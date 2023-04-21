const { Schema, model } = require('mongoose');

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
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
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const personsSchema = new Schema({
  fname: String,
  lName: String,
  email: String,
  dob: Date,
  address: {
    address1: String,
    address2: String,
    city: String,
    state: String,
    zipCode: String,
  },
});

const weight = new Schema({
  person: { type: Schema.Types.ObjectId, ref: 'Person' },
  date: Date,
  weight: Number,
  unit: { type: String, enum: ['kg', 'lb'] },
});

const User = model('User', userSchema);

module.exports = User;
