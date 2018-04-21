var mongoose = require('mongoose');

var questionSchema = new mongoose.Schema({
 questionAsker:String,
  question:String,
  created:{type:Date, default:Date.now},
  questionAskerId: {
      id:{
          type : mongoose.Schema.Types.ObjectId,
          ref:"User"
      
      }
    
  },
  answers:[{
    answer:String,
    answerBy:String,
    answererId:{
      id:{
          type : mongoose.Schema.Types.ObjectId,
          ref:"User"
      
      }
    }
  }]
  
});

module.exports = mongoose.model("Question", questionSchema);
