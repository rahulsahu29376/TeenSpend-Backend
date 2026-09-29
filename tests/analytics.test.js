import request from 'supertest';
import app from '../src/app.js';

describe('TeenSpend Dashboard & Analytics API Tests', () => {
  let userToken = '';

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Casey Teen',
        email: `casey_${Date.now()}@example.test`,
        password: 'Password123!',
        age: 16
      });
    userToken = res.body.data.token;

    // Add an income record: $100
    await request(app)
      .post('/api/income')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        amount: 100.00,
        source: 'Weekly allowance',
        date: new Date().toISOString().split('T')[0]
      });

    // Add an expense: $30
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        amount: 30.00,
        category: 'Food',
        description: 'Tacos after school',
        payment_method: 'Debit Card'
      });
  });

  test('GET /api/analytics/dashboard - Returns consolidated stats with balance calculation', async () => {
    const res = await request(app)
      .get('/api/analytics/dashboard')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const { summary, categoryBreakdown, monthlyTrend, insights } = res.body.data;
    expect(summary).toBeDefined();
    expect(summary.totalIncome).toBe(100.00);
    expect(summary.totalExpenses).toBe(30.00);
    // Formula verification: balance = income - expenses
    expect(summary.currentBalance).toBe(70.00);

    expect(categoryBreakdown).toBeDefined();
    expect(categoryBreakdown.length).toBeGreaterThanOrEqual(1);

    expect(monthlyTrend).toBeDefined();
    expect(monthlyTrend.length).toBe(6);

    expect(insights).toBeDefined();
    expect(Array.isArray(insights)).toBe(true);
  });
});
