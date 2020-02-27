const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A mximum number of people allowed per tour must be set']
  },
  difficulty: {
    type: String,
    required: [true, 'The difficulty level should be set']
  },
  ratingsAverage: {
    type: Number,
    default: 4.4
  },
  ratingQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    required: [true, 'Provide a description for the tour']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour should have a cover image']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date]
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
