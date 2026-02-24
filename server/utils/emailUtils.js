const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Due to Render blocking outbound SMTP, we use Resend's HTTP API.
    // Resend is extremely developer friendly and rarely silently drops emails like Brevo.

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        throw new Error('Missing RESEND_API_KEY. Render blocks standard SMTP, so you must use Resend HTTP API. Please add RESEND_API_KEY to your Render environment variables.');
    }

    const payload = {
        from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
        to: [options.email],
        subject: options.subject,
        html: `<p>${options.message}</p>`
    };

    console.log(`Attempting to send email to: ${options.email} via Resend API...`);

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Resend API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Email sent successfully via Resend:', data.id);
        global.lastEmailError = null;
        return data;

    } catch (error) {
        console.error('❌ Resend Email Error:', error.message);
        global.lastEmailError = error.message;
        throw error;
    }
};

module.exports = sendEmail;
