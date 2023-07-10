const express = require('express');
const router = express.Router({mergeParams : true});

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Trip = require('../models/trip');
const Review = require('../models/review.js');
const { tripSchema , reviewSchema } = require('../schemas.js');
const { validateReview , isLoggedIn, isReviewAuthor } = require('../middleware');

router.post('/' , isLoggedIn , validateReview , catchAsync(async (req,res) => {
    const id = req.params.id;
    const camp = await Trip.findById(id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    await newReview.save();
    camp.reviews.push(newReview);
    await camp.save();
    req.flash('success' , "Succesfully created a Review!")
    res.redirect(`/trips/${id}`);
}))

router.delete('/:reviewid' , isLoggedIn , isReviewAuthor , catchAsync(async (req,res) => {
    const {id , reviewid} = req.params;
    await Trip.findByIdAndUpdate(id , { $pull : {reviews : reviewid} });
    await Review.findByIdAndDelete(reviewid);
    res.redirect(`/trips/${id}`);
}))

module.exports = router;