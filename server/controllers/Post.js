const models = require('../models');

const Post = models.Post;

const appPage = (req, res) => res.render('app');

const getPosts = async (req, res) => {
  try {
    const docs = await Post.find({})
      .select('text owner username createdDate')
      .sort({ createdDate: -1 })
      .lean()
      .exec();

    return res.json({
      posts: docs,
      currentUser: req.session.account._id,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving posts!' });
  }
};

const makePost = async (req, res) => {
  if (!req.body.text) {
    return res.status(400).json({ error: 'Post text is required!' });
  }

  const postData = {
    text: req.body.text,
    owner: req.session.account._id,
    username: req.session.account.username,
  };

  try {
    const newPost = new Post(postData);
    await newPost.save();

    return res.status(201).json({
      text: newPost.text,
      username: newPost.username,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error making post!' });
  }
};

const deletePost = async (req, res) => {
  if (!req.body.id) {
    return res.status(400).json({ error: 'Post id is required!' });
  }

  try {
    const query = {
      _id: req.body.id,
      owner: req.session.account._id,
    };

    await Post.deleteOne(query);

    return res.status(200).json({ message: 'Post deleted!' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error deleting post!' });
  }
};

module.exports = {
  appPage,
  getPosts,
  makePost,
  deletePost,
};