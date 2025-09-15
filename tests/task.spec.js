const { LoginPage } = require('../pages/auth/LoginPage');
const { DashboardPage } = require('../pages/DashboardPage');
const { TaskPage } = require('../pages/Task');
import { test, expect } from '@playwright/test';

const adminCredentials = {
  email: 'sandalidilshanitemp@gmail.com',
  password: 'RkpSandali@12',
};

let loginPage, dashboardPage, taskPage;

test.describe('Task Tests', () => {
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    taskPage = new TaskPage(page);

    await loginPage.navigateToLogin();
    await loginPage.validLogin(adminCredentials.email, adminCredentials.password);
    await dashboardPage.goToSprints();
  });
  test('TC244 - Navigate to Task Creation screen from Task List button', async ({ page }) => {
    await page.getByRole('main').getByRole('button', { name: 'New Task' }).click();
    await expect(page.getByText('Create New Task')).toBeVisible();
  });

  test('TC245 - Verify "New Task" option in header context menu', async ({ page }) => {
    await expect(page.locator('div').filter({ hasText: /^New Task$/ }).getByRole('button')).toBeVisible();
  });

  test('TC246 - Navigate to Task Creation screen from header menu', async ({ page }) => {
    await page.locator('div').filter({ hasText: /^New Task$/ }).getByRole('button').click();
    await expect(page.getByText('Create New Task')).toBeVisible();
  });

  test('TC247 - Verify "New Task" button visibility on Task List page', async ({ page }) => {
    await expect(page.getByRole('main').getByRole('button', { name: 'New Task' })).toBeVisible();
  });

  test('TC248 - Verify Task Type dropdown functionality', async ({ page }) => {
    await page.getByRole('main').getByRole('button', { name: 'New Task' }).click();
    await expect(page.getByText('Create New Task')).toBeVisible();
    const dropdown = page.locator('#taskTypeID');
    const options = await dropdown.locator('option').allTextContents();
    const expectedOptions = ['Select an option', 'Epic', 'Story', 'Task', 'Bug'];
    for (const expected of expectedOptions) {
      expect(options).toContain(expected);
    }
  });

  test('TC249 - Dynamic UI update based on Task Type selection', async ({ page }) => {
    await page.locator('div').filter({ hasText: /^New Task$/ }).getByRole('button').click();
    await expect(page.getByText('Create New Task')).toBeVisible();

    // Wait for the dropdown to be visible and enabled
    const dropdown = page.locator('#taskTypeID');
    await dropdown.waitFor({ state: 'visible' });

    // Select the "Epic" option using its value
    await dropdown.selectOption('61');

    // Verify the selection
    await expect(dropdown).toHaveValue('61');

    // Verify dynamic UI updates
    await expect(page.locator('span.capitalize', { hasText: 'Release' })).toBeVisible(); // Specific locator for the label
    await expect(page.locator('#priority')).toBeVisible(); 
    await expect(page.locator('#release')).toBeVisible(); 
  });

  test('TC250 - Mandatory field validation', async ({ page }) => {
    await page.locator('div').filter({ hasText: /^New Task$/ }).getByRole('button').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('task type is required')).toBeVisible();
    await expect(page.getByText('sprint is required')).toBeVisible();
    await expect(page.getByText('task title is required')).toBeVisible();
  });

  test('TC251 - Successful task creation with mandatory fields', async ({ page }) => {
    await page.locator('div').filter({ hasText: /^New Task$/ }).getByRole('button').click();
    await expect(page.getByText('Create New Task')).toBeVisible();
    await page.locator('#taskTypeID').selectOption('133');
    await page.locator('#sprintID').selectOption('62');
    await page.locator('#name').fill('test');
    await page.locator('.ql-editor').fill('test des');
    await page.locator('span').filter({ hasText: 'Select an option' }).first().click();
    await page.getByText('Pramod Hewasinghe').click();
    await page.locator('span').filter({ hasText: 'Select an option' }).click();
    await page.getByRole('listitem').getByText('PH').click();
    await page.getByTestId('Priority').selectOption('849');
    await page.getByRole('button', { name: 'Continue' }).click();
    //await expect(page.getByText('Creating task...')).toBeVisible();
    await expect(page.getByText('created successfully!')).toBeVisible();
  });

  test('TC252 - Verify default fields in task creation form', async ({ page }) => {
    await page.locator('div').filter({ hasText: /^New Task$/ }).getByRole('button').click();
    await expect(page.getByText('Create New Task')).toBeVisible();
    await expect(page.getByText('Task Type')).toBeVisible();
    //await expect(page.getByText('Sprint')).toBeVisible();
    await expect(page.getByText('Task Title')).toBeVisible();
    await expect(page.getByText('Description')).toBeVisible();
    //await expect(page.getByText('Epic')).toBeVisible();
    await expect(page.getByText('Assignee')).toBeVisible();
    await expect(page.getByText('Task Owner')).toBeVisible();
  });
  test('TC279 - Access Task Linking Interface', async () => {
    await taskPage.selectProject('15');
    await taskPage.openTask('test');
    await taskPage.navigateToTab('Relationship');
    await expect(taskPage.page.getByText('Relationship(s)')).toBeVisible();
  });

  test('TC280 - Relationship Type Selection', async () => {
    await taskPage.selectProject('15');
    await taskPage.openTask('test');
    await taskPage.navigateToTab('Relationship');
    await taskPage.addNewRelationship();

    const dropdown = taskPage.page.locator('#type');
    await expect(dropdown.locator('option')).toHaveCount(8);

    const options = await dropdown.locator('option').allTextContents();
    const expectedOptions = ['Is Blocked By', 'Related to', 'Blocks'];
    for (const expected of expectedOptions) {
      expect(options).toContain(expected);
    }
  });

  test('TC281 - Create Valid Task Link', async () => {
    await taskPage.selectProject('15');
    await taskPage.openTask('test');
    await taskPage.navigateToTab('Relationship');
    await taskPage.createTaskLink('7');
    await expect(taskPage.page.getByRole('row', { name: 'test Related to' })).toBeVisible();
  });

  test('TC283 - View Linked Tasks', async () => {
    await taskPage.selectProject('15');
    await taskPage.openTask('test');
    await taskPage.navigateToTab('Relationship');

    const linkedTasks = taskPage.page.locator('tbody tr');
    await expect(linkedTasks.first()).toBeVisible();
    const count = await linkedTasks.count();
    console.log(`Found ${count} linked tasks`);
    for (let i = 0; i < count; i++) {
      await expect(linkedTasks.nth(i)).toBeVisible();
    }
  });

  test('TC284 - Remove Task Link', async () => {
    await taskPage.selectProject('15');
    await taskPage.openTask('test');
    await taskPage.navigateToTab('Relationship');
    await taskPage.removeTaskLink('test SR Sanduni Related to');
    await expect(taskPage.page.getByText('Task link successfully removed')).toBeVisible();
  });

  test('TC244 - Navigate to Task Creation screen from Task List button', async ({ page }) => {
    await taskPage.navigateToTaskCreation();
    await expect(page.getByText('Create New Task')).toBeVisible();
  });

  test('TC251 - Successful task creation with mandatory fields', async ({ page }) => {
    await taskPage.navigateToTaskCreation();
    await taskPage.fillTaskDetails('133', '62', 'test', 'test des', '849');
    await taskPage.submitTask();
    await expect(page.getByText('created successfully!')).toBeVisible();
  });
  test('TC292 - Delete option visibility', async ({ page }) => {
    await page.locator('tr:nth-child(3) > td:nth-child(7) > .flex > .h-4').click();
    await expect(page.getByText('Delete')).toBeVisible();
  });

  test('TC293 - Confirmation dialog trigger', async ({ page }) => {
    await page.locator('tr:nth-child(3) > td:nth-child(7) > .flex > .h-4').click();
    await page.getByText('Delete').click();
    await expect(page.getByText('Are You Sure?Delete task -')).toBeVisible();
  });

  test('TC294 - Successful deletion', async ({ page }) => {
    await page.locator('.dx-cell-focus-disabled > .flex > .h-4').click();
    await page.getByText('Delete').click();
    await page.getByRole('button', { name: 'Yes, Delete It' }).click();
    await expect(page.getByText('Task Successfully Deleted')).toBeVisible();
  });

  //CHECK AGAIN
  test('TC295 - Cancel deletion', async ({ page }) => {
    await page.locator('tr:nth-child(3) > td:nth-child(7) > .flex > .h-4').click();
    await page.getByText('Delete').click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByText('Delete')).toBeVisible();
  });
  test('TC254 - Sprint-based filtering', async ({ page }) => {
    await page.locator('div').filter({ hasText: /^BACKLOGWebsite•Development$/ }).first().click();
    await page.waitForTimeout(2000);
    const taskNames = await page.locator('table >> tr >> td').allTextContents();
    for (const task of taskNames) {
      expect(task).not.toContain('BACKLOG');
    }
  });

  test('TC255 - Column customization', async ({ page }) => {
    await page.getByRole('button', { name: 'Column Chooser' }).click();
    await page.getByRole('treeitem', { name: 'Epic Name' }).getByLabel('Check state').click();
    await expect(page.getByLabel('Column Epic Name').getByText('Epic Name')).toBeVisible();
  });

  test('TC257 - Filter by attributes', async ({ page }) => {
    await page.getByTestId('assignee').selectOption('53');
    await page.getByTestId('status').selectOption('843');
    await expect(page.getByRole('gridcell', { name: 'In Progress' })).toBeVisible();
    await expect(page.getByText('PHPramod')).toBeVisible();
  });

  test('TC258 - Keyword search', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Search', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search', exact: true }).fill('test3');
    await expect(page.getByRole('button', { name: 'test3' })).toBeVisible();
  });

  test('TC259 - Show/hide options', async ({ page }) => {
    await page.locator('div').filter({ hasText: /^Completed Tasks$/ }).locator('div').first().click();
    await expect(page.getByText('Done')).toBeVisible();
  });

  test('TC260 - Keyword search', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Search', exact: true }).click();
    await page.getByRole('textbox', { name: 'Search', exact: true }).fill('test3');
    await expect(page.getByRole('button', { name: 'test3' })).toBeVisible();
  });

  test('TC261 - Show/hide options', async ({ page }) => {
    await page.locator('div').filter({ hasText: /^Completed Tasks$/ }).locator('div').first().click();
    await expect(page.getByText('Done')).toBeVisible();
  });
  test('TC265 - Access task detail view', async ({ page }) => {
    await page.getByRole('button', { name: 'test', exact: true }).click();
    await expect(page.getByLabel('Title')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
    await expect(page.getByText('Assignee')).toBeVisible();
    await expect(page.getByText('Task Owner')).toBeVisible();
    await expect(page.getByText('Epic')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();
    await expect(page.getByText('Priority')).toBeVisible();
  });

  test('TC266 - Verify displayed fields', async ({ page }) => {
    await page.getByRole('button', { name: 'test', exact: true }).click();
    await expect(page.getByLabel('Title')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
    await expect(page.getByText('Assignee')).toBeVisible();
    await expect(page.getByText('Task Owner')).toBeVisible();
    await expect(page.getByText('Epic')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();
    await expect(page.getByText('Priority')).toBeVisible();
  });

  test('TC267 - Edit text fields', async ({ page }) => {
    await page.getByRole('button', { name: 'test', exact: true }).click();
    await page.getByText('test des update').click();
    await page.locator('div').filter({ hasText: /^test des$/ }).nth(1).fill('test des update2');
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(1).click();
    await expect(page.getByText('Task successfully updated!')).toBeVisible();
  });

  test('TC268 - Update dropdown fields', async ({ page }) => {
    await page.getByRole('button', { name: 'test', exact: true }).click();
    await page.getByTestId('Priority').selectOption('417');
    await expect(page.getByText('Task attribute updated!')).toBeVisible();
  });

  test('TC270 - Change assignee', async ({ page }) => {
    await page.getByRole('button', { name: 'test', exact: true }).click();
    await page.locator('div').filter({ hasText: /^SSathsara Wijerathna$/ }).first().click();
    await page.getByRole('listitem').filter({ hasText: 'SSanduni Rajapaksha' }).click();
    await expect(page.getByText('Task successfully updated!')).toBeVisible();
  });
 



  // Add other tests here using taskPage methods
});




