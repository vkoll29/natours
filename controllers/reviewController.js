const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter;
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews }
  });
});
/* My implementation for the above handler factory. Mine does not leave room for finding all reviews. The idea here is that ther's no point in accessing all reviews. Rather you should only access the reviews while clicking on one particular tour */
// exports.getReviewsonOneTour = catchAsync(async (req, res, next) => {
//   const reviews = await Review.find()
//     .where('tour')
//     .equals(req.params.tourId);

//   res.status(200).json({
//     status: 'successs',
//     results: reviews.length,
//     data: { reviews }
//   });
// });

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review)
    return next(
      new AppError(`No review found with that id ${req.params.id}`, 404)
    );

  res.status(200).json({
    status: 'success',
    data: { review }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  //creating a review through nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; //req.user comes from the protect middleware as defined in authController

  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { review: newReview }
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!review) return next(new AppError('No review with that ID found', 404));

  res.status(200).json({
    status: 'success',
    data: { review }
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return next(new AppError('No review with that ID found', 404));
  res.status(204).json({
    status: 'success',
    data: null
  });
});
