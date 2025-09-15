import { test, expect } from '@playwright/test';
const { LoginPage } = require('../pages/auth/LoginPage');
const { DashboardPage } = require('../pages/DashboardPage');
const { TaskPage } = require('../pages/TaskPage');

//npx playwright test tests/accepted_criteria/acceptedCriteria.spec.js

let loginPage;
let dashboardPage;
let taskPage;

test.describe("Sprint Page Tests", () => {
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    taskPage = new TaskPage(page);

    await loginPage.navigateToLogin();
    await loginPage.validLogin(adminCredentials.email, adminCredentials.password);
    await dashboardPage.goToSprints();
  });

  test('TC285 -  Add new acceptance criteria', async ({ page }) => {
   await page.getByTestId('project').selectOption('15');
   await page.getByRole('button', { name: 'test' }).click();
   await page.getByRole('tab', { name: 'Criteria' }).click();
   await page.locator('div').filter({ hasText: /^Add New$/ }).locator('svg').click();
   await page.getByTestId('description').fill('test');
   await page.getByRole('row', { name: 'test' }).locator('svg').first().click();
   await expect(page.getByText('Acceptance criteria successfully saved')).toBeVisible();
  });

  test('TC286 -  Edit existing criteria', async ({ page }) => {
   await page.getByTestId('project').selectOption('15');
   await page.getByRole('button', { name: 'test' }).click();
   await page.getByRole('tab', { name: 'Criteria' }).click();
  });

  test('TC287 -  Remove criteria', async ({ page }) => {
   await page.getByTestId('project').selectOption('15');
   await page.getByRole('button', { name: 'test' }).click();
   await page.getByRole('tab', { name: 'Criteria' }).click();
   await page.getByRole('row', { name: 'test' }).locator('svg').click();
   await expect(page.getByText('Acceptance criteria successfully updated')).toBeVisible();
  });

  test('TC288 -  Mark criteria as accepted', async ({ page }) => {
   await page.getByTestId('project').selectOption('15');
   await page.getByRole('button', { name: 'test' }).click();
   await page.getByRole('tab', { name: 'Criteria' }).click();
   await page.locator('.w-5.h-5.mb-1').click();
   await expect(page.getByText('Acceptance criteria successfully updated')).toBeVisible();
  });

  test('TC288 -  Revert accepted criteria', async ({ page }) => {
   await page.getByTestId('project').selectOption('15');
   await page.getByRole('button', { name: 'test' }).click();
   await page.getByRole('tab', { name: 'Criteria' }).click();
   await page.locator('.w-5.h-5.mb-1').click();
   await expect(page.getByText('Acceptance criteria successfully updated')).toBeVisible();
  });

  test('TC290 -  Validation - empty criteria', async ({ page }) => {
   await page.getByTestId('project').selectOption('15');
   await page.getByRole('button', { name: 'test' }).click();
   await page.getByRole('tab', { name: 'Criteria' }).click();
   await page.locator('div').filter({ hasText: /^Add New$/ }).locator('svg').click();
   await page.getByRole('row', { name: 'test' }).locator('svg').first().click();
   await expect(page.getByText('Failed to save acceptance criteria')).toBeVisible();
  });
});
