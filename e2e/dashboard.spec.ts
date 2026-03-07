import { test, expect } from '@playwright/test';

test.describe('Dashboard (Protected Routes)', () => {
    test('Redirects unauthenticated users to login', async ({ page }) => {
        // Attempting to visit a protected route should redirect to /sign-in
        await page.goto('/dashboard');

        // Wait for URL to change to sign-in or check if login UI mounts
        await expect(page).toHaveURL(/.*sign-in.*/);
    });

    // Mocking an authenticated state would require setting a valid cookie
    // or utilizing a 'global-setup' script.
    // Example:
    /*
    test.describe('Authenticated', () => {
        test.use({ storageState: 'playwright/.auth/user.json' });

        test('Loads dashboard successfully', async ({ page }) => {
            await page.goto('/dashboard');
            await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
            await expect(page.getByRole('link', { name: /Disponibilidad/i })).toBeVisible();
            await expect(page.getByRole('link', { name: /Servicios/i })).toBeVisible();
        });
    });
    */
});
