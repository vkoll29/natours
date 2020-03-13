const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true,
    maxlength: [25, `A user's name should not exceed 25 characters`],
    minlength: [5, `A user's name should have more than 5 characters`]
  },
  email: {
    type: String,
    required: [true, 'Please provide your email address'],
    unique: true,
    lowercase: true,
    maxlength: [50, 'An email should not exceed 50 characters'],
    minlength: [5, 'An email should have more than 5 characters'],
    validate: [validator.isEmail, 'Please provide a valid email address']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'A password is required to create a user account'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Pease confirm your password'],
    validate: {
      // the validator only works on SAVE and CREATE
      validator: function(el) {
        return el === this.password;
      },
      message: 'Ensure that the passwords match'
    }
  },
  passwordChangedAt: Date
});

//pre(save) is called just when the data is received from the user and just before it is persisted in the db
userSchema.pre('save', async function(next) {
  //do not encrypt password if it is not modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  //passwordConfirm is unimportant in the database so the field is deleted. only used to confirm that the user typed the right thing
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//By default this function should return false meaning that the password has never been changed
//However, if it has a passwordChangedAt property, then it should be compared with the date of issue of the token issued
//If the password was changed after the token was issued then render that token invalid and require new login
//An example is changing your password for twitter on one device then trying to access twitter on another device. you will be asked to log in again
userSchema.methods.changedPasswordAfterLogin = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return changedAt > JWTTimestamp;
  }

  // Password has not been changed
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
