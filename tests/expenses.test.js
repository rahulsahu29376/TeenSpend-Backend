import request from 'supertest';
import app from '../src/app.js';

describe('TeenSpend Expense CRUD & Security Isolation Tests', () => {
  let userAToken = '';
  let userBToken = '';
  let expenseAId = '';

  beforeAll(async () => {
    // Register User A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User A',
        email: `usera_${Date.now()}@example.test`,
        password: 'PasswordA123!',
        age: 16
      });
    userAToken = resA.body.data.token;

    // Register User B
    const resB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User B',
        email: `userb_${Date.now()}@example.test`,
        password: 'PasswordB123!',
        age: 17
      });
    userBToken = resB.body.data.token;
  });

  test('POST /api/expenses - User A creates an expense successfully', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        amount: 24.50,
        category: 'Food',
        description: 'Team pizza lunch',
        payment_method: 'Debit Card',
        notes: 'Celebrated tournament win'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.expense).toBeDefined();
    expect(res.body.data.expense.amount).toBe(24.50);
    expenseAId = res.body.data.expense.id;
  });

  test('POST /api/expenses - Rejects negative amount with 422', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        amount: -15.00,
        category: 'Food',
        description: 'Invalid negative expense'
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test('SECURITY: User B CANNOT view User A expense (404/Isolated)', async () => {
    const res = await request(app)
      .get(`/api/expenses/${expenseAId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    // Must return 404 so User B cannot even discover User A's expense exists
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('SECURITY: User B CANNOT update User A expense', async () => {
    const res = await request(app)
      .put(`/api/expenses/${expenseAId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        amount: 999.00,
        description: 'Hacked description'
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('SECURITY: User B CANNOT delete User A expense', async () => {
    const res = await request(app)
      .delete(`/api/expenses/${expenseAId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/expenses - User A views own expense with pagination', async () => {
    const res = await request(app)
      .get('/api/expenses?page=1&limit=10')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.page).toBe(1);
  });

  test('PUT /api/expenses/:id - User A updates own expense', async () => {
    const res = await request(app)
      .put(`/api/expenses/${expenseAId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        description: 'Updated pizza lunch with dessert',
        amount: 27.50
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.expense.amount).toBe(27.50);
  });

  test('DELETE /api/expenses/:id - User A deletes own expense', async () => {
    const res = await request(app)
      .delete(`/api/expenses/${expenseAId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
