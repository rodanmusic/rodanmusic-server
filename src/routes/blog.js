import express from 'express';
var router = express.Router();

let retrieveBlogEntries = (req, res) => {
    
}

router.get('/getBlogListings', (req, res) => retrieveBlogEntries(req, res));

export default router;