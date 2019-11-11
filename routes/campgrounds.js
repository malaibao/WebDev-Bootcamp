var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var middleware = require('../middleware');

var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);


//if only require /middleware, it will automatically require index.js

//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
       }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
	// get data from form and add to campgrounds array
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	}
	geocoder.geocode(req.body.location, function (err, data) {
	  if (err || !data.length) {
		req.flash('error', 'Invalid address');
		return res.redirect('back');
	  }
	  var lat = data[0].latitude;
	  var lng = data[0].longitude;
	  var location = data[0].formattedAddress;
	  var newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
	  // Create a new campground and save to DB
	  Campground.create(newCampground, function(err, newlyCreated){
		  if(err){
			  console.log(err);
		  } else {
			  //redirect back to campgrounds page
			  console.log(newlyCreated);
			  res.redirect("/campgrounds");
		  }
	  });
	});
  });

/*
router.post('/', middleware.isLoggedIn, (req, res)=>{
	//get data from form and add to campground array
	var author = {
		id: req.user._id,
		username: req.user.username
	};

	console.log("PRICE ISS " + req.body.price + "/n/n");
	var newCampground = {name: req.body.name, price: req.body.price, image: req.body.image, description: req.body.description, author: author};
	//console.log(req.user);

	//campgrounds.push(newCampground); 
	//Create new campground and save to db
	Campground.create(newCampground, (err, newlyCreated)=>{
		if(err)
			console.log('Adding newly created error');
		else
			res.redirect('/campgrounds'); //go to get in default //redirect back to campground page
	});	
});
*/

router.get('/new', middleware.isLoggedIn, (req, res)=>{
	res.render('campgrounds/new');
});

//SHOW MORE INFO ABOUT CAMPGROUND
router.get('/:id', (req,res)=>{
	//find the campground with provided id
	Campground.findById(req.params.id).populate("comments").exec((err, foundCampground)=>{
		if(err)
			console.log('Error showing template');
		else{
			//console.log(foundCampground);
			res.render("campgrounds/show", {foundCampground:foundCampground});
		}
	});
	//render show template with that campground
});

//======================EDIT===========================//
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res)=>{
	Campground.findById(req.params.id, (err, foundCampground)=>{
		res.render('campgrounds/edit', {campground: foundCampground});
	});
});

//===========UPDATE=========================//
/*
router.put('/:id', middleware.checkCampgroundOwnership, (req, res)=>{
	//find and update
	Campground.findByIdAndUpdate(req.params.id, req.body.newCamp, (err, updatedOne)=>{
		if(err){
			res.redirect('/campgrounds');
		}else{
			res.redirect('/campgrounds/' + req.params.id); //or updatedOne._id
		}
	});
});
*/
// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	geocoder.geocode(req.body.location, function (err, data) {
	  if (err || !data.length) {
		req.flash('error', 'Invalid address');
		return res.redirect('back');
	  }
	  req.body.campground.lat = data[0].latitude;
	  req.body.campground.lng = data[0].longitude;
	  req.body.campground.location = data[0].formattedAddress;
  
	  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
		  if(err){
			  req.flash("error", err.message);
			  res.redirect("back");
		  } else {
			  req.flash("success","Successfully Updated!");
			  res.redirect("/campgrounds/" + campground._id);
		  }
	  });
	});
  });

//================DESTROY===================//
router.delete('/:id', middleware.checkCampgroundOwnership, (req, res)=>{
	Campground.findByIdAndRemove(req.params.id, (err)=>{
		if(err)
		;
		else
			res.redirect('/campgrounds');
	});
});

//=======STAY LOGIN MIDDLEWARE==============//


//=============CHECK USER IDENTITY============//


module.exports = router;

