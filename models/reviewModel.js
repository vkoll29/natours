const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review must be filled']
    },
    rating: {
      type: Number,
      max: [5, 'A tour rating should not exceed 5.0'],
      min: [1, 'A tour name should not be less than 1.0']
    },
    createdAt: {
      type: Date,
      Default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must be tied to a tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must be created by an existing user']
    }
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

// reviewSchema.pre(/^find/, function(next) {
//   this.populate(
//     'tour',
//     'name'
//     // {
//     // // eslint-disable-next-line prettier/prettier
//     // 'path': 'tour',
//     // // eslint-disable-next-line prettier/prettier
//     // // 'select': '-__v -passwordChangedAt',
//     // project: { name: 1, summary: 1 }
//     // }
//   ).populate(
//     'user',
//     'name'
//   );
//   next();
// });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
