const { tripSchema , reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Trip = require('./models/trip');
const Review = require('./models/review');

const isLoggedIn = ((req,res,next) => {
    if (!req.isAuthenticated())
    {
        req.session.returnTo = req.originalUrl;
        req.session.method = req.method;
        req.flash('error' , 'You must be Signed-In!');
        return res.redirect('/login');
    }
    next();
});

const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
        res.locals.method = req.session.method;
    }
    next();
}

const validateTrip = (req, res, next) => {
    const { error } = tripSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
const verifyAuthor = async (req,res,next) => {
    const { id } = req.params;
    const trip = await Trip.findById(id);
    if (!trip.author.equals(req.user._id))
    {
        req.flash('error' , 'You dont have permission to do that!');
        return res.redirect(`/trips/${id}`);
    }
    next();
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const isReviewAuthor = async (req, res, next) => {
    const { id, reviewid } = req.params;
    const review = await Review.findById(reviewid);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/trips/${id}`);
    }
    next();
}

module.exports.storeReturnTo = storeReturnTo;
module.exports.isLoggedIn = isLoggedIn;
module.exports.validateTrip = validateTrip;
module.exports.verifyAuthor = verifyAuthor;
module.exports.validateReview = validateReview;
module.exports.isReviewAuthor = isReviewAuthor;