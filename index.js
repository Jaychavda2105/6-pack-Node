const express = require("express")
const app = express()
const path = require("path")
const mongoose = require("mongoose")
const { type } = require("os")
const cookie_parser = require("cookie-parser")
const jwt = require("jsonwebtoken")

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/Youtube_app")
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log("Mongo Error",err))
 
// Defining User Schema for MongoDB
const userSchema = new mongoose.Schema({
    name:{type: String , required: true},
    email:{type: String , required: true , unique: true},
    email:{type: String , required: true , unique: true},
})

// Defining Model for MongoDB
const User = mongoose.model("User",userSchema)

// Setting Up View Engine For EJS or Give extension .ejs to res.render
app.set("view engine","ejs")

// express.static is Middleware so app.use is used for accessing the MiddleWare
app.use(express.static(path.join(__dirname + "/public")))

// Using MiddleWares for accessing the form data using POST Method
app.use(express.urlencoded({extended:true}))

app.use(cookie_parser())

const isAuthenticated = async(req,res,next) => {
    const {token}  = req.cookies
    if (token) {
        const decoded = jwt.verify(token,"dsbkgndsjk")
        console.log(decoded);
        req.user = await User.findById(decoded._id)
        next()
    }
    else{
        res.render("login")
    }
}

app.get("/",isAuthenticated,(req,res) => {
    res.render("logout")  
})

app.get("/register",(req,res) => {
    res.render("register")  
})

app.post("/register",async (req,res) => {
    const { name , email , password } = req.body
    let user = await User.findOne({email})

    if(!user){
        return res.redirect("/register");
    }
    
     user = await User.create({
        name,
        email,
        password,
    })
    const token = jwt.sign({id:user._id},"dsbkgndsjk")
    res.cookie("token", token , {
        httpOnly:true,
        expires: new Date(Date.now() + 60*1000)
    }) 
    res.redirect("/")
})

app.get("/logout",(req,res) => {
    res.cookie("token",null,{
        httpOnly:true,
        expires: new Date(Date.now())
    })
    res.redirect("/")
})

app.listen(4000,() => {
    console.log("Server Started at PORT")
})