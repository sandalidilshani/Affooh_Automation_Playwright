const { expect } = require('@playwright/test');


export class Project {

    constructor(page) {
        this.page = page;
        this.addNewButton = page.locator('text=Add New');
        this.prefixInput = page.locator('[data-testid="prefix"]');
        this.nameInput = page.locator('[data-testid="name"]');
        this.projectTypeSelect = page.getByTestId('projectType');
        this.statusSelect = page.getByLabel('Select an optionActiveOn');
        this.createButton = page.getByRole('button', { name: 'Create' });
        this.updateButton = page.getByRole('button', { name: 'Update' });
        this.deleteButton = page.locator('.w-4.h-4.text-pink-700');
        this.confirmDeleteButton = page.getByRole('button', { name: 'Yes, Delete It' });
        this.successMessage = page.getByText(/Successfully Created/);
        this.errorMessage = page.locator('.error-message, .text-red-500');
        this.projectList = page.locator('.project-card p.font-bold');
        this.projectCards = page.locator('div.flex.justify-between.items-center.p-3.border.rounded-md.w-full.gap-2.cursor-pointer');
        this.projectsList = page.locator('.project-item .project-name');


    }

async navigateToProjects() {
    await this.page.locator('a:nth-child(5)').click();
  }

  async clickAddNew() {
    await this.addNewButton.click();
  }

  async createProject(prefix, name, type) {
  await this.clickAddNew();
  await this.prefixInput.click();
  await this.prefixInput.fill(prefix);
  await this.nameInput.click();
  await this.nameInput.fill(name);
  await this.projectTypeSelect.selectOption(type);
  await this.createButton.click();
  }

  async updateProject(prefix, name, type, status) {
    
    await this.prefixInput.click();
    await this.prefixInput.clear();
    await this.prefixInput.fill(prefix);
    
    await this.nameInput.click();
    await this.nameInput.clear();
    await this.nameInput.fill(name);
    
    await this.projectTypeSelect.selectOption(type);
    
    if (status) {
      await this.statusSelect.selectOption(status);
    }
    
    await this.updateButton.click();
  }

  async deleteProject() {
    await this.deleteButton.click();
    await this.confirmDeleteButton.click();
  }

  async selectProject(projectName) {
    await this.page.locator(`div:has-text("${projectName}")`).first().click();
  }

  async openProjectMenu(projectName) {
    await this.page.locator(`div:has-text("${projectName}") svg`).click();
  }

  async verifyProjectExists(projectName) {
  await this.page.waitForSelector(`.font-bold:has-text("${projectName}")`, {
    state: 'visible',
    timeout: 10000 
  });
}

  async verifyProjectNotExists(projectName) {
  await this.page.waitForSelector(`.font-bold:has-text("${projectName}")`, {
    state: 'hidden',
    timeout: 10000 
  });
  }

  async verifyProjectsListSorted() {
    // Get all project names
    const projectElements = await this.page.locator('.project-item .project-name').all();
    const projectNames = await Promise.all(
      projectElements.map(el => el.textContent())
    );
    
    const sortedNames = [...projectNames].sort((a, b) => 
      (a || '').localeCompare(b || '', undefined, { sensitivity: 'base' })
    );
    
    expect(projectNames).toEqual(sortedNames);
  }

  async verifyEmptyState() {
    await expect(
      this.page.getByText('No projects found').or(
        this.page.getByText('+ Create Project')
      )
    ).toBeVisible();
  }

  async verifyAddNewButtonVisible() {
    await expect(this.addNewButton).toBeVisible();
  }

  async verifyDeleteOptionVisible() {
    await expect(this.deleteButton).toBeVisible();
  }

  async verifyDeleteOptionNotVisible() {
    await expect(this.deleteButton).not.toBeVisible();
  }
 
async getProjects() {
  const projectCount = await this.projectCards.count();
    const projects = [];

    for (let i = 0; i < projectCount; i++) {
      const card = this.projectCards.nth(i);
      const name = await card.locator('div.font-bold').innerText();
      const type = await card.locator('div.text-xs.text-gray-600').innerText();
      projects.push({ name, type });
    }
    return projects;
  }

  

}
