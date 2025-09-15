import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/LoginPage';
import { Logout } from '../../pages/auth/LogoutPage';
import testData from '../../TestData/Login.json';

test.describe('Logout Flow', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.navigateToLogin();
    const data = testData.TC13;
    await login.validLogin(data.email, data.password);
  });

  test('TC42: Verify that the logout option appears in the profile dropdown menu.', async ({ page }) => {
    const logout = new Logout(page);
    const isVisible = await logout.verifyLogoutOption();
    expect(isVisible).toBeTruthy();
  });

  test('TC43: Verify that clicking "Logout" redirects to the login page.', async ({ page }) => {
    const logout = new Logout(page);
    const redirected = await logout.verifyRedirectionAfterLogout('https://app.affooh.com/login');
    expect(redirected).toBeTruthy();
  });

  test('TC44: Verify that the user cannot navigate back to protected pages after logout.', async ({ page }) => {
    const logout = new Logout(page);
    const noBackNavigation = await logout.verifyNoBackNavigation();
    expect(noBackNavigation).toBeTruthy();
  });

  test('TC45: Verify that logout terminates sessions across all browser tabs.', async ({ browser }) => {
    const context = await browser.newContext();
    const logout = new Logout( );
    const loggedOutAcrossTabs = await logout.verifyLogoutAcrossTabs(context);
    expect(loggedOutAcrossTabs).toBeTruthy();
  });

  test('TC46: Verify that session tokens/cookies are cleared after logout.', async ({ page }) => {
    const logout = new Logout(page);
    await logout.logout();
    const sessionCleared = await logout.verifySessionCleared();
    expect(sessionCleared).toBeTruthy();
  });

  test('TC47: Verify that a confirmation dialog appears before logging out.', async ({ page }) => {
    const logout = new Logout(page);
    await logout.cancelLogout();
    await expect(page).toHaveURL(/.*dashboard/i);
  });
});
