require('dotenv').config();
const express = require("express");
const path = require("path");
const ejs = require("ejs");
const app = express();
const routes = require('./routes/routes.js')
const request = require('./routes/routes.js')

app.use(routes);
app.use(request);

//ejs path files templates 
app.set('view engine','ejs')
app.set('views', path.join(__dirname, "views"));

//file path for ejs
app.use("/public",express.static(path.join(__dirname,"public")))

app.listen(process.env.lOCALHOST_PORT, ()=>console.log(`server started  port ${process.env.lOCALHOST_PORT}....!`)); 