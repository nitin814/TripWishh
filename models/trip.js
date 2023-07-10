const mongoose = require('mongoose');
const Review = require('./review');
const User = require('./user');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const TripSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String ,
    author : { type : mongoose.Schema.Types.ObjectId , ref : 'User'} ,
    reviews: [
        {
            type : mongoose.Schema.Types.ObjectId ,
            ref : 'Review'
        }
    ]
});

TripSchema.post('findOneAndDelete' , async function (doc) {
    if (doc)
    {  await Review.deleteMany({ _id : {$in : doc.reviews}})  }  
})

module.exports = mongoose.model('Trip', TripSchema);