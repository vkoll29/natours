const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  resetTokenExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
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

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; //sometimes the data may be slower to save thus the jwt migh tbe set earlier than passchangedafter. subtract 1 second to put it a bit ealier just to be safe
  next();
});

userSchema.pre(/^find/, function(next) {
  //this. refers to the current query
  this.find({ active: { $ne: false } }); //using $ne:fasle because some documents don't have the active property set
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

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  console.log({ resetToken }, { pwt: this.passwordResetToken });
  this.resetTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
