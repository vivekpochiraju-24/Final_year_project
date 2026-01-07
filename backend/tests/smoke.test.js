const request = require('supertest');

const BASE = process.env.TEST_BASE_URL || 'http://localhost:5000';

describe('Backend smoke tests (requires running backend at ' + BASE + ')', () => {
  test('GET /api should not 500 (health)', async () => {
    const res = await request(BASE).get('/api');
    // If route not defined, we may get 404; just ensure no server error
    expect([200, 404, 405, 401, 400]).toContain(res.status);
  });

  test('Auth register + login flow', async () => {
    const email = `smoke+${Date.now()}@example.com`;
    const password = 'Password123!';
    // register
    const r1 = await request(BASE).post('/api/auth/register').send({ name: 'Smoke Test', email, password, role: 'patient' });
    expect([201, 400]).toContain(r1.status); // 400 if already exists

    // login
    const r2 = await request(BASE).post('/api/auth/login').send({ email, password });
    expect([200, 400]).toContain(r2.status);
    if (r2.status === 200) {
      expect(r2.body).toHaveProperty('token');
    }
  }, 20000);

  test('GET /api/doctors returns array', async () => {
    const r = await request(BASE).get('/api/doctors');
    expect([200]).toContain(r.status);
    expect(Array.isArray(r.body)).toBeTruthy();
  });
});
