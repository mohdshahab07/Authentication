//jshint esversion:6

import dotenv from "dotenv";
dotenv.config();
// config the dotenv package at the top because if we use environment variables before configuring this package it won't work.

import express from "express";
import mongoose from "mongoose";
import ejs from "ejs";
import encrypt from "mongoose-encryption";
// adding "mongoose-encryption" package for encrypting the Secrets. 
const app = express();

app.set("view engine", "ejs");
app.use(express.static('./public'));

app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });


const userSchema =new mongoose.Schema ({
    email: String,
    password: String
});



// const encsecret="Thisisoursecretforencryption.";

// this is the key for encryption.this key must not revealed to others since it's very useful for decryption.
// since this secret key is very important and anyone who looked into this file will know the secret key and easily decrypt the encrypted fields.so to prevent this key we'll use environment variables.for using environment variables we will use the npm package named "dotenv".
// for storing the environment variables, a file named .env will be created and all the secret variables are stored in that file in the format NAME=VALUE and no gap is given b/w any lines. and the format for using that environment variables is:
// process.env.ENCSECRET 
// make sure that while hosting project to github or other online sites put .env file in .gitignore file to keep all the environment variables Safe. 
//while deploying project on heroku, they have a special page for environment variables where we give details of our environment variables so that they access it for successfully deployment of project.

userSchema.plugin(encrypt,{secret:process.env.ENCSECRET , encryptedFields:["password"]});
// as here ENCSECRET is environment variable and to use it here we write process.env.ENCSECRET 


const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    // each time when user registered it's data will be saved in database.

    newUser.save(function (err) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("secrets");
        }
    });
});

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    console.log(typeof (password));

    User.findOne({ email: username }, function (err, founddoc) {
        if (err) {
            console.log(err);
        }
        else {
            if (founddoc) {
                if (founddoc.password === password) {
                    res.render("secrets");
                }
                // in this case when we apply findOne method on model then mongoose-encrypt will be able to successfully decrypt the password. 
                // after decryption if the password saved in the databse with corresponding email matches with the password that user enters, then the secret page is shown.
            }
        }
    });
});



app.listen(4000, function () {
    console.log("the server is started on port 4000");
})
