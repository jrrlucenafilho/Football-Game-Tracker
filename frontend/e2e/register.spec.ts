import { test, expect, Page } from '@playwright/test';

function mockRegister(page: Page) {
  return page.route('*/**/api/auth/register', async route => {
    const body = JSON.parse(route.request().postData() || '{}');
    if (!body.nome || !body.email || !body.senha) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Nome, email e senha são obrigatórios' }),
      });
      return;
    }
    if (body.email === 'existente@teste.com') {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Email já cadastrado' }),
      });
      return;
    }
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 3,
        nome: body.nome,
        email: body.email,
        nivel_acesso: 'COMUM',
      }),
    });
  });
}

test.describe('Register', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });
  });

  test('deve exibir o formulário de cadastro com campos obrigatórios', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/register', { waitUntil: 'networkidle' });

    expect(errors, `Page errors: ${errors.join(', ')}`).toEqual([]);

    await expect(page.locator('h2')).toHaveText('Cadastro');
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cadastrar' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Faça login' })).toBeVisible();
  });

  test('deve cadastrar com sucesso e redirecionar para /login', async ({ page }) => {
    await mockRegister(page);
    await page.goto('/register', { waitUntil: 'networkidle' });

    await page.locator('input[type="text"]').fill('Novo Usuário');
    await page.locator('input[type="email"]').fill('novo@teste.com');
    await page.locator('input[type="password"]').fill('123456');
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page).toHaveURL('/login');
  });

  test('deve mostrar erro ao tentar cadastrar com email existente', async ({ page }) => {
    await mockRegister(page);
    await page.goto('/register', { waitUntil: 'networkidle' });

    await page.locator('input[type="text"]').fill('Existente');
    await page.locator('input[type="email"]').fill('existente@teste.com');
    await page.locator('input[type="password"]').fill('123456');
    await page.getByRole('button', { name: 'Cadastrar' }).click();

    await expect(page.locator('text=Email já cadastrado')).toBeVisible();
  });

  test('deve navegar para login via link', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: 'Faça login' }).click();
    await expect(page).toHaveURL('/login');
  });
});
