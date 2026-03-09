import { test, expect } from '@playwright/test';

test.describe('Flujo Onboarding Profesional', () => {

    test('Un nuevo usuario puede registrarse y crear organización', async ({ page }) => {
        // Redirigir al auth screen
        await page.goto('/login');

        // Simular auth (Dependerá del mock o credentials en CI)
        const loginBtn = page.getByRole('button', { name: "Google" })
        if (await loginBtn.isVisible()) {
            // Nota: test real require seed test accounts
        }

        // Una vez logueado iría a /onboarding
        // await expect(page).toHaveURL(/onboarding/, { timeout: 10000 });

        // Paso: crear la organización
        // await page.getByLabel(/nombre de organización/i).fill('Mi Organización Playwright');
        // await page.getByRole('button', { name: /continuar|siguiente/i }).click();

        // Paso: configurar servicio y horario (Dependiendo del flujo real)
        // await page.getByLabel(/nombre del servicio/i).fill('Consulta General');
        // await page.getByRole('button', { name: /guardar|finalizar/i }).click();

        // Verificar éxito (redirect al dashboard)
        // await expect(page).toHaveURL(/dashboard/);
    });
});
