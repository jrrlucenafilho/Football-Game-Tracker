import { test, expect, Page } from '@playwright/test';

async function setupAdmin(page: Page) {
  page.route('*/**/api/times', async (route, request) => {
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, nome: 'Flamengo', cidade: 'Rio de Janeiro', tecnico: 'Tite' },
          { id: 2, nome: 'Palmeiras', cidade: 'São Paulo', tecnico: 'Abel Ferreira' },
        ]),
      });
    } else if (request.method() === 'POST') {
      const body = JSON.parse(request.postData() || '{}');
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 3, ...body }),
      });
    } else {
      await route.fulfill({ status: 405, contentType: 'application/json', body: JSON.stringify({ error: 'Método não permitido' }) });
    }
  });

  page.route('*/**/api/times/*', async (route, request) => {
    if (request.method() === 'PUT') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, nome: 'Flamengo Atualizado', cidade: 'Rio', tecnico: 'Novo Técnico' }),
      });
    } else if (request.method() === 'DELETE') {
      await route.fulfill({ status: 204 });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 1, nome: 'Flamengo', cidade: 'Rio de Janeiro', tecnico: 'Tite' }) });
    }
  });

  await page.goto('/times');
  await page.evaluate(() => {
    localStorage.setItem('token', 'fake-token-admin');
    localStorage.setItem('user', JSON.stringify({ id: 1, nome: 'Admin', email: 'admin@teste.com', nivel_acesso: 'ADMIN' }));
  });
  await page.goto('/times', { waitUntil: 'networkidle' });
}

test.describe('Times (admin)', () => {
  test('deve redirecionar para /login quando não autenticado', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/times');
    await expect(page).toHaveURL('/login');
  });

  test('deve listar times na tabela', async ({ page }) => {
    await setupAdmin(page);

    await expect(page.getByRole('heading', { name: 'Gerenciar Times' })).toBeVisible();
    const linhas = page.locator('table tbody tr');
    await expect(linhas).toHaveCount(2);
    await expect(linhas.nth(0).getByText('Flamengo')).toBeVisible();
    await expect(linhas.nth(1).getByText('Palmeiras')).toBeVisible();
  });

  test('deve exibir formulário ao clicar em Novo Time', async ({ page }) => {
    await setupAdmin(page);
    await page.getByRole('button', { name: 'Novo Time' }).click();

    await expect(page.getByRole('heading', { name: 'Novo Time' })).toBeVisible();
    await expect(page.locator('form input[type="text"]').nth(0)).toBeVisible();
    await expect(page.locator('form input[type="text"]').nth(1)).toBeVisible();
    await expect(page.locator('form input[type="text"]').nth(2)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Criar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancelar' })).toBeVisible();
  });

  test('deve criar novo time via formulário', async ({ page }) => {
    await setupAdmin(page);
    await page.getByRole('button', { name: 'Novo Time' }).click();

    await page.locator('form input[type="text"]').nth(0).fill('Santos');
    await page.locator('form input[type="text"]').nth(1).fill('Santos');
    await page.locator('form input[type="text"]').nth(2).fill('Fábio Carille');
    await page.getByRole('button', { name: 'Criar' }).click();

    await expect(page.getByRole('heading', { name: 'Novo Time' })).not.toBeVisible();
  });

  test('deve preencher formulário ao clicar em Editar', async ({ page }) => {
    await setupAdmin(page);

    await page.locator('table tbody tr').nth(0).getByRole('button', { name: 'Editar' }).click();

    await expect(page.getByRole('heading', { name: 'Editar Time' })).toBeVisible();
    await expect(page.locator('form input[type="text"]').nth(0)).toHaveValue('Flamengo');
    await expect(page.locator('form input[type="text"]').nth(1)).toHaveValue('Rio de Janeiro');
    await expect(page.locator('form input[type="text"]').nth(2)).toHaveValue('Tite');
  });

  test('deve atualizar time via formulário de edição', async ({ page }) => {
    await setupAdmin(page);

    await page.locator('table tbody tr').nth(0).getByRole('button', { name: 'Editar' }).click();
    await page.locator('form input[type="text"]').nth(0).fill('Flamengo Atualizado');
    await page.getByRole('button', { name: 'Atualizar' }).click();

    await expect(page.getByRole('heading', { name: 'Editar Time' })).not.toBeVisible();
  });

  test('deve exibir confirmação ao excluir e remover da lista', async ({ page }) => {
    await setupAdmin(page);

    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('excluir');
      dialog.accept();
    });

    await page.locator('table tbody tr').nth(0).getByRole('button', { name: 'Excluir' }).click();
  });

  test('deve fechar formulário ao clicar em Cancelar', async ({ page }) => {
    await setupAdmin(page);
    await page.getByRole('button', { name: 'Novo Time' }).click();
    await expect(page.getByRole('heading', { name: 'Novo Time' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByRole('heading', { name: 'Novo Time' })).not.toBeVisible();
  });
});
