/* eslint-disable radix */
/* eslint-disable no-console */
const Tour = require('./../models/tourModel');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//tour ROUTE HANDLERS
exports.getAllTours = async (req, res) => {
  try {
    //BUILD QUERY
    //1a) Filtering
    let queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(e => delete queryObj[e]);
    // console.log(req.query, queryObj);

    // const tours = Tour.find()
    //   .where('duration')
    //   .gte(5)
    //   .where('difficulty')
    //   .equals('easy');

    //1b) Advanced filtering

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    queryObj = JSON.parse(queryStr);
    //{duration: {$gte: 5}, difficulty: easy}
    let query = Tour.find(queryObj); //find returns a query

    //2 sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
      //sort('ratingsAverage price')
    } else {
      query = query.sort('-createdAt');
    }
    //3) Limiting fields shown after a query
    if (req.query.fields) {
      const projectedFields = req.query.fields.split(',').join(' ');
      query = query.select(projectedFields);
    } else {
      query = query.select('-__v');
    }
    //4 Pagination
    const page = req.query.page * 1 || 1; //another way of converting a string to number, the or operator defines a default value for page
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }

    //EXECUTE QUERY
    const tours = await query;
    //query.sort().select().skip().limit() - this is what's happening in the above line i.e when the query is finally executed

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { tour }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { tour: newTour }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent'
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: { tour }
    });
  } catch (err) {
    res.status(201).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
