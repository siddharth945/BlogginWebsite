require('dotenv').config();
const express = require('express');
const { connectDB } = require('./connection');
const path = require('path');
const userrouter = require('./routes/user');
const cookieParser = require('cookie-parser');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');
const blogRoute = require('./routes/blog');
const app = express();
const PORT = process.env.PORT ||  8001;
const Blog = require('./models/blogs.model');

app.set('view engine','ejs');
app.set('views',path.resolve('./views'));


connectDB(process.env.MONGO_URL).then(()=>{
    console.log("Connected to MongoDB");
}).catch((err)=>{
    console.log({error : err.message});
})

app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve('./public')));
// Example middleware to set user in locals
app.use((req, res, next) => {
  res.locals.user = req.user; // or however you store the user
  next();
});


app.get('/',async(req,res)=>{
    const allBlogs = await Blog.find({});    
    res.render('home',{
        user: req.user,
        blogs: allBlogs,
    });
});


app.use('/user',userrouter);
app.use('/blog',blogRoute);


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});