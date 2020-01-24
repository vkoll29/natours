const fs = require('fs');
const express = require('express');

const app = express();

app.use(express.json());

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        status: "success",
        results: tours.length,
        data: { tours }
    });
});

app.post('/api/v1/tours', (req, res) => {
    /**my implementation. works */
    // tours.push(req.body)
    // fs.writeFileSync(`${__dirname}/dev-data/data/tours-simple2.json`, JSON.stringify(tours));

    const newId = tours[tours.length - 1].id + 1;
    const newTourObj = Object.assign({ id: newId }, req.body);
    tours.push(newTourObj);
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: "success",
            data: { tour: newTourObj}
        })
    });

});

const port = 4000;
app.listen(port, () => {
    console.log(`server running on port ${port}`);
    
})
