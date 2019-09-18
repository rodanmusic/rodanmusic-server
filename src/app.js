// app.js
import express from 'express';
import logger from 'morgan';
import email from './routes/email';
import blog from './routes/blog';
import path from 'path';

const app = express();

app.use( express.static(`${__dirname}/../clientBuild` ));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/blog', blog);
app.use('/email',email);
app.get('*', (req, res)=>{  res.sendFile(path.join(__dirname, '../clientBuild/index.html'));})
export default app;