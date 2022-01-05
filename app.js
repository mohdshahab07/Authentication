//jshint esversion:6

import dotenv from "dotenv";
dotenv.config();
// config the dotenv package at the top because if we use environment variables before configuring this package it won't work.

import express from "express";
import mongoose from "mongoose";
import ejs from "ejs";
import encrypt from "mongoose-encryption";
// adding "mongoose-encryption" package for encrypting the Secrets. 

import md5 from "md5";
// now we import md5 package
//md5 is a hashing algorithm.
//how hard we tried to encrypt our password or secrets,that password remains safe unless it's key is safe, but if someone able to find it's key then that password will be cracked easily.so to solve this problem hashing comes into play.
//hashing is the technique to converts strings into a hexadecimal hash.converting that hash again into the original text is almost impossible.
//hashing uses several algorithm. "md5" is one of the algorithms of hashing.
//md5 algorithm basically generates a hash function and when any string pass through those functions then certain hash is generated.
//the important thing about hashing is that it generates the same hash if the same string pass through the hash function.

// console.log(md5("123456"));
// this generates the hash of string "123456" using md5 algorithm.




const app = express();

app.set("view engine", "ejs");
app.use(express.static('./public'));

app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });


const userSchema = new mongoose.Schema({
    email: String,
    password: String
});



// const encsecret="Thisisoursecretforencryption.";
// userSchema.plugin(encrypt,{secret:process.env.ENCSECRET , encryptedFields:["password"]});



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
        password: md5(req.body.password)
        // here we converting the password of user into hash using md5 hashing algorithm.

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
    const password = md5(req.body.password);
    // while login we again changed the password that the user entered into the hash.and if the hash that stores in databse while registering matches with this hash then that means password is correct. 

    User.findOne({ email: username }, function (err, founddoc) {
        if (err) {
            console.log(err);
        }
        else {
            if (founddoc) {
                if (founddoc.password === password) {
                    res.render("secrets");
                }
                //if the hash that saved in the databse with corresponding email matches with the hash that user enters while login, then the secret page is shown.

                //this is level 3 security.
            }
        }
    });
});



app.listen(4000, function () {
    console.log("the server is started on port 4000");
})
