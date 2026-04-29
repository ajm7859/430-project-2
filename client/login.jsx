const helper = require('./helper.js');

const handleLogin = (e) => {
  e.preventDefault();
  helper.hideError();

  const username = e.target.querySelector('#user').value;
  const pass = e.target.querySelector('#pass').value;

  if (!username || !pass) {
    helper.handleError('All fields required');
    return false;
  }

  helper.sendPost(e.target.action, { username, pass });
  return false;
};

const handleSignup = (e) => {
  e.preventDefault();
  helper.hideError();

  const form = e.target;

  helper.sendPost(form.action, {
    username: form.querySelector('input[name="username"]').value,
    pass: form.querySelector('input[name="pass"]').value,
    pass2: form.querySelector('input[name="pass2"]').value,
  });

  return false;
};

const init = () => {
  document.querySelector('#loginForm').addEventListener('submit', handleLogin);
  document.querySelector('#signupForm').addEventListener('submit', handleSignup);
};

window.onload = init;