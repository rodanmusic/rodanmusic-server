import express from 'express';
import httpRequest from 'request';
import HttpStatus from 'http-status-codes';
import options from '../logger/winston';
import logger from '../logger/winston'

const router = express.Router();

// endpoint data
const TUMBLR_UUID = 't:g2nbrkbakUCxZd_UpGoAUA';
const TUMBLR_BASE_URI = 'https://api.tumblr.com/v2/blog';
const TUMBLR_ENDPOINT = 'posts';

const DEFAULT_PLAYER_SIZE = 250;

let getBlogEntries = (req, res) => {
    try {
        httpRequest.get(buildURI(req.params.tag), {timeout: 10000}, (error, apiResponse, body) => {
            if(body && body.length === 0){
                res.json({"message": "No Posts For the Selected Genre"});
                res.status(HttpStatus.OK);
            } else if(error || apiResponse.statusCode !== HttpStatus.OK){
                processErrorResponse(req, res, apiResponse, error);
            } else {
                generateJsonResponse(res, body);
            }
        });
    } catch (e) {
        logger.error(e);
        res.json({"message": "Unable to retrieve posts"});
    }
};

let buildURI = (tag) => {
    return `${TUMBLR_BASE_URI}/${TUMBLR_UUID}/${TUMBLR_ENDPOINT}?api_key=${getApiKey()}&tag=${tag}&type=video`;
};

let getApiKey = () => {
    // TODO: retrieve the api key from the environmental variables
    return "";
};

let processErrorResponse = (req, res, apiResponse, error) =>{
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
    // add email functionality to notify me when an error occurs.
    res.json({"message": "Unknown error occured.  Please contact the admin if the problem persists."});
};

let generateJsonResponse = (res, body) => {
    // parse the response, and create the proper json response object
    let structuredJSONResponse = []; 

    let bodyJSON = JSON.parse(body);
    let posts = bodyJSON.response.posts;

     // limiting to last 5 tracks, then link to the blog on page.
    let numVideos = (posts.length > 5) ? 5 : posts.length;
    for(let i = 0; i < numVideos; i++){
        let post = posts[i];
        if(post.player){
            let players = post.player;
            for(let p = 0; p < players.length; p++){
                let player = players[p];
                if(player.width && player.width === DEFAULT_PLAYER_SIZE){
                    structuredJSONResponse.push(player.embed_code);
                    break;
                }
            }
        }
    }
    res.status(HttpStatus.OK);
    res.json(structuredJSONResponse);
};

router.get('/posts/tags/:tag', (req, res) => getBlogEntries(req, res));

export default router;