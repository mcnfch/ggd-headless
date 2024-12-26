const nodemailer = require('nodemailer');

// Create test transporter
const transporter = nodemailer.createTransport({
  host: 'mail.festivalravegear.com',
  port: 587,
  secure: false,
  auth: {
    user: 'info@festivalravegear.com',
    pass: 'way2mcnfch@WSX'
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true, // Enable debug logging
  logger: true // Enable built-in logger
});

async function sendTestEmail(toEmail) {
  console.log(`\n\nTesting email to: ${toEmail}`);
  console.log('='.repeat(50));

  try {
    // First, verify the configuration
    console.log('1. Verifying connection...');
    const verification = await transporter.verify();
    console.log('Verification result:', verification);

    // If verification successful, send a test email
    console.log('\n2. Sending test email...');
    const info = await transporter.sendMail({
      from: 'support@festivalravegear.com',
      to: toEmail,
      subject: `Test Email from Festival Rave Gear to ${toEmail}`,
      text: 'This is a test email to verify SMTP configuration.',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email sent to ${toEmail} to verify SMTP configuration.</p>
        <p>Time sent: ${new Date().toISOString()}</p>
      `
    });

    console.log('\n3. Email send results:');
    console.log('Message ID:', info.messageId);
    console.log('Accepted:', info.accepted);
    console.log('Rejected:', info.rejected);
    console.log('Response:', info.response);
    console.log('Envelope:', JSON.stringify(info.envelope, null, 2));
    
  } catch (error) {
    console.error('\nError occurred:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
  }
}

async function runTests() {
  const testEmails = [
    'me@matt.forbush.biz',
    'mcnfch@gmail.com'
  ];

  for (const email of testEmails) {
    await sendTestEmail(email);
  }
}

runTests();
