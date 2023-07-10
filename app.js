if (process.env.NODE_ENV!== "production")
{ require('dotenv').config(); }

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const passportlocal = require('passport-local')
const mongosantize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');

const { tripSchema , reviewSchema } = require('./schemas.js');
const tripRoutes = require('./routes/trips');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/user')

const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Trip = require('./models/trip');

const Review = require('./models/review.js');
const User = require('./models/user');

const dburl = process.env.DB_URL;
const secret = process.env.secret || 'givethebest';

mongoose.connect(dburl , {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const store = MongoStore.create({
    mongoUrl: dburl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error" , function(e) {
    console.log("session storing error" , e);
})

const sessionConfig = {
    store ,
    name : 'naman' ,
    secret,
    resave : false ,
    saveUninitialized : true ,
    cookie : {
        httpOnly : true ,  // so that the cross handling stuff does not take place
        expires : Date.now() + 1000*60*60*24*7 , // max time of the cookie set in
        maxAge : 1000*60*60*24*7
    }
}

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname , 'public')));
app.use(flash());
app.use(mongosantize({replaceWith: '_'}));
app.use(Session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportlocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.message = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.use('/',userRoutes);

app.use('/trips' , tripRoutes);
app.use('/trips/:id/reviews' , reviewRoutes); 

app.get('/', (req, res) => {
    res.render('home')
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})
app.listen(3000, () => {
    console.log('Serving on port 3000')
})