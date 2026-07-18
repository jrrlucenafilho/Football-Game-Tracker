import { test, expect, Page } from '@playwright/test';

async function setupUsuarios(page: Page) {
  page.route('*/**/api/usuarios', async (route, request) => {
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, nome: 'Admin', email: 'admin@teste.com', nivel_acesso: 'ADMIN' },
          { id: 2, nome: 'João', email: 'joao@teste.com', nivel_acesso: 'COMUM' },
        ]),
      });
    } else if (request.method() === 'POST') {
      const body = JSON.parse(request.postData() || '{}');
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 3, nome: body.nome, email: body.email, nivel_acesso: body.nivel_acesso || 'COMUM' }),
      });
    } else {
      await route.fulfill({ status: 405, contentType: 'application/json', body: JSON.stringify({ error: 'Método não permitido' }) });
    }
  });

  page.route('*/**/api/usuarios/*', async (route, request) => {
    if (request.method() === 'PUT') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, nome: 'Admin Atualizado', email: 'admin@teste.com', nivel_acesso: 'ADMIN' }),
      });
    } else if (request.method() === 'DELETE') {
      await route.fulfill({ status: 204 });
    }
  });

  await page.goto('/usuarios');
  await page.evaluate(() => {
    localStorage.setItem('token', 'fake-token-admin');
    localStorage.setItem('user', JSON.stringify({ id: 1, nome: 'Admin', email: 'admin@teste.com', nivel_acesso: 'ADMIN' }));
  });
  await page.goto('/usuarios', { waitUntil: 'networkidle' });
}

test.describe('Usuários (admin)', () => {
  test('deve redirecionar para /login quando não autenticado', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/usuarios');
    await expect(page).toHaveURL('/login');
  });

  test('deve listar usuários na tabela', async ({ page }) => {
    await setupUsuarios(page);

    await expect(page.getByRole('heading', { name: 'Gerenciar Usuários' })).toBeVisible();
    const linhas = page.locator('table tbody tr');
    await expect(linhas).toHaveCount(2);
    await expect(linhas.nth(0).getByRole('cell', { name: 'Admin', exact: true })).toBeVisible();
    await expect(linhas.nth(0).getByText('Administrador')).toBeVisible();
    await expect(linhas.nth(1).getByRole('cell', { name: 'João', exact: true })).toBeVisible();
    await expect(linhas.nth(1).getByText('Comum')).toBeVisible();
  });

  test('deve exibir formulário ao clicar em Novo Usuário', async ({ page }) => {
    await setupUsuarios(page);
    await page.getByRole('button', { name: 'Novo Usuário' }).click();

    await expect(page.getByRole('heading', { name: 'Novo Usuário' })).toBeVisible();
    await expect(page.locator('form input[type="text"]').nth(0)).toBeVisible();
    await expect(page.locator('form input[type="email"]')).toBeVisible();
    await expect(page.locator('form select')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Criar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible();
  });

  test('deve criar novo usuário via formulário', async ({ page }) => {
    await setupUsuarios(page);
    await page.getByRole('button', { name: 'Novo Usuário' }).click();

    await page.locator('form input[type="text"]').nth(0).fill('Maria');
    await page.locator('form input[type="email"]').fill('maria@teste.com');
    await page.locator('form input[type="password"]').fill('123456');
    await page.getByRole('button', { name: 'Criar' }).click();

    await expect(page.getByRole('heading', { name: 'Novo Usuário' })).not.toBeVisible();
  });

  test('deve preencher formulário ao clicar em Editar', async ({ page }) => {
    await setupUsuarios(page);

    await page.locator('table tbody tr').nth(0).getByRole('button', { name: 'Editar' }).click();

    await expect(page.getByRole('heading', { name: 'Editar Usuário' })).toBeVisible();
    await expect(page.locator('form input[type="text"]').nth(0)).toHaveValue('Admin');
    await expect(page.locator('form input[type="email"]')).toHaveValue('admin@teste.com');
    await expect(page.getByText('Nova senha (deixe em branco para manter)')).toBeVisible();
  });

  test('deve atualizar usuário via formulário de edição', async ({ page }) => {
    await setupUsuarios(page);

    await page.locator('table tbody tr').nth(0).getByRole('button', { name: 'Editar' }).click();
    await page.locator('form input[type="text"]').nth(0).fill('Admin Atualizado');
    await page.getByRole('button', { name: 'Atualizar' }).click();
  });

  test('deve exibir confirmação ao excluir', async ({ page }) => {
    await setupUsuarios(page);

    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('excluir');
      dialog.accept();
    });

    await page.locator('table tbody tr').nth(0).getByRole('button', { name: 'Excluir' }).click();
  });
});
