const express = require('express');
const app = require('./app');

const port = 4000;
app.listen(port, () => {
    console.log(`server running on port ${port}`);

})
