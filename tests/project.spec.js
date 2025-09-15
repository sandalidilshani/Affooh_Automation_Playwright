// tests/project/project.spec.js
import { test, expect } from '@playwright/test';
import path from 'path';
import { DashboardPage } from '../pages/DashboardPage';
import { Project } from  '../pages/Project';
import { LoginPage } from '../pages/auth/LoginPage';
import TestDataHelper from '../utils/TestDataHelper';

// Test data configuration
export const adminCredentials = {
    email: 'sandalidilshanitemp@gmail.com',
    password: 'RkpSandali@12'
};

const projectTypes = {
    SCRUM: '1',
    KANBAN: '2',
    SOFTWARE: '3'
};

const testDataHelper = new TestDataHelper();

test.describe('Project Management Tests', () => {
    let loginPage;
    let dashboardPage;
    let projectPage;


    // Global setup for all tests
    test.beforeEach(async ({ page }) => {
        // Initialize page objects
        loginPage = new LoginPage(page);
        dashboardPage = new DashboardPage(page);
        projectPage = new Project(page);


        // Login and navigate to projects
        await loginPage.navigateToLogin();
        await loginPage.validLogin(adminCredentials.email, adminCredentials.password);
        await page.goto('https://app.affooh.com/projects');
    });

    test.describe('4.0 | Create Project', () => {
        test('170 | Verify Project Creation Access', async () => {
            await projectPage.verifyAddNewButtonVisible();
        });

        test('TC172 | Create New Project', async () => {
            const data = testDataHelper.getTestDataById('TC172');
            await projectPage.createProject(data.prefix, data.name, projectTypes.SCRUM);
            await expect(projectPage.page.getByText(/Successfully Created/)).toBeVisible();
            await projectPage.verifyProjectExists(data.name);
        });

        test('TC174 | Create Kanban Project', async () => {
            const data = testDataHelper.getTestDataById('TC174');
            await projectPage.createProject(data.prefix, data.name, projectTypes.KANBAN);
            await expect(projectPage.page.getByText(/Successfully Created/)).toBeVisible();
            await projectPage.verifyProjectExists(data.name);
        });

        test('TC175 | Validate Unique Prefix', async () => {
            const data = testDataHelper.getTestDataById('TC174');
            await projectPage.createProject(data.prefix, data.name, projectTypes.KANBAN);
            await expect(projectPage.page.getByText(/Successfully Created/)).toBeVisible();
            await projectPage.createProject(data.prefix, data.duplicateName, projectTypes.KANBAN);
            await expect(projectPage.page.getByText('This prefix is already taken')).toBeVisible();
            await expect(projectPage.page.getByRole('button', { name: 'Create' })).toBeDisabled();
        });

        test('TC176 | Required Field Validation', async () => {
            const data = testDataHelper.getTestDataById('TC175');
            await projectPage.clickAddNew();
            await projectPage.createButton.click();
            await expect(projectPage.page.getByText('Project name must be at least 3 characters long')).toBeVisible();
            await projectPage.prefixInput.fill(data.prefix);
            await projectPage.nameInput.fill(data.name);
            await projectPage.createButton.click();
            await expect(projectPage.page.getByText('Project type is required')).toBeVisible();
        });

        test('177 | Methodology-Specific Sprint Creation', async () => {
            await projectPage.createProject('SCR', 'Scrum Project', projectTypes.SCRUM);
            await expect(projectPage.page.getByText(/Successfully Created/)).toBeVisible();
            await projectPage.createProject('KAN', 'Kanban Project', projectTypes.KANBAN);
            await expect(projectPage.page.getByText(/Successfully Created/)).toBeVisible();
        });

        test('178 | Project List Update', async () => {
            const initialCount = await projectPage.page.locator('.project-item').count();
            await projectPage.createProject('NEW', 'New Project', projectTypes.SOFTWARE);
            await expect(projectPage.page.getByText(/Successfully Created/)).toBeVisible();
            const newCount = await projectPage.page.locator('.project-item').count();
            expect(newCount).toBe(initialCount + 1);
        });
    });

    test.describe('4.1 | List Project', () => {
        test('176 | Verify projects are displayed in left navigation', async () => {
            await expect(projectPage.page.getByText('All Projects')).toBeVisible();
        });

        test('177 | Ensure projects are sorted alphabetically (A-Z)', async () => {
            await projectPage.verifyProjectsListSorted();
        });

        test('178 | Verify behavior when no projects exist', async () => {
            const projectCount = await projectPage.page.locator('.project-item').count();
            if (projectCount === 0) {
                await projectPage.verifyEmptyState();
            }
        });

        test('181 | Ensure the list updates when a new project is added', async () => {
            const initialCount = await projectPage.page.locator('.project-item').count();
            await projectPage.createProject('NEW', 'New Project', projectTypes.SOFTWARE);
            await projectPage.verifySuccessMessage('Project Successfully Created');
            const newCount = await projectPage.page.locator('.project-item').count();
            expect(newCount).toBe(initialCount + 1);
        });

        test('182 | Test truncation/display of long names', async () => {
            const longName = 'This is a very long project name that should be truncated or wrapped neatly in the interface';
            await projectPage.createProject('LNG', longName, projectTypes.SOFTWARE);
            await projectPage.verifySuccessMessage('Project Successfully Created');
            const projectElement = projectPage.page.locator(`[title*="${longName}"], [title="${longName}"]`);
            await expect(projectElement).toBeVisible();
        });
    });

    test.describe('4.2 | Delete Project', () => {
        
        test.beforeEach(async () => {
            // Create a test project for deletion tests
            await projectPage.createProject('DEL', 'Delete Test Project', projectTypes.SOFTWARE);
            await projectPage.verifySuccessMessage('Project Successfully Created');
        });

        test('Verify Delete option appears for admin users', async () => {
            await projectPage.openProjectMenu('Delete Test Project');
            await projectPage.verifyDeleteOptionVisible();
        });

        test('Successfully delete a project', async () => {
            await projectPage.openProjectMenu('Delete Test Project');
            await projectPage.deleteProject();
            await projectPage.verifySuccessMessage('Project Successfully Deleted');
            await projectPage.verifyProjectNotExists('Delete Test Project');
        });
    });

    test.describe('4.3 | Update Project Details', () => {
        
        test.beforeEach(async () => {
            // Create a test project for update tests
            await projectPage.createProject('UPD', 'Update Test Project', projectTypes.SOFTWARE);
            await projectPage.verifySuccessMessage('Project Successfully Created');
        });

        test('185 | Verify Edit Project Details Option in Dropdown Menu', async () => {
            await projectPage.openProjectMenu('Test Project');
            await expect(projectPage.page.getByText('Edit Project Details')).toBeVisible();
        });

        test('186 | Verify Edit Project Dialog Opens', async () => {
            await projectPage.openProjectMenu('Test Project');
            await projectPage.page.getByText('Edit Project Details').click();
            await expect(projectPage.page.getByText('Edit Project')).toBeVisible();
        });

        test('187 | Validate Prefix Field (Unique Identifier)', async () => {
            await projectPage.openProjectMenu('Test Project');
            await projectPage.page.getByText('Edit Project Details').click();
            await projectPage.prefixInput.fill('DuplicatePrefix');
            await projectPage.createButton.click();
            await expect(projectPage.page.getByText('Prefix must be unique')).toBeVisible();
        });

        test('188 | Validate Name Field (Required Field)', async () => {
            await projectPage.openProjectMenu('Test Project');
            await projectPage.page.getByText('Edit Project Details').click();
            await projectPage.nameInput.fill('');
            await projectPage.createButton.click();
            await expect(projectPage.page.getByText('Name is required')).toBeVisible();
        });

        test('189 | Validate Type Field (Dropdown Selection)', async () => {
            await projectPage.openProjectMenu('Test Project');
            await projectPage.page.getByText('Edit Project Details').click();
            await projectPage.projectTypeSelect.selectOption('Marketing');
            await projectPage.createButton.click();
            await expect(projectPage.page.getByText('Project Successfully Updated')).toBeVisible();
        });

        test('190 | Edit and Save Project Details Successfully', async () => {
            await projectPage.openProjectMenu('Test Project');
            await projectPage.page.getByText('Edit Project Details').click();
            await projectPage.prefixInput.fill('UpdatedPrefix');
            await projectPage.nameInput.fill('Updated Project Name');
            await projectPage.projectTypeSelect.selectOption('Design');
            await projectPage.createButton.click();
            await expect(projectPage.page.getByText('Project Successfully Updated')).toBeVisible();
        });

        test('191 | Cancel Editing Project Details', async () => {
            await projectPage.openProjectMenu('Test Project');
            await projectPage.page.getByText('Edit Project Details').click();
            await projectPage.page.getByText('Cancel').click();
            await expect(projectPage.page.getByText('Edit Project')).not.toBeVisible();
        });

        test('192 | Verify Status Change (Active/On Hold/Closed)', async () => {
            await projectPage.openProjectMenu('Test Project');
            await projectPage.page.getByText('Edit Project Details').click();
            await projectPage.statusSelect.selectOption('On Hold');
            await projectPage.createButton.click();
            await expect(projectPage.page.getByText('Project Successfully Updated')).toBeVisible();
        });
    });

    test.describe('4.4 | Project Configurations – Manage People', () => {
        test('193 | Access People Tab', async () => {
            await projectPage.page.getByText('People').click();
            await expect(projectPage.page.getByText('People')).toBeVisible();
        });

        test('194 | View User List', async () => {
            await projectPage.page.getByText('People').click();
            const userList = await projectPage.page.locator('.user-list-item');
            expect(await userList.count()).toBeGreaterThan(0);
        });

        test('195 | Add New User', async () => {
            await projectPage.page.getByText('People').click();
            await projectPage.page.getByText('Add User').click();
            await projectPage.page.locator('select[name="user"]').selectOption('New User');
            await projectPage.page.getByText('Add').click();
            await expect(projectPage.page.getByText('User Successfully Added')).toBeVisible();
        });

        test('196 | Attempt to Add Existing User', async () => {
            await projectPage.page.getByText('People').click();
            await projectPage.page.getByText('Add User').click();
            await projectPage.page.locator('select[name="user"]').selectOption('Existing User');
            await projectPage.page.getByText('Add').click();
            await expect(projectPage.page.getByText('User is already part of this project')).toBeVisible();
        });

        test('197 | Add User with Different Roles', async () => {
            await projectPage.page.getByText('People').click();
            await projectPage.page.getByText('Add User').click();
            await projectPage.page.locator('select[name="user"]').selectOption('Developer');
            await projectPage.page.getByText('Add').click();
            await expect(projectPage.page.getByText('User Successfully Added')).toBeVisible();
            await projectPage.page.getByText('Add User').click();
            await projectPage.page.locator('select[name="user"]').selectOption('Manager');
            await projectPage.page.getByText('Add').click();
            await expect(projectPage.page.getByText('User Successfully Added')).toBeVisible();
        });

        test('198 | Remove User', async () => {
            await projectPage.page.getByText('People').click();
            await projectPage.page.locator('.user-list-item .remove-user').first().click();
            await projectPage.page.getByText('Confirm').click();
            await expect(projectPage.page.getByText('User Successfully Removed')).toBeVisible();
        });
    });

    test.describe('4.5 | Manage Project Configurations', () => {
        test('215 | Access Project Configuration Page', async () => {
            await projectPage.page.getByText('Project Configurations').click();
            await expect(projectPage.page.getByText('Task Types')).toBeVisible();
        });

        test('216 | Add a New Task Type', async () => {
            await projectPage.page.getByText('Task Types').click();
            await projectPage.page.getByText('Add Task Type').click();
            await projectPage.page.locator('input[name="taskTypeName"]').fill('Bug Fix');
            await projectPage.page.getByText('Save').click();
            await expect(projectPage.page.getByText('Bug Fix')).toBeVisible();
        });

        test('217 | Edit an Existing Task Type', async () => {
            await projectPage.page.getByText('Task Types').click();
            await projectPage.page.locator('.task-type-item').first().getByText('Edit').click();
            await projectPage.page.locator('input[name="taskTypeName"]').fill('Feature Request');
            await projectPage.page.getByText('Save').click();
            await expect(projectPage.page.getByText('Feature Request')).toBeVisible();
        });

        test('218 | Delete a Task Type', async () => {
            await projectPage.page.getByText('Task Types').click();
            await projectPage.page.locator('.task-type-item').first().getByText('Delete').click();
            await projectPage.page.getByText('Confirm').click();
            await expect(projectPage.page.getByText('Task Type Successfully Deleted')).toBeVisible();
        });
    });

    test.describe('4.6 | Project Selection', () => {
        test('226 | Verify Project Dropdown Visibility', async () => {
            await expect(projectPage.page.locator('.project-dropdown')).toBeVisible();
        });

        test('227 | Verify Project Switch Updates Relevant Sections', async () => {
            await projectPage.page.locator('.project-dropdown').selectOption('Project B');
            await expect(projectPage.page.getByText('Project B Data')).toBeVisible();
        });

        test('228 | Verify Global Sections Remain Unchanged', async () => {
            await projectPage.page.locator('.project-dropdown').selectOption('Project B');
            await expect(projectPage.page.getByText('Dashboard')).toBeVisible();
        });

        test('229 | Verify Default Project Selection on Login', async () => {
            await projectPage.page.reload();
            await expect(projectPage.page.locator('.project-dropdown').getByText('Default Project')).toBeVisible();
        });

        test('230 | Verify Loading Indicator on Project Switch', async () => {
            await projectPage.page.locator('.project-dropdown').selectOption('Large Data Project');
            await expect(projectPage.page.locator('.loading-spinner')).toBeVisible();
        });

        test('231 | Verify Dropdown Lists Only Assigned Projects', async () => {
            const projectOptions = await projectPage.page.locator('.project-dropdown option');
            const projectTexts = await projectOptions.allTextContents();
            expect(projectTexts).toEqual(['Project A', 'Project B']);
        });

        test('232 | Verify Project Persistence After Page Refresh', async () => {
            await projectPage.page.locator('.project-dropdown').selectOption('Project A');
            await projectPage.page.reload();
            await expect(projectPage.page.locator('.project-dropdown').getByText('Project A')).toBeVisible();
        });
    });
});