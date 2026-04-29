const models = require('../models');

const Account = models.Account;

const loginPage = (req, res) => res.render('login');

const logout = (req, res) => {
  req.session.destroy();
  return res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/app' });
  });
};

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });

    await newAccount.save();

    req.session.account = Account.toAPI(newAccount);

    return res.json({ redirect: '/app' });
  } catch (err) {
    console.log(err);

    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }

    return res.status(500).json({ error: 'An error occurred.' });
  }
};

const getAccount = (req, res) => res.json({ account: req.session.account });

const togglePremium = async (req, res) => {
  try {
    const account = await Account.findById(req.session.account._id).exec();

    if (!account) {
      return res.status(404).json({ error: 'Account not found!' });
    }

    account.premium = !account.premium;
    await account.save();

    req.session.account = Account.toAPI(account);

    return res.json({ premium: account.premium });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error updating premium status!' });
  }
};

const customizeAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.session.account._id).exec();

    if (!account) {
      return res.status(404).json({ error: 'Account not found!' });
    }
    
    account.displayName = req.body.displayName || account.displayName;

    await account.save();

    req.session.account = Account.toAPI(account);

    return res.json({ account: req.session.account });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error customizing account!' });
  }
};

const changePassword = async (req, res) => {
  const oldPass = `${req.body.oldPass}`;
  const newPass = `${req.body.newPass}`;
  const newPass2 = `${req.body.newPass2}`;

  if (!oldPass || !newPass || !newPass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (newPass !== newPass2) {
    return res.status(400).json({ error: 'New passwords do not match!' });
  }

  try {
    const account = await Account.findById(req.session.account._id).exec();

    if (!account) {
      return res.status(404).json({ error: 'Account not found!' });
    }

    return Account.authenticate(account.username, oldPass, async (err, doc) => {
      if (err || !doc) {
        return res.status(401).json({ error: 'Current password is incorrect!' });
      }

      const hash = await Account.generateHash(newPass);
      account.password = hash;

      await account.save();

      return res.json({ message: 'Password changed successfully!' });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error changing password!' });
  }
};

const notFoundPage = (req, res) => {
  res.status(404).render('404');
};

module.exports = {
  loginPage,
  login,
  logout,
  signup,
  notFoundPage,
  togglePremium,
  customizeAccount,
  getAccount,
  changePassword,
};