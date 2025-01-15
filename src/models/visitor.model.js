import mongoose from "mongoose";
const visitorSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  college: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
  },
  contact: {
    type: String,
    validate: {
      validator: function (v) {
        return /^(\+\d{1,3}[- ]?)?\d{10}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid contact number!`,
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
}, { timestamps: true });

  const Visitor = mongoose.model('Visitor', visitorSchema);
  export default Visitor
