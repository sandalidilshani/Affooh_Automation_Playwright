const { expect } = require('@playwright/test');

class TaskPage {
  constructor(page) {
    this.page = page;
    this.newTaskButton = page.getByRole('main').getByRole('button', { name: 'New Task' });
    this.taskTypeDropdown = page.locator('#taskTypeID');
    this.sprintDropdown = page.locator('#sprintID');
    this.taskTitleInput = page.locator('#name');
    this.descriptionEditor = page.locator('.ql-editor');
    this.priorityDropdown = page.getByTestId('Priority');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  async navigateToTaskCreation() {
    await this.newTaskButton.click();
    await expect(this.page.getByText('Create New Task')).toBeVisible();
  }

  async fillTaskDetails(taskType, sprint, title, description, priority) {
    await this.taskTypeDropdown.selectOption(taskType);
    await this.sprintDropdown.selectOption(sprint);
    await this.taskTitleInput.fill(title);
    await this.descriptionEditor.fill(description);
    await this.priorityDropdown.selectOption(priority);
  }

  async submitTask() {
    await this.continueButton.click();
    await expect(this.page.getByText('created successfully!')).toBeVisible();
  }

  // Methods for managing acceptance criteria
  async navigateToCriteriaTab() {
    await this.page.getByRole('tab', { name: 'Criteria' }).click();
  }

  async addAcceptanceCriteria(description) {
    await this.page.locator('div').filter({ hasText: /^Add New$/ }).locator('svg').click();
    await this.page.getByTestId('description').fill(description);
    await this.page.getByRole('row', { name: description }).locator('svg').first().click();
    await expect(this.page.getByText('Acceptance criteria successfully saved')).toBeVisible();
  }

  async editAcceptanceCriteria() {
    await this.page.getByRole('tab', { name: 'Criteria' }).click();
    // Add editing logic here
  }

  async removeAcceptanceCriteria(description) {
    await this.page.getByRole('row', { name: description }).locator('svg').click();
    await expect(this.page.getByText('Acceptance criteria successfully updated')).toBeVisible();
  }

  async markCriteriaAsAccepted() {
    await this.page.locator('.w-5.h-5.mb-1').click();
    await expect(this.page.getByText('Acceptance criteria successfully updated')).toBeVisible();
  }

  async revertAcceptedCriteria() {
    await this.page.locator('.w-5.h-5.mb-1').click();
    await expect(this.page.getByText('Acceptance criteria successfully updated')).toBeVisible();
  }

  async validateEmptyCriteria() {
    await this.page.locator('div').filter({ hasText: /^Add New$/ }).locator('svg').click();
    await this.page.getByRole('row', { name: 'test' }).locator('svg').first().click();
    await expect(this.page.getByText('Failed to save acceptance criteria')).toBeVisible();
  }
}

module.exports = { TaskPage };
