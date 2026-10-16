# TruthLens AI – AI-Based Fake News Detection System
**BSc Computer Science Final Year Project**

TruthLens AI is an end-to-end, academic-grade web platform designed for AI-assisted news credibility analysis, factual claim verification, and algorithmic transparency. Powered by Google Gemini 3.8 Flash, Express.js, React 19, TypeScript, and Tailwind CSS, the platform evaluates news articles, extracts discrete claims, detects sensationalism and deceptive rhetoric, and produces a structured credibility assessment.

---

## 1. Core System Entities & UML Design

The system strictly models the entities specified in the project Class Diagram and Object Diagram:

### 1. `User`
- **Attributes:** `user_id`, `name`, `email`, `password_hash`, `salt`, `role` (`'user' | 'admin'`), `created_at`
- **Operations:** `register()`, `login()`, `submitNews()`, `provideFeedback()`
- **Security:** Passwords are cryptographically salted and hashed using PBKDF2 (100,000 iterations, SHA-512). Plaintext passwords are never stored.

### 2. `NewsArticle`
- **Attributes:** `news_id`, `user_id` [FK], `title`, `content`, `source_name?`, `source_url?`, `input_mode` (`'paste' | 'url'`), `submission_date`
- **Operations:** `create()`, `getNewsById()`, `getAllNews()`, `delete()`
- **Cardinality:** `User (1) ──── (0..*) NewsArticle`

### 3. `Prediction`
- **Attributes:** `prediction_id`, `news_id` [FK, 1:1], `user_id` [FK], `predicted_label` (`'REAL' | 'FAKE' | 'NEEDS VERIFICATION'`), `confidence_score` (0.0 to 1.0), `summary`, `explanation`, `key_claims[]`, `warning_signs[]`, `evidence_sources[]`, `verification_steps[]`, `limitations[]`, `model_version`, `prediction_date`, `is_demo`
- **Operations:** `getPredictionById()`, `getPredictionByNewsId()`, `getAllPredictions()`
- **Cardinality:** `NewsArticle (1) ──── (1) Prediction` (Strict 1:1; duplicate submissions are prevented, and deletion cascades automatically).

### 4. `Feedback`
- **Attributes:** `feedback_id`, `user_id` [FK], `prediction_id` [FK], `feedback_text`, `feedback_category` (`'Correct Prediction' | 'Incorrect Prediction' | 'Unsure' | 'General Feedback'`), `supporting_source_url?`, `feedback_date`
- **Operations:** `submitFeedback()`, `getFeedbackById()`, `getAllFeedbacks()`
- **Cardinality:** `User (1) ──── (0..*) Feedback` and `Prediction (1) ──── (0..*) Feedback`

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, Recharts (classification distribution & timeline charts).
- **Backend API:** Node.js, Express, TypeScript (`tsx server.ts`).
- **AI Engine:** Google Gemini API (`gemini-3.8-flash`) via the modern `@google/genai` TypeScript SDK with strict JSON schema constraints.
- **Persistence Engine:** JSON relational database with atomic file transactions (`data/truthlens.json`), foreign key integrity, and cascading deletions.
- **Security & Crawling:** SSRF-protected URL crawler blocking RFC-1918 subnets, cloud metadata IPs, and localhost; PBKDF2 password hashing; timing-safe comparisons; Bearer token authorization.

---

## 3. Pre-Configured Test Accounts (Classroom / Viva Demonstration)

For testing and examination presentations, TruthLens includes seeded demonstration accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Researcher (Student)** | `student@truthlens.ai` | `DemoPass123!` | Standard user: submit articles, view history, provide feedback |
| **System Administrator** | `admin@truthlens.ai` | `AdminPass123!` | Elevated admin: audit all reviews, dispute rates, reset demo data |

---

## 4. Setup & Local Execution

### Prerequisites
- Node.js (v20+ recommended)
- npm (v9+)
- Google Gemini API Key (`GEMINI_API_KEY`)

### Installation & Run Commands
```bash
# 1. Install dependencies
npm install

# 2. Run system test suite (14 automated unit and integration tests)
npm test

# 3. Start development server (serves Vite frontend + Express backend on port 3000)
npm run dev

# 4. Production build
npm run build
npm start
```

---

## 5. Automated Verification & Test Results

The included automated test suite (`tests/system.test.ts`) verifies 14 critical test cases:
1. `[PASS]` Password hashing and salt verification (PBKDF2 SHA-512)
2. `[PASS]` Rejection of invalid password credentials
3. `[PASS]` Session token generation and user association
4. `[PASS]` Database initialization and demo account seeding
5. `[PASS]` New user registration
6. `[PASS]` Article submission and entity creation (`User 1:N NewsArticle`)
7. `[PASS]` Prediction persistence (`NewsArticle 1:1 Prediction`)
8. `[PASS]` Strict 1:1 relationship enforcement between Article and Prediction
9. `[PASS]` Feedback submission linked to prediction
10. `[PASS]` Feedback foreign key integrity
11. `[PASS]` User-specific history retrieval and search filtering
12. `[PASS]` Cascading deletion (deleting an Article purges its 1:1 Prediction and child Feedbacks)
13. `[PASS]` Access authorization: blocking unauthorized access to private records
14. `[PASS]` Administrative authorization: permitting admin audit overviews

---

## 6. Academic Disclaimer & Limitations

- **Language Model Asymmetry:** An AI assessment is an assistive classification based on linguistic patterns, rhetorical markers, and training knowledge. It does not constitute legal or investigative proof of ground truth.
- **Confidence Metrics:** Confidence scores represent the model's internal assessment certainty and are not mathematically calibrated real-world probabilities.
- **Live Breaking News:** Developing events with absent primary sources are labeled `NEEDS VERIFICATION` by design to prevent hallucinated certainty.
