var nodemailer = require('nodemailer');

const TRANSPORT_USER = process.env.TRANSPORT_USER;// const USER_EMAIL = 'rodanmusic@gmail.com';
const TRANSPORT_PASS = process.env.TRANSPORT_PASS;

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: TRANSPORT_USER,
        pass: TRANSPORT_PASS
    }
});

module.exports = transporter;

