const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

const handlePost = (e, onPostAdded) => {
  e.preventDefault();
  helper.hideError();

  const text = e.target.querySelector('#postText').value;

  if (!text) {
    helper.handleError('Post cannot be empty!');
    return false;
  }

  helper.sendPost(e.target.action, { text }, onPostAdded);
  e.target.reset();
  return false;
};

const handleDeletePost = (e, id, onPostDeleted) => {
  e.preventDefault();
  helper.hideError();

  helper.sendPost('/deletePost', { id }, onPostDeleted);
  return false;
};

const PostForm = (props) => (
  <form
    id="postForm"
    onSubmit={(e) => handlePost(e, props.triggerReload)}
    action="/makePost"
    method="POST"
    className="post-form"
  >
    <textarea id="postText" name="text" placeholder="Say something!" />
    <input className="post-submit" type="submit" value="Post" />
  </form>
);

const PostCard = (props) => {
  const isOwner = props.post.owner === props.currentUser;

  return (
    <div className="post-card">
      <h3>@{props.post.username}</h3>
      <p>{props.post.text}</p>

      {isOwner && (
        <div className="post-actions">
          <button
            type="button"
            onClick={(e) => handleDeletePost(e, props.post._id, props.triggerReload)}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const PostList = (props) => {
  if (props.posts.length === 0) {
    return <h3 className="empty-feed">No posts yet. Be the first to post!</h3>;
  }

  const postNodes = props.posts.map((post) => (
    <PostCard
      key={post._id}
      post={post}
      currentUser={props.currentUser}
      triggerReload={props.triggerReload}
    />
  ));

  return <div className="post-list">{postNodes}</div>;
};

const FeedApp = () => {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [reloadPosts, setReloadPosts] = useState(false);

  const triggerReload = () => setReloadPosts(!reloadPosts);

  useEffect(() => {
    const loadPosts = async () => {
      const response = await fetch('/getPosts');
      const data = await response.json();

      setPosts(data.posts);
      setCurrentUser(data.currentUser);
    };

    loadPosts();
  }, [reloadPosts]);

  return (
    <main className="feed-app">
      <PostForm triggerReload={triggerReload} />
      <PostList
        posts={posts}
        currentUser={currentUser}
        triggerReload={triggerReload}
      />
    </main>
  );
};

const init = () => {
  const root = createRoot(document.getElementById('app'));
  root.render(<FeedApp />);
};

window.onload = init;