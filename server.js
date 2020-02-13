const dotenv = require('dotenv');
dotenv.config({path: './config.env'});

const app = require('./app');

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`server running on port ${port} and NODE_ENV is ${process.env.NODE_ENV}` );

})
