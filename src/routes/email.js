import express from 'express';
import logger from '../logger/winston';
import HttpStatus from 'http-status-codes';

var router = express.Router();
const TO_ADDRESS = process.env.TO_MAIL;
const TRANSPORT = require('../mailer/transport.js');

router.get('/send',  (req, res) => handleMessage(req.body, res));

let handleMessage = (req, res) => {
    let requestBody = JSON.parse(req.body);
    const options = {
        from: requestBody.email,
        to: TO_ADDRESS,
        subject: `EMAIL RECEIVED FROM RODANMUSIC.COM FROM EMAIL: ${requestBody.email}`,
        html: `<p>MESSAGE:${requestBody.message}</p>`
    };
    res = sendEmail(options, res);
    res.end();
};

let sendEmail = async (options, res) => {
    await TRANSPORT.sendMail(options, (err, info) => {
        if(err){
            res.status(HttpStatus.BAD_GATEWAY);
            res.json({"message": "Message unable to be sent!  Please wait and try again.  If error doesn't go away please contact Rodan on his Facebook or Soundcloud."});
            logger.error(`Unabled to send email from: ${options.from}.  Error: ${err}`);
        } else {
            res.status(HttpStatus.OK);
            res.json({"message": "Message successfully sent!"});
            logger.info(`Message from : ${options.from} sent successfully.  Result: ${info}`);
        }
    });
    return res;
};

export default router;