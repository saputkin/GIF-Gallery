var createError = require('http-errors');
var express = require('express');
var path = require('path');
const session = require('express-session')
var cors = require("cors");

var giphy = require('giphy-api')('Giphy API key');

var app = express();
//serve static files (client)
app.use(express.static(path.join(__dirname, '../fclient/build')));
app.use(session({
  secret: 'itsAS3cr3t',
  resave: true,
  saveUninitialized: true
}))
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('etag', false)

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
app.get('/refresh', function(req, res) {
  if(req.session.gifs && req.session.queries){
    return res.send({gifs:req.session.gifs,queries:req.session.queries} )
  }
});


app.get('/loadGifs', (req, res) =>{
  if(req.session.queries && req.session.gifs){
    return res.send(200,{'queries':req.session.queries, 'gifs':req.session.gifs})
  }
  res.sendStatus(404);
})
app.post('/getRandomGIF', (req, res) =>{
  //validate input
  var q = req.body.query;
  if(!req.session.queries || !req.session.gifs){
    return res.sendStatus(404);
  }
  
  giphy.random({'tag': q}).then(function (gifres) {
  req.session.gifs = [...req.session.gifs, {'gif':gifres, 'key': req.body.key}]
  return res.send({'gif':gifres, 'key':req.body.key})
  });
} )

app.post('/removeJob', (req, res) =>{
  if(req.session.queries && req.session.gifs ){
    const qrs = req.session.queries.filter(q => q.key !== req.body.job.key);
    const gfs = req.session.gifs.filter(gif => gif.key !== req.body.job.key);
    req.session.queries = qrs;
    req.session.gifs = gfs;
    

    return res.send({'gifs':gfs, 'queries':qrs});
  }
})

app.post('/submitQuery', (req, res) =>{
  //TODO Validate input
  if(req.session.queries){
    req.session.queries = [...req.session.queries, {'query':req.body.query, 'interval': req.body.interval,'key':req.body.key}];
  }
  else req.session.queries = [{'query':req.body.query, 'interval': req.body.interval,'key':req.body.key}]
  giphy.random({'tag': req.body.query}).then(function (gifres) {
    if(req.session.gifs){
      req.session.gifs = [...req.session.gifs, {'gif':gifres, 'key':req.body.key}]
    }
    else{
      req.session.gifs = [{'gif':gifres, 'key':req.body.key}]
    }
    res.send({'gif':gifres, 'key':req.body.key})
  })
})

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
