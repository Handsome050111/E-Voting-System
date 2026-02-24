const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // To send emails to ANY address without buying a domain name, 
    // we must use a personal Gmail account with Nodemailer and an "App Password".

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
        throw new Error('Missing EMAIL_USER or EMAIL_PASS. You must configure a Gmail account and App Password in Render.');
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use SSL
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });

    const mailOptions = {
        from: `"${process.env.FROM_NAME || 'VoteSecure Admin'}" <${emailUser}>`,
        to: options.email,
        subject: options.subject,
        html: `<p>${options.message}</p>`
    };

    console.log(`Attempting to send email via Gmail SMTP to: ${options.email}...`);

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully via Gmail:', info.messageId);
        global.lastEmailError = null;
        return info;
    } catch (error) {
        console.error('❌ Gmail SMTP Error:', error.message);
        global.lastEmailError = error.message;
        throw error;
    }
};

module.exports = sendEmail;
