const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'A tour name should not exceed 50 characters'],
      minlength: [10, 'A tour name should have more than 10 characters']
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [
        true,
        'A maximum number of people allowed per tour must be set'
      ]
    },
    difficulty: {
      type: String,
      required: [true, 'The difficulty level should be set'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium, or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'A tour rating should not exceed 5.0'],
      min: [1, 'A tour name should not be less than 1.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this. only points to the current doc when creating a NEW document not when updating
          return val < this.price; //checking if the discount is less than the marked price
        },
        message: 'The discounted price needs to be less than the marked price'
      }
    },
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
    startDates: [Date],
    slug: String,
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        //GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
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

//seting index
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// document middleware. only runs when save() and create() are called
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true }); // this refers to the actual Document to be saved
  next();
});

// query middleware
tourSchema.pre(/^find/, function(next) {
  this.find({
    secretTour: {
      $ne: true
    }
  }); // this refers to the query object
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

// aggregation middleware

tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({
    $match: {
      secretTour: {
        $ne: true
      }
    }
  }); //this points to the current aggregate object
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
