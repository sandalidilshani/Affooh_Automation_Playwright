// pages/DashboardPage.js
export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.profileButton = page.locator('button.w-12.h-12.rounded-full');
    this.logoutMenuItem = page.getByRole('menuitem', { name: 'Log Out' });

  }

  async logout() {
    await this.profileButton.click();
    await this.logoutMenuItem.click();
  }
   async goToSprints() {
    await this.page.goto('https://app.affooh.com/sprints');
    
  }

  async goToTestPlan() {
    await this.page.goto('https://app.affooh.com/test-plan');
    await expect(this.page).toHaveURL(/.*test-plan/i);
    await expect(this.page).toHaveURL(/.*test-plan/i);
  }

  async goToReleases() {
    await this.page.locator('a:nth-child(4)').click();
    await this.page.getByText('Releases').click();
    await expect(this.page).toHaveURL(/.*release/i);
  }

  async goToAllProjects() {
    await this.page.locator('a:nth-child(5)').click();
    await this.page.getByText('All Projects').click();
    await expect(this.page).toHaveURL(/.*projects/i);
  }

  async goToUsers() {
    await this.page.locator('a:nth-child(6)').click();
    await this.page.waitForURL('/profile');
  }

  async openProfileMenu() {
    await this.page.goto('https://app.affooh.com/profile');
  }
}
