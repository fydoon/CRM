const express = require("express");
const path = require("path");
const routes = require("./routes.js");
const app = express();
const request = express.Router();

//routes paths
app.get("/", routes);
app.post("/register", routes);
app.get("/register", routes);

//log in
app.get("/login", routes);
app.post("/login", routes);

// ofter lofin admin pages
app.get("/dashboard", routes);
app.get("/services", routes);
app.get("/SalesInfo", routes);
app.get("/BasicAnalytics", routes);
app.get("/Emailtrigger", routes);
app.get("/Forms", routes);
app.get("/viewdata", routes);
app.get("/success", routes);
app.get("/logout", routes);
app.get("/search", routes);
app.post("/search", routes);

// client data//
app.post("/savedata", routes);
app.get("/clientdata", routes);
app.post("/clientdata", routes);

//forgot password
app.get("/forgotpassword", routes);
app.post("/forgotpassword", routes);
app.get("/reset", routes);
app.post("/reset", routes);

//Delete and update the client data//
app.get("/delete/:id", routes);
app.get("/update/:id", routes);
app.get("/updateclient", routes);
app.post("/updateclient", routes);

module.exports = request;
