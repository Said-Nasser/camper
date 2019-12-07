var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    cookieParser = require("cookie-parser"),
    LocalStrategy = require("passport-local"),
    flash        = require("connect-flash"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    session = require("express-session"),
    MongoStore = require('connect-mongo')(session),
    seedDB      = require("./seeds"),
    methodOverride = require("method-override");
// configure dotenv
require('dotenv').load();

//requiring routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index")
    
// assign mongoose promise library and connect to database
mongoose.Promise = global.Promise;

// const databaseUri = process.env.MONGODB_URI || 'mongodb://localhost/yelp_camp';
// const databaseUri = "mongodb://colt:rusty@ds055525.mongolab.com:55525/yelpcamp" || 'mongodb://localhost/yelp_camp';
const databaseUri = "mongodb://saidnasser:said0000**@campercluster-shard-00-00-xmhii.mongodb.net:27017,campercluster-shard-00-01-xmhii.mongodb.net:27017,campercluster-shard-00-02-xmhii.mongodb.net:27017/camper?ssl=true&replicaSet=CamperCluster-shard-0&authSource=admin&retryWrites=true&w=majority";
// const databaseUri = 'mongodb://localhost/yelp_camp';

mongoose.connect(databaseUri, { useNewUrlParser: true, useUnifiedTopology: true})
      .then(() => console.log(`Database connected`))
      .catch(err => console.log(`Database connection error: ${err.message}`));
// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://saidnasser:said0000**@camper-xmhii.mongodb.net/test?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//     const collection = client.db("test").collection("devices");
//     // perform actions on the collection object
//     client.close();
// });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));
//require moment
app.locals.moment = require('moment');
// seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    store: new MongoStore({
        url: "mongodb://saidnasser:said0000**@campercluster-shard-00-00-xmhii.mongodb.net:27017,campercluster-shard-00-01-xmhii.mongodb.net:27017,campercluster-shard-00-02-xmhii.mongodb.net:27017/camper?ssl=true&replicaSet=CamperCluster-shard-0&authSource=admin&retryWrites=true&w=majority"
    }),
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});


app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});
app.listen(process.env.PORT || 4000, function(){
   console.log("The Camper Server Has Started!");
});