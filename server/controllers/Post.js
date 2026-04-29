const models = require('../models');

const Post = models.Post;

const appPage = (req, res) => res.render('app');

const getPosts = async (req, res) => {
  try {
    const docs = await Post.find({})
      .select('text owner username createdDate likes')
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
    username: req.session.account.displayName || req.session.account.username,
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

const editPost = async (req, res) => {
  if (!req.body.id || !req.body.text) {
    return res.status(400).json({ error: 'Post id and text are required!' });
  }

  try {
    const query = {
      _id: req.body.id,
      owner: req.session.account._id,
    };

    await Post.updateOne(query, { text: req.body.text });

    return res.status(200).json({ message: 'Post updated!' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error editing post!' });
  }
};

const likePost = async (req, res) => {
  if (!req.body.id) {
    return res.status(400).json({ error: 'Post id is required!' });
  }

  try {
    const post = await Post.findById(req.body.id).exec();

    if (!post) {
      return res.status(404).json({ error: 'Post not found!' });
    }

    const userId = req.session.account._id;
    const liked = post.likes.some((id) => id.toString() === userId);

    if (liked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    return res.status(200).json({
      likes: post.likes.length,
      liked: !liked,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error liking post!' });
  }
};

module.exports = {
  appPage,
  getPosts,
  makePost,
  deletePost,
  editPost,
  likePost,
};