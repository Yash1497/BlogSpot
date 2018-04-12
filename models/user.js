var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
 var UserSchema = new mongoose.Schema({
   username:String,
   password:String,
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
 ]
 });

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",UserSchema);