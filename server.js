
var http = require('http');
var path = require('path');
var express = require('express');
var mongoose = require('mongoose');

var Post = require('./models/Post.js');
var Comment = require('./models/Comment.js');
var Hashtag = require('./models/Hashtag.js');
var User = require('./models/User.js');

var router = express();
var server = http.createServer(router);



//establish connection to our mongodb instance
mongoose.connect('mongodb://admin:admin@ds021182.mlab.com:21182/instagram_assignment');

//tell the router (ie. express) where to find static files
router.use(express.static(path.resolve(__dirname, 'client')));
//tell the router to parse JSON data for us and put it into req.body
router.use(express.bodyParser());

//tell the router how to handle a get request to the root 
router.get('/', function(req, res)
{
  console.log('client requests index.html');
  //use sendfile to send our index.html file
  res.sendfile(path.join(__dirname, 'client/view','index.html'));
});


//tell the router how to handle a post request to find all post
router.post('/GetAllPosts', function(req, res){
  //print the log
  console.log('Client requests all posts');
  
  //go find all the posts in the database
  Post.find({})
  .then(function(paths){
    //send them to the client in JSON format
    res.json(paths);
  })
});

  
//tell the router how to handle a post request to find all comment
router.post('/GetAllComments', function(req, res){
  //print the log
  console.log('Find all comments of post ' + req.body.id);
  
  //go find all the comments of the post
  Comment.findById(req.body.id)
  .then(function(paths){
    //send them to the client in JSON format
    res.json(paths);
  })
});
  
//tell the router how to handle a post request to /incrLike
router.post('/incrLike', function(req, res){
  console.log('increment like for ' + req.body.id);
  //the client will send us the ID for the post for which we should increment the like
  //this will be in req.body.id
  //so far, we are just going to respond with a count of 1
  //we don't have to send back the ID, but it will make the client side code easier
  res.json({id: req.body.id, count: 1});  
});


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
