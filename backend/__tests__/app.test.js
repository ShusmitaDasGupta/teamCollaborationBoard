const request = require('supertest');

// Mock mongoose before importing app
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue({}),
    connection: { readyState: 1 }
  };
});

describe('API Health Check', () => {
  let app;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
    // Import app after env vars are set
    app = require('../server');
  });

  it('GET /api/health returns 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });

  it('Protected route returns 401 without token', async () => {
    const res = await request(app).get('/api/boards');
    expect(res.statusCode).toBe(401);
  });
});

describe('Auth Validation', () => {
  let app;
  beforeAll(() => {
    process.env.JWT_SECRET = 'test_secret';
    app = require('../server');
  });

  it('POST /api/auth/register with missing fields returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' }); // missing name and password
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/auth/login with invalid body returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email' });
    expect(res.statusCode).toBe(400);
  });
});
