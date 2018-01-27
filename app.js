var express = require('express');
var app = express();
var methodOverride = require('method-override');
app.set("view engine", "ejs");
var bodyParser = require("body-parser");
var mongoose = require('mongoose');
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("mongodb://localhost/restfull_blog");

app.use(methodOverride("_method"));
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
  res.redirect("/blogs");
});

app.get("/blogs", function(req, res) {
  Blog.find({},function(err, blogs){
    if(err){
      console.log(err)
    } else{
      res.render("home",{blogs:blogs}); 
    }
  });
});

///////////////////////////////////////new post////////////////////////////////////////////

app.get("/blogs/new",function(req,res){
  res.render("new");
});

///////////////////////////////////////post routes////////////////////////////////////////////


app.post("/blogs",function(req,res){
  Blog.create(req.body.blog,function(err,newBlog){
    if(err){
      console.log(err);
    } else{
      res.redirect("/blogs")
    }
  });
});

////////////////////////////////////////show routes//////////////////////////


app.get("/blogs/:id",function(req, res){
  Blog.findById(req.params.id, function(err,foundBlogs){
      if(err){
    console.log(err)
} else{
  res.render("show",{blog:foundBlogs})
}});
});


/////////////////////////////////////edit route/////////////////////////////

app.get("/blogs/:id/edit",function(req, res){
   Blog.findById(req.params.id, function(err,foundBlogs){
      if(err){
    console.log(err)
} else{
  res.render("edit",{blog:foundBlogs})
  }
   });
});


/////////////////////////////////////////update blog//////////////////////////////

app.put("/blogs/:id", function(req, res){
  Blog.findByIdAndUpdate(req.params.id, req.body.blog ,function(err,updateBlogs){
     if(err){
    console.log(err)
} else{
  res.redirect("/blogs/" + req.params.id);
  }
   });
});


///////////////////delete routes////////////////////////////////////

app.delete("/blogs/:id",function(req,res){
  Blog.findByIdAndRemove(req.params.id, function(err){
     if(err){
    console.log(err)
} else{
  res.redirect("/blogs");
  }
   });
});












app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});