import mongoose from "mongoose";
import ConnectMongoDBSession from "connect-mongodb-session";
import session  from 'express-session';
import * as dotenv from 'dotenv';


dotenv.config()



let uri="mongodb+srv://Merghen:"+process.env.PASSAWORD+"@cluster0.30lmtkv.mongodb.net/?retryWrites=true&w=majority"

mongoose.connect(uri);

const googleSchema=mongoose.Schema({
    
    username:String,
    password:String,
    googleId:String,
    secret:String
})

const GoogleUser=mongoose.model("googleUser",googleSchema);





// storing sessions infos in database:


const MongoDBSession=ConnectMongoDBSession(session)

const sessionDB= new MongoDBSession({
    uri:uri,
    collection:"MySessions"
})

export default { GoogleUser:GoogleUser, sessionDB:sessionDB}