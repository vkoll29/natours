/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// ); /*Atlas server connection*/
const DB = process.env.DATABASE_LOCAL; /*local server connection*/
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    // console.log(con.connections);
    console.log('Connected to database successfully');
  });
//connect method is a promise. con used as an arg in then is the resolved value of the promise

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    `server running on port ${port} and NODE_ENV is ${process.env.NODE_ENV}`
  );
});
