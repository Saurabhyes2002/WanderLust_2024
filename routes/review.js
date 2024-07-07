const express = require("express");
const router = express.Router({ mergeParams: true });
const ExpressError = require("../utils/ExpressError.js");
const Review = require('../models/review.js');
const listing = require('../models/listing.js');
const { isLoggedin, saveRedirectUrl } = require('../middleware.js');
const { reviewschema } = require("../schema.js");

const validatereview = (req, res, next) => {
    const { error } = reviewschema.validate(req.body);
    if (error) {
        const errmsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errmsg);
    } else {
        next();
    }
};

router.post("/",validatereview, async (req, res, next) => {
    try {
        const rating = req.body.review.rating;
        const { id } = req.params;
        const listings = await listing.findById(id);
        if (!listings) {
            return res.status(404).send('Listing not found');
        }
        const newReview = new Review(req.body.review);
        newReview.author = req.user._id;
        listings.reviews.push(newReview);
        await newReview.save();
        await listings.save();
        req.flash('success', 'Review added successfully');
        res.redirect(`/listings/${listings._id}`);
    } catch (error) {
        next(error);
    }
});

router.delete("/:reviewId", isLoggedin, async (req, res, next) => {
    try {
        const { id, reviewId } = req.params;
        await listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        req.flash('success', 'Review deleted successfully');
        res.redirect(`/listings/${id}`);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
