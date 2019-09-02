// app.js
import express from 'express';
import path from 'path';
import logger from 'morgan';
import email from './routes/email';
import blog from './routes/blog';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

let whitelist = ['http://localhost:3000', 'http://www.rodanmusic.com'];
app.use('/email', cors({
    'origin': whitelist,
    'optionsSuccessStatus': 200,
    'Access-Control-Allow-Methods': 'POST'
}), email);
app.use('/blog', cors({
    'origin': whitelist,
    'optionsSuccessStatus': 200,
    'Access-Control-Allow-Methods': 'GET'
}), blog);

export default app;