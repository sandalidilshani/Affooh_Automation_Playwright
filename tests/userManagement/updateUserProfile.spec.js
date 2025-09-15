const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../../pages/DashboardPage');
const { LoginPage } = require('../../pages/auth/LoginPage');


const adminCredentials = {
    email: 'sandalidilshanitemp@gmail.com',
    password: 'RkpSandali@12'
};

test.describe('2.0| User Profile Update Tests', () => {
    test.beforeEach(async ({page})=>{
        const loginPage = new LoginPage(page);
        const dashboardPage=new DashboardPage(page);
        await loginPage.navigateToLogin();
        await loginPage.validLogin(adminCredentials.email, adminCredentials.password);
        await dashboardPage.openProfileMenu();
    })
test('48 | Verify that the profile link appears when clicking the profile image', async ({page}) => {

    await expect(page.getByRole('button', { name: 'Update' })).toBeVisible();
});

test('49 | Verify that clicking the profile link redirects to the profile page', async ({page}) => {
        await page.locator('.p-6 > div > div').first().click();
        await page.waitForSelector('button:enabled', { timeout: 30000 });
        await page.getByRole('button', { name: 'Update' }).click();
        await expect(page.getByRole('button', { name: 'Update' })).toBeEnabled();
});

test('50 | Verify that the profile page displays the user\'s current information', async ({page}) => {
    await expect(page.getByText('First Name')).toBeVisible();
    await expect(page.getByText('Last Name')).toBeVisible();
    await expect(page.getByText('Email')).toBeVisible();
});

test('51 | Verify that a user can update profile information with valid inputs', async () => {
    // Test logic for verifying profile update with valid inputs
});

test('52 | Verify that the system rejects invalid inputs (invalid email/phone)', async () => {
    // Test logic for verifying rejection of invalid inputs
});
});