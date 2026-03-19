const mongoose = require('mongoose');

const travelSchema = new mongoose.Schema({
  destination: { type: String, required: true }, 
  country: { type: String, required: true },
  highlight: { type: String, required: true }, 
  photoUrl: { type: String }
});

module.exports = mongoose.model('Travel', travelSchema);