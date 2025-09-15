import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/auth/LoginPage.js";
//import { ManageSprintPage } from "../pages/ManageSprint.js";
import { DashboardPage } from "../pages/DashboardPage.js";


let login;
let sprintPage;
export const adminCredentials = {
    email: 'sandalidilshanitemp@gmail.com',
    password: 'RkpSandali@12'
};
test.describe("Sprint Page Tests", () => {
  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.navigateToLogin();
    await login.validLogin(adminCredentials.email, adminCredentials.password);
    const dashboard = new DashboardPage(page);
    await dashboard.goToSprints();
    //sprintPage = new ManageSprintPage(page);
  });

  test('TC235 - Verify Sprint Creation Accessibility', async ({ page }) => {
    await page.getByText('Add New').click();
    await expect(page.getByPlaceholder('Sprint Name')).toBeVisible();
    await expect(page.getByPlaceholder('Start Date')).toBeVisible();
    await expect(page.getByPlaceholder('End Date')).toBeVisible();
  });

  test('TC236 - Create a Valid Sprint', async ({ page }) => {
  await page.getByText('Add New').click();
  await page.getByPlaceholder('Sprint Name').fill('Sprint Test');
  await page.getByTestId('startDate').fill('2025-07-15');
  await page.getByTestId('endDate').fill('2025-07-20');
  await page.getByRole('button', { name: 'Create New Sprint' }).click();
  await expect(page.getByText('Sprint Successfully Created')).toBeVisible();

});

  test('TC237 - Validate Required Fields', async ({ page }) => {
  await page.getByText('Add New').click();
  await page.getByPlaceholder('Sprint Name').fill('');
  await page.getByTestId('startDate').fill('');
  await page.getByTestId('endDate').fill('');
  await page.getByRole('button', { name: 'Create New Sprint' }).click();
  await expect(page.getByText('Sprint name is required')).toBeVisible();
    await expect(page.getByText('Sprint name is required')).toBeVisible();
  await expect(page.getByText('Start date is required')).toBeVisible();
  await expect(page.getByText('End date is required')).toBeVisible();




});

  test('TC238 -Validate Date Logic', async ({ page }) => {
  await page.getByText('Add New').click();
  await page.getByPlaceholder('Sprint Name').fill('Sprint Test D');
  await page.getByTestId('startDate').fill('2025-07-20');
  await page.getByTestId('endDate').fill('2025-07-10');
  await page.getByRole('button', { name: 'Create New Sprint' }).click();
  await expect(page.getByText('End date cannot be before start date')).toBeVisible();

});

  test('TC241 - Delete Sprint (With Confirmation)', async ({ page }) => {
  await page.locator('div').filter({ hasText: /^SprintTestWebsite•DevelopmentBACKLOGWebsite•Development$/ }).locator('svg').click();
  await page.getByRole('button', { name: 'DELETE' }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByText('Failed To Delete The Sprint')).toBeVisible();
  await page.reload();
  const sprintStillExists = await page.locator('div', { hasText: /^SprintTestWebsite•DevelopmentBACKLOGWebsite•Development$/ }).count();
  expect(sprintStillExists).toBe(0);
});

  test('TC242 - Cancel Sprint Deletion', async ({ page }) => {
  await page.locator('div').filter({ hasText: /^SprintTestWebsite•DevelopmentBACKLOGWebsite•Development$/ }).locator('svg').click();
  await page.getByRole('button', { name: 'DELETE' }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByText('Failed To Delete The Sprint')).toBeVisible();
   await page.reload();
  const sprintExists = await page.locator('div', { hasText: /^SprintTestWebsite•DevelopmentBACKLOGWebsite•Development$/ }).count();
  expect(sprintExists).toBeGreaterThan(0);
});

});