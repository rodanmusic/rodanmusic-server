import express from 'express';
import logger from '../logger/winston';
import HttpStatus from 'http-status-codes';
const TRANSPORT = require('../mailer/transport.js');
var router = express.Router();
const TO_ADDRESS = process.env.TO_ADDRESS;

router.post('/send',  (req, res) => handleMessage(req.body, res));

let handleMessage = (req, res) => {
    /*
    TODO: when I add a dropdown for email type, convert this to be a template system for different email types.
    */
    const options = {
        from: req.data.email,
        to: TO_ADDRESS,
        subject: `Message recieved from RODANMUSIC.COM.`,
        html: `
            <b>SENDER</b>:<br /> ${req.data.name}<br /><br />
            <b>SENDER EMAIL</b>:<br /> ${req.data.email}<br /><br />
            <b>MESSAGE</b>:<br /> ${req.data.message}<br />
        `
    };
    sendEmail(options, res);
};

function sendEmail(options, res) {
    TRANSPORT.sendMail(options, (err, info) => {
        if(err){
            res.status(HttpStatus.BAD_GATEWAY);
            res.json({"message": "Message unable to be sent!  Please wait and try again.  If error doesn't go away please contact Rodan on his Facebook or Soundcloud."});
            logger.error(`Unabled to send email from: ${options.from}.  Error: ${err}`);
        } else {
            res.status(HttpStatus.OK);
            res.json({"message": "Message successfully sent!"});
            logger.info(`Message from : ${options.from} sent successfully.  Result: ${info}`);
        }
        res.end();
    });
};

export default router;