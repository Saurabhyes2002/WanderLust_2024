const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const review= require("./review.js")

// Define the schema for the image object
const imageSchema = new Schema({
    url: {
        type: String,
        default: "https://unsplash.com/photos/a-large-body-of-water-sitting-under-a-cloudy-blue-sky-YpttsJb9D9I", // Default URL if not provided
        set: function(v) {
            if (v === "") {
                return "https://unsplash.com/photos/a-view-of-the-desert-from-a-distance-fEVV17nl8Nw"; // URL to use if an empty string is provided
            }
            return v; // Return the provided URL
        }
    }
});

// Define the schema for the listing
const listingSchema = new Schema({
    title: {
        type: String,
        required: true, // Title is required
    },
    description: {
        type: String
    },
    image: {
        type: imageSchema,
        default: () => ({}) // Set default to an empty object if no image is provided
    },
    price: {
        type: Number
    },
    location: {
        type: String
    },
    country: {
        type: String
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }
});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
    await review.deleteMany({_id: {$in: listing.reviews}})
    }
})

// Create the Listing model using the schema
const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
