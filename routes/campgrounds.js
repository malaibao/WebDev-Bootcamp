var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var middleware = require('../middleware');
//if only require /middleware, it will automatically require index.js

//INDEX
router.get('/', (req,res) =>{
	//get data from db
	Campground.find({}, (err, allCampgrounds)=>{
		if(err)
			console.log("Error in retriving data");
		else
			res.render('campgrounds/index', {campgrounds:allCampgrounds, currentUser: req.user, page: 'campgrounds'});
	});
});

router.post('/', middleware.isLoggedIn, (req, res)=>{
	//get data from form and add to campground array
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	console.log("PRICE ISS " + req.body.price + "/n/n");
	var newCampground = {name: req.body.name, price: req.body.price, image: req.body.image, description: req.body.description, author: author};
	//console.log(req.user);

	/*campgrounds.push(newCampground); */
	//Create new campground and save to db
	Campground.create(newCampground, (err, newlyCreated)=>{
		if(err)
			console.log('Adding newly created error');
		else
			res.redirect('/campgrounds'); //go to get in default //redirect back to campground page
	});	
});

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

