var express = require('express');
var app = express();
var methodOverride = require('method-override');
var bodyParser = require("body-parser");
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy  = require('passport-local');
var User = require('./models/user');
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("mongodb://localhost/restfull_blog");
app.use(methodOverride("_method"));






/////////////////////////////passport config///////////////////////////////////////////////

app.use(require("express-session")({
  secret:"THIS IS SECRET",
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  next();
}); 



///////////////////////////////////////////////Declaring Schema//////////////////////////////////////

var blogSchema = new mongoose.Schema({
  title:"String",
  image:"String",
  body:"String",
  created:{type:Date, default:Date.now}
});

var Blog = mongoose.model("Blog", blogSchema)

/////////////////////////////////////////// get ROUTES////////////////////////////////////////


app.get("/", function(req, res) {
  res.render("blog");
});

app.get("/blogs",isLoggedIn, function(req, res) {
  Blog.find({},function(err, blogs){
    if(err){
      console.log(err)
    } else{
      res.render("home",{blogs:blogs}); 
    }
  });
});

///////////////////////////////////////new post////////////////////////////////////////////

app.get("/blogs/new",isLoggedIn,function(req,res){
  res.render("new");
});




app.post("/blogs",isLoggedIn,function(req,res){
  Blog.create(req.body.blog,function(err,newBlog){
    if(err){
      console.log(err);
    } else{
      res.redirect("/blogs")
    }
  });
});

////////////////////////////////////////show routes//////////////////////////


app.get("/blogs/:id",isLoggedIn,function(req, res){
  Blog.findById(req.params.id, function(err,foundBlogs){
      if(err){
    console.log(err)
} else{
  res.render("show",{blog:foundBlogs})
}});
});


/////////////////////////////////////edit route/////////////////////////////

app.get("/blogs/:id/edit",isLoggedIn,function(req, res){
   Blog.findById(req.params.id, function(err,foundBlogs){
      if(err){
    console.log(err)
} else{
  res.render("edit",{blog:foundBlogs})
  }
   });
});


/////////////////////////////////////////update button blog//////////////////////////////

app.put("/blogs/:id",isLoggedIn, function(req, res){
  Blog.findByIdAndUpdate(req.params.id, req.body.blog ,function(err,updateBlogs){
     if(err){
    console.log(err)
} else{
  res.redirect("/blogs/" + req.params.id);
  }
   });
});


///////////////////delete routes////////////////////////////////////

app.delete("/blogs/:id",isLoggedIn,function(req,res){
  Blog.findByIdAndRemove(req.params.id, function(err){
     if(err){
    console.log(err)
} else{
  res.redirect("/blogs");
  }
   });
});

/////////////////////////user sign in////////////////////////////////////////

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){
  var newUser = new User({username:req.body.username});
  var password = req.body.password; 
  User.register(newUser, password, function(err, user){
    if(err){
      console.log(err);
      
    } else{
       passport.authenticate("local")(req, res, function(){
       res.redirect("/blogs");
    });
    }
  });
});



///////////////////////////log in/////////////////////////////////
app.get("/login",function(req,res){
  res.render("login");
});

app.post("/login", passport.authenticate("local",{
  successRedirect:"/blogs",
  failureRedirect:"/login"
}), function(req,res){
});

////////////////////////logout/////////////////////

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect("/login");
  }
}





app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});