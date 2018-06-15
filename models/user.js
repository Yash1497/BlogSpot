var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
 var UserSchema = new mongoose.Schema({
   username:String,
   password:String,
   email: {type: String, unique: true, required: true},
  resetPasswordToken: String,
  resetPasswordExpires: Date,
   blogs:[
     {
      id:{
          type : mongoose.Schema.Types.ObjectId,
          ref:"Blog"
      
      },
       
//        author:{
//     id:{
//       type:mongoose.Schema.Types.ObjectId,
//       ref:"User"
//     },
//     username:String
//   },
       
      title:"String",
      image:"String",
      body:"String",
      created:{type:Date, default:Date.now}
      
     }
 ],
     questions:[
     {
      id:{
          type : mongoose.Schema.Types.ObjectId,
          ref:"Question"
      
      },
       
      
      question:"String",
      created:{type:Date, default:Date.now}
      
     }
 ],
    answers:[
     {
      id:{
          type : mongoose.Schema.Types.ObjectId,
          ref:"Question"
      
      },
       
      
      answer:"String",
      created:{type:Date, default:Date.now}
      
     }
 ]
 });

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",UserSchema);