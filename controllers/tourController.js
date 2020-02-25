/* eslint-disable no-console */
const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is ${val}`);
  if (parseInt(req.params.id) > tours[tours.length - 1].id)
    return res.status(404).json({
      status: 'Failed',
      message: 'Invalid ID passed'
    });
  next();
};

exports.checkData = (req, res, next) => {
  if (!req.body.name || !req.body.price)
    return res.status(400).json({
      status: 'Failed',
      message: 'Bad request: You must include all the new data'
    });
  next();
};

//tour ROUTE HANDLERS
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    time: req.reqTime,
    results: tours.length,
    data: { tours }
  });
};

exports.getTour = (req, res) => {
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

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
};

exports.createTour = (req, res) => {
  /**my implementation. works */
  // tours.push(req.body)
  // fs.writeFileSync(`${__dirname}/dev-data/data/tours-simple2.json`, JSON.stringify(tours));

  const newId = tours[tours.length - 1].id + 1;
  const newTourObj = Object.assign({ id: newId }, req.body);
  tours.push(newTourObj);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    () => {
      res.status(201).json({
        status: 'success',
        data: { tour: newTourObj }
      });
    }
  );
};

exports.updateTour = (req, res) => {
  res.status(201).json({
    status: 'success',
    message: 'Successfully modified the tour with id...'
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null
  });
};
