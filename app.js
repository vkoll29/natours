const fs = require('fs');
const express = require('express');

const app = express();


const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        status: "success",
        results: tours.length,
        data: { tours }
    });
});
app.post('/', (req, res) => {
    res.status(200).send("You can post to ths endpoint..")
})

const port = 4000;
app.listen(port, () => {
    console.log(`server running on port ${port}`);
    
})
