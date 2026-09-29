import request from 'supertest';
import app from '../src/app.js';

describe('TeenSpend Authentication API Tests', () => {
  const uniqueEmail = `testteen_${Date.now()}@example.test`;
  const validPassword = 'SecurePassword123!';
  let authToken = '';

  test('POST /api/auth/register - Successfully registers new teenager account', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jordan Sparks',
        email: uniqueEmail,
        password: validPassword,
        age: 15,
        currency: 'USD'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(uniqueEmail.toLowerCase());
    expect(res.body.data.token).toBeDefined();
    // Security check: password_hash must NEVER be exposed
    expect(res.body.data.user.password_hash).toBeUndefined();

    authToken = res.body.data.token;
  });

  test('POST /api/auth/register - Rejects registration with duplicate email (409 Conflict)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jordan Duplicate',
        email: uniqueEmail,
        password: validPassword,
        age: 15
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/register - Rejects invalid age below 10 (422 Validation Error)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Baby Kid',
        email: `kid_${Date.now()}@example.test`,
        password: validPassword,
        age: 8
      });

    expect(res.statusCode).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login - Successfully logs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: validPassword
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(uniqueEmail.toLowerCase());
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  test('POST /api/auth/login - Rejects incorrect password (401 Unauthorized)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueEmail,
        password: 'WrongPassword999'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/auth/me - Retrieves current session with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(uniqueEmail.toLowerCase());
  });

  test('GET /api/auth/me - Rejects request without token (401 Unauthorized)', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});
