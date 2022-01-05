//jshint esversion:6

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

const encsecret="Thisisoursecretforencryption.";
// this is the key for encryption.this key must not revealed to others since it's very useful for decryption.

userSchema.plugin(encrypt,{secret:encsecret , encryptedFields:["password"]});
//Schemas are pluggable, that is, they allow for applying pre-packaged capabilities to extend their funcionality.
// just like above we plug the schema "userSchema" for using encryption for that schema. if we don't add encryptedFields option then, the whole schema will be encrypted.and if we wanted to encrypt anything else other than password, then we simply just add that item to array after password.
//make sure that we add plugins before creating the mongoose model since the schema is used in creating model.
//this is the level-2 security.

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
