const fs = require('fs');
const express = require('express');

const router = express.Router();
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

//tour ROUTE HANDLERS
const getAllTours = (req, res) => {
    res.status(200).json({
        status: "success",
        time: req.reqTime,
        results: tours.length,
        data: { tours }
    });
}

const getTour = (req, res) => {
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
}

const createTour = (req, res) => {
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

}

const updateTour = (req, res) => {
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
};

const deleteTour = (req, res) =>{
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
};

router
  .route('/')
  .get(getAllTours)
  .post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;
