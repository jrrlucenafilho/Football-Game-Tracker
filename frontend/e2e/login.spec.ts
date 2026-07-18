import { test, expect, Page } from '@playwright/test';

function mockLogin(page: Page) {
  return page.route('*/**/api/auth/login', async route => {
    const body = JSON.parse(route.request().postData() || '{}');
    if (body.email === 'admin@teste.com' && body.senha === 'admin123') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'fake-token-admin',
          usuario: { id: 1, nome: 'Admin', email: 'admin@teste.com', nivel_acesso: 'ADMIN' },
        }),
      });
    } else if (body.email === 'user@teste.com' && body.senha === 'user123') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'fake-token-user',
          usuario: { id: 2, nome: 'User', email: 'user@teste.com', nivel_acesso: 'COMUM' },
        }),
      });
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Credenciais inválidas' }),
      });
    }
  });
}

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  test('deve exibir o formulário de login com campos obrigatórios', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/login', { waitUntil: 'networkidle' });

    expect(errors, `Page errors: ${errors.join(', ')}`).toEqual([]);

    await expect(page.locator('h2')).toHaveText('Login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
    await expect(page.locator('text=Não tem conta?')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cadastre-se' })).toBeVisible();
  });

  test('deve redirecionar para / ao fazer login com credenciais válidas (admin)', async ({ page }) => {
    await mockLogin(page);
    await page.goto('/login', { waitUntil: 'networkidle' });

    await page.locator('input[type="email"]').fill('admin@teste.com');
    await page.locator('input[type="password"]').fill('admin123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Admin (Admin)')).toBeVisible();
  });

  test('deve redirecionar para / ao fazer login com credenciais válidas (comum)', async ({ page }) => {
    await mockLogin(page);
    await page.goto('/login', { waitUntil: 'networkidle' });

    await page.locator('input[type="email"]').fill('user@teste.com');
    await page.locator('input[type="password"]').fill('user123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.locator('text=User (Torcedor)')).toBeVisible();
  });

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await mockLogin(page);
    await page.goto('/login', { waitUntil: 'networkidle' });

    await page.locator('input[type="email"]').fill('admin@teste.com');
    await page.locator('input[type="password"]').fill('senha_errada');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.locator('text=Credenciais inválidas')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('deve redirecionar para / se já estiver logado', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, nome: 'Admin', email: 'admin@teste.com', nivel_acesso: 'ADMIN' }));
    });

    await page.goto('/login', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL('/');
  });

  test('deve navegar para cadastro via link', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: 'Cadastre-se' }).click();
    await expect(page).toHaveURL('/register');
  });
});
