class ManageUsers {
    constructor(page) {
        this.page = page;
        
        // Corrected selectors based on the actual HTML structure
        this.selectors = {
            userListContainer: '.h-list-screen',
            // More specific selector for user buttons
            userButtons: 'button.items-center.p-3.border.border-gray-200.rounded-md.w-full.grid.grid-cols-3.gap-2.hover\\:bg-gray-100',
            // More specific selectors for name and email within user buttons
            userNameElements: '.col-span-2 .font-bold',
            userEmailElements: '.col-span-2 .text-sm.text-primary-pink',
            searchInput: 'input[placeholder="Search..."]',
            loadingIndicator: '.loading',
            userCard: '.user-card',
            addUserButton: '[data-testid="add-user-btn"]',
            deleteUserButton: '[data-testid="delete-user-btn"]',
            editUserButton: '[data-testid="edit-user-btn"]',
            inviteEmailInput: 'input[type="email"][placeholder="Invite"]',
            roleSelect: 'select',
            inviteButton: 'button:has-text("INVITE")'
        };
        
        // Wait times
        this.waitTimes = {
            short: 500,
            medium: 1500,
            long: 10000
        };
    }

    /**
     * Wait for the user list container to be visible
     */
    async waitForUserListToLoad() {
        try {
            await this.page.waitForSelector(this.selectors.userListContainer, { 
                timeout: this.waitTimes.long,
                state: 'visible'
            });
            
            // Also wait for at least one user button to be present
            await this.page.waitForSelector(this.selectors.userButtons, { 
                timeout: this.waitTimes.long 
            });
            
            console.log('✅ User list loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load user list:', error.message);
            throw error;
        }
    }

    /**
     * Scroll the user list to the bottom to load all users
     * @param {string} containerSelector - The container selector to scroll
     */
    async scrollUserListToBottom(containerSelector = this.selectors.userListContainer) {
        try {
            await this.page.waitForSelector(containerSelector, { 
                timeout: this.waitTimes.long,
                state: 'visible'
            });
            
            await this.page.evaluate(async (selector) => {
                const container = document.querySelector(selector);
                if (!container) {
                    throw new Error(`Container with selector ${selector} not found`);
                }
                
                let prevHeight = 0;
                let currHeight = container.scrollHeight;
                let attempts = 0;
                const maxAttempts = 10;
                
                while (prevHeight !== currHeight && attempts < maxAttempts) {
                    prevHeight = currHeight;
                    container.scrollTop = container.scrollHeight;
                    
                    // Wait for potential new content to load
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    currHeight = container.scrollHeight;
                    attempts++;
                }
                
                console.log(`Scrolling completed after ${attempts} attempts`);
            }, containerSelector);
            
            // Wait a bit more for any lazy-loaded content
            await this.page.waitForTimeout(this.waitTimes.short);
            console.log('✅ Scrolling to bottom completed');
            
        } catch (error) {
            console.error('❌ Failed to scroll user list:', error.message);
            throw error;
        }
    }

    /**
     * Get all visible email addresses from the user list
     * @returns {Promise<string[]>} Array of email addresses
     */
    async getAllVisibleEmails() {
        try {
            // Wait for user buttons to be present
            await this.page.waitForSelector(this.selectors.userButtons, { timeout: this.waitTimes.medium });
            
            const emails = await this.page.$$eval(this.selectors.userEmailElements, elements =>
                elements
                    .filter(element => element.offsetParent !== null) // Only visible elements
                    .map(element => element.textContent.trim())
                    .filter(email => email.length > 0) // Filter out empty strings
            );
            
            console.log(`📧 Found ${emails.length} visible emails`);
            return emails;
            
        } catch (error) {
            console.error('❌ Failed to get visible emails:', error.message);
            return [];
        }
    }

    /**
     * Get all users with their names and emails
     * @returns {Promise<Array<{name: string, email: string}>>}
     */
    async getAllUsersWithDetails() {
        try {
            // Wait for user buttons to be present
            await this.page.waitForSelector(this.selectors.userButtons, { timeout: this.waitTimes.medium });
            
            const users = await this.page.$$eval(this.selectors.userButtons, buttons =>
                buttons.map(button => {
                    const nameElement = button.querySelector('.col-span-2 .font-bold');
                    const emailElement = button.querySelector('.col-span-2 .text-sm.text-primary-pink');
                    
                    return {
                        name: nameElement ? nameElement.textContent.trim() : '',
                        email: emailElement ? emailElement.textContent.trim() : ''
                    };
                }).filter(user => user.email && user.name) // Only return users with valid emails and names
            );
            
            console.log(`👥 Found ${users.length} users with complete details`);
            return users;
            
        } catch (error) {
            console.error('❌ Failed to get users with details:', error.message);
            return [];
        }
    }

    /**
     * Search for users using the search input
     * @param {string} searchTerm - The term to search for
     */
    async searchUsers(searchTerm) {
        try {
            const searchInput = this.page.locator(this.selectors.searchInput);
            await searchInput.waitFor({ state: 'visible', timeout: this.waitTimes.medium });
            
            // Clear existing text first
            await searchInput.fill('');
            await this.page.waitForTimeout(this.waitTimes.short);
            
            // Type the search term
            await searchInput.fill(searchTerm);
            await this.page.waitForTimeout(this.waitTimes.medium); // Wait for filtering to complete
            
            console.log(`🔍 Searched for: "${searchTerm}"`);
            
        } catch (error) {
            console.error('❌ Failed to search users:', error.message);
            throw error;
        }
    }

    /**
     * Clear the search input
     */
    async clearSearch() {
        try {
            const searchInput = this.page.locator(this.selectors.searchInput);
            await searchInput.waitFor({ state: 'visible', timeout: this.waitTimes.medium });
            await searchInput.fill('');
            await this.page.waitForTimeout(this.waitTimes.medium); // Wait for filter to reset
            
            console.log('🔄 Search cleared');
            
        } catch (error) {
            console.error('❌ Failed to clear search:', error.message);
            throw error;
        }
    }

    /**
     * Check if a specific email exists in the user list
     * @param {string} email - Email to search for
     * @returns {Promise<boolean>}
     */
    async isEmailExists(email) {
        try {
            const allEmails = await this.getAllVisibleEmails();
            const exists = allEmails.includes(email);
            console.log(`📍 Email "${email}" ${exists ? 'found' : 'not found'}`);
            return exists;
            
        } catch (error) {
            console.error('❌ Failed to check email existence:', error.message);
            return false;
        }
    }

    /**
     * Get user count
     * @returns {Promise<number>}
     */
    async getUserCount() {
        try {
            await this.page.waitForSelector(this.selectors.userButtons, { timeout: this.waitTimes.medium });
            const users = await this.page.$$(this.selectors.userButtons);
            const count = users.length;
            console.log(`📊 Total user count: ${count}`);
            return count;
            
        } catch (error) {
            console.error('❌ Failed to get user count:', error.message);
            return 0;
        }
    }

    /**
     * Click on a user by email
     * @param {string} email - Email of the user to click
     */
    async clickUserByEmail(email) {
        try {
            await this.page.waitForSelector(this.selectors.userButtons, { timeout: this.waitTimes.medium });
            
            const userButtons = await this.page.$$(this.selectors.userButtons);
            
            for (const button of userButtons) {
                const emailElement = await button.$('.col-span-2 .text-sm.text-primary-pink');
                if (emailElement) {
                    const userEmail = await emailElement.textContent();
                    if (userEmail && userEmail.trim() === email) {
                        await button.click();
                        console.log(`👆 Clicked on user: ${email}`);
                        return;
                    }
                }
            }
            
            throw new Error(`User with email ${email} not found`);
            
        } catch (error) {
            console.error(`❌ Failed to click user with email ${email}:`, error.message);
            throw error;
        }
    }

    /**
     * Wait for search results to load
     */
    async waitForSearchResults() {
        try {
            // Wait for the search to process
            await this.page.waitForTimeout(this.waitTimes.medium);
            
            // Wait for at least one user button to be present (or none if no results)
            await this.page.waitForFunction(() => {
                const buttons = document.querySelectorAll('button.items-center.p-3.border.border-gray-200.rounded-md.w-full.grid.grid-cols-3.gap-2.hover\\:bg-gray-100');
                return true; // Always return true since we might have 0 results
            }, { timeout: this.waitTimes.long });
            
            console.log('⏳ Search results loaded');
            
        } catch (error) {
            console.error('❌ Failed to wait for search results:', error.message);
            // Don't throw error here, as empty results are valid
        }
    }

    /**
     * Get filtered emails after search
     * @returns {Promise<string[]>}
     */
    async getFilteredEmails() {
        try {
            await this.waitForSearchResults();
            return await this.getAllVisibleEmails();
            
        } catch (error) {
            console.error('❌ Failed to get filtered emails:', error.message);
            return [];
        }
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean}
     */
    isValidEmailFormat(email) {
        if (!email || typeof email !== 'string') {
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    /**
     * Get users by search term
     * @param {string} searchTerm - Term to search for
     * @returns {Promise<string[]>}
     */
    async getUsersBySearchTerm(searchTerm) {
        try {
            await this.searchUsers(searchTerm);
            const filteredEmails = await this.getFilteredEmails();
            await this.clearSearch();
            
            console.log(`🔎 Found ${filteredEmails.length} users matching "${searchTerm}"`);
            return filteredEmails;
            
        } catch (error) {
            console.error(`❌ Failed to get users by search term "${searchTerm}":`, error.message);
            // Always clear search even if there's an error
            try {
                await this.clearSearch();
            } catch (clearError) {
                console.error('❌ Failed to clear search after error:', clearError.message);
            }
            return [];
        }
    }

    /**
     * Invite a new user
     * @param {string} email - Email to invite
     * @param {string} role - Role to assign (OWNER, ADMIN, MEMBER, CLIENT)
     */
    async inviteUser(email, role = 'MEMBER') {
        try {
            // Fill email input
            const emailInput = this.page.locator(this.selectors.inviteEmailInput);
            await emailInput.waitFor({ state: 'visible', timeout: this.waitTimes.medium });
            await emailInput.fill(email);
            
            // Select role
            const roleSelect = this.page.locator(this.selectors.roleSelect);
            await roleSelect.selectOption({ label: role });
            
            // Click invite button
            const inviteButton = this.page.locator(this.selectors.inviteButton);
            await inviteButton.click();
            
            console.log(`📨 Invited user: ${email} with role: ${role}`);
            
        } catch (error) {
            console.error(`❌ Failed to invite user ${email}:`, error.message);
            throw error;
        }
    }

    /**
     * Get user details by email
     * @param {string} email - Email to search for
     * @returns {Promise<{name: string, email: string} | null>}
     */
    async getUserDetailsByEmail(email) {
        try {
            const users = await this.getAllUsersWithDetails();
            const user = users.find(u => u.email === email);
            
            if (user) {
                console.log(`👤 Found user: ${user.name} (${user.email})`);
            } else {
                console.log(`❌ User with email ${email} not found`);
            }
            
            return user || null;
            
        } catch (error) {
            console.error(`❌ Failed to get user details for ${email}:`, error.message);
            return null;
        }
    }

    /**
     * Take screenshot for debugging
     * @param {string} filename - Screenshot filename
     */
    async takeDebugScreenshot(filename = 'debug-screenshot.png') {
        try {
            await this.page.screenshot({ 
                path: filename, 
                fullPage: true 
            });
            console.log(`📸 Debug screenshot saved: ${filename}`);
        } catch (error) {
            console.error('❌ Failed to take screenshot:', error.message);
        }
    }
}

module.exports = { ManageUsers };