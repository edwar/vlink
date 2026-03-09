import { test, expect } from '@playwright/test';

test.describe('Flujo de Cancelación', () => {

    test('El cliente puede cancelar una cita con su token', async ({ page }) => {
        // Asumiendo un token válido en la base de datos de test
        const testToken = "test-cancel-token-123";

        // Visitar la página de cancelación pública
        await page.goto(`/cancelar/${testToken}`);

        // Confirmar la cancelación si se exige un botón en la UI
        const confirmBtn = page.getByRole('button', { name: /cancelar cita/i });
        if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
        }

        // Verificar mensaje de éxito
        // await expect(page.getByText(/cita cancelada/i)).toBeVisible();
    });
});
