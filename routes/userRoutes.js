const express = require('express');

const router = express.Router();

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


router
  .route('/')
  .get(getAllUsers)
  .post(createUser);
router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router
