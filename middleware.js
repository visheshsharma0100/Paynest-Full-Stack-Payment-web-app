const jwt=require('jsonwebtoken');
function authmiddleware(req,res,next){
    const token=req.headers.token;
    if (!token) {
        return res.status(403).json({
            message: "Token not found",
        });
    }
    try{
    const decoded=jwt.verify(
        token
    ,"Sharma@10");
    if(decoded.id){
        req.userId=decoded.id;
        next();
    }
    else{
        return res.status(403).json({
            message:"Invalid token",
        });
    }
}
    catch(e){
        return res.status(403).json({
            message:"Token is incorrect or expired"
        });

    }
}
module.exports={authmiddleware};