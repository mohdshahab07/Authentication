//jshint esversion:6

import express from "express";
import mongoose from "mongoose";
import ejs from "ejs";

const app = express();

app.set("view engine", "ejs");
app.use(express.static('./public'));

app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });


const userSchema = {
    email: String,
    password: String
}

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
                // if the password saved in the databse with corresponding email matches with the password that user enters, then the secret page is shown.
                //  now this is our level 1 security in which password saved in databse in it's original form.for further levels we use encryption for saving passwords.

            }
        }
    });
});



app.listen(4000, function () {
    console.log("the server is started on port 4000");
})
