import { test, expect } from '@playwright/test';

test.describe('Security Regression: Project Access Authorization', () => {
  const baseURL = process.env.TARGET_BASE_URL || 'http://localhost:8000';
  const userBToken = process.env.USER_B_TOKEN || 'mock_token_for_user_b';
  const targetResourceId = process.env.TARGET_RESOURCE_ID || '123';

  test('User B must receive 403 Forbidden when accessing User A project', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/projects/${targetResourceId}`, {
      headers: {
        'Authorization': `Bearer ${userBToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Fix validation: Once patched, access must be denied
    expect([403, 404]).toContain(response.status());
  });
});

