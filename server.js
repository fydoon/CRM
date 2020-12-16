const express = require("express");
const path = require("path");
const ejs = require("ejs");
const app = express();
const routes = require('./routes/routes.js')

//routes paths
app.get('/',routes)
app.post('/register',routes)
app.get('/register',routes)
//log in
app.get('/login',routes)
app.post('/login',routes)

// ofter lofin admin pages
app.get('/dashboard',routes)
app.get('/services',routes)
app.get('/SalesInfo',routes)
app.get('/BasicAnalytics',routes)
app.get('/Emailtrigger',routes)
app.get('/Forms',routes)
app.get('/viewdata',routes)
app.get('/success',routes)
app.get('/logout',routes)
// app.post('/addmsg',routes)

// client data//
app.post('/savedata',routes)
app.get('/clientdata',routes)
app.post('/clientdata',routes)

//forgot password
app.get('/forgotpassword',routes)
app.post('/forgotpassword',routes)
app.get('/reset',routes)
app.post('/reset',routes)

//dlete//
app.get('/delete/:id',routes)
app.get('/update/:id',routes)
app.get('/updateclient',routes)
app.post('/updateclient',routes)


//ejs path files templates 
app.set('view engine','ejs')
app.set('views', path.join(__dirname, "views"));

//file path for ejs
app.use("/public",express.static(path.join(__dirname,"public")))

//app.get('/',(req,res)=>{res.send("hii im stared")});
//sever
const PORT = process.env.PORT || 9000;
app.listen(PORT, ()=>console.log('server started  port', PORT)); 