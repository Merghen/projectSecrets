import * as dotenv from 'dotenv';
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import passport from 'passport';
import setup from "./passportSetup.js"
import session from 'express-session';
import dbModules from "./dbModul/modules.js";
import bcyrpt from "bcryptjs";

const GoogleUser = dbModules.GoogleUser;
const sessionDB = dbModules.sessionDB;


//console.log(process.env.KEY);


dotenv.config()


const app = express();



// session 

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionDB
}))




app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));


// control authorization

const isAuth = function (req, res, next) {
    if (req.session.kimlikDogrulama) {
        next();
    }
    else {
        res.redirect("/register");
    }
}




app.get("/", function (req, res) {
    res.render("home");
})
app.get("/login", function (req, res) {
    res.render("login");
})
app.get("/register", function (req, res) {
    res.render("register");
})
app.get("/submit", isAuth, function (req, res) {
    res.render("submit");
})





app.get("/auth/google/", passport.authenticate("google", { scope: ["profile"] }), function (req, res) {

})

app.get("/auth/google/secrets", passport.authenticate("google"), function (req, res) {
    req.session.kimlikDogrulama = true
    res.redirect("/secrets");
})

app.get("/secrets", function (req, res) {

    console.log(req.session.passport.user);

    GoogleUser.find({ secret: { $ne: null } }).then(function (foundOne) {

        if (foundOne) {
            res.render("secrets", { secret: foundOne });

        }
        else console.log("couldn't find");

    }).catch((e) => { console.log(e); });


})

app.get("/logout", function (req, res) {
    req.session.destroy((err) => { console.log(err); })
    res.redirect("/register");
})




// posts

app.post("/register", function (req, res) {

    GoogleUser.findOne({ username: req.body.username }).then((foundOne) => {
        if (foundOne) {
            console.log("already exist");
        }
        else {
            bcyrpt.hash(req.body.password, 10, (err, hash) => {
                
                const user = new GoogleUser({
                    username: req.body.username,
                    password: hash
                })
                user.save();
                req.session.passport = user.id;
                req.session.kimlikDogrulama = true

                res.redirect("/secrets");

            })

        }

    })

})


app.post("/login", function (req, res) {

    GoogleUser.findOne({ username: req.body.username }).then((found) => {
        if (found) {
            bcyrpt.compare(req.body.password, found.password).then((result) => {
                if (result) {
                    req.session.kimlikDogrulama = true;

                    res.redirect("/secrets");
                }
                else res.redirect("/");
            })
        }
    })

})


app.post("/submit", function (req, res) {
    

    GoogleUser.updateOne( {_id: req.session.passport.user}, { secret: req.body.secret }).then((err) => {
        if(err){
            console.log("deneme");
            GoogleUser.updateOne( {_id: req.session.passport}, { secret: req.body.secret }).then(() => {}).catch((err)=>{console.log(err);});
        }
    }).catch((err)=>{console.log(err);});

    res.redirect("/secrets");

})









app.listen("3000", function () {
    console.log("server started on port 3000");
})