import express from 'express';
import httpRequest from 'request';
import HttpStatus from 'http-status-codes';
import logger from '../logger/winston';
const TRANSPORT = require('../mailer/transport.js');

const router = express.Router();

const TO_ADDRESS = process.env.TO_ADDRESS;
const FROM_ADDRESS = process.env.FROM_ADDRESS;
const TUMBLR_UUID = process.env.TUMBLR_UUID;
const TUMBLR_API_KEY = process.env.TUMBLR_API_KEY;

const TUMBLR_BASE_URI = 'https://api.tumblr.com/v2/blog';
const TUMBLR_ENDPOINT = 'posts';

const DEFAULT_PLAYER_SIZE = 500;

router.get('/posts/tags/:tag', (req, res) => getBlogEntries(req, res));

const getBlogEntries = (req, res) => {
    try {
        httpRequest.get(buildURI(req.params.tag), {timeout: 10000}, (error, apiResponse, body) => {
            if(body && body.length === 0){
                res.json({"message": "No Posts For the Selected Genre"});
                res.status(HttpStatus.OK);
            } else if(error || apiResponse.statusCode !== HttpStatus.OK){
                res = processErrorResponse(req, res, apiResponse, error);
            } else {
                res = generateJsonResponse(res, body);
            }
            res.end();
        });
    } catch (e) {
        logger.error('MESSAGE: ' + e.message, 'STACK:' + e.stack);
        res.json({"message": "Unable to retrieve posts"});
        res.end();
    }
};

const buildURI = (tag) => {
    tag = encodeURI(tag);
    const URI = `${TUMBLR_BASE_URI}/${TUMBLR_UUID}/${TUMBLR_ENDPOINT}?api_key=${TUMBLR_API_KEY}&tag=${tag}`;
    return URI;
};

const processErrorResponse = (req, res, apiResponse, error) =>{
    let httpStatusErrorMessage = '';
    if(error){
        if(error.code === 'ETIMEDOUT'){
            logger.error('Request timeout');
        } else {
            logger.error('Unknown Error occured during api request');
        }
        httpStatusErrorMessage = error;
    } else {
        switch(apiResponse.statusCode){
            case HttpStatus.NOT_FOUND:
                httpStatusErrorMessage = `Request for posts with tag of type: ${req.params.tag} not found`;
                break;
            case HttpStatus.REQUEST_TIMEOUT:
                httpStatusErrorMessage = 'Request timed out';
                break;
            case HttpStatus.UNAUTHORIZED:
                httpStatusErrorMessage = 'Tumblr api access unauthorized'; 
                break;
            default:
                httpStatusErrorMessage = 'Unknown error occured';
                break;
        }
        logger.error(`Tumblr API request failed with status code: ${apiResponse.statusCode}.  Reason: ${httpStatusErrorMessage}.`);
    }
    notifyOfErrorByEmail(httpStatusErrorMessage);
    res.json({"message": "Unknown error occured.  Please contact the admin if the problem persists."});
    return res;
};

const generateJsonResponse = (res, body) => {
    // parse the response, and create the proper json response object
    let listOfBlogPosts = []; 

    let bodyJSON = JSON.parse(body);
    console.log(bodyJSON);
    let posts = bodyJSON.response.posts;

     // limiting to last 5 tracks, then link to the blog on page.
    let numberOfVideos = 0;
    for(let i = 0; (i < posts.length && numberOfVideos < 5); i++){
        let post = posts[i];
        if(post.type === 'video'){
            if(post.player){
                let players = post.player;
                for(let p = 0; p < players.length; p++){
                    let player = players[p];
                    if(player.embed_code && player.width && player.width === DEFAULT_PLAYER_SIZE){
                        listOfBlogPosts.push(resizeIframe(player.embed_code));
                        numberOfVideos++;
                        break;
                    }
                }
            }
        } else if (post.type === 'text'){
            if(post.body){
                listOfBlogPosts.push(resizeIframe(post.body.substring(post.body.indexOf('<iframe'), post.body.indexOf('</iframe>'))));
                numberOfVideos++;
            }
        }
    }
    res.status(HttpStatus.OK);
    let responseJSON = {
        "postEntries" : `${JSON.stringify(listOfBlogPosts)}`
    };
    res.json(responseJSON);
    return res;
};

const resizeIframe = (iframe) => {
    iframe = iframe.replace(/height="[0-9]*"/, 'height="180"')
    return iframe.replace(/width="[0-9]*"/, 'width="100%"');
};

const notifyOfErrorByEmail = (error) => {
    TRANSPORT.sendMail({
        from: FROM_ADDRESS, 
        to: TO_ADDRESS, 
        subject: 'Blog Retrieval Error', 
        html: `<p>${error}</p>`
    }, (err, info) => {
        if(err){
            logger.error(`Unable to send email regarding the following error: ${error}.  Reason: ${err}`);
        }
    });
}

export default router;