import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalSetup() {
  console.log('🚀 Running global setup - fetching test data...');
  
  // Create browser instance for API calls
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  // Create data directory
  const dataDir = path.join(process.cwd(), 'test-datafromAPI');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  try {
    // Fetch users data
    console.log('Fetching users...');
    const usersResponse = await context.request.get('https://jsonplaceholder.typicode.com/users');
    if (!usersResponse.ok()) {
      throw new Error(`Failed to fetch users: ${usersResponse.status()}`);
    }
    const usersData = await usersResponse.json();
    
    // Save users data
    fs.writeFileSync(
      path.join(dataDir, 'users.json'), 
      JSON.stringify(usersData, null, 2)
    );
    console.log(`✅ Saved ${usersData.length} users`);

    // Fetch posts data
    console.log('Fetching posts...');
    const postsResponse = await context.request.get('https://jsonplaceholder.typicode.com/posts');
    if (!postsResponse.ok()) {
      throw new Error(`Failed to fetch posts: ${postsResponse.status()}`);
    }
    const postsData = await postsResponse.json();
    
    // Save posts data
    fs.writeFileSync(
      path.join(dataDir, 'posts.json'), 
      JSON.stringify(postsData, null, 2)
    );
    console.log(`✅ Saved ${postsData.length} posts`);

    // Create summary file
    const summary = {
      lastUpdated: new Date().toISOString(),
      totalUsers: usersData.length,
      totalPosts: postsData.length,
      dataReady: true
    };

    fs.writeFileSync(
      path.join(dataDir, 'summary.json'),
      JSON.stringify(summary, null, 2)
    );

    console.log('✅ Global setup completed successfully');

  } catch (error) {
    console.error('❌ Global setup failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;