export class AcceptInvitation{
    constructor(page){
        this.page=page;

        this.selector={
            emailinput:this.page.getByRole('textbox', { name: 'Invite' }),
            inviteButton:this.page.getByRole('button',{name:'invite'})


        }
    }

    async sentInvitation(email){
        await this.selector.emailinput.fill(email)
        await this.selector.inviteButton.click()
        

    }

    a

}

