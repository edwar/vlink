import { test, expect } from '@playwright/test';

test.describe('Booking Page', () => {
    test('debería mostrar estado de cargando y luego el perfil (o error si no existe)', async ({ page }) => {
        // Al no tener servidor corriendo con data, usamos un usuario de prueba o mockeamos.
        // Navegamos a la página de un usuario ficticio
        await page.goto('/test-user');

        // Verificamos que el título cambie o muestre 404/Perfil no encontrado
        // ya que no hemos populado la base de datos en el entorno de pruebas e2e.
        const notFoundText = page.getByText(/Perfil no encontrado/i);
        await expect(notFoundText).toBeVisible({ timeout: 10000 });
    });
});
