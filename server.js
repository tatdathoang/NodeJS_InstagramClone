//require statements -- this adds external modules from node_modules or our own defined modules
var http = require('http');
var path = require('path');

//express related
var express = require('express');
const bodyParser = require('body-parser');

//session
const session = require('express-session');  
const mongoSession = require('connect-mongodb-session')(session);
const passport = require('passport');
const userAuth = require('./userAuth.js');
const hash = require('./utils/hash.js');

//database
var mongoose = require('mongoose');
var Post = require('./models/Post.js');
var Comment = require('./models/Comment.js');
var Hashtag = require('./models/Hashtag.js');
var User = require('./models/User.js');
var PasswordReset = require('./models/PasswordReset.js');

//sendmail
const email = require('./utils/sendmail.js');

var router = express();
var server = http.createServer(router);

const dbUrl = 'mongodb://admin:admin@ds021182.mlab.com:21182/instagram_assignment'
//establish connection to our mongodb instance
mongoose.connect(dbUrl);
//create a sessions collection as well
var mongoSessionStore = new mongoSession({
    uri: dbUrl,
    collection: 'sessions'
});

//tell the router (ie. express) where to find static files
router.use(express.static(path.resolve(__dirname, 'client')));
//tell the router to parse JSON data for us and put it into req.body
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
//add session support
router.use(session({
  secret: process.env.SESSION_SECRET || 'mySecretKey', 
  store: mongoSessionStore,
  resave: true,
  saveUninitialized: false
}));

//add passport for authentication support
router.use(passport.initialize());
router.use(passport.session());
userAuth.init(passport);

//tell the router how to handle a get request to the root 
router.get('/', function(req, res)
{
  console.log('client requests root');
  //use sendfile to send our signin.html file
  res.sendfile(path.join(__dirname, 'client','signin.html'));//EDIT THIS PART
});


//tell the router how to handle a get request to the login page
router.get('/posts', function(req, res)
{
  console.log('client requests posts');
  //use sendfile to send our index.html file
  res.sendfile(path.join(__dirname, 'client','posts.html'));//EDIT THIS
});

//tell the router how to handle a get request to the login page
router.get('/login', function(req, res)
{
  console.log('client requests login');
  //use sendfile to send our index.html file
  res.sendfile(path.join(__dirname, 'client','login.html'));//EDIT THIS
});

//tell the router how to handle a post request from the login page
router.post('/login', function(req, res, next) 
{
  //tell passport to attempt to authenticate the login
  passport.authenticate('login', function(err, user, info)
  {
    //callback returns here
    if (err)
    {
      //if error, say error
      res.json({isValid: false, message: 'internal error'});
    } 
    else if (!user) 
    {
      //if no user, say invalid login
      res.json({isValid: false, message: 'try again'});
    } 
    else 
    {
      //log this user in
      req.logIn(user, function(err)
      {
        if (!err)
          //send a message to the client to say so
          res.json({isValid: true, message: 'welcome ' + user.email});
      });
    }
  })(req, res, next);
});

//tell the router how to handle a get request to the join page
router.get('/join', function(req, res)
{
  console.log('client requests join');
  res.sendFile(path.join(__dirname, 'client', 'signin.html'));//EDIT THIS
});

//tell the router how to handle a post request to the join page
router.post('/join', function(req, res, next) 
{
  passport.authenticate('join', function(err, user, info)
  {
    if (err)
    {
      res.json({isValid: false, message: 'internal error'});    
    } 
    else if (!user)
    {
      res.json({isValid: false, message: 'try again'});
    }
    else 
    {
      //log this user in since they've just joined
      req.logIn(user, function(err)
      {
        if (!err)
          //send a message to the client to say so
          res.json({isValid: true, message: 'welcome ' + user.email});
      });
    }
  })(req, res, next);
});

//tell the router how to handle a get request to the login page
router.get('/passwordreset', function(req, res)
{
  console.log('client requests passwordreset');
  //use sendfile to send our index.html file
  res.sendfile(path.join(__dirname, 'client','passwordreset.html'));//EDIT THIS
});

router.post('/passwordreset',function(req, res)
{
    Promise.resolve()
    .then(function()
    {
        //see if there's a user with this email
        return User.findOne({'email' : req.body.email});
    })
    .then(function(user)
    {
      if (user)
      {
        var pr = new PasswordReset();
        pr.userId = user.id;
        pr.password = hash.createHash(req.body.password);
        pr.expires = new Date((new Date()).getTime() + (20 * 60 * 1000));
        pr.save()
        .then(function(pr)
        {
          if (pr)
          {
            email.send(req.body.email, 'password reset', 'https://instagram-tatdathoang.c9users.io/verifypassword?id=' + pr.id);
          }
        });
      }
    })
});

router.get('/verifypassword', function(req, res)
{
    var password;
    
    Promise.resolve()
    .then(function()
    {
      return PasswordReset.findOne({id: req.body.id});
    })
    .then(function(pr)
    {
      if (pr)
      {
        if (pr.expires > new Date())
        {
          password = pr.password;
          //see if there's a user with this email
          return User.findOne({id : pr.userId});
        }
      }
    })
    .then(function(user)
    {
      if (user)
      {
        user.password = password;
        return user.save();
      }
    })
});


//tell the router how to handle a post request to find all post
router.post('/GetAllPosts', function(req, res)
{
  //print the log
  console.log('Client requests all posts');
  
  //go find all the posts in the database
  Post.find({})
  .then(function(paths){
    //send them to the client in JSON format
    res.json(paths);
  })
});
  
//tell the router how to handle a post request to find all comments
router.post('/GetAllComments', function(req, res)
{
  //print the log
  console.log('Find all comments of post ' + req.body.id);
  var commentArray = {};
  //go find all the comments of the post
  Comment.find({postID:req.body.id})
  .then(function(paths){
     paths.forEach(function(comment) {
    //send them to the client in JSON format
    res.json(paths);
    });
  })
});
  
//tell the router how to handle a post request to find all hashtags
router.post('/GetAllHashtag', function(req, res)
{
  //print the log
  console.log('Find all hastags of post ' + req.body.id);
  var hashtagArray = {};
  //go find all the hashtags of the post
  Hashtag.find({postID:req.body.id})
  .then(function(paths){
    paths.forEach(function(hashtag) {
    //send them to the client in JSON format
    res.json(paths);
    });
  })
});
    
//tell the router how to handle a post request to find user details
router.post('/GetUserDetails', function(req, res)
{
  //print the log
  console.log('Get details of the user that has id ' + req.body.id);
  //go find all the details of the user
  User.find({_id:req.body.id})
  .then(function(paths){
    //send them to the client in JSON format
    res.json(paths);
    });
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
