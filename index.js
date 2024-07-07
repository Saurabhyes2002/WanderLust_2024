require('dotenv').config()
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require('path');
const methodOverride = require("method-override"); // Middleware for supporting PUT and DELETE methods
const ejsMate = require("ejs-mate"); // Middleware for using ejs-mate for EJS templating
const listing = require(path.join(__dirname, 'models', 'listing.js'));
const Review = require(path.join(__dirname, 'models', 'review.js'));
const { reviewschema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js")
const Listings = require("./routes/listing.js")
const Reviews = require("./routes/review.js")
const UserRoute = require("./routes/user.js")
const session = require("express-session"); // Middleware for managing sessions
const MongoStore = require('connect-mongo');
const flash = require("connect-flash") // Middleware for flash messages
const passport = require("passport") // Middleware for authentication
const LocalStrategy = require("passport-local") // Middleware for local authentication strategy
const User = require(path.join(__dirname, 'models', 'users.js'));
//const Mongo_url = "mongodb://127.0.0.1:27017/Wanderlust";
const dbUrl=process.env.ATLAS_DB_URL;



// Connect to MongoDB
main().then(() => {
    console.log("Connected to DB");
}).catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process on database connection error
});

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs"); // Set the view engine to EJS
app.set("views", path.join(__dirname, "./views")); // Set the views directory
app.use(express.urlencoded({ extended: true })); // Middleware for parsing URL-encoded bodies
app.use(methodOverride("_method")); // Middleware for method overriding
app.engine("ejs", ejsMate); // Use ejs-mate for EJS templates
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:"mysupersecretcode"
    },
    touchAfter:24*3600,
})

store.on("error",()=>{
    console.log("error in mongo session",err);
});


const sessionoptions = {
    store,
    secret: "mysupersecretcode", // Secret key for session
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // Set cookie expiration date
        maxAge: 7 * 24 * 60 * 60 * 1000, // Set cookie max age
    },
};



app.use(session(sessionoptions)); // Use session middleware
app.use(flash()); // Use flash middleware for flash messages

app.use(passport.initialize()); // Initialize Passport.js
app.use(passport.session()); // Use Passport.js session middleware
passport.use(new LocalStrategy(User.authenticate())); // Set up Passport.js with the local strategy
passport.serializeUser(User.serializeUser()); // Serialize user
passport.deserializeUser(User.deserializeUser()); // Deserialize user

// Middleware to set local variables for templates
app.use((req, res, next) => {
    res.locals.success = req.flash('success'); // Set success messages
    res.locals.error = req.flash('error'); // Set error messages
    res.locals.currentUser = req.user; // Set the current user
    next();
});

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/listings", Listings); // Use the listings routes

app.use("/listings/:id/reviews", Reviews); // Use the reviews routes

app.use("/", UserRoute); // Use the user routes

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
  
    // Determine status code based on error type
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
  
    // Render error.ejs with appropriate error code
    res.render('./includes/error.ejs', { errorCode: statusCode });
});

app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
