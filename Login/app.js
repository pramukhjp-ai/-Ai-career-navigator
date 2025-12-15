// Login/app.js
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');

const homeRouter = require('./routers/homeRouter');
const resumeRouter = require('./routers/resumeRouter');
const port = process.env.PORT || 8080;

const app = express();

// ---- views + view engine ----
app.set('views', path.join(__dirname, 'views')); // ensures correct absolute path
app.set('view engine', 'ejs');

// ---- middleware ----
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // parse form data
app.use(express.json());

// ---- session (must be before mounting router) ----
app.use(session({
  name: 'itnav.sid',
  secret: 'replace_this_with_a_strong_secret', // change in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
    httpOnly: true,
    // secure: true // enable in production with HTTPS
  }
}));

// ---- database ----
mongoose.connect('mongodb://127.0.0.1:27017/studentsdata', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", () => { console.log("error in connection"); });
db.once('open', () => { console.log("Connected to MongoDB"); });

// ---- static quick routes (optional) ----
app.get('/', (req, res) => {
  // If user logged in redirect to dashboard, otherwise show register/login
  if (req.session && req.session.user) return res.redirect('/dashboard');
  res.render('register', { title: 'Fill Form', password: '', email: '' });
});

app.get('/iq', (req, res) => res.render('iq', { text: 'iq' }));
app.get('/trivia', (req, res) => res.render('trivia', { text: 'trivia' }));
app.get('/chat', (req, res) => res.render('chat', { text: 'chat' }));

// ---- mount routers (after session & parsing middleware) ----
app.use('/', homeRouter);
app.use('/resume', resumeRouter);

// ---- start server ----
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

