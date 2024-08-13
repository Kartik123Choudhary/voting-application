const nodemailer = require('nodemailer'); // Nodemailer is used to send the emails


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'skkartik006@gmail.com',
        pass: 'htma kyzr yezv xotd'
    }
});

function sendEmail(to, subject, text) {
    const mailOptions = {
        from: 'skkartik006@gmail.com',
        to,
        subject,
        text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
}

function sendSMS(mobile, message) {
    console.log(`Sending SMS to ${mobile}: ${message}`);
    // Implement SMS sending logic here
}

module.exports = {
    sendEmail,
    sendSMS
};
