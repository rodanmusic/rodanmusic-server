// app.js
import express from 'express';
import path from 'path';
import logger from 'morgan';
import email from './routes/email';
import blog from './routes/blog';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

app.use('/email', email);
app.use('/blog', blog);

export default app;