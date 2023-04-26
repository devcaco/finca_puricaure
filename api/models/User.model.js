const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    fname: { type: String, trim: true },
    lname: { type: String, trim: true },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
    },
    profilePicture: {
      type: Object,
      required: false,
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  }
);

userSchema.methods.checkPwd = async function validatePassword(data) {
  console.log({ data, pwd: this.password });
  return bcrypt.compare(data, this.password);
};

userSchema.statics.hashPwd = async (pwd) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(pwd, salt);

  return hashedPassword;
};

const User = model('User', userSchema);

module.exports = User;
