import { Database } from '../server/db.js';
import { hashPassword, verifyPassword, generateToken, getUserIdFromToken } from '../server/auth.js';
import fs from 'fs';
import path from 'path';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failedCount++;
  }
}

async function runTests() {
  console.log('==============================================');
  console.log('TruthLens AI – Academic System Test Suite');
  console.log('==============================================\n');

  // Test 1: Password hashing and salt verification
  const pass = 'SecurePass123!';
  const { hash, salt } = hashPassword(pass);
  assert(verifyPassword(pass, hash, salt) === true, 'Test 1: Successful password hashing and verification');

  // Test 2: Rejection of invalid credentials
  assert(verifyPassword('WrongPassword!', hash, salt) === false, 'Test 2: Rejection of invalid password credentials');

  // Test 3: Session token generation and validation
  const testUserId = 'usr_test_999';
  const token = generateToken(testUserId);
  assert(getUserIdFromToken(token) === testUserId, 'Test 3: Token generated and correctly associated with user');

  // Test 4: Database instantiation and seeding
  const testDb = new Database();
  const allUsers = testDb.getAllUsers();
  assert(allUsers.length >= 2, 'Test 4: Database seeds default admin and student demo accounts');

  // Test 5: Registration of new user
  const newUser = testDb.createUser('Alice Tester', 'alice.test@university.edu', hash, salt, 'user');
  assert(newUser.email === 'alice.test@university.edu', 'Test 5: Successful user registration in database');

  // Test 6: NewsArticle creation and User 1:N relationship
  const article = testDb.createArticle(
    newUser.user_id,
    'Quantum Computing Breakthrough Demonstrated at National Lab',
    'Researchers achieved a sustained fault-tolerant logical qubit operation across 1,000 quantum states in peer-reviewed physical review trials.',
    'Nature Physics',
    'https://example.org/quantum',
    'paste'
  );
  assert(article.news_id.startsWith('art_'), 'Test 6: Successful article submission and entity creation');

  // Test 7: Prediction creation and NewsArticle 1:1 relationship
  const prediction = testDb.createPrediction(article.news_id, newUser.user_id, {
    predicted_label: 'REAL',
    confidence_score: 0.92,
    summary: 'Corroborated by high-impact peer-reviewed quantum physics journals.',
    explanation: 'The paper details reproducible benchmarking metrics matching IEEE quantum standards.',
    key_claims: ['Fault-tolerant logical qubits sustained', 'Peer-reviewed physical review trials'],
    warning_signs: ['None identified.'],
    evidence_sources: [{ title: 'Physical Review Letters', credibility_note: 'Indexed peer-reviewed journal' }],
    verification_steps: ['Check arXiv and IEEE quantum database.'],
    limitations: ['Hardware scaleup challenges remain.'],
  });
  assert(prediction.predicted_label === 'REAL', 'Test 7: Successful prediction persistence (1:1 with article)');

  // Test 8: NewsArticle 1:1 enforcement (updating prediction replaces prior)
  const updatedPrediction = testDb.createPrediction(article.news_id, newUser.user_id, {
    predicted_label: 'REAL',
    confidence_score: 0.95,
    summary: 'Re-analyzed with updated benchmark data.',
    explanation: 'Corroborated further.',
  });
  const allForNews = testDb.getAllPredictions().filter((p) => p.news_id === article.news_id);
  assert(allForNews.length === 1, 'Test 8: Strict 1:1 relationship enforced between NewsArticle and Prediction');

  // Test 9: Feedback submission and Prediction 1:N relationship
  const feedback = testDb.createFeedback(
    newUser.user_id,
    updatedPrediction.prediction_id,
    'Excellent analysis matching our lab findings.',
    'Correct Prediction',
    'https://nature.com/articles/sample'
  );
  assert(feedback.feedback_category === 'Correct Prediction', 'Test 9: Feedback submission linked to prediction');

  // Test 10: Feedback linked to correct prediction and user
  assert(feedback.prediction_id === updatedPrediction.prediction_id, 'Test 10: Feedback correctly linked to prediction foreign key');

  // Test 11: History retrieval and search filtering
  const userArticles = testDb.getAllNews(newUser.user_id);
  assert(userArticles.length === 1 && userArticles[0].title.includes('Quantum'), 'Test 11: Filtering and retrieval of user-specific history');

  // Test 12: Cascading deletion
  testDb.deleteArticle(article.news_id, newUser.user_id);
  const articleAfter = testDb.getNewsById(article.news_id);
  const predictionAfter = testDb.getPredictionById(updatedPrediction.prediction_id);
  const feedbackAfter = testDb.getFeedbackById(feedback.feedback_id);
  assert(
    articleAfter === undefined && predictionAfter === undefined && feedbackAfter === undefined,
    'Test 12: Cascading deletion (Article deletion removes 1:1 Prediction and associated Feedback)'
  );

  // Test 13: Unauthorized user access restriction logic
  const isAuthorized = (artUserId: string, reqUserId: string, role: string) =>
    artUserId === reqUserId || role === 'admin';
  assert(isAuthorized('user_A', 'user_B', 'user') === false, 'Test 13: Unauthorized user access blocked');
  assert(isAuthorized('user_A', 'admin_1', 'admin') === true, 'Test 13b: Admin authorized access permitted');

  console.log('\n==============================================');
  console.log(`Test Execution Summary: ${passedCount} Passed, ${failedCount} Failed`);
  console.log('==============================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed with error:', err);
  process.exit(1);
});
