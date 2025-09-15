// send-results.js
const fs = require('fs');
const path = require('path');
const { request } = require('@playwright/test');

async function sendResults() {
  console.log(' Starting sendResults function...');

  // --- 1. AFFOOH API details ---
  const AFFOOH_API_ENDPOINT = 'https://webhook.site/a334dcd8-dc33-4aa5-ac67-04f567d8edb5';

  // --- 2. Read the JSON results file ---
  let results;
  try {
    results = JSON.parse(fs.readFileSync('test-results.json', 'utf-8'));
  } catch (error) {
    console.error("Could not read test-results.json file:", error);
    return;
  }

  // --- 3. Prepare the payload ---
  const getLastResult = (test) => test.results[test.results.length - 1];

  // Collect all tests from nested suites
  const allTests = [];

  function collectTests(suites) {
    suites.forEach(suite => {
      if (suite.specs && suite.specs.length > 0) {
        suite.specs.forEach(spec => {
          spec.tests.forEach(test => {
            allTests.push({
              spec: spec,
              test: test,
              result: getLastResult(test)
            });
          });
        });
      }

      if (suite.suites && suite.suites.length > 0) {
        collectTests(suite.suites);
      }
    });
  }

  console.log('🔍 Collecting tests from suites...');
  collectTests(results.suites);
  console.log(`📊 Found ${allTests.length} tests`);

  const jsonPayload = {
    projectId: '123',
    tests: allTests.map(({ spec, result }) => {
      const testPayload = {
        testCaseId: spec.title.split(' ')[0], // Extract only the ID from the test case title
        status: result.status,
      };

      if (result.status === 'failed') {
        testPayload.error = result.error ? {
          message: result.error.message,
          stack: result.error.stack,
        } : null;

        const screenshotAttachment = result.attachments.find(att => att.name === 'screenshot');
        if (screenshotAttachment && screenshotAttachment.path) {
          const normalizedPath = path.resolve(screenshotAttachment.path.replace('test-resultts', 'test-results'));
          if (fs.existsSync(normalizedPath)) {
            const base64Screenshot = fs.readFileSync(normalizedPath).toString('base64');
            testPayload.screenshot = base64Screenshot.length > 1000 ? `${base64Screenshot.substring(0, 1000)}...` : base64Screenshot;
          } else {
            console.warn(`⚠️ Screenshot file not found: ${normalizedPath}`);
          }
        }
      }

      return testPayload;
    }),
  };

  console.log('📦 Payload being sent:', JSON.stringify(jsonPayload, null, 2));

  // --- 4. Send the API request ---
  console.log('🚀 Sending test results to Webhook...');
  try {
    const apiRequest = await request.newContext();

    const response = await apiRequest.post(AFFOOH_API_ENDPOINT, {
      data: jsonPayload,
      headers: {
        'User-Agent': 'Playwright-Test-Runner/1.0',
        'X-Test-Runner': 'Playwright',
      },
    });

    if (response.ok()) {
      console.log('✅ Successfully sent results!');
      console.log(`📋 Response status: ${response.status()}`);
    } else {
      console.error(`❌ Failed to send results. Status: ${response.status()}`);
      try {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
      } catch (e) {
        console.error('❌ Could not read error response');
      }
    }
  } catch (error) {
    console.error('❌ Error sending API request:', error);
  }

  // --- 5. Save the payload to a versioned file ---
  const resultsDir = path.resolve('results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const versionedFilePath = path.join(resultsDir, `results-${timestamp}.json`);
  fs.writeFileSync(versionedFilePath, JSON.stringify(jsonPayload, null, 2));
  console.log(`📁 Results saved to: ${versionedFilePath}`);
}

module.exports = sendResults;