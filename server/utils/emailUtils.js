const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // For development, we can use ethereal or a simple log if credentials aren't provided
    // But since nodemailer is in dependencies, let's set up a basic transport

    // Due to Render.com blocking all outbound SMTP ports (25, 465, 587) on their free tier,
    // we must use an HTTP API to send emails instead of Nodemailer/SMTP.
    // We are using Brevo (formerly Sendinblue) because it has a generous free tier and a simple HTTP API.

    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
        throw new Error('Missing BREVO_API_KEY environment variable. Render blocks standard SMTP, so you must use Brevo. Please add BREVO_API_KEY to your Render environment variables.');
    }

    const payload = {
        sender: {
            name: process.env.FROM_NAME || 'VoteSecure Admin',
            email: process.env.FROM_EMAIL || 'no-reply@votesecure.com'
        },
        to: [
            {
                email: options.email
            }
        ],
        subject: options.subject,
        textContent: options.message
    };

    console.log(`Attempting to send HTTP email to: ${options.email} via Brevo API...`);

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Brevo API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log('✅ HTTP Email sent successfully via Brevo: %s', data.messageId);
        global.lastEmailError = null; // Clear on success
        return data;

    } catch (error) {
        console.error('❌ HTTP Email Error:', error.message);
        global.lastEmailError = error.message;
        throw error;
    }
};

module.exports = sendEmail;
