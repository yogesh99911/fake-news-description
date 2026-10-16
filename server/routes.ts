import { Router, Response } from 'express';
import { db } from './db.js';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  revokeToken,
  authenticate,
  requireAdmin,
  AuthenticatedRequest,
} from './auth.js';
import { analyzeNewsWithGemini } from './gemini.js';
import { analyzeNewsWithCloudflare } from './cloudflare.js';
import { extractArticleFromUrl } from './urlExtractor.js';
import { FeedbackCategory, InputMode, PredictedLabel } from './types.js';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

// POST /api/auth/register
apiRouter.post('/auth/register', (req, res): void => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Name must be at least 2 characters long.' });
      return;
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters long.' });
      return;
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const { hash, salt } = hashPassword(password);
    const user = db.createUser(name.trim(), email.trim(), hash, salt, 'user');
    const token = generateToken(user.user_id);

    res.status(201).json({
      message: 'Account successfully registered.',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

// POST /api/auth/login
apiRouter.post('/auth/login', (req, res): void => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password credentials.' });
      return;
    }

    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password credentials.' });
      return;
    }

    const token = generateToken(user.user_id);

    res.json({
      message: 'Logged in successfully.',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// POST /api/auth/logout
apiRouter.post('/auth/logout', authenticate(db), (req: AuthenticatedRequest, res: Response): void => {
  if (req.token) {
    revokeToken(req.token);
  }
  res.json({ message: 'Successfully logged out.' });
});

// GET /api/auth/me
apiRouter.get('/auth/me', authenticate(db), (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }
  res.json({
    user_id: req.user.user_id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    created_at: req.user.created_at,
  });
});

// ==========================================
// 2. ARTICLE & ANALYSIS ENDPOINTS
// ==========================================

// POST /api/extract-url
apiRouter.post('/extract-url', authenticate(db), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'A valid article URL is required.' });
      return;
    }

    const extracted = await extractArticleFromUrl(url);
    res.json(extracted);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to extract article content from URL.' });
  }
});

// POST /api/news (Submit & Analyze News)
apiRouter.post('/news', authenticate(db), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const { title, content, source_name, source_url, input_mode, is_demo } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length < 5) {
      res.status(400).json({ error: 'Headline is required and must be at least 5 characters long.' });
      return;
    }

    if (!content || typeof content !== 'string' || content.trim().length < 20) {
      res.status(400).json({ error: 'Article content must be at least 20 characters long.' });
      return;
    }

    if (content.length > 50000) {
      res.status(400).json({ error: 'Article content exceeds maximum length (50,000 characters).' });
      return;
    }

    const mode: InputMode = input_mode === 'url' ? 'url' : 'paste';

    // 1. Create Article entity (User 1:N NewsArticle)
    const article = db.createArticle(
      user.user_id,
      title.trim(),
      content.trim(),
      source_name?.trim(),
      source_url?.trim(),
      mode
    );

    // 2. Use the configured AI service. Cloudflare Workers AI's free daily
    // allocation can be used without enabling paid Google Cloud billing.
    // If no provider is configured, save an explicit unverified demo result.
    let analysisResult;
    const hasCloudflare = Boolean(
      process.env.CLOUDFLARE_ACCOUNT_ID?.trim() && process.env.CLOUDFLARE_API_TOKEN?.trim()
    );
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY?.trim());
    const hasAiProvider = hasCloudflare || hasGeminiKey;
    if (!hasAiProvider) {
      analysisResult = {
        predicted_label: 'NEEDS VERIFICATION' as PredictedLabel,
        confidence_score: 0,
        summary: 'No AI verdict was generated. This free demo has no AI provider connected, so this label does not mean the claim is true or false.',
        explanation: 'Your submission was saved, but it was not checked against news sources or fact-checking records. This result only demonstrates the app flow; it is not a fact-check.',
        key_claims: [],
        warning_signs: ['No AI analysis or independent source check was performed.'],
        evidence_sources: [],
        verification_steps: [
          'Check the claim against an official primary source.',
          'Look for independent reporting from multiple reputable news organizations.',
          'Do not treat this demo result as confirmation or a debunk.',
        ],
        limitations: ['Free demo mode: Gemini API key is not configured; no factual assessment was made.'],
        model_version: 'free-demo-no-ai',
      };
    } else {
      try {
        analysisResult = hasCloudflare
          ? await analyzeNewsWithCloudflare(article.title, article.content, article.source_url)
          : await analyzeNewsWithGemini(article.title, article.content, article.source_url);
      } catch (aiErr: any) {
        // If AI failed, delete the newly created article to maintain consistency (no orphan articles without predictions)
        db.deleteArticle(article.news_id, user.user_id);
        res.status(502).json({
          error: `AI Analysis failed: ${aiErr.message}. The submission was not recorded. Please retry later.`,
        });
        return;
      }
    }

    // 3. Create 1:1 Prediction entity
    const prediction = db.createPrediction(article.news_id, user.user_id, {
      predicted_label: analysisResult.predicted_label,
      confidence_score: analysisResult.confidence_score,
      summary: analysisResult.summary,
      explanation: analysisResult.explanation,
      key_claims: analysisResult.key_claims,
      warning_signs: analysisResult.warning_signs,
      evidence_sources: analysisResult.evidence_sources,
      verification_steps: analysisResult.verification_steps,
      limitations: analysisResult.limitations,
      model_version: analysisResult.model_version,
      is_demo: !hasAiProvider || !!is_demo,
    });

    res.status(201).json({
      message: 'Article analyzed and saved successfully.',
      article,
      prediction,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error while processing news article.' });
  }
});

// GET /api/news (Retrieve user's article history joined with prediction)
apiRouter.get('/news', authenticate(db), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { q, label, sort, page = '1', limit = '10' } = req.query;

    let articles = db.getAllNews(user.user_id);

    // Join with prediction
    let results = articles.map((article) => {
      const prediction = db.getPredictionByNewsId(article.news_id);
      return {
        article,
        prediction,
      };
    });

    // Search filter
    if (q && typeof q === 'string') {
      const query = q.toLowerCase();
      results = results.filter(
        (item) =>
          item.article.title.toLowerCase().includes(query) ||
          item.article.content.toLowerCase().includes(query) ||
          (item.prediction && item.prediction.summary.toLowerCase().includes(query))
      );
    }

    // Label filter
    if (label && typeof label === 'string' && label !== 'ALL') {
      results = results.filter(
        (item) => item.prediction && item.prediction.predicted_label === label
      );
    }

    // Sorting
    results.sort((a, b) => {
      const dateA = new Date(a.article.submission_date).getTime();
      const dateB = new Date(b.article.submission_date).getTime();
      return sort === 'oldest' ? dateA - dateB : dateB - dateA;
    });

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit as string, 10) || 10));
    const total = results.length;
    const paginated = results.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      items: paginated,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve article history.' });
  }
});

// GET /api/news/:id (Retrieve specific article + prediction + feedbacks)
apiRouter.get('/news/:id', authenticate(db), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const newsId = req.params.id;

    const article = db.getNewsById(newsId);
    if (!article) {
      res.status(404).json({ error: 'Article not found.' });
      return;
    }

    // Authorization check
    if (article.user_id !== user.user_id && user.role !== 'admin') {
      res.status(403).json({ error: 'Access denied. You can only view your own submitted articles.' });
      return;
    }

    const prediction = db.getPredictionByNewsId(article.news_id);
    const feedbacks = prediction ? db.getAllFeedbacks().filter((f) => f.prediction_id === prediction.prediction_id) : [];

    res.json({
      article,
      prediction,
      feedbacks,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve article details.' });
  }
});

// DELETE /api/news/:id
apiRouter.delete('/news/:id', authenticate(db), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const newsId = req.params.id;

    const article = db.getNewsById(newsId);
    if (!article) {
      res.status(404).json({ error: 'Article not found.' });
      return;
    }

    // Authorization check
    if (article.user_id !== user.user_id && user.role !== 'admin') {
      res.status(403).json({ error: 'Access denied. You can only delete your own submitted articles.' });
      return;
    }

    const success = db.deleteArticle(newsId, user.role === 'admin' ? undefined : user.user_id);
    if (!success) {
      res.status(404).json({ error: 'Article could not be deleted.' });
      return;
    }

    res.json({ message: 'Article and associated predictions/feedback deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete article.' });
  }
});

// ==========================================
// 3. PREDICTIONS ENDPOINTS
// ==========================================

// GET /api/predictions
apiRouter.get('/predictions', authenticate(db), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const predictions = db.getAllPredictions(user.user_id);
    res.json(predictions);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve predictions.' });
  }
});

// GET /api/predictions/:id
apiRouter.get('/predictions/:id', authenticate(db), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const predictionId = req.params.id;
    const prediction = db.getPredictionById(predictionId);

    if (!prediction) {
      res.status(404).json({ error: 'Prediction not found.' });
      return;
    }

    if (prediction.user_id !== user.user_id && user.role !== 'admin') {
      res.status(403).json({ error: 'Access denied. You can only view your own predictions.' });
      return;
    }

    res.json(prediction);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve prediction.' });
  }
});

// ==========================================
// 4. FEEDBACK ENDPOINTS
// ==========================================

// POST /api/feedback
apiRouter.post('/feedback', authenticate(db), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { prediction_id, feedback_text, feedback_category, supporting_source_url } = req.body;

    if (!prediction_id) {
      res.status(400).json({ error: 'prediction_id is required.' });
      return;
    }

    if (!feedback_text || typeof feedback_text !== 'string' || feedback_text.trim().length < 5) {
      res.status(400).json({ error: 'Feedback text must be at least 5 characters long.' });
      return;
    }

    const validCategories: FeedbackCategory[] = [
      'Correct Prediction',
      'Incorrect Prediction',
      'Unsure',
      'General Feedback',
    ];
    const category: FeedbackCategory = validCategories.includes(feedback_category)
      ? feedback_category
      : 'General Feedback';

    const prediction = db.getPredictionById(prediction_id);
    if (!prediction) {
      res.status(404).json({ error: 'Referenced prediction not found.' });
      return;
    }

    const feedback = db.createFeedback(
      user.user_id,
      prediction_id,
      feedback_text,
      category,
      supporting_source_url
    );

    res.status(201).json({
      message: 'Feedback submitted successfully. Thank you for contributing to research verification.',
      feedback,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit feedback.' });
  }
});

// GET /api/feedback
apiRouter.get('/feedback', authenticate(db), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const feedbacks = db.getAllFeedbacks(user.user_id);
    res.json(feedbacks);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve feedback history.' });
  }
});

// ==========================================
// 5. USER DASHBOARD STATS
// ==========================================

// GET /api/stats
apiRouter.get('/stats', authenticate(db), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const stats = db.getUserStats(user.user_id);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to calculate user stats.' });
  }
});

// ==========================================
// 6. DEMO DATA & CLASSROOM SAMPLES
// ==========================================

// GET /api/demo/samples
apiRouter.get('/demo/samples', (_req, res): void => {
  res.json([
    {
      label: 'Astronomical Discovery (Real Sample)',
      title: 'NASA James Webb Telescope Confirms Carbon-Bearing Molecules on Habitable-Zone Exoplanet K2-18 b',
      source_name: 'NASA / ESA Newsroom',
      source_url: 'https://www.nasa.gov/universe/exoplanets/webb-discovers-methane-carbon-dioxide-in-atmosphere-of-k2-18-b/',
      content: `A new investigation with NASA's James Webb Space Telescope into K2-18 b, an exoplanet 8.6 times as massive as Earth, has revealed the presence of carbon-bearing molecules including methane and carbon dioxide. Webb's discovery adds to recent studies suggesting that K2-18 b could be a Hycean exoplanet, one which has the potential to possess a hydrogen-rich atmosphere and a water ocean-covered surface. The abundance of methane and carbon dioxide, and shortage of ammonia, support the hypothesis that there may be a water ocean underneath a hydrogen-rich atmosphere in K2-18 b. These initial Webb observations also provided a possible detection of a molecule called dimethyl sulfide (DMS). On Earth, this is only produced by life, though the DMS signal requires further verification.`,
    },
    {
      label: 'Viral Health Hoax (Fake Sample)',
      title: 'Miracle Lemon Bicarbonate Elixir Proven 10,000 Times Stronger Than Chemotherapy, Scientists Fired For Exposing Truth',
      source_name: 'Secret Remedies Today',
      source_url: 'http://natural-health-miracles-revealed.xyz',
      content: `A simple mixture of organic lemon juice and baking soda is 10,000 times more potent at destroying cancer cells than laboratory chemotherapy drugs, according to a breakthrough study that the pharmaceutical cartel attempted to incinerate! Top oncologists who witnessed the miraculous 24-hour recoveries were immediately fired and barred from medical practice. The global healthcare syndicate does not want you to know that cancer is completely cured by this $2 kitchen staple because chemotherapy generates trillions in corrupt hospital revenue! Share this before Big Tech removes it!`,
    },
    {
      label: 'Developing Policy Claim (Needs Verification Sample)',
      title: 'Regional Transport Authority Allegedly Signs Confidential Preliminary MOU for High-Speed Maglev Corridor',
      source_name: 'Transit Leak Wire',
      content: `Internal communications leaked from a regional transit advisory committee suggest administrators signed a non-binding memorandum of understanding with a private rail consortium to study a 300-mph magnetic levitation corridor between coastal hubs. While the state transportation department has acknowledged receiving unsolicited private proposals, no formal capital allocation, legislative approval, or environmental impact filings have been published on public procurement portals. State representatives contacted by phone stated they were unaware of binding commitments.`,
    },
  ]);
});

// POST /api/demo/seed
apiRouter.post('/demo/seed', (_req, res): void => {
  try {
    db.seedInitialData();
    res.json({ message: 'Demonstration and baseline project data successfully initialized.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to seed demo data.' });
  }
});

// ==========================================
// 7. ADMIN ENDPOINTS
// ==========================================

// GET /api/admin/overview
apiRouter.get('/admin/overview', authenticate(db), requireAdmin, (_req: AuthenticatedRequest, res: Response): void => {
  try {
    const stats = db.getSystemStats();
    const allFeedbacks = db.getAllFeedbacks();
    const allArticles = db.getAllNews();
    const allPredictions = db.getAllPredictions();

    res.json({
      stats,
      feedbacks: allFeedbacks,
      articlesCount: allArticles.length,
      predictionsCount: allPredictions.length,
      recentFeedbacks: allFeedbacks.slice(-15).reverse(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to load administrator overview.' });
  }
});
