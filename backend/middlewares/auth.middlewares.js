import { ValidateUserToken } from "../utils/token.js";

export function authenticationMiddleware(req,resp,next){
    const authHeader=req.header('authorization');

    if(!authHeader)return next();  //user must be logged out

    if(!authHeader.startsWith('Bearer')){
        resp.status(400).json({error:"Authorization header must start with Bearer"});
    }
    

    const [_,token]=authHeader.split(' '); //Bearer <TOKEN>
    
    const payload=ValidateUserToken(token);
    console.log(payload);
    req.user=payload;

    next();
}

export function ensureAuthenticated(req,resp,next){
    const UserId=req.user?.id;
    if(!req.user||!req.user.id){
        return resp.status(401).json({error:"You Must Be Login"});
    }

    next();
}