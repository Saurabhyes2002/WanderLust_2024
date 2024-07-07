const mongoose = require("mongoose");
const initdata = require("./data.js")
const listing = require("../models/listing.js");

const Mongo_url= "mongodb://127.0.0.1:27017/Wanderlust"

main().then(()=>{
    console.log("connected to DB");
}).catch(err=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(Mongo_url);
}

const initdb= async()=>{
    await listing.deleteMany({});
    initdata.data = initdata.data.map((obj)=>({...obj,owner:"667d35ba1601c094ece73f3b"}))
    await listing.insertMany(initdata.data)
    console.log("data was initialized");
}

initdb();
