const { get } = require("http");
const MailosaurClient = require("mailosaur");
const mailosaur = new MailosaurClient("SvVSgPbirXKsZnfSkUnRHYPEjDkdGtFu");
const serverId = "temnjvgp";
const domain = `${serverId}.mailosaur.net`;

// Function to generate a new email address for each try
function generateTestEmail() {
  return mailosaur.servers.generateEmailAddress(serverId);
}

console.log("Sample generated email:", generateTestEmail());

async function waitForEmail(testEmail, timeout = 60000) {
  console.log(`Waiting for email sent to: ${testEmail}`);
  try {
    // Use the correct method name and parameters for Mailosaur SDK
    const criteria = {
      sentTo: testEmail
    };
    
    const result = await mailosaur.messages.get(serverId, criteria, {
      timeout: timeout
    });

    if (!result) {
      console.error("Email not found");
      return null;
    }

    console.log("📧 Email received:", result.subject);
    return result;
  } catch (error) {
    console.error("Error waiting for email:", error.message);
    
    // Try alternative approach - polling for messages
    console.log("Trying alternative polling approach...");
    return await pollForEmail(testEmail, timeout);
  }
}

// Alternative polling method with full message retrieval
async function pollForEmail(testEmail, timeout = 60000) {
  const startTime = Date.now();
  const pollInterval = 2000; // Poll every 2 seconds
  
  while (Date.now() - startTime < timeout) {
    try {
      console.log(`Polling for emails to ${testEmail}...`);
      const messages = await mailosaur.messages.list(serverId, {
        receivedAfter: new Date(startTime)
      });
      
      if (messages.items && messages.items.length > 0) {
        // Find message sent to our test email
        const targetMessage = messages.items.find(msg => 
          msg.to && msg.to.some(recipient => 
            recipient.email && recipient.email.toLowerCase() === testEmail.toLowerCase()
          )
        );
        
        if (targetMessage) {
          console.log(`📧 Email found: ${targetMessage.subject}`);
          
          // Get the full message content
          try {
            const fullMessage = await mailosaur.messages.getById(targetMessage.id);
            console.log("Full message content retrieved");
            return fullMessage;
          } catch (error) {
            console.log("Error getting full message, using partial:", error.message);
            return targetMessage;
          }
        }
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error("Error during polling:", error.message);
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  
  console.error("Timeout: No email received within the specified time");
  return null;
}

async function getInboxname() {
  console.log("Fetching inbox name...");
  try {
    const result = await mailosaur.servers.list();
    const inboxName = result.items[0].name;
    console.log(`Inbox name is ${inboxName}`);
    return inboxName;
  } catch (error) {
    console.error("Error fetching inbox name:", error.message);
    return null;
  }
}

async function getEmail() {
  try {
    const result = await mailosaur.messages.list(serverId);
    if (!result.items || result.items.length === 0) {
      console.error("No emails found");
      return null;
    }
    const latestMessage = result.items[0];
    console.log(`Latest message subject: ${latestMessage.subject}`);
    
    // Get the full message details including content
    const fullMessage = await mailosaur.messages.getById(latestMessage.id);
    console.log("Full message retrieved:", {
      id: fullMessage.id,
      subject: fullMessage.subject,
      hasText: !!fullMessage.text,
      hasHtml: !!fullMessage.html
    });
    
    return fullMessage;
  } catch (error) {
    console.error("Error fetching email:", error.message);
    return null;
  }
}

// Extract OTP from email content with enhanced parsing
function extractOtpFromEmail(message) {
  if (!message) {
    console.error("No message provided");
    return null;
  }

  console.log("Full message object for debugging:", JSON.stringify(message, null, 2));

  // Try different ways to access email content
  const textContent = String(message.text?.body || message.textBody || message.text || "");
  const htmlContent = String(message.html?.body || message.htmlBody || message.html || "");
  const subject = String(message.subject || "");
  const summary = String(message.summary || "");
  
  // Also check if content is in different structure
  const alternativeText = String(message.body?.text || "");
  const alternativeHtml = String(message.body?.html || "");
  
  const allContent = [
    subject,
    textContent,
    htmlContent,
    summary,
    alternativeText,
    alternativeHtml
  ].filter(content => content && content.length > 0).join(" ");
  
  console.log('All extracted content:', {
    subject: subject,
    textContent: typeof textContent === 'string' ? textContent.substring(0, 200) : textContent,
    htmlContent: typeof htmlContent === 'string' ? htmlContent.substring(0, 200) : htmlContent,
    summary: typeof summary === 'string' ? summary.substring(0, 200) : summary,
    alternativeText: typeof alternativeText === 'string' ? alternativeText.substring(0, 200) : alternativeText,
    alternativeHtml: typeof alternativeHtml === 'string' ? alternativeHtml.substring(0, 200) : alternativeHtml,
    fullContentLength: allContent.length
  });
  
  // Look for various OTP patterns with more flexible matching
  const otpPatterns = [
    /\b(\d{6})\b/g,                    // 6-digit numbers with word boundaries
    /\b(\d{4})\b/g,                    // 4-digit numbers with word boundaries
    /\b(\d{5})\b/g,                    // 5-digit numbers
    /code[:\s]*(\d+)/gi,               // "code: 123456"
    /otp[:\s]*(\d+)/gi,                // "otp: 123456"
    /verification[:\s]*(\d+)/gi,       // "verification: 123456"
    /confirm[:\s]*(\d+)/gi,            // "confirm: 123456"
    /pin[:\s]*(\d+)/gi,                // "pin: 123456"
    /token[:\s]*(\d+)/gi,              // "token: 123456"
    /(\d{4,8})/g                       // Any 4-8 digit sequence
  ];

  for (const pattern of otpPatterns) {
    const matches = allContent.match(pattern);
    if (matches && matches.length > 0) {
      console.log(`Pattern ${pattern} found matches:`, matches);
      
      // Find the first numeric match that looks like an OTP (4-8 digits)
      for (const match of matches) {
        const numbers = match.match(/\d+/);
        if (numbers && numbers[0].length >= 4 && numbers[0].length <= 8) {
          const otp = parseInt(numbers[0], 10);
          console.log(`OTP found: ${otp}`);
          return otp;
        }
      }
    }
  }

  console.error('OTP not found in the email content');
  return null;
}

async function getOtP() {
  const latestMessage = await getEmail();
  return extractOtpFromEmail(latestMessage);
}

// Main function that generates new email and waits for OTP
async function getOtpFlow() {
  const testEmail = generateTestEmail(); // Generate new email each time
  console.log(`📨 Generated test email: ${testEmail}`);

  // Use this testEmail when registering/logging in your app
  const message = await waitForEmail(testEmail);

  return extractOtpFromEmail(message);
}

// Function to run multiple attempts with new emails
async function runMultipleAttempts(maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`\n--- Attempt ${attempt} ---`);
    
    const testEmail = generateTestEmail();
    console.log(`Generated email for attempt ${attempt}: ${testEmail}`);
    
    try {
      const message = await waitForEmail(testEmail, 30000); // 30 second timeout
      
      if (message) {
        const otp = extractOtpFromEmail(message);
        if (otp) {
          console.log(`✅ Success on attempt ${attempt}! OTP: ${otp}`);
          return { success: true, email: testEmail, otp: otp };
        }
      }
      
      console.log(`❌ Attempt ${attempt} failed`);
    } catch (error) {
      console.error(`Error on attempt ${attempt}:`, error.message);
    }
  }
  
  console.log("All attempts failed");
  return { success: false };
}

// Example usage
(async () => {
  console.log("=== Single OTP Flow ===");
  const otp = await getOtpFlow();
  console.log("Final OTP:", otp);
  
  console.log("\n=== Multiple Attempts Demo ===");
  const result = await runMultipleAttempts(2);
  console.log("Final result:", result);
})();

module.exports = {
  mailosaur,
  generateTestEmail,
  getInboxname,
  getEmail,
  getOtP,
  getOtpFlow,
  waitForEmail,
  pollForEmail,
  extractOtpFromEmail,
  runMultipleAttempts
};