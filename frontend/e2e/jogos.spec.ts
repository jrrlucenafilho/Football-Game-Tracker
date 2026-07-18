import { test, expect, Page } from '@playwright/test';

async function setupJogos(page: Page) {
  await page.route('*/**/api/times', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, nome: 'Flamengo' },
        { id: 2, nome: 'Palmeiras' },
        { id: 3, nome: 'Santos' },
      ]),
    });
  });

  await page.route('*/**/api/jogos', async (route, request) => {
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1, time_casa_id: 1, time_visitante_id: 2, gols_casa: 2, gols_visitante: 1, estadio: 'Maracanã', data_hora: '2026-07-18T20:00:00.000Z',
            timeCasa: { id: 1, nome: 'Flamengo' },
            timeVisitante: { id: 2, nome: 'Palmeiras' },
          },
        ]),
      });
    } else if (request.method() === 'POST') {
      const body = JSON.parse(request.postData() || '{}');
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 2, ...body, timeCasa: { id: body.time_casa_id, nome: 'Flamengo' }, timeVisitante: { id: body.time_visitante_id, nome: 'Santos' } }),
      });
    } else {
      await route.fulfill({ status: 405, contentType: 'application/json', body: JSON.stringify({ error: 'Método não permitido' }) });
    }
  });

  await page.route('*/**/api/jogos/*', async (route, request) => {
    if (request.method() === 'PUT') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, gols_casa: 3, gols_visitante: 0, estadio: 'Maracanã', data_hora: '2026-07-18T20:00:00.000Z' }),
      });
    } else if (request.method() === 'DELETE') {
      await route.fulfill({ status: 204 });
    }
  });

  await page.goto('/jogos');
  await page.evaluate(() => {
    localStorage.setItem('token', 'fake-token-admin');
    localStorage.setItem('user', JSON.stringify({ id: 1, nome: 'Admin', email: 'admin@teste.com', nivel_acesso: 'ADMIN' }));
  });
  await page.goto('/jogos', { waitUntil: 'networkidle' });
}

test.describe('Jogos (admin)', () => {
  test('deve redirecionar para /login quando não autenticado', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/jogos');
    await expect(page).toHaveURL('/login');
  });

  test('deve listar jogos na tabela', async ({ page }) => {
    await setupJogos(page);

    await expect(page).toHaveURL(/\/jogos/);
    await expect(page.getByRole('heading', { name: 'Gerenciar Jogos' })).toBeVisible();
    await expect(page.locator('table tbody tr')).toHaveCount(1);
    await expect(page.getByText('Flamengo').first()).toBeVisible();
    await expect(page.getByText('Palmeiras').first()).toBeVisible();
    await expect(page.getByText('2 x 1')).toBeVisible();
    await expect(page.getByText('Maracanã')).toBeVisible();
  });

  test('deve exibir formulário ao clicar em Novo Jogo', async ({ page }) => {
    await setupJogos(page);
    await page.getByRole('button', { name: 'Novo Jogo' }).click();

    await expect(page.getByRole('heading', { name: 'Novo Jogo' })).toBeVisible();
    await expect(page.getByText('Time Casa *')).toBeVisible();
    await expect(page.getByText('Time Visitante *')).toBeVisible();
    await expect(page.getByText('Gols Casa')).toBeVisible();
    await expect(page.getByText('Gols Visitante')).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Estádio' })).toBeVisible();
    await expect(page.getByText('Data/Hora')).toBeVisible();
  });

  test('deve criar novo jogo via formulário', async ({ page }) => {
    await setupJogos(page);
    await page.getByRole('button', { name: 'Novo Jogo' }).click();

    await page.locator('select').nth(0).selectOption('1');
    await page.locator('select').nth(1).selectOption('3');
    await page.locator('input[type="number"]').nth(0).fill('3');
    await page.locator('input[type="number"]').nth(1).fill('0');
    await page.locator('input[type="text"]').nth(0).fill('Vila Belmiro');
    await page.getByRole('button', { name: 'Criar' }).click();
  });

  test('deve preencher formulário ao clicar em Editar', async ({ page }) => {
    await setupJogos(page);

    await page.locator('table tbody tr').nth(0).getByRole('button', { name: 'Editar' }).click();

    await expect(page.getByRole('heading', { name: 'Editar Jogo' })).toBeVisible();
    await expect(page.locator('form select').nth(0)).toHaveValue('1');
    await expect(page.locator('form select').nth(1)).toHaveValue('2');
  });

  test('deve atualizar jogo via formulário de edição', async ({ page }) => {
    await setupJogos(page);

    await page.locator('table tbody tr').nth(0).getByRole('button', { name: 'Editar' }).click();
    await page.locator('input[type="number"]').nth(0).fill('3');
    await page.locator('input[type="number"]').nth(1).fill('0');
    await page.getByRole('button', { name: 'Atualizar' }).click();
  });

  test('deve exibir confirmação ao excluir', async ({ page }) => {
    await setupJogos(page);

    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('excluir');
      dialog.accept();
    });

    await page.locator('table tbody tr').nth(0).getByRole('button', { name: 'Excluir' }).click();
  });

  test('deve filtrar times visitantes ao selecionar time da casa', async ({ page }) => {
    await setupJogos(page);
    await page.getByRole('button', { name: 'Novo Jogo' }).click();

    await page.locator('select').nth(0).selectOption('1');

    const visitanteOptions = page.locator('select').nth(1).locator('option');
    await expect(visitanteOptions).toHaveCount(3);
    const values = await visitanteOptions.evaluateAll(options => options.map(o => (o as HTMLOptionElement).value));
    expect(values).not.toContain('1');
  });
});
