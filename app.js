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

app.get('/api/v1/tours/:id/', (req, res) => {
    tourId = parseInt(req.params.id);
    /** first solution to a case where the ID doesn't match records*/

    // if(tourId > tours[tours.length - 1].id) return(
    //   res.status(404).json({
    //     status: "Failed",
    //     message: "No such page exists"
    //   })
    // )

    /**Second solution*/
    const tour = tours.find(e => e.id === tourId);
    if(!tour) return(
      res.status(404).json({
        status: "Failed",
        message: "No such page exists"
      })
    )
    res.status(200).json({
        status: "success",
        data: {
            tour
        }
    })
})

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

app.patch('/api/v1/tours/:id', (req, res) => {
  if(parseInt(req.params.id) > tours[tours.length - 1].id) return(
    res.status(404).json({
      status: "Failed",
      message: "Invalid ID passed"
    })
  )
  res.status(201).json({
    status: "success",
    message: "Successfully modified the tour with id..."
  })
})

app.delete('/api/v1/tours/:id', (req, res) =>{
  if(parseInt(req.params.id) > tours[tours.length - 1].id) return(
    res.status(404).json({
      status: "Failed",
      message: "Invalid ID passed"
    })
  )
  res.status(204).json({
    status: "success",
    data: null
  })
})

const port = 4000;
app.listen(port, () => {
    console.log(`server running on port ${port}`);

})
