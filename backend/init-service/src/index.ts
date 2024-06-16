import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import { copyS3Folder } from './aws';
config()
const app = express();
app.use(express.json());
app.use(cors())
const PORT=process.env.PORT||8080;


app.post('/project',async(req,res)=>{
    const {replId,language}=req.body;
    if(!replId){
        res.send(403).send({message:"Replid not Found"});
    }
    await copyS3Folder(`base/${language}`, `code/${replId}`);
    res.send("Project created successfully!!");
})




app.listen(PORT,()=>{
    console.log(`Server listening on port ${PORT}`);
})


