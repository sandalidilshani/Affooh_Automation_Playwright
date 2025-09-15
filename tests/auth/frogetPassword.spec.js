import ForgotPasswordPage from '../../pages/auth/ForgotPasswordPage';
import { LoginPage } from '../../pages/auth/LoginPage';
import { test, expect } from '@playwright/test';


test.describe('1.2 | Forgot Password ', () => {

    let forgotPasswordPage;
    test.beforeEach(async ({ page }) => {
        forgotPasswordPage = new ForgotPasswordPage(page);
         const loginPage = new LoginPage(page);
        await loginPage.navigateToLogin();
        await forgotPasswordPage.navigateToForgotPassword();
    });

    test('TC28 - Forgot Password Link Navigation', async ({ page }) => {
       
        await expect(page).toHaveURL(/.*forgot-password/);
    });

    test('TC30 - Password Reset Email Submission (Invalid Email)', async ({ page }) => {
        const forgotPasswordPage = new ForgotPasswordPage(page);
        await forgotPasswordPage.forgotPassword('invalid@example.com');
        await expect(page.locator('text=This email is not registered.')).toBeVisible();
    });

    test('TC32 - OTP Verification Failure (Invalid/Expired OTP)', async ({ page }) => {
        await forgotPasswordPage.submitEmail('rkpsandalidilshani@gmail.com');
        await forgotPasswordPage.resetPasswordWithOtp('000000','sandali@12','sandali@12');
        await expect(page.locator('text=Invalid/Expired OTP. Please try again.')).toBeVisible();
    });

    test('TC33 - New Password Mismatch', async ({ page }) => {
        await forgotPasswordPage.submitEmail('sandalidilshanitemp@gmail.com');
        await forgotPasswordPage.resetPasswordWithOtp('000000','sandali@1','sand');
        await expect(page.locator('text=Passwords do not match.')).toBeVisible();
    });

   test('TC34 - Weak Password Validation', async ({ page }) => {
    await forgotPasswordPage.submitEmail('sandalidilshanitemp@gmail.com');
    await forgotPasswordPage.resetPasswordWithOtp('000000', '21', '21');
    await expect(page.locator('text=Password must be at least 8 characters long')).toBeVisible(); // Corrected text
});
    test('TC35 - Successful Login After Password Reset', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.navigateToLogin();
        await loginPage.login('registered@example.com', 'NewPassword123');
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('TC36 - Multiple OTP Attempts & Lockout', async ({ page }) => {
        const forgotPasswordPage = new ForgotPasswordPage(page);
        await forgotPasswordPage.navigate();
        await forgotPasswordPage.submitEmail('registered@example.com');
        for (let i = 0; i < 5; i++) {
            const resetPasswordPage = new ResetPasswordPage(page);
            await resetPasswordPage.submitOtpAndPasswords('000000', '', '');
        }
        await expect(page.locator('text=Too many failed attempts...')).toBeVisible();
    });

    test('TC37 - Email Notification for Password Reset', async ({ page }) => {
        const resetPasswordPage = new ResetPasswordPage(page);
        await resetPasswordPage.navigate();
        await resetPasswordPage.submitOtpAndPasswords('', 'Password123', 'Password123');
        await expect(page.locator('text=Your password has been reset successfully.')).toBeVisible();
    });

    test('TC38 - Session Termination After Password Reset', async ({ page, browser }) => {
        const context1 = await browser.newContext();
        const page1 = await context1.newPage();
        const loginPage1 = new LoginPage(page1);
        await loginPage1.navigateToLogin();
        await loginPage1.login('registered@example.com', 'OldPassword123');

        const context2 = await browser.newContext();
        const page2 = await context2.newPage();
        const resetPasswordPage = new ResetPasswordPage(page2);
        await resetPasswordPage.navigate();
        await resetPasswordPage.submitOtpAndPasswords('', 'NewPassword123', 'NewPassword123');

        await page1.reload();
        await expect(page1.locator('text=Session expired')).toBeVisible();
    });

    test('TC40 - Browser Back Button After Reset', async ({ page }) => {
        const resetPasswordPage = new ResetPasswordPage(page);
        await resetPasswordPage.navigate();
        await resetPasswordPage.submitOtpAndPasswords('', 'Password123', 'Password123');
        await page.goBack();
        await expect(page).toHaveURL(/.*login/);
    });
});