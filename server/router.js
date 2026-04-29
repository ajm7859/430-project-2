const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/app', mid.requiresLogin, controllers.Post.appPage);
  app.get('/getPosts', mid.requiresLogin, controllers.Post.getPosts);
  app.post('/makePost', mid.requiresLogin, controllers.Post.makePost);
  app.post('/deletePost', mid.requiresLogin, controllers.Post.deletePost);
  app.post('/editPost', mid.requiresLogin, controllers.Post.editPost);
  app.post('/likePost', mid.requiresLogin, controllers.Post.likePost);

  app.get('/getAccount', mid.requiresLogin, controllers.Account.getAccount);
  app.post('/togglePremium', mid.requiresLogin, controllers.Account.togglePremium);
  app.post('/customizeAccount', mid.requiresLogin, controllers.Account.customizeAccount);
  app.post('/changePassword', mid.requiresLogin, controllers.Account.changePassword);
  
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  app.use(controllers.Account.notFoundPage);
};

module.exports = router;