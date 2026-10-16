import http from 'http';
import https from 'https';
import { URL } from 'url';

// SSRF Protection: Check if an IP or host is private or restricted
function isRestrictedHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();

  // Localhost checks
  if (lower === 'localhost' || lower === 'ip6-localhost' || lower === 'localhost.localdomain') {
    return true;
  }

  // IPv6 loopback
  if (lower === '::1' || lower === '[::1]') {
    return true;
  }

  // Check IPv4 ranges
  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const p1 = parseInt(ipv4Match[1], 10);
    const p2 = parseInt(ipv4Match[2], 10);

    // 0.0.0.0/8
    if (p1 === 0) return true;
    // 127.0.0.0/8 (Loopback)
    if (p1 === 127) return true;
    // 10.0.0.0/8 (Private)
    if (p1 === 10) return true;
    // 172.16.0.0/12 (Private)
    if (p1 === 172 && p2 >= 16 && p2 <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (p1 === 192 && p2 === 168) return true;
    // 169.254.0.0/16 (Link-local / AWS / GCP metadata)
    if (p1 === 169 && p2 === 254) return true;
  }

  // Metadata service domains
  if (lower.includes('metadata.google') || lower.includes('instance-data')) {
    return true;
  }

  return false;
}

export interface ExtractedArticle {
  title: string;
  content: string;
  source_name: string;
}

export async function extractArticleFromUrl(urlStr: string): Promise<ExtractedArticle> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlStr);
  } catch {
    throw new Error('Invalid URL format. Please provide a full URL including https://');
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error('Unsupported protocol. Only http:// and https:// URLs are permitted.');
  }

  if (isRestrictedHost(parsedUrl.hostname)) {
    throw new Error('Security restriction: Access to localhost, local private network, or cloud metadata endpoints is strictly prohibited.');
  }

  // Fetch with timeout and size limit
  return new Promise((resolve, reject) => {
    const client = parsedUrl.protocol === 'https:' ? https : http;
    const timeoutMs = 8000;
    const maxSizeBytes = 3 * 1024 * 1024; // 3MB limit

    const req = client.get(
      parsedUrl.toString(),
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TruthLens/1.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
      (res) => {
        // Handle redirects (up to 3 hops)
        if (
          res.statusCode &&
          [301, 302, 303, 307, 308].includes(res.statusCode) &&
          res.headers.location
        ) {
          try {
            const redirectUrl = new URL(res.headers.location, parsedUrl.toString());
            if (isRestrictedHost(redirectUrl.hostname)) {
              reject(new Error('Redirected to prohibited private network destination.'));
              return;
            }
            extractArticleFromUrl(redirectUrl.toString()).then(resolve).catch(reject);
            return;
          } catch {
            reject(new Error('Invalid redirect target URL.'));
            return;
          }
        }

        if (res.statusCode && res.statusCode >= 400) {
          reject(
            new Error(
              `The website returned HTTP error ${res.statusCode} (${res.statusMessage || 'Access Denied'}). It may be paywalled or blocking web crawlers.`
            )
          );
          return;
        }

        let body = '';
        let receivedBytes = 0;

        res.setEncoding('utf-8');
        res.on('data', (chunk) => {
          receivedBytes += Buffer.byteLength(chunk);
          if (receivedBytes > maxSizeBytes) {
            req.destroy();
            reject(new Error('The web page exceeded maximum size limits (3MB).'));
            return;
          }
          body += chunk;
        });

        res.on('end', () => {
          try {
            const result = parseHtmlArticle(body, parsedUrl.hostname);
            if (!result.content || result.content.length < 50) {
              reject(
                new Error(
                  'Could not extract sufficient article text from this URL. The page may require JavaScript rendering, a login wall, or a subscription.'
                )
              );
              return;
            }
            resolve(result);
          } catch (err: any) {
            reject(new Error(`Failed to parse article content: ${err.message}`));
          }
        });
      }
    );

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error('Connection timed out while fetching article from the remote server.'));
    });

    req.on('error', (err) => {
      reject(new Error(`Network connection error: ${err.message}`));
    });
  });
}

function parseHtmlArticle(html: string, hostname: string): ExtractedArticle {
  // Strip scripts, styles, svg, and comment blocks
  let cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  // Extract Title: Check og:title or <title>
  let title = '';
  const ogTitleMatch = cleanHtml.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  if (ogTitleMatch && ogTitleMatch[1]) {
    title = ogTitleMatch[1];
  } else {
    const titleTagMatch = cleanHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleTagMatch && titleTagMatch[1]) {
      title = titleTagMatch[1];
    }
  }

  // Extract site name
  let source_name = hostname.replace(/^www\./i, '');
  const siteNameMatch = cleanHtml.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i);
  if (siteNameMatch && siteNameMatch[1]) {
    source_name = siteNameMatch[1];
  }

  // Extract paragraph texts
  const paragraphs: string[] = [];
  const pRegex = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = pRegex.exec(cleanHtml)) !== null) {
    const pText = match[1]
      .replace(/<[^>]+>/g, ' ') // Strip inner tags (a, b, span, etc.)
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();

    if (pText.length > 30 && !pText.toLowerCase().includes('cookie') && !pText.toLowerCase().includes('privacy policy')) {
      paragraphs.push(pText);
    }
  }

  const content = paragraphs.slice(0, 30).join('\n\n');

  return {
    title: decodeHtmlEntities(title.trim()) || `Report from ${source_name}`,
    content: decodeHtmlEntities(content),
    source_name,
  };
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code))
    .trim();
}
