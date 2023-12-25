const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
  },
  username: {
    type: String,
    required: true,
    unique: true, // Ensure username is unique
  },
  profileImage: {
    type: String,
  },
  tokens: [
    {
      type: String,
    },
  ],
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
