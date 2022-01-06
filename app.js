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


import bcrypt from "bcrypt";
const saltRounds = 5;
// as number of salt rounds increases, our computer also experience some difficulties to generate hash. so keep number of salt rounds not very large. 


// Problems with hashing:
// each time if the string is same the hash generated with that string remains same.this is the biggest disadvantage of using hashing.
// the hackers usually constructs a hash table where they stored the hash of most commonly used passwords and their respective strings.they hacked the database and find the hashes of all users and then they search in their hash table to get original passwords from that hash. 
// hackers usually generates the hash table of:
// 1>all the dictionary words(around 150,000 words), also called as dictionary attack.
// 2> all the numbers from a telephone book (around 5,000,000 numbers).
// 3>all combination of characters up to 6 places (around 19,770,609,664 words).Schema
// the total combiantion formed after combining all these strings are around 19,775,609,664.
// and the normal computer takes around 0.9sec to search that many hashes, which is very less time. so using simple passwords is not Secure.
// so as the number of characters of your password increases the computational time to crack that password increases exponentially. 


// solution:
// therefore to solve the vulnerabelity of hashing.we use the method called Salting.it's basically hashing with salting.
// in salting we generate a random set of characters and combine it with original String(password) and then after combining both of them we pass it through the hash function, so the resulting hash is created is from the combination of both.
// thus salting increses the number of characters of original String. so the hash produces by the combination will be very hard to crack.
// in database only the salt and hash will be present. 
// to further increase the security, the developers use hashing algorithm other than md5. because searching of md5 hashes are relatively faster than the other algorithm hashes.
// the one we are gonna use is "bcrypt" hashing algorithm. the modern GPU searches around 17000 brypt hashes/sec, while in md5 algorithm it searches 20 billion hashes/sec. so bcrypt hashing algorithm is more secure than md5 hashing algorithm.
// and to make our passwords more secure we done salt rounds, that means we salted our passwords many number of times, so that it's become impossible for hackers to crack it.

// salt round: 
// in round 1 we add some salt to our password and pass it through the hash function to generate a hash.
// in round 2 we add the same salt to the hash that generated in previous round(round1) and then pass it through the same hash function to generate a new hash.
// we done this process upto certain rounds. 






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

    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {

        const newUser = new User({
            email: req.body.username,
            password: hash
            //    now in database the hash generated from bcrypt.hash() function is saved in password field.
        });
        // each time when user registered it's data will be saved in database.
        // bcrypt.hash() function takes first parameter as the plane text password , the second paramter it takes is the number of salt rounds and then a call back function with two parameters the error and the final hash generated.
        //this bcrypt.hash() function also auto generates the salt. 

        newUser.save(function (err) {
            if (err) {
                console.log(err);
            }
            else {
                res.render("secrets");
            }
        });
    });
});



app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;


    User.findOne({ email: username }, function (err, founddoc) {
        if (err) {
            console.log(err);
        }
        else {
            if (founddoc) {

                bcrypt.compare(password, founddoc.password, function (err, result) {
                    if (result == true) {
                        res.render("secrets");
                    }

                    else{
                        res.redirect("/login");
                    }
                });
                // here bcrypt.compare() function takes the first parameter as a plane text password that user entered while login, and then convert that password to the hash with same salt and rounds as we done in bcrypt.hash() function.after that it compares it with the second parameter which is the hash that we given to it and if both of the hashes matched then result of the callback function will true. otherwise false.

                //this is level 4 security.
            }
        }
    });
});



app.listen(4000, function () {
    console.log("the server is started on port 4000");
})
