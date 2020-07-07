var express           = require('express');
var app               = express();
var methodOverride    = require('method-override');
var bodyParser        = require("body-parser");
var mongoose          = require('mongoose');
var passport          = require('passport');
var LocalStrategy     = require('passport-local');
var Blog              = require("./models/blog");
var User              = require('./models/user');
var Comment           = require('./models/comment');
var Question          = require("./models/question")

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("mongodb://chirag778:chirag123@ds263656.mlab.com:63656/blogapp");
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





/////////////////////////////////////////// get ROUTES////////////////////////////////////////




app.get("/blogs", function(req, res) {
  var noMatch = null;
   if (req.query.search) {
       const regex = new RegExp(escapeRegex(req.query.search), 'gi');
     Blog.find({title:regex},function(err, blogs){
    if(err){
      console.log(err)
    } else{
      if(blogs.length < 1 ){
        noMatch = "no result found please try again with appropriate search"
      }else{
        res.render("home",{blogs:blogs,currentUser:req.user,noMatch:noMatch}); 
      }
      
    }
  });
   }else{
  Blog.find({},function(err, blogs){
    if(err){
      console.log(err)
    } else{
      res.render("home",{blogs:blogs,currentUser:req.user,noMatch:noMatch}); 
    }
  });
       }
});



function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

///////////////////////////////////////new post////////////////////////////////////////////

app.get("/blogs/new",isLoggedIn,function(req,res){
  res.render("new");
});




app.post("/blogs",isLoggedIn,function(req,res){
   User.findById(req.user._id,function(err,user){
    if(err){
      console.log(err)
    } else{
      
      var title  = req.body.title;
      var image  = req.body.image;
      var body   = req.body.body;
      var author = {
        id:req.user._id,
        username:req.user.username
      }
      var newblog = {title:title,image:image,body:body,author:author}
    Blog.create(newblog,function(err,newBlog){
        if(err){
          console.log(err);
        } else{
          newBlog.save();
          user.blogs.push(newBlog);
          user.save();
          res.redirect("/blogs")
        }
      });
      
    }
  });
  });

////////////////////////////////////////show routes//////////////////////////


app.get("/blogs/:id",function(req, res){
  Blog.findById(req.params.id).populate("comments").exec(function(err,foundBlogs){
      if(err){
    console.log(err)
} else{
  res.render("show",{blog:foundBlogs});
  
}});
});

//==============================================================Commemts route================================================//


app.get("/blogs/:id/comments" ,isLoggedIn,function(req,res){
   Blog.findById(req.params.id,function(err,blog){
    if(err){
      console.log(err)
    } else{
       res.render("comments",{blog:blog});
    }
  });
});


//========================================================Commemts post route================================================//


app.post("/blogs/:id/comments" ,function(req,res){
   Blog.findById(req.params.id,function(err,blog){
    if(err){
      console.log(err)
    } else{
      Comment.create(req.body.comment,function(err,comment){
        if(err){
          console.log(err)
        } else{
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          blog.comments.push(comment);
          blog.save();
          res.redirect("/blogs/" + blog._id);
        }
      }); 
    }
  });
});



//========================================================Commemts delete route================================================//




app.delete("/blogs/:id/comments/:comment_id",function(req,res){
  Comment.findByIdAndRemove(req.params.comment_id, function(err){
     if(err){
    console.log(err)
} else{
res.redirect("/blogs/" + req.params.id);
}
   });
});



//===========================================ask question=====================//

app.get("/askQuestion",isLoggedIn,function(req,res){
   res.render("askQuestion");
});





//=====================================askquestion post routes====================================//


app.post("/",isLoggedIn,function(req,res){
   User.findById(req.user._id,function(err,user){
    if(err){
      console.log(err)
    } else{
  var author = {
        id:req.user._id,
        username:req.user.username
      }
  var question = {question:req.body.question,author:author}
  Question.create(question,function(err,question){
    if(err){
      console.log(err)
    } else{
      question.questionAskerId.id = req.user._id;
      question.questionAsker = req.user.username;
      question.save();
      user.questions.push(question);
      user.save();
      res.redirect("/")
    }
  })
        }
});
  });



//==============================================questions==========================================//

app.get("/",function(req,res){
Question.find({},function(err,question){
    if(err){
      console.log(err)
    } else{
       res.render("blog",{questions:question});
    }
  });
});


//========================================answer route===============================//

app.get("/question/:id",isLoggedIn,function(req, res){
  Question.findById(req.params.id,function(err,foundQuestion){
      if(err){
    console.log(err)
} else{
  res.render("answer",{question:foundQuestion});
  
}});
});



//=======================================answer post routes==============================///

app.post("/question/:id",isLoggedIn,function(req,res){
   User.findById(req.user._id,function(err,user){
    if(err){
      console.log(err)
    } else{
  Question.findById(req.params.id,function(err,question){
    if (err) {
      console.log(err);
    } else {
       
      var answer = {
        answer:req.body.answer,
        answerdBy:req.user.username,
        id:req.user._id,
       
      }
      question.answers.push(answer);
      question.save();
      user.answers.push(answer);
      user.save()
      res.redirect("back");
      
      
      
    }
  })
    }
   });
  
})





// app.post("/question/:id",function(req,res){
//   Question.findById(req.param.id,function(err,question){
//     if(err){
//       console.log(err)
//     } else{
//       var answer = {answer:req.body.answer}

//       question.answers.push(answer);
// //       question.save();
//       res.redirect("/question/"+req.params.id)
//     }
//   })
// });



///////////////////////my blog/////////////////////////////////////


app.get("/myblogs",isLoggedIn,function(req,res){
  User.findById(req.user._id,function(err,user){
    if(err){
      console.log(err)
    } else{
      Blog.find({},function(err,blogs){
        if(err){
          console.log(err)
        } else{
          res.render("myblogs",{user:user,blogs:blogs})
        }
      });
    }
  });
});






/////////////////////////////////////edit route/////////////////////////////

app.get("/blogs/:id/edit",ownership,function(req, res){
   Blog.findById(req.params.id, function(err,foundBlogs){
      if(err){
    console.log(err)
} else{
  res.render("edit",{blog:foundBlogs})
  }
   });
});


/////////////////////////////////////////update button blog//////////////////////////////

app.put("/blogs/:id",ownership, function(req, res){
  Blog.findByIdAndUpdate(req.params.id, req.body.blog ,function(err,updateBlogs){
     if(err){
    console.log(err)
} else{
  res.redirect("/blogs/" + req.params.id);
  }
   });
});


///////////////////delete routes////////////////////////////////////

app.delete("/blogs/:id",ownership,function(req,res){
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
  var newUser  = new User({username:req.body.username,email:req.body.email});
  var password = req.body.password; 
  
  User.register(newUser, password, function(err, user){
    if(err){
      console.log(err);
      
    } else{
       passport.authenticate("local")(req, res, function(){
       res.redirect("/");
    });
    }
  });
});



///////////////////////////log in/////////////////////////////////
app.get("/login",function(req,res){
  res.render("login");
});

app.post("/login", passport.authenticate("local",{
  successRedirect:"/",
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

//=======================================owenership=========================================//
function ownership(req,res,next){
   if(req.isAuthenticated()){
      Blog.findById(req.params.id, function(err,foundBlogs){
      if(err){
          res.redirect("back");
      } else{
         if(foundBlogs.author.id.equals(req.user._id)){
            next();
      }else{
        res.redirect("back");
      }

    }
        });
   } 
        
        else{
        res.render("edit",{blog:foundBlogs})
        }
 
}


app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});