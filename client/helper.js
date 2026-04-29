const handleError = (message) => {
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('appMessage').classList.remove('hidden');
};
  
const hideError = () => {
  document.getElementById('appMessage').classList.add('hidden');
};
  
const sendPost = async (url, data, handler) => {
  const response = await fetch(url, {
    method: 'POST',
        headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
 
  const result = await response.json();
  hideError();
  
  if (result.redirect) {
    window.location = result.redirect;
  }
  
  if (result.error) {
    handleError(result.error);
  }
  
  if (handler) {
    handler(result);
  }
};

const handleEditPost = (e, id, text, onReload) => {
  e.preventDefault();
  helper.hideError();

  if (!text) {
    helper.handleError('Post cannot be empty!');
    return false;
  }

  helper.sendPost('/editPost', { id, text }, onReload);
  return false;
};
  
module.exports = {
  handleError,
  hideError,
  sendPost,
  handleEditPost
};