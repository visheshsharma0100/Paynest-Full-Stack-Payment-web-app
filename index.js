const express=require('express');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const z=require('zod');
const cors = require('cors');
const path = require("path");
const {authmiddleware}=require("./middleware");
const {UsersModel,AccountsModel}=require('./db');
const app=express();
app.use(express.json());
app.use(cors());
const port=3000;


const SignUpSchema=z.object({
    username:z.string().min(3),
    password:z.string().min(3),
    firstName:z.string().min(3),
    lastName:z.string().min(3),

})

app.post("/user/signup",async function(req,res){
    const {data,success,error}=SignUpSchema.safeParse(req.body);
    if(!success){
        return res.status(403).json({
            message:"Incorrect input",error:JSON.parse(error)
        });
    }
    let username=data.username;
    let password=data.password;
    let firstName=data.firstName;
    let lastName=data.lastName;
    let hashedpassword=await bcrypt.hash(password,10);
    let UserExists=await UsersModel.findOne({
        username,
    });
    if(UserExists){
        return res.status(403).json({
            message:"User already Exists",
        });
    }
    const newUser=await UsersModel.create({
        username,
       password: hashedpassword,
        firstName,
        lastName,
    });

    await AccountsModel.create({
        userId:newUser._id,
        balance:Math.floor(Math.random()*10000)+1
    });

    res.json({
        id:newUser._id,
        message:"SignUp Successfully",
    });

});

app.post("/user/signin", async function(req,res){
    let username=req.body.username;
    let password=req.body.password;
    let firstName=req.body.firstName;
    let lastName=req.body.lastName;
    let UserExists= await UsersModel.findOne({
        username,
    });
    if(!UserExists){
        return res.status(403).json({
            message:"Incorrect Creadentials",
        });
    }
    let passwordmatched=await bcrypt.compare(password,UserExists.password);
    if(!passwordmatched){
        return res.status(403).json({
            message:"Inccorect credentials",
        });
    }

    const token=jwt.sign({
        id:UserExists._id
    },"Sharma@10");
    res.json({
        token
    });
});

app.get("/account/balance",authmiddleware, async function(req,res){
    const account =await AccountsModel.findOne({
        userId:req.userId,
    });
    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        });
    }
    res.json({
        balance:account.balance
    });
})

app.post("/account/transfer",authmiddleware, async function(req,res){
   const amount=parseInt(req.body.amount);
   const receiver=req.body.receiver;
   const Balance=await AccountsModel.findOne({
        userId:req.userId
   });
   if(Balance.balance<amount){
    return res.json({
        message:"You do not have sufficient balance"
    });
   }
   Balance.balance=Balance.balance-amount;
   const receiverAccount=await AccountsModel.findOne({
    userId:receiver
   });
   receiverAccount.balance=receiverAccount.balance+amount;
   if (!receiverAccount) {
    return res.status(404).json({
        message: "Receiver account not found"
    });
}
   await Balance.save();
   await receiverAccount.save();
   res.json({
    message:"Transaction Successfull"
   });
    
})
app.get("/user/bulk", authmiddleware, async function(req, res) {
    const filter = req.query.filter || "";
    const users = await UsersModel.find({
        $or: [
            { firstName: { $regex: filter, $options: "i" } },
            { lastName: { $regex: filter, $options: "i" } }
        ]
    });
    res.json({ users });
});

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname + "/frontend/signup.html"));
});
app.get("/user/signin", function(req, res) {
    res.sendFile(path.join(__dirname + "/frontend/signin.html"));
});
app.get("/dashboard", function(req, res) {
    res.sendFile(path.join(__dirname + "/frontend/dashboard.html"));
});
app.get("/send", function(req, res) {
    res.sendFile(path.join(__dirname + "/frontend/send.html"));
});
app.get("/signin", function(req, res) {
    res.sendFile(path.join(__dirname + "/frontend/signin.html"));
});


app.listen(port,()=>{
    console.log(`Server Runing at port: ${port}`);
});
