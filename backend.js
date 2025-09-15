// runner-server.js
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
app.use(express.json());

// Webhook: Affooh calls this to start tests
app.post('/start-tests', (req, res) => {
  const { projectId, tests, callbackUrl } = req.body;

  // Save test data for Playwright
  fs.writeFileSync('test-data.json', JSON.stringify({ projectId, tests, callbackUrl }));

  // Run Playwright tests
  exec('npx playwright test', (error, stdout, stderr) => {
    if (error) console.error(`❌ Error: ${error.message}`);
    if (stderr) console.error(`⚠️ Stderr: ${stderr}`);
    console.log(`📜 Output: ${stdout}`);
  });

  res.json({ message: '✅ Tests started', projectId });
});

app.listen(5000, () => console.log('🚀 Runner listening on http://localhost:5000'));
