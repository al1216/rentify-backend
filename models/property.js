// Property.js

const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  place: String,
  area: String,
  bedrooms: Number,
  bathrooms: Number,
  price: String,
  nearest_hospital: {
    name: String,
    distance: String
  },
  nearest_college: {
    name: String,
    distance: String
  },
  like: Number,
  name: String,
  seller_name: String,
  seller_contact: String,
  seller_email: String
});

module.exports = mongoose.model('Property', propertySchema);
