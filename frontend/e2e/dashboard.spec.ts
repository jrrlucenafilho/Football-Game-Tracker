import { test, expect, Page } from '@playwright/test';

const ADMIN_USER = { id: 1, nome: 'Admin', email: 'admin@teste.com', nivel_acesso: 'ADMIN' as const };
const COMUM_USER = { id: 2, nome: 'User', email: 'user@teste.com', nivel_acesso: 'COMUM' as const };

async function setupDashboard(page: Page, isAdmin: boolean, jogosVazios = false) {
  const user = isAdmin ? ADMIN_USER : COMUM_USER;

  page.route('*/**/api/times', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, nome: 'Flamengo' },
        { id: 2, nome: 'Palmeiras' },
      ]),
    });
  });

  page.route('*/**/api/jogos', async route => {
    const data = jogosVazios ? [] : [
      {
        id: 1, gols_casa: 2, gols_visitante: 1, estadio: 'Maracanã',
        timeCasa: { id: 1, nome: 'Flamengo' },
        timeVisitante: { id: 2, nome: 'Palmeiras' },
      },
    ];
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
  });

  await page.goto('/');
  await page.evaluate((u) => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify(u));
  }, user);
  await page.goto('/', { waitUntil: 'networkidle' });
}

test.describe('Dashboard', () => {
  test('deve redirecionar para /login quando não autenticado', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('deve exibir dashboard com estatísticas e links de admin', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await setupDashboard(page, true);

    expect(errors, `Page errors: ${errors.join(', ')}`).toEqual([]);

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await expect(page.locator('h3').filter({ hasText: 'Times' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Jogos' })).toBeVisible();
    await expect(page.locator('p:has-text("2")').first()).toBeVisible();
    await expect(page.locator('p:has-text("1")').first()).toBeVisible();

    await expect(page.getByRole('link', { name: 'Gerenciar Times' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Gerenciar Jogos' })).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Últimos Jogos' })).toBeVisible();
    await expect(page.getByText('Flamengo').first()).toBeVisible();
    await expect(page.getByText('Palmeiras').first()).toBeVisible();
    await expect(page.getByText('2 x 1')).toBeVisible();
    await expect(page.getByText('Maracanã')).toBeVisible();
  });

  test('deve exibir dashboard sem links de admin para usuário comum', async ({ page }) => {
    await setupDashboard(page, false);

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await expect(page.locator('p:has-text("2")').first()).toBeVisible();
    await expect(page.locator('p:has-text("1")').first()).toBeVisible();

    await expect(page.getByRole('link', { name: 'Gerenciar Times' })).not.toBeVisible();
    await expect(page.getByRole('link', { name: 'Gerenciar Jogos' })).not.toBeVisible();
  });

  test('deve exibir mensagem quando não houver jogos', async ({ page }) => {
    await setupDashboard(page, true, true);

    await expect(page.getByText('Nenhum jogo cadastrado')).toBeVisible();
  });
});
