// app.js
import express from 'express';
import path from 'path';
import logger from 'morgan';

import email from './routes/email';
import blog from './routes/blog';

const app = express();
let portNum = 4000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/email', email);
app.use('/blog', blog);

app.listen(portNum, () => console.log(`Listening on port: ${portNum}`));

export default app;