import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  NewsArticle,
  Prediction,
  Feedback,
  DatabaseSchema,
  UserRole,
  PredictedLabel,
  FeedbackCategory,
  InputMode,
} from './types.js';
import { hashPassword } from './auth.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'truthlens.json');

export class Database {
  private schema: DatabaseSchema = {
    users: [],
    articles: [],
    predictions: [],
    feedbacks: [],
  };

  constructor() {
    this.init();
  }

  private init(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.schema = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading database file, resetting to initial state:', err);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  private save(): void {
    try {
      const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.schema, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  public seedInitialData(): void {
    // Default Admin User
    const adminPass = hashPassword('AdminPass123!');
    const adminUser: User = {
      user_id: 'usr_admin_001',
      name: 'System Administrator',
      email: 'admin@truthlens.ai',
      password_hash: adminPass.hash,
      salt: adminPass.salt,
      role: 'admin',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Default Demo Student User
    const demoPass = hashPassword('DemoPass123!');
    const demoUser: User = {
      user_id: 'usr_demo_002',
      name: 'Academic Researcher',
      email: 'student@truthlens.ai',
      password_hash: demoPass.hash,
      salt: demoPass.salt,
      role: 'user',
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Sample Articles & Predictions representing distinct categories
    // 1. REAL Article
    const realArticle: NewsArticle = {
      news_id: 'art_sample_real_01',
      user_id: demoUser.user_id,
      title: 'NASA James Webb Space Telescope Detects Water Vapor in Rocky Planet Atmosphere System',
      content: 'Astronomers using the James Webb Space Telescope (JWST) have confirmed spectral evidence of atmospheric water vapor around rocky exoplanet GJ 486 b. The findings, published in leading peer-reviewed astrophysical journals, detail how the NIRSpec instrument observed transmission spectra during repeated stellar transits. NASA and European Space Agency scientists noted that while stellar contamination cannot be completely ruled out, corroborating ground-based observations strongly support the planetary atmospheric signature.',
      source_name: 'NASA Jet Propulsion Laboratory & Nature Astronomy',
      source_url: 'https://www.nasa.gov/mission_pages/webb/main/index.html',
      input_mode: 'paste',
      submission_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const realPrediction: Prediction = {
      prediction_id: 'pred_sample_real_01',
      news_id: realArticle.news_id,
      user_id: demoUser.user_id,
      predicted_label: 'REAL',
      confidence_score: 0.94,
      summary: 'Consistent with verified peer-reviewed publications and official announcements from NASA/ESA astronomical missions.',
      explanation: 'The article accurately reflects authentic scientific literature and verified press releases from NASA and ESA researchers. The terminology aligns with standard astrophysics protocols (transmission spectroscopy, NIRSpec instrument, transit photometry). Claims are framed with appropriate scientific caveats regarding potential stellar contamination rather than sensationalized guarantees.',
      key_claims: [
        'James Webb Space Telescope observed transmission spectra of exoplanet GJ 486 b',
        'Spectroscopic data indicated presence of water vapor signatures',
        'Official findings were documented through NASA and European Space Agency archives',
      ],
      warning_signs: [
        'None identified. Reporting maintains balanced scientific caution.',
      ],
      evidence_sources: [
        {
          title: 'NASA Exoplanet Exploration Archive & JWST Science Releases',
          url: 'https://exoplanets.nasa.gov',
          credibility_note: 'Primary institutional space research agency with public raw telemetry archives.',
        },
        {
          title: 'Nature Astronomy Peer-Reviewed Papers',
          credibility_note: 'High-impact indexed academic journal.',
        },
      ],
      verification_steps: [
        'Cross-reference the target GJ 486 b in the NASA Exoplanet Catalog.',
        'Review original transmission spectroscopy datasets published via STScI MAST portal.',
        'Confirm authorship among listed astrophysics research team members.',
      ],
      limitations: [
        'Astronomical spectroscopy continues to receive follow-up observations to further disentangle starspot contamination.',
      ],
      model_version: 'gemini-3.8-flash (TruthLens v1.2)',
      prediction_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      is_demo: true,
    };

    // 2. FAKE Article
    const fakeArticle: NewsArticle = {
      news_id: 'art_sample_fake_02',
      user_id: demoUser.user_id,
      title: 'Secret Miracle Fruit Discovered in Rainforest Cures All Stage 4 Cancers in 48 Hours, Big Pharma Bans It',
      content: 'A miraculous berry discovered deep in the Amazon basin known as the "Miracle Sunberry" completely eliminates 100% of stage 4 malignant tumors within two days according to an anonymous whistleblower doctor who had to flee the country. Mainstream hospitals and pharmaceutical executives have colluded with world governments to destroy all plantations and censor medical journals to protect chemotherapy profits. Doctors are threatening anyone who consumes this ancient extract!',
      source_name: 'Viral Health Secrets Blog',
      source_url: 'http://daily-miracle-breakthroughs.unverified.org',
      input_mode: 'paste',
      submission_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const fakePrediction: Prediction = {
      prediction_id: 'pred_sample_fake_02',
      news_id: fakeArticle.news_id,
      user_id: demoUser.user_id,
      predicted_label: 'FAKE',
      confidence_score: 0.98,
      summary: 'Classic medical miracle cure hoax exhibiting severe conspiracy framing, untraceable claims, and zero clinical trial corroboration.',
      explanation: 'This submission demonstrates classic characteristics of predatory health misinformation. There is no biological mechanism by which a single botanical compound can eradicate diverse advanced malignancies across varying tissue types in 48 hours. No clinical trials exist in PubMed, ClinicalTrials.gov, or WHO registries for the alleged "Miracle Sunberry". The claim employs psychological manipulation tropes: an anonymous whistleblower, suppression conspiracies ("Big Pharma bans it"), and urgent emotional fear appeal.',
      key_claims: [
        'An unidentified berry eradicates all stage 4 cancer tumors in 48 hours',
        'Global medical community and governments are executing a coordinated censorship campaign',
        'Anonymous physician fled the country after discovering the cure',
      ],
      warning_signs: [
        'Sensationalist miracle cure promise with zero clinical evidence',
        'Classic conspiracy trope ("Big Pharma suppressed this secret")',
        'Unverifiable anonymous sources with no institutional affiliation',
        'Emotionally manipulative and urgent clickbait language',
        'Complete absence of peer-reviewed clinical trial references',
      ],
      evidence_sources: [
        {
          title: 'National Cancer Institute (NCI) & WHO Guidelines on Cancer Therapeutics',
          url: 'https://www.cancer.gov',
          credibility_note: 'Official international oncology standards; no such compound is recognized.',
        },
        {
          title: 'U.S. FDA Health Fraud Product Warnings Database',
          credibility_note: 'Monitors deceptive unapproved botanical cancer cures and misleading health scams.',
        },
      ],
      verification_steps: [
        'Search PubMed (pubmed.ncbi.nlm.nih.gov) for clinical trials containing the compound name.',
        'Consult the FDA Health Fraud Product Database for enforcement alerts.',
        'Review oncological advisory warnings from major cancer research centers.',
      ],
      limitations: [
        'Analysis evaluates textual claims and medical consensus databases; specific viral blog domain registration records were not queried.',
      ],
      model_version: 'gemini-3.8-flash (TruthLens v1.2)',
      prediction_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      is_demo: true,
    };

    // 3. NEEDS VERIFICATION Article
    const verifyArticle: NewsArticle = {
      news_id: 'art_sample_verify_03',
      user_id: demoUser.user_id,
      title: 'City Council Approves Emergency Ordinance for Subterranean Geothermal District Heating Project',
      content: 'Local municipal sources report that the metropolitan regional council held a closed-door midnight meeting to authorize $450 million in municipal bonds for a pilot deep-borehole geothermal heating grid across the eastern district. Unverified social media leaks claim construction begins next month under emergency powers without public environmental impact review. Official municipal public relation spokespeople have neither published meeting minutes nor denied ongoing exploratory feasibility studies.',
      source_name: 'Metro Insider Anonymous Telegram Channel',
      input_mode: 'paste',
      submission_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const verifyPrediction: Prediction = {
      prediction_id: 'pred_sample_verify_03',
      news_id: verifyArticle.news_id,
      user_id: demoUser.user_id,
      predicted_label: 'NEEDS VERIFICATION',
      confidence_score: 0.65,
      summary: 'Developing local governance claim with unconfirmed anonymous sourcing and pending official public records.',
      explanation: 'The report blends plausible municipal energy transition concepts (geothermal district heating) with uncorroborated procedural assertions (closed-door midnight bond votes bypassing environmental review). Because municipal bond issues require statutory disclosures and public agenda notices, this story cannot be confirmed or debunked without official city council minutes, state bond filings, or signed public records.',
      key_claims: [
        'City council authorized $450 million in emergency municipal bonds',
        'Closed-door midnight session allegedly bypassed environmental review',
        'Spokespersons have neither published minutes nor issued an outright denial',
      ],
      warning_signs: [
        'Sourced solely from unverified social media leaks and anonymous messaging channels',
        'Alleges emergency closed-door procedural moves without documentary evidence',
        'Lack of named council members, ordinance docket numbers, or official press releases',
      ],
      evidence_sources: [
        {
          title: 'Municipal Registry & City Council Docket Archives',
          credibility_note: 'Primary public record authority for municipal legislative votes.',
        },
      ],
      verification_steps: [
        'Check the official City Clerk meeting agendas and voting records for recorded roll calls.',
        'Inspect the Municipal Securities Rulemaking Board (EMMA) for official bond issuance filings.',
        'Wait for verified on-the-record statements from accredited regional investigative journalists.',
      ],
      limitations: [
        'Local municipal ordinances depend on municipal public record access that may take days to publish.',
      ],
      model_version: 'gemini-3.8-flash (TruthLens v1.2)',
      prediction_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      is_demo: true,
    };

    // Sample feedback
    const sampleFeedback1: Feedback = {
      feedback_id: 'fb_sample_01',
      user_id: demoUser.user_id,
      user_name: demoUser.name,
      user_email: demoUser.email,
      prediction_id: fakePrediction.prediction_id,
      article_title: fakeArticle.title,
      predicted_label: fakePrediction.predicted_label,
      feedback_text: 'Spot-on analysis. This exact claim was circulating on WhatsApp groups targeting elderly family members.',
      feedback_category: 'Correct Prediction',
      supporting_source_url: 'https://www.cancer.gov/about-cancer/treatment/cam',
      feedback_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    };

    this.schema = {
      users: [adminUser, demoUser],
      articles: [realArticle, fakeArticle, verifyArticle],
      predictions: [realPrediction, fakePrediction, verifyPrediction],
      feedbacks: [sampleFeedback1],
    };

    this.save();
  }

  // --- User Operations ---
  public createUser(name: string, email: string, password_hash: string, salt: string, role: UserRole = 'user'): User {
    const user_id = `usr_${crypto.randomUUID()}`;
    const newUser: User = {
      user_id,
      name,
      email: email.toLowerCase().trim(),
      password_hash,
      salt,
      role,
      created_at: new Date().toISOString(),
    };
    this.schema.users.push(newUser);
    this.save();
    return newUser;
  }

  public getUserById(user_id: string): User | undefined {
    return this.schema.users.find((u) => u.user_id === user_id);
  }

  public getUserByEmail(email: string): User | undefined {
    const clean = email.toLowerCase().trim();
    return this.schema.users.find((u) => u.email === clean);
  }

  public getAllUsers(): User[] {
    return this.schema.users;
  }

  // --- NewsArticle Operations ---
  public createArticle(
    user_id: string,
    title: string,
    content: string,
    source_name?: string,
    source_url?: string,
    input_mode: InputMode = 'paste'
  ): NewsArticle {
    // Verify user exists
    const user = this.getUserById(user_id);
    if (!user) {
      throw new Error(`User with ID ${user_id} does not exist.`);
    }

    const news_id = `art_${crypto.randomUUID()}`;
    const article: NewsArticle = {
      news_id,
      user_id,
      title: title.trim(),
      content: content.trim(),
      source_name: source_name?.trim() || undefined,
      source_url: source_url?.trim() || undefined,
      input_mode,
      submission_date: new Date().toISOString(),
    };

    this.schema.articles.push(article);
    this.save();
    return article;
  }

  public getNewsById(news_id: string): NewsArticle | undefined {
    return this.schema.articles.find((a) => a.news_id === news_id);
  }

  public getAllNews(user_id?: string): NewsArticle[] {
    if (user_id) {
      return this.schema.articles.filter((a) => a.user_id === user_id);
    }
    return this.schema.articles;
  }

  // Cascading delete: Article + its 1:1 Prediction + any related Feedbacks
  public deleteArticle(news_id: string, user_id?: string): boolean {
    const articleIndex = this.schema.articles.findIndex((a) => {
      if (a.news_id !== news_id) return false;
      if (user_id && a.user_id !== user_id) return false;
      return true;
    });

    if (articleIndex === -1) return false;

    // Find associated prediction
    const prediction = this.schema.predictions.find((p) => p.news_id === news_id);

    // Delete feedbacks tied to this prediction
    if (prediction) {
      this.schema.feedbacks = this.schema.feedbacks.filter(
        (f) => f.prediction_id !== prediction.prediction_id
      );
    }

    // Delete prediction
    this.schema.predictions = this.schema.predictions.filter((p) => p.news_id !== news_id);

    // Delete article
    this.schema.articles.splice(articleIndex, 1);

    this.save();
    return true;
  }

  // --- Prediction Operations ---
  public createPrediction(
    news_id: string,
    user_id: string,
    data: {
      predicted_label: PredictedLabel;
      confidence_score: number;
      summary: string;
      explanation: string;
      key_claims?: string[];
      warning_signs?: string[];
      evidence_sources?: Array<{ title: string; url?: string; credibility_note?: string; snippet?: string }>;
      verification_steps?: string[];
      limitations?: string[];
      model_version?: string;
      is_demo?: boolean;
    }
  ): Prediction {
    // Enforce 1:1 relationship with NewsArticle: delete any prior prediction for this news_id
    this.schema.predictions = this.schema.predictions.filter((p) => p.news_id !== news_id);

    const prediction_id = `pred_${crypto.randomUUID()}`;
    const prediction: Prediction = {
      prediction_id,
      news_id,
      user_id,
      predicted_label: data.predicted_label,
      confidence_score: Math.max(0, Math.min(1, data.confidence_score)),
      summary: data.summary,
      explanation: data.explanation,
      key_claims: data.key_claims || [],
      warning_signs: data.warning_signs || [],
      evidence_sources: data.evidence_sources || [],
      verification_steps: data.verification_steps || [],
      limitations: data.limitations || [],
      model_version: data.model_version || 'gemini-3.8-flash (TruthLens v1.2)',
      prediction_date: new Date().toISOString(),
      is_demo: data.is_demo || false,
    };

    this.schema.predictions.push(prediction);
    this.save();
    return prediction;
  }

  public getPredictionById(prediction_id: string): Prediction | undefined {
    return this.schema.predictions.find((p) => p.prediction_id === prediction_id);
  }

  public getPredictionByNewsId(news_id: string): Prediction | undefined {
    return this.schema.predictions.find((p) => p.news_id === news_id);
  }

  public getAllPredictions(user_id?: string): Prediction[] {
    if (user_id) {
      return this.schema.predictions.filter((p) => p.user_id === user_id);
    }
    return this.schema.predictions;
  }

  // --- Feedback Operations ---
  public createFeedback(
    user_id: string,
    prediction_id: string,
    feedback_text: string,
    feedback_category: FeedbackCategory = 'General Feedback',
    supporting_source_url?: string
  ): Feedback {
    const user = this.getUserById(user_id);
    const prediction = this.getPredictionById(prediction_id);
    if (!prediction) {
      throw new Error(`Prediction with ID ${prediction_id} does not exist.`);
    }

    const article = this.getNewsById(prediction.news_id);

    const feedback_id = `fb_${crypto.randomUUID()}`;
    const feedback: Feedback = {
      feedback_id,
      user_id,
      user_name: user?.name,
      user_email: user?.email,
      prediction_id,
      article_title: article?.title,
      predicted_label: prediction.predicted_label,
      feedback_text: feedback_text.trim(),
      feedback_category,
      supporting_source_url: supporting_source_url?.trim() || undefined,
      feedback_date: new Date().toISOString(),
    };

    this.schema.feedbacks.push(feedback);
    this.save();
    return feedback;
  }

  public getFeedbackById(feedback_id: string): Feedback | undefined {
    return this.schema.feedbacks.find((f) => f.feedback_id === feedback_id);
  }

  public getAllFeedbacks(user_id?: string): Feedback[] {
    if (user_id) {
      return this.schema.feedbacks.filter((f) => f.user_id === user_id);
    }
    return this.schema.feedbacks;
  }

  // Stats calculation
  public getUserStats(user_id: string) {
    const userArticles = this.getAllNews(user_id);
    const userPredictions = this.getAllPredictions(user_id);
    const userFeedbacks = this.getAllFeedbacks(user_id);

    const realCount = userPredictions.filter((p) => p.predicted_label === 'REAL').length;
    const fakeCount = userPredictions.filter((p) => p.predicted_label === 'FAKE').length;
    const verifyCount = userPredictions.filter(
      (p) => p.predicted_label === 'NEEDS VERIFICATION'
    ).length;

    // Timeline distribution (grouped by day for past 7 days)
    const timelineMap: Record<string, { date: string; real: number; fake: number; needs_verification: number; total: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      timelineMap[key] = { date: key, real: 0, fake: 0, needs_verification: 0, total: 0 };
    }

    for (const p of userPredictions) {
      const key = p.prediction_date.split('T')[0];
      if (timelineMap[key]) {
        timelineMap[key].total += 1;
        if (p.predicted_label === 'REAL') timelineMap[key].real += 1;
        else if (p.predicted_label === 'FAKE') timelineMap[key].fake += 1;
        else if (p.predicted_label === 'NEEDS VERIFICATION') timelineMap[key].needs_verification += 1;
      }
    }

    return {
      totalAnalyzed: userArticles.length,
      realCount,
      fakeCount,
      needsVerificationCount: verifyCount,
      totalFeedback: userFeedbacks.length,
      distribution: [
        { name: 'Real', count: realCount, color: '#16a34a' },
        { name: 'Fake', count: fakeCount, color: '#dc2626' },
        { name: 'Needs Verification', count: verifyCount, color: '#d97706' },
      ],
      timeline: Object.values(timelineMap),
    };
  }

  public getSystemStats() {
    const totalUsers = this.schema.users.length;
    const totalArticles = this.schema.articles.length;
    const totalPredictions = this.schema.predictions.length;
    const totalFeedbacks = this.schema.feedbacks.length;

    const realCount = this.schema.predictions.filter((p) => p.predicted_label === 'REAL').length;
    const fakeCount = this.schema.predictions.filter((p) => p.predicted_label === 'FAKE').length;
    const verifyCount = this.schema.predictions.filter((p) => p.predicted_label === 'NEEDS VERIFICATION').length;

    const disputedCount = this.schema.feedbacks.filter(
      (f) => f.feedback_category === 'Incorrect Prediction'
    ).length;

    return {
      totalUsers,
      totalArticles,
      totalPredictions,
      totalFeedbacks,
      realCount,
      fakeCount,
      verifyCount,
      disputedCount,
      distribution: [
        { name: 'Real', count: realCount, color: '#16a34a' },
        { name: 'Fake', count: fakeCount, color: '#dc2626' },
        { name: 'Needs Verification', count: verifyCount, color: '#d97706' },
      ],
    };
  }
}

export const db = new Database();
