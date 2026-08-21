import express from 'express';
const app=express();
const PORT=process.env.PORT||8000;
import userRouter from "./routes/user.routes.js";
import urlRouter from "./routes/url.routes.js"
import { authenticationMiddleware } from './middlewares/auth.middlewares.js';

//Middlewares...
app.use(express.json());
app.use(authenticationMiddleware);


app.get("/",(req,resp)=>{
    return resp.json({message:"Server Says Hello World...!"});
})

app.use(urlRouter);
app.use("/user",userRouter);




app.listen(PORT,()=>{console.log("Server Runing..")});
