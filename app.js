//jshint esversion:6

import dotenv from "dotenv";
dotenv.config();
// config the dotenv package at the top because if we use environment variables before configuring this package it won't work.

import express from "express";
import mongoose from "mongoose";
import ejs from "ejs";
// import encrypt from "mongoose-encryption";
// import md5 from "md5";
// import bcrypt from "bcrypt";
// const saltRounds = 5;



import session, { Cookie } from "express-session";
// Express-session - an HTTP server-side framework used to create and manage a session middleware.

import passport from "passport";
// Passport is Express-compatible authentication middleware for Node.js.
// Passport's sole purpose is to authenticate requests, which it does through an extensible set of plugins known as strategies. 
// Strategies can range from verifying username and password credentials, delegated authentication using OAuth (for example, via Facebook or Twitter), or federated authentication using OpenID.

import passportlocalmongoose from "passport-local-mongoose"
// Passport-Local Mongoose is a Mongoose plugin that simplifies building username and password login with Passport.

import flash from "connect-flash";
// connect-flash is a library which allows you to flash messages whenever you are redirected to another webpage.




// cookies and sessions:

// 1>Cookie:
// A cookie is a small text file that is saved on the user’s computer. The maximum file size for a cookie is 4KB. It is also known as an HTTP cookie, a web cookie, or an internet cookie. When a user first visits a website, the site sends data packets to the user’s computer in the form of a cookie.
// Sites can use cookies to improve your browsing experience, for example to keep you signed in or to remember items in your shopping basket.
// Sites can use cookies to see your browsing activity across different sites, for example, to personalise ads.

// 2>Session:
// A session is used to save information on the server momentarily so that it may be utilized across various pages of the website. It is the overall amount of time spent on an activity. The user session begins when the user logs in to a specific network application and ends when the user logs out of the program or shuts down the machine.
// Session values are far more secure since they are saved in binary or encrypted form and can only be decoded at the server. When the user shuts down the machine or logs out of the program, the session values are automatically deleted. We must save the values in the database to keep them forever.


// the cookie that we are gonna using is session cookie, which is little different from the normal cookie. 

// Session Cookie:
// One method of maintaining session state between a client and a server is to use a cookie to hold this session information. The server packages the session key for a particular client in a cookie and sends it to the client's browser. For each new request, the browser re-identifies itself by sending the cookie (with the session key) back to the server.
// The session cookie allows the browser to re-identify itself to the single, unique server to which the client had previously authenticated.When using session cookies, WebSEAL does not need to prompt the client for another login.
// Each time the browser requests a web page from the server, it includes the session cookie file with its request. The cookie lets the server know which page components the browser has already been sent, so the server doesn't waste time re-sending them.
// When the browser closes at the end of a session or the user log out, the  cookie file is deleted and the session ends.
// The session key stored in the session cookie contains only a random number identifier (“key”) that is used to index the server's session cache. There is no other information exposed in the session cookie.

// and to implement the session and cookies in our website we are gonna using some node packages:
// "passport",
// "passport-local",
// "passport-local-mongoose", and
// "express-session" (NOT express-sessions)





let secretarr = [];

const app = express();

app.set("view engine", "ejs");
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));



app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));
// This is the basic express session({..}) initialization.

// The session secret is a key used for signing and/or encrypting cookies set by the application to maintain session state.

// If you alter the req.session object, it will be saved back to the session store at the end of the request; otherwise it will not be saved. Setting resave to true forces it to be saved everytime and a cookie is sent everytime, even if no changes were made. 

//saveUninitialized option forces the uninitialized session the to be saved in a store. uninitialized session is that one session which is satarted, but not modified yet.so we set it false because if no changes were made, then session not stored in memory.
// When a cookie is set for the first time, a new session object is created in memory and saved to the store at the end of the request. This can take up a lot of space in the db if you have many people visiting and then bouncing without performing any meaningful action like logging in. You can choose to only save sessions if they deviate from the default session object (ie. if you've modified it, like setting req.session.user = user; on login) by setting saveUninitialized to false.

// and there are many other options like rolling,maxAge,etc.for more info read the documentation at :https://www.npmjs.com/package/express-session





app.use(passport.initialize());
// init passport on every route call.To use Passport in an Express or Connect-based application, configure it with the required passport.initialize().
app.use(passport.session());
// middleware that allows passport to use "express-session".
app.use(flash());
//middleware for handling flash messages of passport.



mongoose.connect("mongodb+srv://admin-mohdshahab:" + process.env.PASSWORD + "@cluster0.bmgof.mongodb.net/UserDB?retryWrites=true&w=majority", { useNewUrlParser: true });



const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    fullname: String,
    mysecret: [{
        secrettext: String,
        timestamp: String
    }]
});
// You're free to define your User(Schema) how you like. Passport-Local Mongoose will add a username, hash and salt field to store the username, the hashed password and the salt value.
// Bydefault username is saved in the database as the field called "username". 
// in place of password it's salt and hash is saved as "salt" and "hash".
//we can change these option by providing an additional option to the plugin function below.see https://github.com/saintedlama/passport-local-mongoose

const secretSchema = new mongoose.Schema({
    secrettext: String,
    timestamp: String
})

const Usersecret = new mongoose.model("Usersecret", secretSchema);

userSchema.plugin(passportlocalmongoose);
// plugin Passport-Local-Mongoose into your User schema.
//for using passport with mongoose.


const User = new mongoose.model("User", userSchema);




// passport.use(new LocalStrategy(function verify(username, password, cb) {
//     db.get('SELECT * FROM users WHERE username = ?', [ username ], function(err, user) {
//       if (err) { return cb(err); }
//       if (!user) { return cb(null, false, { message: 'Incorrect username or password.' }); }
//       crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
//         if (err) { return cb(err); }
//         if (!crypto.timingSafeEqual(user.hashed_password, hashedPassword)) {
//           return cb(null, false, { message: 'Incorrect username or password.' });
//         }
//         return cb(null, user);
//       });
//     });
//   });

// Before authenticating requests, the strategy (or strategies) used by an application must be configured.
// The local authentication strategy authenticates users using a username and password. 

// The LocalStrategy constructor takes a verify function as an argument, which accepts username and password as arguments. When authenticating a request, the strategy parses a username and password, which are submitted via an HTML form to the web application. The strategy then calls the verify function with those credentials.

// The verify function is responsible for determining the user to which the username belongs, as well as verifying the password. Because the verify function is supplied by the application, the application is free to use a database and schema of its choosing. The example above illustrates usage of a SQL database.

// Similarly, the application is free to determine its password storage format. The example above illustrates usage of PBKDF2 when comparing the user-supplied password with the hashed password stored in the database.

// In case of authentication failure, the verify callback supplies a message, via the message option, describing why authentication failed. This will be displayed to the user when they are re-prompted to sign in, informing them of what went wrong.



// the module used for creating authentication for local strategy is passport-local.
// but,since now we are using passport-local-mongoose package,doing this is too easy.
// Passport-Local Mongoose supports this setup by implementing a LocalStrategy and serializeUser/deserializeUser functions.

passport.use(User.createStrategy());
// The createStrategy is responsible to setup passport-local LocalStrategy with the correct options.

passport.serializeUser(User.serializeUser());
// in effect during "serializeUser", the PassportJS library adds the authenticated user to end of the "req.session.passport" object.This allows the authenticated user to be "attached" to a unique session. 

passport.deserializeUser(User.deserializeUser());
// in the deserializeUser(), Passport JS takes this last object attached to "req.session.passport.user.{..}", and attaches it to "req.user"So "req.user" will contain the authenticated user object for that session, and you can use it in any of the routes in the Node JS app.


// Passport will maintain persistent login sessions. In order for persistent sessions to work, the authenticated user must be serialized to the session, and deserialized when subsequent requests are made.
// for more information read the documentation at:https://medium.com/@prashantramnyc/node-js-with-passport-authentication-simplified-76ca65ee91e5





app.get("/", function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect("/secrets")
        // console.log(req.user.username);
    }
    // Passport JS conveniently provides a “req.isAuthenticated()” function,
    // that returns “true” in case an authenticated user is present in “req.session.passport.user”,otherwise "false"
    else {
        res.render('home', { message: req.flash() });
    }
});

app.get("/login", function (req, res) {
    res.render('login', { message: req.flash() });
    // now successFlash message will be accessed in views section using "message.success" and failureFlash message using "message.error" .
});

app.get("/register", function (req, res) {
    res.render('register', { message: req.flash() });
});

app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        // console.log(req.user);

        Usersecret.find(function (err, docs) {
            if (err) {
                console.log(err)
            }
            else {
                if (docs) {
                    // console.log("found");
                    res.render("secrets", {
                        allsecretsdocs: docs,
                        personname: req.user.fullname,
                    });
                }
                else {
                    res.render("secrets", {
                        personname: req.user.fullname
                    })
                }
            }
        })

        // res.render("secrets",{
        //     allsecretsdocs:secretarr,
        //     personname:req.user.fullname,

        // });

        // User.find({mysecret:{$ne:null}},function(err,founddocs){
        //     if(err){
        //         console.log(err)
        //     }
        //     else{
        //         if(founddocs){
        //             res.render("secrets",{allsecretsdocs:founddocs})
        //         }
        //         else{
        //             res.render("secrets",{allsecretsdocs:secretarr})
        //         }
        //     }
        // })
    }
    // Passport JS conveniently provides a “req.isAuthenticated()” function,
    // that returns “true” in case an authenticated user is present in “req.session.passport.user”,otherwise "false"
    else {
        res.redirect("/login");
    }
})
// The “req.isAuthenticated()” function can be used to protect routes that can be accessed only after a user is logged in.
// this means if the user is authenticated, then that user can directly access the secret page, till his session runs, but ones the user logouts or browser closes then his session ends and cookies deleted and he can then no longer able to see secret page.

app.get("/submit", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("submit", { personname: req.user.fullname });
    }
    else {
        res.redirect("/");
    }
})

app.get("/mysecrets", function (req, res) {
    if (req.isAuthenticated()) {

        User.findById(req.user.id, function (err, userdoc) {
            if (err) {
                console.log(err);
            }
            else {
                if (userdoc) {
                    res.render("mysecret", {
                        yoursecret: userdoc.mysecret,
                        personname: req.user.fullname,
                    });
                }
            }
        })


    }
    else {
        res.redirect('/');
    }
})

app.post("/submit", function (req, res) {
    let thesecret = req.body.secret;

    User.findById(req.user.id, function (err, founduser) {
        if (err) {
            console.log(err);
            res.redirect("/");
        }
        else {
            if (founduser) {

                // const sadt=({
                //     sec:thesecret,
                //     dt:new Date()
                // })

                const newsecret = new Usersecret({
                    secrettext: thesecret,
                    timestamp: new Date()
                })
                // console.log(newsecret);

                founduser.mysecret.push(newsecret);
                founduser.save();
                secretarr.push(thesecret);

                newsecret.save();

                res.redirect("/secrets");
            }
        }
    })
})




app.post("/register", function (req, res) {

    User.register({ username: req.body.username },
        req.body.password,
        function (err, user) {
            passport.authenticate('local', {
                // successRedirect: '/login',
                failureRedirect: '/register',
                failureFlash: err,
                successFlash: "User Registered Successfully"
            })(req, res, function () {
                //  callback function , works only after successful Authenticaton. 
                //mondatory.
                res.redirect("/login");
                // console.log("hello")
                User.findById(req.user.id, function (err, doc) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        if (doc) {
                            doc.fullname = req.body.realname;
                            doc.save();
                        }
                    }
                })

            })
            // Passport provides an authenticate() function, which is used as route middleware to authenticate requests.
            // The ‘local’ signifies that we are using ‘local’ strategy. If you were using google or facebook to authenticate, it would say ‘google’ or ‘facebook’ instead of ‘local’.
            // passport.authenticate() function used within the post route and checks the posted data according to the given strategy and if details verified then it authenticates the user.
            // if user is successfully authenticated,successRedirect and successFlash options works,otherwise failure options work.

        });
    //"register()" is a Convenience method of a "passport-local-mongoose module" to register a new user instance with a given password.it also Checks if username is unique. and if any error occured, err is set, else user is set.
});
// You may be wondering about password security, specifically salting/hashing the password. Fortunately, the passport-local-mongoose package automatically takes care of salting and hashing the password.
// Passport-Local Mongoose will add a username, hash and salt field to store the username, the hashed password and the salt value.


app.post("/mysecrets", function (req, res) {
    if (req.isAuthenticated()) {
        User.updateOne({ "_id": req.user.id }, { "$pull": { mysecret: { "_id": req.body.deletesecret } } }, function (err) {
            if (err) {
                console.log(err)
            }
            else {
                Usersecret.deleteOne({ "_id": req.body.deletesecret }, function (err) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        // console.log("success");
                    }
                })
                console.log(req.body.deletesecret)
                res.redirect("/mysecrets")
            }
        })
    }
    else {
        res.redirect("/");
    }
})


app.post("/login",
    passport.authenticate('local', {
        successRedirect: '/secrets',
        failureRedirect: '/login',
        failureFlash: true,
        // successFlash:"Welcome"
    }), function (req, res) {
        // callback function , works after successful Authenticaton. 
        // mondatory.
    }
)
// authenticate using local strategy 
// it is the best practice to set name of the username field as "username" and password fiels as "password" in front-end login/register form.



app.post('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});
//   Passport exposes a logout() function on req (also aliased as logOut()) that can be called from any route handler which needs to terminate a login session. Invoking logout() will remove the req.user property and clear the login session (if any).

//   It is a good idea to use POST or DELETE requests instead of GET requests for the logout endpoints, in order to prevent accidental or malicious logouts.



let port = process.env.PORT;
if (port == null || port == "") {
    port = 4000;
}
app.listen(port, function () {
    console.log("server has started successfully");
});
// note that restarting the server will erase the session and delete the Cookie.



// Read these documentaion for more clarification:
// https://www.npmjs.com/package/passport-local-mongoose     (must read)
// https://www.passportjs.org/docs/downloads/html/           (must read)
// https://www.npmjs.com/package/passport
// https://www.npmjs.com/package/passport-local
// https://medium.com/@prashantramnyc/node-js-with-passport-authentication-simplified-76ca65ee91e5