const express = require("express");
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const session = require('express-session');
const cookie = require('cookie-parser');
const flash = require('connect-flash');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport')
const crypto = require('crypto')
const user = require("../DB/models.js");
const client = require("../DB/clientdata.js");
const { json, response } = require("express");
const path = require("path");  
const { render } = require("ejs");

//function
const routes = express.Router();
routes.use(bodyparser.urlencoded({ extended:true }));

var options = {
    auth: {
        api_key: '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'
    }
};
var msgmail = {
    to:user.email,
    from: 'no-replay@noreplay.com',
    subject: 'Hi registration sucessful',
    html: '<h2>registration sucessfull</h2>'
};

//gorgot password sendgrid
const transpoter = nodemailer.createTransport(sendgrid(options));

routes.use(cookie('secret'));
routes.use(session({
    secret:'secrect',
    maxAge :3600000,
    resave:true,
    saveUninitialized :true,
})),

//passport local
routes.use(passport.initialize());
routes.use(passport.session());
// main middle warauth
routes.use(flash());
routes.use(function(req,res,next){
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
})
// chache and resirect page cancellation and revalidate
const CheckAuth = function(req,res,next){
    if(req.isAuthenticated()){
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0')
        return next();
    }else{
        res.redirect('/login')
    }
}
//database
mongoose.connect("mongodb://localhost:27017/crm_database",{
    useNewUrlParser:true, useUnifiedTopology:true,
 }).then(()=>console.log("database connected"))
 .catch((err)=>console.log(err))
//end of database

//get requestsfor registration page
 routes.get('/',(req,res)=>{
         res.render('register');
});

//get requests for forgot passwor page
routes.get('/forgotpassword',(req,res)=>{
    res.render('forgotpassword');
});

routes.get('/reset',(req,res)=>{
    res.render('reset');
});
//registration post requests
routes.post('/register',(req,res)=>{
    var {email, username, password, confirmpassword} = req.body;
    var error;
    if(!email ||!username ||!password ||!confirmpassword){
        error = 'Please Fill  All The Fields...!';
        res.render('register',{'error': error});
     };
     if(password != confirmpassword){
        error='Password Does Not Match.!';
        res.render('register',{'error': error,'email':email,'username':username});
    };
    if (typeof error == 'undefined') {
        user.findOne({ email: email }, function (error, data){
            if(error) throw error;
            if(data){
                error = "User is Already Exists With This Email Id...!";
                res.render('register',{'error': error,'email':email,'username':username});
            }else {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(password, salt,(err, hash)=>{
                        if (err) throw err;
                        password = hash;
                        user({email,
                             username,
                             password,
                            }).save().then(transpoter.sendMail(msgmail,(err,res)=>{
                                if(err){
                                    console.log(err);
                                }    
                                console.log(res);
                                console.log('Massage Sent Sucessfully...!');

                            }));
                            req.flash('success_message', "Registered Successfully.. Login To Continue..!");
                            res.redirect('/login');
                        })
                    });
            }
        });
    }
});
//end of register page post

//authontication//for login user
var localSteategy = require('passport-local').Strategy;

passport.use(new localSteategy({usernameField :'email'},(email,password,done)=>{
    user.findOne({ email : email},(err,data)=>{
        if(err) throw err;
        if(!data){
            return done(null,false,{ message: "User Doesn't Exists.." });
        }
        bcrypt.compare(password, data.password, (err,match)=>{
            if(err){
                return done(null,false,);
            }
            if(!match){

                return done(null,false, { message: "Password doesnot match.." });
            }
            if(match){
                return done(null,data);
            };
        });
    });
}));

passport.serializeUser(function(user,cd){
    cd(null, user.id)
});

//user means model name not user
passport.deserializeUser(function(id,cd){
    user.findById(id,function(err,user){
        cd(err,user)
    });
});
//endof authnication//

//get requests gor login page//
routes.get('/login',(req,res)=>{
    res.render('login');
});
//login post request login page//
routes.post('/login',(req, res,next)=>{
    passport.authenticate('local',{
        failureRedirect:'/login',
        successRedirect:'/success',
        failureFlash :true,
    })(req, res, next);
});
//end of post request//

routes.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/login');
});

//get request for success page//
routes.get('/success',CheckAuth,(req,res)=>{
    res.render('success',{'user':req.user});
});

// adding message to the database//
routes.post('/addmsg',CheckAuth,(req,res)=>{
    user.findOneAndUpdate(
        {email:req.user.email },
        {$push:{
            messages:req.body['msg']
        }},(err,sucess)=>{
            if(err) {
                console.log(err);
            }
            if(sucess)console.log('Added Message sucessfully');
        }
        );
        res.redirect('/success');
});

// forgot password//
routes.post('/forgotpassword',(req,res)=>{
    crypto.randomBytes(32,(err,buff)=>{
        if (err){
            console.log(err);
        }
        const token = buff.toString('hex');
        user.findOne({email : req.body.email},(err,data)=>{
            if(err){
                console.log(err);
            }
        }).then(user=>{
            if(!user){
                return res.status(422).json({error:'user does not exists with this email..!'})
            }
           user.restToken = token
           user.expireToken = Date.now()+3600000
           user.save().then((result)=>{
               transpoter.sendMail({
                   to:user.email,
                   from:'no-replay@gmail.com',
                   subject:'password reset link',
                   html:`<h3>requsesed for password reset the link below</h3>
                   <p>click <a href="http://localhost:9000/forgotpassword/${token}">here</a> to proceesed</p>
                   `
               }).then(redirect('login'))
           })
        })

    })

});
// After login get requests//
routes.get('/Dashboard',CheckAuth,(req,res)=>{
    res.render('Dashboard',{'user':req.user})
});

routes.get('/viewdata',CheckAuth,(req,res)=>{
    res.render('viewdata',{'user':req.user})
});

routes.get('/Services',CheckAuth,(req,res)=>{
    res.render('Services',{'user':req.user})
});

routes.get('/SalesInfo',CheckAuth,(req,res)=>{
    res.render('SalesInfo',{'user':req.user})
});

routes.get('/BasicAnalytics',CheckAuth,(req,res)=>{
    res.render('BasicAnalytics',{'user':req.user})
});

routes.get('/Emailtrigger',CheckAuth,(req,res)=>{
    res.render('Emailtrigger',{'user':req.user})
});

routes.get('/Forms',(req,res)=>{
    res.render('Forms',{'user':req.user})
});

// inserting client data //
routes.post('/savedata', CheckAuth,(req,res)=>{
    var {user, gmail, Address, phone} = req.body;
         client({
             user,
             gmail,
             Address,
             phone,
         }).save().then((err,data)=>{
             if (err) {
                 console.log(err)
             }else{
                 console.log(data)
             }res.redirect("/clientdata")
         }) 
     });

routes.get('/clientdata',CheckAuth,(req,res)=>{
        client.find({},(err,listdata)=>{
            if(err){
                console.log(err);
            }
        res.render('clientdata',{client:listdata})
            //console.log(listdata)
        })
    });
// update client data//
routes.get('/update/:id',CheckAuth,(req,res)=>{
    client.findById(req.params.id,(err,update)=>{
        if(err) throw err;
        res.render('update',{client:update})
    })
});

routes.post('/updateclient', CheckAuth,(req,res)=>{
    var update = client.findByIdAndUpdate( req.body.id,{
        user:req.body.user,
        gmail:req.body.gmail,
        Address:req.body.Address,
        phone:req.body.phone,
    },(err,up)=>{
        if(err) throw err;
        res.redirect('/clientdata');
    });
});

// delete the client//
routes.get('/delete/:id',CheckAuth,(req,res)=>{
    client.findByIdAndDelete( req.params.id,(err,dele)=>{
        if(err) throw err;
        res.redirect('/clientdata');
    })
    
    });

module.exports = routes;
