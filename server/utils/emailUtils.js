const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // For development, we can use ethereal or a simple log if credentials aren't provided
    // But since nodemailer is in dependencies, let's set up a basic transport

    const transporterOptions = {
        host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
        port: process.env.EMAIL_PORT || 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    };

    // Use built-in service config if it's Gmail for better reliability
    if (process.env.EMAIL_HOST === 'smtp.gmail.com') {
        delete transporterOptions.host;
        delete transporterOptions.port;
        transporterOptions.service = 'gmail';
    }

    const transporter = nodemailer.createTransport(transporterOptions);

    const message = {
        from: `${process.env.FROM_NAME || 'VoteSecure'} <${process.env.FROM_EMAIL || 'no-reply@votesecure.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    console.log(`Attempting to send email to: ${options.email} via Gmail...`);

    try {
        const info = await transporter.sendMail(message);
        console.log('✅ Email sent successfully: %s', info.messageId);

        // Preview URL if using ethereal
        if (info.messageId && !process.env.EMAIL_USER) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
        return info;
    } catch (error) {
        console.error('❌ Nodemailer Error:');
        console.error('Code:', error.code);
        console.error('Command:', error.command);
        console.error('Response:', error.response);
        console.error('ResponseCode:', error.responseCode);
        console.error('Full Error:', error);
        throw error;
    }
};

module.exports = sendEmail;
