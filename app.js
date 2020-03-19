const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//GLOBAL MIDDLEWARES
//Set security HTTP headers
app.use(helmet());

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//limit requests from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from your IP. Try again in an hour'
});
app.use('/api', limiter);

//Body parser; reading data from body into req.body. also limit the payload
app.use(express.json({ limit: '10kb' }));

//serving static fields
app.use(express.static(`${__dirname}/public`));

// app.use((req, res, next) => {
//   console.log("this text is from the middleware");
//   next();
// })
//
// app.use((req, res, next) => {
//   req.reqTime = new Date().toISOString();
//   console.log(req.headers);
//   next();
// });

// route middlewares
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.statusCode = 404;
  // err.status = 'fail';
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
