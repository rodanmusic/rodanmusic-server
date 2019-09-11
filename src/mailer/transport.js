var nodemailer = require('nodemailer');

const USER_EMAIL = process.env.USER_EMAIL;
const USER_PASS = process.env.USER_PASS;

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: USER_EMAIL,
        pass: USER_PASS
    }
});

module.exports = transporter;

