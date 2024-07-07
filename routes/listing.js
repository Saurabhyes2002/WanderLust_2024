const express= require("express")
const router= express.Router();
const ExpressError= require("../utils/ExpressError.js")
const listing = require('../models/listing.js');
const {isLoggedin}= require('../middleware.js')
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET
  });

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'uploads',
      allowed_formats: ['jpg', 'png','jpeg'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    },
  });

const parser = multer({ storage: storage });


//show route 
router.get("/", async (req, res, next) => {
    try {
        const allListings = await listing.find({});
        res.render("./listings/index.ejs", { allListings });
    } catch (error) {
        next(error); // Pass error to the next middleware (error handling middleware)
    }
});

router.get("/new", isLoggedin,(req, res) => {
    res.render("./listings/new.ejs");
    });


//create route

router.post("/",parser.single('listing[image]'),async (req, res, next) => {
    try {
        const { title, description, price, location, country } = req.body;
        const newListing = new listing({
            title,
            description,
            image: { url: req.file.path }, // Assuming you save the file path to the database
            price,
            location,
            country,
            owner: req.user._id
        });
        await newListing.save();
        req.flash("success", "New listing created");
        res.redirect('/listings');
    } catch (error) {
        next(error);
    }
});



//edit route
router.get("/:id/edit", isLoggedin,async (req, res, next) => {
    try {
        let { id } = req.params;
        const listings = await listing.findById(id);
        if (!listings) {
            return res.status(404).send('Listing not found');
        }
        res.render("./listings/edit.ejs", { listings });
    } catch (error) {
        next(error);
    }
});

//delete route

router.delete("/:id", isLoggedin,async (req, res, next) => {
    try {
        let { id } = req.params;
        const listings = await listing.findByIdAndDelete(id);
        if (!listings) {
            return res.status(404).send('Listing not found');
        }
        res.redirect("/listings");
    } catch (error) {
        next(error);
    }
});

//update route
router.put('/:id', isLoggedin,async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, image, price, location, country } = req.body;

        const updatedListing = await listing.findByIdAndUpdate(id, {
            title,
            description,
            image: { url: image || undefined },
            price,
            location,
            country
        }, { new: true });

        if (!updatedListing) {
            return res.status(404).send('Listing not found');
        }

        res.redirect('/listings');
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        let { id } = req.params;
        const listings = await listing.findById(id).populate({path: "reviews",populate:{path:"author"}}).populate("owner");
        if (!listings) {
            return res.status(404).send('Listing not found');
        }
        res.render("./listings/show.ejs", { listings });
    } catch (error) {
        next(error);
    }
});

module.exports= router;
