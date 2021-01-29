const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

//the mergeParams arg gives reviewRoutes access to the req params in tourROutes. thus it can access tourId
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'guide'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'guide'),
    reviewController.deleteReview
  );

module.exports = router;
