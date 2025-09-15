exports.TaskPage = class TaskPage {
  constructor(page) {
    this.page = page;
    this.sprintIcon = page.locator('a[href="/sprints"]'); 
  }

  async navigateToSprintTab() {
    await this.sprintIcon.click();
    await this.page.waitForURL(/.*\/sprints/);
  }
};

exports.TaskPage = class TaskPage {
  constructor(page) {
    this.page = page;
    this.projectDropdown = page.getByTestId('project');
    this.taskButton = page.getByRole('button', { name: 'test' });
    this.relationshipTab = page.getByRole('tab', { name: 'Relationship' });
    this.addNewButton = page.locator('div').filter({ hasText: /^Add New$/ }).locator('svg');
    this.typeDropdown = page.getByTestId('type');
  }

  async selectProject(projectId) {
    await this.projectDropdown.selectOption(projectId);
  }

  async openTask(taskName) {
    await this.taskButton.click();
  }

  async navigateToTab(tabName) {
    await this.relationshipTab.click();
  }

  async addNewRelationship() {
    await this.addNewButton.click();
  }

  async createTaskLink(typeId) {
    await this.typeDropdown.selectOption(typeId);
  }

  async removeTaskLink(taskName) {
    const taskRow = this.page.getByRole('row', { name: taskName });
    await taskRow.locator('svg').click();
  }
};