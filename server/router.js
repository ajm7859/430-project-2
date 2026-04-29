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

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  app.use(controllers.Account.notFoundPage);
};

module.exports = router;