var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const indexRouter = require('./routes/index');
const dashboardRouter = require('./routes/dashboard');
const requestKKRouter = require('./routes/request-kk');
const requestKTPRouter = require('./routes/request-ktp');
const requestDraftRouter = require('./routes/request-draft');

var app = express();

// view engine setup
const hbs = require('express-handlebars');
app.engine(
  'hbs',
  hbs({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
    helpers: {
      json: (ctx) => {
        return JSON.stringify(ctx);
      },
      counter: (idx) => {
        return idx + 1;
      },
      ifEquals: (arg1, arg2, options) => {
        return arg1 == arg2 ? options.fn(this) : options.inverse(this);
      }
    }
  })
);
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/dashboard', dashboardRouter);
app.use('/request-kk', requestKKRouter);
app.use('/request-ktp', requestKTPRouter);
app.use('/request-draft', requestDraftRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { layout: 'blank' });
});

module.exports = app;
