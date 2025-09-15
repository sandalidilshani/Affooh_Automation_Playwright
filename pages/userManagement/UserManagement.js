import { DashboardPage } from "../dashboard/Dashboard";

export class UserManagementPage{
    constructor(page){
        this.page=page;
        this.UserPage=new DashboardPage(page);
        this.userEmail=page.locator('div.text-sm.text-primary-pink');
        this.userRemoveButton=page.locator('div.svg-icon.svgi-trash');
    
    }
    async gotoUserManagementPage(){
        await this.UserPage.goToUsers();
    }

    async getUserList(){
        for(let i=0;i<10;i++){
            const userEmailText = await this.userEmail.nth(i).innerText();
            console.log(`User ${i+1}: ${userEmailText}`);
        }
    }

    async removeUser(index){
        await this.userRemoveButton.nth(index).click();
    }

}