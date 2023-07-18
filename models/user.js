const mongoose = require('mongoose');

// create new schema to store user sign in details
const userSchema = new mongoose.Schema(
  {
    name : {
      type : String,
      required: true,
    },
    email : {
      type : String,
      required: true,
      unique : true,
    },
    password : { 
      type : String,
      required: true,
    },
  },
  {timestamps : true}
)

const User = mongoose.model('user',userSchema);

module.exports = User;
