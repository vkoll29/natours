const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

/**NESTED ROUTES
 * Acessing reviews through the tour url. However, all the nested routes havve been routed to the reviewRoutes
 *  GET /tour/78346/reviews -> will return all reviews for the tour with id 78346
 *  POST /tour/78346/reviews -> will add another review to the tour with id 78346
 *  GET /tour/78346/reviews/0997 -> will return the review with id 0997 which belongs to tour with id 78346
 */

//telling the tourRouter to route all tours with the defined pattern to the reviewRouter
router.use('/:tourId/reviews', reviewRouter);

// router.param('id', tourController.checkID);
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
