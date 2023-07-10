const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const Trip = require('../models/trip');
const { isLoggedIn , validateTrip , verifyAuthor } = require('../middleware');

const multer = require('multer');
const {storage} = require('../cloundinary');
const upload  = multer({storage});
const { cloudinary } = require("../cloundinary");

router.get('/', catchAsync(async (req, res) => {
    const trips = await Trip.find({});
    res.render('trips/index', { trips })
}));

router.get('/new', isLoggedIn , (req, res) => {
    res.render('trips/new');
})

router.post('/', isLoggedIn , upload.array('image') , validateTrip ,  catchAsync(async (req, res, next) => {
  //  if (!req.body.trip) throw new ExpressError('Invalid trip Data', 400);
    const trip = new Trip(req.body.trip);
    trip.images = req.files.map(f => ({url : f.path , filename : f.filename}))
    trip.author = req.user._id;
    await trip.save();
    req.flash('success' , 'Succesfully created new trip');
    res.redirect(`/trips/${trip._id}`)
}))

router.get('/:id' , catchAsync(async (req, res,) => {
    const trip = await Trip.findById(req.params.id).populate({
        path : 'reviews' , 
        populate : {path : 'author'}
    }).populate('author');
    if (!trip) {
        console.log("yo");
        req.flash('error' , 'Cannot find that trip my dudu');
        res.redirect('/trips');
    }
    res.render('trips/show', { trip });
}));

router.get('/:id/edit', isLoggedIn, verifyAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const trip = await Trip.findById(id)
    if (!trip) {
        req.flash('error' , 'Cannot find that trip my dudu');
        res.redirect('/trips');
    }
    res.render('trips/edit', { trip });
}))

router.put('/:id',isLoggedIn, verifyAuthor , upload.array('image') ,validateTrip, catchAsync(async (req, res) => {  
    const { id } = req.params;  
    req.flash('success' , 'Succesfully updated trip');
    const trip = await Trip.findByIdAndUpdate(id, { ...req.body.trip });
    const img = req.files.map(f => ({url : f.path , filename : f.filename}));
    trip.images.push(...img)

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await trip.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }

    await trip.save();
    res.redirect(`/trips/${trip._id}`)
}));

router.delete('/:id',isLoggedIn, verifyAuthor , catchAsync(async (req, res) => {
    const { id } = req.params;
    await Trip.findByIdAndDelete(id);
    res.redirect('/trips');
}));

module.exports = router;