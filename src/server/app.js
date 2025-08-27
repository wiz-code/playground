import path from 'node:path';

import express from 'express';
import favicon from 'serve-favicon';
import createError from 'http-errors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import pug from 'pug';

const app = express();

app.set('view engine', 'pug');
app.set('views', path.resolve(__dirname, './views'));
app.engine('pug', pug.__express);

app.use(express.static(path.join(__dirname, '../client')));

app.use(
  favicon(path.resolve(__dirname, '../client/assets/images/favicon.ico')),
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.raw({ limit: '1000kb' }));
app.use(cookieParser());

app.get('/', (req, res, next) => {
  console.log('/', req.host);
  res.sendFile(path.resolve(__dirname, '../client/html/index.html'));
  // res.render('index');
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);

  const env = req.app.get('env');
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = env === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error'); /// //////////
});

export default app;
