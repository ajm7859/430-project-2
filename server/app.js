const path = require('path');
const express = require('express');
const compression = require('compression');
const mongoose = require('mongoose');
const redis = require('redis');
const session = require('express-session');
const { RedisStore } = require('connect-redis');
const handlebars = require('express-handlebars');
const dotenv = require('dotenv');

dotenv.config();

const router = require('./router.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/FakeTwitter';
mongoose.connect(dbURI);

const db = mongoose.connection;

db.on('error', (err) => console.log(err));

const redisClient = redis.createClient({
  url: process.env.REDISCLOUD_URL,
});
redisClient.connect().catch(console.error);

const app = express();

app.use('/assets', express.static(path.resolve(__dirname, '../hosted')));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine('handlebars', handlebars.engine({
    defaultLayout: false,
}));
app.set('view engine', 'handlebars');
app.set('views', path.resolve(__dirname, 'views'));

app.use(session({
  key: 'sessionid',
  store: new RedisStore({ client: redisClient }),
  secret: 'supersecret',
  resave: false,
  saveUninitialized: false,
}));

router(app);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});