const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../../../pages/dashboard/Dashboard');
const { LoginPage } = require('../../../pages/auth/login/LoginPage');
const { ManageUsers } = require('../../../pages/userManagement/manageUsers/ManageUsers');
const {AcceptInvitation}=require('../../../pages/userManagement/acceptIvitation/AcceptInvitation')

const adminCredentials = {
    email: 'sandalidilshanitemp@gmail.com',
    password: 'RkpSandali@12'
};

test.describe('User Management Tests', () => {
    let loginPage;
    let dashboardPage;
    let userManagementPage;
    let acceptInvitationPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        dashboardPage = new DashboardPage(page);
        userManagementPage = new ManageUsers(page);
        acceptInvitationPage = new AcceptInvitation(page);
    });

    test('send invitation', async ({ page }) => {
        await loginPage.navigateToLogin();
        await loginPage.validLogin(adminCredentials.email, adminCredentials.password);
        await dashboardPage.goToUsers();
        await acceptInvitationPage.sentInvitation(adminCredentials.email);
        await expect(page.getByText('Invitation sent successfully!')).toBeVisible();

    });
    
    test('85 | Verify Invitation Email Content', async () => {
        // Test logic for verifying invitation email content
    });

    test('86 | Verify Invitation Link Redirection', async () => {
        // Test logic for verifying invitation link redirection
    });

    test('87 | Verify OTP Validation (Valid OTP)', async () => {
        // Test logic for verifying valid OTP validation
    });

    test('88 | Verify OTP Validation (Invalid OTP)', async () => {
        // Test logic for verifying invalid OTP validation
    });

    test('89 | Verify Registration Page Fields', async () => {
        // Test logic for verifying registration page fields
    });

});