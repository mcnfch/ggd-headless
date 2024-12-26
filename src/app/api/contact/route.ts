import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Enable full debug logging for nodemailer
process.env.NODE_DEBUG = 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'mail.festivalravegear.com',
  port: 465,  // SMTPS port
  secure: true,  // Use SSL
  auth: {
    user: 'info@festivalravegear.com',
    pass: 'way2mcnfch@WSX'
  },
  debug: true,
  logger: true
});

// Test the connection on startup
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error);
    console.error('Error Details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
  } else {
    console.log('SMTP Connection Success:', success);
    console.log('Server is ready to take our messages');
  }
});

export async function POST(request: Request) {
  try {
    console.log('='.repeat(50));
    console.log('New Contact Form Submission');
    console.log('='.repeat(50));
    
    const body = await request.json();
    console.log('1. Received form data:', body);
    
    const { name, email, message } = body;

    if (!name || !email || !message) {
      console.error('2. Missing required fields:', { name, email, message: !!message });
      return NextResponse.json(
        { error: 'Name, email and message are required' },
        { status: 400 }
      );
    }

    console.log('3. All required fields present');

    const mailOptions = {
      from: {
        name: name,
        address: 'info@festivalravegear.com'
      },
      to: 'support@festivalravegear.com',
      replyTo: email,
      subject: `Contact Form: ${name}`,
      text: `
From: ${name}
Email: ${email}

${message}
      `.trim(),
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };

    console.log('4. Mail options prepared:', JSON.stringify(mailOptions, null, 2));

    try {
      console.log('5. Verifying SMTP connection...');
      const verification = await transporter.verify();
      console.log('6. SMTP Verification result:', verification);

      console.log('7. Attempting to send email...');
      const info = await transporter.sendMail(mailOptions);
      
      console.log('8. Email sent successfully!');
      console.log('Message ID:', info.messageId);
      console.log('Accepted:', info.accepted);
      console.log('Rejected:', info.rejected);
      console.log('Response:', info.response);
      console.log('Envelope:', JSON.stringify(info.envelope, null, 2));

      return NextResponse.json({ 
        success: true, 
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
      });
    } catch (error) {
      console.error('9. Error sending email:');
      console.error('Error object:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      });
      console.error('Stack trace:', error.stack);
      throw error;
    }
  } catch (error) {
    console.error('10. Contact form error:');
    console.error('Error object:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
