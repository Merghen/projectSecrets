import * as dotenv from 'dotenv';
import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20";
import mongoose from 'mongoose';
import dbModules from "./dbModul/modules.js";

const GoogleUser=dbModules.GoogleUser;


    dotenv.config();

    passport.use(new GoogleStrategy({
        clientID:process.env.CLIENT_ID,
        clientSecret:process.env.CLIENT_SECRET,
        callbackURL:"http://localhost:3000/auth/google/secrets"
    }, function(accessToken, refreshToken, profile, done) {
         
        GoogleUser.findOne({googleId:profile.id}).then((foundId)=>{
            if(foundId){
                console.log("kişi zaten kayıt oldu");
                done(null,foundId);
            }
            else{
                const user = new GoogleUser({
                    username:profile.displayName,
                    googleId:profile.id
                 })
                 user.save();
                 done(null,user);
            }
        })
               
      }
    
    ));

passport.serializeUser((user,done)=>{

    done(null,user.id);
    
})



export default {};
