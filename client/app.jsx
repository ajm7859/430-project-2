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

const handleLikePost = (e, id, onPostLiked) => {
  e.preventDefault();
  helper.hideError();

  helper.sendPost('/likePost', { id }, onPostLiked);
  return false;
};

const handleEditPost = (e, id, text, onPostEdited) => {
  e.preventDefault();
  helper.hideError();

  if (!text) {
    helper.handleError('Post cannot be empty!');
    return false;
  }

  helper.sendPost('/editPost', { id, text }, onPostEdited);
  return false;
};

const handleCustomize = (e, onCustomize) => {
  e.preventDefault();
  helper.hideError();

  const displayName = e.target.querySelector('#displayName').value;

  helper.sendPost('/customizeAccount', { displayName }, onCustomize);
  return false;
};

const handleChangePassword = (e) => {
  e.preventDefault();
  helper.hideError();

  const oldPass = e.target.querySelector('#oldPass').value;
  const newPass = e.target.querySelector('#newPass').value;
  const newPass2 = e.target.querySelector('#newPass2').value;

  if (!oldPass || !newPass || !newPass2) {
    helper.handleError('All password fields are required!');
    return false;
  }

  if (newPass !== newPass2) {
    helper.handleError('New passwords do not match!');
    return false;
  }

  helper.sendPost('/changePassword', { oldPass, newPass, newPass2 });
  e.target.reset();
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

const AccountPanel = (props) => (
  <section className="account-panel">
    <h2>Account</h2>
    <p>Signed in as @{props.account.username}</p>

    {props.account.premium ? (
      <>
        <p>Premium Active</p>

        <form onSubmit={(e) => handleCustomize(e, props.reloadAccount)}>
          <label htmlFor="displayName">Display Name</label>
          <input id="displayName" type="text" name="displayName" placeholder="Display name" />

          <button type="submit">Save Display Name</button>
        </form>

        <button type="button" onClick={props.togglePremium}>
          Disable Premium
        </button>
      </>
    ) : (
      <>
        <p>Free Account</p>
        <button type="button" onClick={props.togglePremium}>
          Enable Premium
        </button>
      </>
    )}
  </section>
);

const PasswordPanel = () => (
  <section className="account-panel">
    <h2>Change Password</h2>

    <form onSubmit={handleChangePassword}>
      <label htmlFor="oldPass">Current Password</label>
      <input id="oldPass" type="password" name="oldPass" />

      <label htmlFor="newPass">New Password</label>
      <input id="newPass" type="password" name="newPass" />

      <label htmlFor="newPass2">Confirm New Password</label>
      <input id="newPass2" type="password" name="newPass2" />

      <button type="submit">Update Password</button>
    </form>
  </section>
);

const PostCard = (props) => {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(props.post.text);

  const isOwner = props.post.owner === props.currentUser;
  const likes = props.post.likes || [];
  const liked = likes.some((id) => id === props.currentUser);

  return (
    <div className="post-card">
      <h3>@{props.post.username}</h3>

      {editing ? (
        <form onSubmit={(e) => {
          handleEditPost(e, props.post._id, editText, props.triggerReload);
          setEditing(false);
        }}
        >
          <textarea value={editText} onChange={(e) => setEditText(e.target.value)} />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      ) : (
        <p>{props.post.text}</p>
      )}

      <button
        type="button"
        onClick={(e) => handleLikePost(e, props.post._id, props.triggerReload)}
      >
        {liked ? 'Unlike' : 'Like'} ({likes.length})
      </button>

      {isOwner && !editing && (
        <div className="post-actions">
          <button type="button" onClick={() => setEditing(true)}>Edit</button>
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
  const [account, setAccount] = useState({});
  const [reloadAccount, setReloadAccount] = useState(false);


  const triggerReload = () => setReloadPosts(!reloadPosts);
  const triggerAccountReload = () => setReloadAccount(!reloadAccount);

  useEffect(() => {
    const loadPosts = async () => {
      const response = await fetch('/getPosts');
      const data = await response.json();

      setPosts(data.posts);
      setCurrentUser(data.currentUser);
    };

    loadPosts();
  }, [reloadPosts]);

  useEffect(() => {
    const loadAccount = async () => {
      const response = await fetch('/getAccount');
      const data = await response.json();

      setAccount(data.account);
    };

    loadAccount();
  }, [reloadAccount]);

  const togglePremium = () => {
    helper.sendPost('/togglePremium', {}, triggerAccountReload);
  };

  return (
    <main className="feed-app">
      <AccountPanel
        account={account}
        togglePremium={togglePremium}
        reloadAccount={triggerAccountReload}
      />

      <PasswordPanel />

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