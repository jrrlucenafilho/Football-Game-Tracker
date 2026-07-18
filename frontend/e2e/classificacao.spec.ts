import { test, expect, Page } from '@playwright/test';

function mockClassificacao(page: Page, data: any[]) {
  page.route('*/**/api/classificacao', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
  });
}

test.describe('Classificação', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
  });

  test('deve exibir classificação vazia quando não há dados', async ({ page }) => {
    mockClassificacao(page, []);
    await page.goto('/classificacao');

    await expect(page.getByRole('heading', { name: 'Classificação' })).toBeVisible();
    await expect(page.getByText('Nenhum dado de classificação disponível')).toBeVisible();
  });

  test('deve exibir tabela de classificação com dados', async ({ page }) => {
    mockClassificacao(page, [
      { timeId: 1, nome: 'Flamengo', pontos: 6, jogos: 2, vitorias: 2, empates: 0, derrotas: 0, golsPro: 5, golsContra: 1, saldoGols: 4 },
      { timeId: 2, nome: 'Palmeiras', pontos: 1, jogos: 2, vitorias: 0, empates: 1, derrotas: 1, golsPro: 2, golsContra: 3, saldoGols: -1 },
    ]);
    await page.goto('/classificacao');

    const linhas = page.locator('table tbody tr');
    await expect(linhas).toHaveCount(2);

    await expect(linhas.nth(0).locator('td').nth(1)).toHaveText('Flamengo');
    await expect(linhas.nth(0).locator('td').nth(2)).toHaveText('6');
    await expect(linhas.nth(0).locator('td').nth(9)).toHaveText('+4');

    await expect(linhas.nth(1).locator('td').nth(1)).toHaveText('Palmeiras');
    await expect(linhas.nth(1).locator('td').nth(2)).toHaveText('1');
    await expect(linhas.nth(1).locator('td').nth(9)).toHaveText('-1');
  });

  test('deve exibir cabeçalhos corretos da tabela', async ({ page }) => {
    mockClassificacao(page, []);
    await page.goto('/classificacao');

    const headers = page.locator('table thead th');
    await expect(headers).toHaveCount(10);
    await expect(headers.nth(1)).toHaveText('Time');
    await expect(headers.nth(2)).toHaveText('P');
    await expect(headers.nth(3)).toHaveText('J');
  });
});
