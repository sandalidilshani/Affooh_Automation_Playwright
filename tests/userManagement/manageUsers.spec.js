const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../../pages/DashboardPage');
const { LoginPage } = require('../../pages/auth/LoginPage');
const { ManageUsers } = require('../../pages/userManagement/ManageUsers');
const TestDataHelper = require('../../../utils/TestDataHelper');
import path from 'path';
const fs = require('fs');

const adminCredentials = {
    email: 'sandalidilshanitemp@gmail.com',
    password: 'RkpSandali@12'
};

const testDataHelper = new TestDataHelper();

const testDataPath = path.resolve(__dirname, '../../../TestData/Login.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));

test.describe('User Management Tests', () => {
    let dashboardPage;
    let userManagementPage;
    let context;
    let page;

    test.beforeEach(async ({ browser }) => {
        // Create a new context with saved auth state
        context = await browser.newContext();

        // Create a fresh page inside that context
        page = await context.newPage();

        // Init page objects
        dashboardPage = new DashboardPage(page);
        userManagementPage = new ManageUsers(page);

        // Perform login
        const loginPage = new LoginPage(page);
        await loginPage.loginAndNavigateToDashboard(adminCredentials.email, adminCredentials.password);
    });
    test.afterEach(async () => {
        await context.close();
    });
    test('Extract All User Emails', async () => {
        // Login and navigate to users page
       
        await dashboardPage.goToUsers();
        await userManagementPage.waitForUserListToLoad();
        await userManagementPage.scrollUserListToBottom();
        
        // Get all emails
        const emails = await userManagementPage.getAllVisibleEmails();

        // Assertions
        console.log('📧 All emails:', emails);
        expect(emails.length).toBeGreaterThan(0);
        
        // Validate each email format
        emails.forEach(email => {
            expect(userManagementPage.isValidEmailFormat(email)).toBe(true);
        });
    });



    test('Extract Users with Names and Emails', async ({ page }) => {
       
        
        await dashboardPage.goToUsers();

        // Wait for user list to load and scroll to bottom
        await userManagementPage.waitForUserListToLoad();
        await userManagementPage.scrollUserListToBottom();

        // Get all users with details
        const users = await userManagementPage.getAllUsersWithDetails();

        // Assertions
        console.log('👥 Users with details:', users);
        expect(users.length).toBeGreaterThan(0);
        
        users.forEach(user => {
            expect(user.name).toBeTruthy();
            expect(userManagementPage.isValidEmailFormat(user.email)).toBe(true);
        });
    });

    test('Search Functionality Filters Emails Correctly', async ({ page }) => {
       
        await dashboardPage.goToUsers();

        // Wait for user list to load and scroll to bottom
        await userManagementPage.waitForUserListToLoad();
        await userManagementPage.scrollUserListToBottom();

        // Get all emails before search
        const allEmails = await userManagementPage.getAllVisibleEmails();
        console.log('⚠️ All emails found:', allEmails);
        expect(allEmails.length).toBeGreaterThan(0);

        // Search for users with specific term
        const searchTerm = 'hacker'; // You can make this dynamic based on your data
        await userManagementPage.searchUsers(searchTerm);

        // Get filtered emails
        const filteredEmails = await userManagementPage.getFilteredEmails();

        // Assertions
        console.log('🔍 Filtered emails:', filteredEmails);
        expect(filteredEmails.length).toBeGreaterThan(0);
        
        filteredEmails.forEach(email => {
            expect(email.toLowerCase()).toContain(searchTerm.toLowerCase());
        });

        // Clear search
        await userManagementPage.clearSearch();
    });

    test('Verify Specific Email Exists in User List', async ({ page }) => {
      
        await dashboardPage.goToUsers();

        // Wait for user list to load and scroll to bottom
        await userManagementPage.waitForUserListToLoad();
        await userManagementPage.scrollUserListToBottom();

        // Check if specific email exists
        const targetEmail = 'sandalidilshanitemp@gmail.com';
        const emailExists = await userManagementPage.isEmailExists(targetEmail);

        // Assertion
        console.log(` Email ${targetEmail} found:`, emailExists);
        expect(emailExists).toBe(true);
    });

    test('Validate Email Format for All Users', async ({ page }) => {
     
        await dashboardPage.goToUsers();

        // Wait for user list to load and scroll to bottom
        await userManagementPage.waitForUserListToLoad();
        await userManagementPage.scrollUserListToBottom();

        // Get all emails
        const emails = await userManagementPage.getAllVisibleEmails();

        // Validate all emails have correct format
        console.log('✅ Validating email formats for', emails.length, 'users');
        
        emails.forEach((email, index) => {
            const isValid = userManagementPage.isValidEmailFormat(email);
            if (!isValid) {
                console.log(`❌ Invalid email format at index ${index}: ${email}`);
            }
            expect(isValid).toBe(true);
        });
    });

    test('62 | Verify Admin Can Access User Management Section', async () => {
        const admin = testDataHelper.getTestDataById('TC22').admin;
        await loginPage.validLogin(admin.email, admin.password);
        await dashboardPage.goToUsers();
        await expect(page.getByText('User Management')).toBeVisible();
    });

    test('63 | Verify Non-Admin Cannot Access User Management', async () => {
        const nonAdmin = testDataHelper.getTestDataById('TC22').nonAdmin;
        await loginPage.validLogin(nonAdmin.email, nonAdmin.password);
        await page.goto('/user-management');
        await expect(page.getByText('403 Forbidden')).toBeVisible();
    });

    test('64 | Verify Default User List Columns', async () => {
        // Test logic for verifying default user list columns
        await dashboardPage.goToUsers();
        const columnNames = await userManagementPage.getUserListColumnNames();

        // Assuming these are the expected default columns
        const expectedColumns = ['Name', 'Email', 'Role', 'Status'];
        expect(columnNames).toEqual(expect.arrayContaining(expectedColumns));
    });

    test('65 | Verify Pagination for 25+ Users', async () => {
        // Test logic for verifying pagination functionality
        await dashboardPage.goToUsers();

        // Add more users to test pagination, assuming you have a way to create users
        for (let i = 0; i < 30; i++) {
            await userManagementPage.createUser(`testuser${i}@example.com`, 'Test User', 'User', 'Active');
        }

        await userManagementPage.waitForUserListToLoad();
        const pageCount = await userManagementPage.getPaginationCount();

        // Expecting more than 1 page
        expect(pageCount).toBeGreaterThan(1);
    });

    test('66 | Verify Search by Username', async () => {
        const searchTerm = testDataHelper.getTestDataById('TC23').searchTerm;
        await dashboardPage.goToUsers();
        await userManagementPage.searchUser(searchTerm);
        const results = await userManagementPage.getSearchResults();
        expect(results).toEqual(testDataHelper.getTestDataById('TC23').expectedResults);
    });
});