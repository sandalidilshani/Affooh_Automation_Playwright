import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/LoginPage';
import TestDataHelper from '../../utils/TestDataHelper';
import logger from '../../utils/Logger';
import fs from 'fs';
import path from 'path';

let loginPage;
let testData;

test.describe('Login Tests - Comprehensive Suite', () => {
    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        testData = new TestDataHelper();
        await loginPage.navigateToLogin();
    });

    // TC13 - Valid login
    test('TC13 - Valid login with registered credentials', async ({ page }) => {
        const data = testData.getTestDataById('TC13');
        console.log('Test Data for TC13:', data.email);
    
        await loginPage.validLogin(data.email, data.password);
        await expect(page).toHaveURL(/.*dashboard/);

        

        logger.info('TC13 - Test completed successfully');
    });

    // TC14 - Invalid email
    test('TC14 - Error message for invalid/unregistered email', async ({ page }) => {
        const data = testData.getTestDataById('TC14');
        const expectedError = 'User does not exist.';
        await loginPage.invalidLogin(data.email, data.password);
        await expect(page.getByText(expectedError)).toBeVisible();
    });

    // TC15 - Incorrect password
    test('TC15 - Error message for incorrect password', async ({ page }) => {
        const data = testData.getTestDataById('TC15');
        const expectedError = 'Incorrect username or password.';
        await loginPage.invalidLogin(data.email, data.password);
        await expect(page.getByText(expectedError)).toBeVisible();
    });

    // TC16 - Empty fields validation
    test('TC16 - Validation for empty fields', async ({ page }) => {
        const data = testData.getTestDataById('TC16');
        const expectedError = 'username is a required field';
        await loginPage.invalidLogin(data.email, data.password);
        await expect(page.getByText(expectedError)).toBeVisible();
    });

    // TC17 - Account lock
    test('TC17 - Account lock after maximum failed attempts', async ({ page }) => {
        const data = testData.getTestDataById('TC17');
        const expectedError = 'Password attempts exceeded';
        await loginPage.multipleFailedAttempts(data.email, data.password, data.maxAttempts);
        await expect(page.getByText(expectedError).first()).toBeVisible();
    });

    // TC18 - Forgot password
    test('TC18 - Forgot password functionality', async ({ page }) => {
        const data = testData.getTestDataById('TC18');
        const expectedSuccessMessage = 'Verification code has been sent to your email';
        await loginPage.forgotPassword(data.email);
        await expect(page.getByText(expectedSuccessMessage)).toBeVisible();
    });

    // TC19 - Password reset with valid OTP
    test('TC19 - Password reset with valid OTP', async ({ page }) => {
        const data = testData.getTestDataById('TC19');
        const expectedSuccessMessage = 'Password reset successfully.';
        await loginPage.forgotPassword(data.email);
        await loginPage.resetPasswordWithOtp(data.otp, data.newPassword, data.confirmPassword);
        await expect(page.locator('.react-toast-notifications__toast__content:has-text("Password reset successfully.")')).toBeVisible();
        await expect(page).toHaveURL(/.*login/);
    });

    // TC20 - Password reset with invalid OTP
    test('TC20 - Password reset with invalid OTP', async ({ page }) => {
        const data = testData.getTestDataById('TC20');
        const expectedError = 'Invalid verification code provided, please try again.';
         await loginPage.forgotPassword(data.email);
        await loginPage.resetPasswordWithOtp(data.otp, data.newPassword, data.confirmPassword);
        await expect(page.getByText(expectedError)).toBeVisible();
    });

    // TC21 - Dashboard redirection for different users
    test('TC21 - Dashboard redirection for different users', async ({ page }) => {
        const data = testData.getTestDataById('TC21');
        for (const [userType, credentials] of Object.entries(data)) {
            const expectedDashboard = credentials.expectedDashboard;
            await loginPage.navigateToLogin();
            await loginPage.validLogin(credentials.email, credentials.password, expectedDashboard);
            await expect(page).toHaveURL(new RegExp(`.*${expectedDashboard}`));

            await loginPage.logout();
        }
    });

    // TC22 - Navigate to login from registration
    test('TC22 - Navigate to login from registration page', async ({ page }) => {
        const data = testData.getTestDataById('TC22');
        await loginPage.navigateToRegisterFromLogin();
        await expect(page.getByText('Register')).toBeVisible();
    
        // Verify redirection to the login page
        await expect(page).toHaveURL(/.*login/);
    });

    // TC23 - Email format validation
    test('TC23 - Email format validation', async ({ page }) => {
        const data = testData.getTestDataById('TC23');
        const expectedError = 'User does not exist.';
        await loginPage.invalidLogin(data.email, data.password);
        await expect(page.getByText(expectedError)).toBeVisible();
    });

    // TC24 - Password field masking
    test('TC24 - Password field input masking', async ({ page }) => {
        const data = testData.getTestDataById('TC24');
        const expectedType = 'password';
        await loginPage.passwordInput.fill(data.password);
        const passwordType = await loginPage.passwordInput.getAttribute('type');
        expect(passwordType).toBe(expectedType);
    });

    // TC25 - Prevent return to login
    test('TC25 - Prevent return to login page after login', async ({ page }) => {
        const data = testData.getTestDataById('TC25');
        await loginPage.validLogin(data.email, data.password);
        await expect(page).toHaveURL(/.*dashboard/);
        await page.goBack();
        await expect(page).toHaveURL(/.*dashboard/);

    });

    // TC26 - Session persistence
    test('TC26 - Session remains active on page refresh', async ({ page }) => {
        const data = testData.getTestDataById('TC26');
        await loginPage.validLogin(data.email, data.password);
        await page.reload();
        await expect(page).toHaveURL(/.*dashboard/);
    });

    // TC27 - Logout functionality
    test('TC27 - Successful logout functionality', async ({ page }) => {
        const data = testData.getTestDataById('TC27');
        await loginPage.validLogin(data.email, data.password);
        await loginPage.logout();
        await expect(page).toHaveURL(/.*login/);
    });

    // EDGE cases
    test('EDGE - Empty email field validation', async ({ page }) => {
        const data = testData.getTestDataById('EDGE_EMPTY_EMAIL');
        const expectedError = 'Email is required.';
        logger.info(`Starting ${testData.getTestName('EDGE_EMPTY_EMAIL')}`);

        await loginPage.invalidLogin(data.email, data.password);
        await expect(page.getByText(expectedError)).toBeVisible();
    });

    test('EDGE - Empty password field validation', async ({ page }) => {
        const data = testData.getTestDataById('EDGE_EMPTY_PASSWORD');
        const expectedError = 'Password is required.';
        logger.info(`Starting ${testData.getTestName('EDGE_EMPTY_PASSWORD')}`);

        await loginPage.invalidLogin(data.email, data.password);
        await expect(page.getByText(expectedError)).toBeVisible();
    });
});
