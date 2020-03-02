/**Error Handling async functions
 * - create a wrapper function where the async function is passed as an argument
 * - the wrapper returns an anonymous fn which is then stored in each route handler
 * - if the async fn rejects i.e no promise returned, the error is passed onto catch which calls next() with that error
 */
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
