const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//MIDDLEWARES
app.use(morgan('dev'));
app.use(express.json());
// app.use((req, res, next) => {
//   console.log("this text is from the middleware");
//   next();
// })
//
// app.use((req, res, next) => {
//   req.reqTime = new Date().toISOString();
//   next();
// })

// route middlewares
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);


//START SERVER
const port = 4000;
app.listen(port, () => {
    console.log(`server running on port ${port}`);

})
