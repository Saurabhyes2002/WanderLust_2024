const express= require("express")
const router= express.Router({mergeParams:true});
const path = require('path');
const User=require(path.join(__dirname, '..','models', 'users.js'));
const passport= require("passport");
const { saveRedirectUrl } = require("../middleware");

router.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
    req.flash("success","logged out")
    res.redirect("/listings");
});
})

router.get("/signup",(req,res)=>{
    res.render("users/signupform.ejs")
})

router.post("/signup",async(req,res)=>{
    try{
        let {username, email,password}= req.body;
    const newUser= new User({email,username})
    const registeredUser = await User.register(newUser,password);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success",`Welcome to Wanderlust, ${registeredUser.username}!`);
        res.redirect("/listings");
    })
    }
    catch(e){
        req.flash("error",e.message)
        res.redirect("/signup");
        console.log(e);
    }
    
})
router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
})

router.post("/login", saveRedirectUrl, passport.authenticate("local", {
    failureRedirect: '/login',
    failureFlash: true
}), async (req, res) => {
    let { username, password } = req.body;
    req.flash("success", `Welcome back to Wanderlust, ${username}!`);
    const redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
});




module.exports=router;