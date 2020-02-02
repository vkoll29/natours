const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

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
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

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

//user route HANDLERS
const getAllUsers = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Internal Server error"
  })
}
const createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Internal Server error"
  })
}
const getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Internal Server error"
  })
}
const updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Internal Server error"
  })
}
const deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "Internal Server error"
  })
}


// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id/', getTour)
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//ROUTES
const tourRouter = express.Router();


const userRouter = express.Router();

tourRouter
  .route('/')
  .get(getAllTours)
  .post(createTour);
tourRouter
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

userRouter
  .route('/')
  .get(getAllUsers)
  .post(createUser);
userRouter
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);


//START SERVER
const port = 4000;
app.listen(port, () => {
    console.log(`server running on port ${port}`);

})
