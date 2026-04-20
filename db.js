const mongoose=require('mongoose');
mongoose.connect("");
const UsersSchema=mongoose.Schema({
    username: String,   
  password: String,
  firstName: String,
  lastName: String
});
const AccountsSchema=mongoose.Schema({
          // reference to User
          userId:mongoose.Schema.Types.ObjectId,
         balance: Number  
});
const UsersModel=mongoose.model("users",UsersSchema);
const AccountsModel=mongoose.model("accounts",AccountsSchema);
 
module.exports={
    UsersModel,
    AccountsModel
}


