const express = require('express');
const app = express();
const mongodb = require('./data/database');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github').Strategy;
const cors = require('cors');
const port = process.env.PORT || 3000;

app.use(cors());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use('/', require('./routes/index'));
app.use((req, res, next) => {
  res.status(404).json({ message: 'Page not found.' });
});
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ message: 'An internal error occurred!' });
});
app.use((err, req, res, next) => {
  console.error(err); 
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL 
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

mongodb.initDb((err) => {
  if (err) {
    console.error('Failed to connect to MongoDB:', err);
  } else {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
});
