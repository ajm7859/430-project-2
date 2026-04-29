const mongoose = require('mongoose');
const _ = require('underscore');

const setText = (text) => _.escape(text).trim();

const PostSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
    set: setText,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  username: {
    type: String,
    required: true,
  },
  likes: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Account',
  }],
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

const PostModel = mongoose.model('Post', PostSchema);
module.exports = PostModel;