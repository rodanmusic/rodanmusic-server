import express from 'express';
var router = express.Router();

let sendEmail = (req, res) => {
    
}


router.get('/send',  (req, res) => sendEmail(req.body, res));

export default router;