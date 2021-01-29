const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//the mergeParams arg gives reviewRoutes access to the req params in tourROutes. thus it can access tourId
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(authController.protect, reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(authController.protect, reviewController.deleteReview);

module.exports = router;
