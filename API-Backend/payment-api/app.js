const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const paymentRouter = require('./routes/payment');
const shipmentRouter = require('./routes/shipment');

const app = express();

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:5173', 'https://dreamxworld.com', 'https://www.dreamxworld.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Log all requests with Authorization header
app.use((req, res, next) => {
  if (req.path.startsWith('/payment') || req.path.startsWith('/shipment')) {
    const auth = req.header('Authorization');
    console.log(`[Request] ${req.method} ${req.path}`);
    console.log(`[Auth Header] ${auth ? auth.substring(0, 50) + '...' : 'NOT PROVIDED'}`);
  }
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/payment', paymentRouter);
app.use('/shipment', shipmentRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
