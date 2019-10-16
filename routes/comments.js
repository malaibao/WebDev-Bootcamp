var express = require('express');
var router = express.Router({mergeParams: true});
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var middleware = require('../middleware');

//Comment New Form
router.get('/new', middleware.isLoggedIn, (req, res)=>{
	Campground.findById(req.params.id, (err, campground)=>{
		if(err)
			console.log("Error");
		else
			res.render("comments/new", {campground: campground});
	});	
})

router.post('/', middleware.isLoggedIn, (req, res)=>{
	//look up campground using id
	Campground.findById(req.params.id, (err, campground)=>{
		if(err){
			console.log("Error");
			res.redirect('/campgrounds');
		}else{
			//res.send('Hello');
			//console.log(req.body.comment);
			Comment.create(req.body.comment, (err, comment)=>{
				if(err){
					console.log("WHYYYYYY THEFK IS THE PROBMLEM/n");
					req.flash('error', 'Something went wrong.');
				}else{
					// console.log(comment);
					//add username and id to comment
					console.log('HELLLOOOONew comment username will be: ' + req.user.username);
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();

					campground.comments.push(comment); 
					campground.save();
					console.log("COMMENTS IS : ");
					console.log(comment);
					req.flash('success', 'Successfully added comment');
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});

//GET CHANGE COMMENT FORM//
router.get('/:comment_id/edit', middleware.checkCommentOwnership, (req, res)=>{
	Comment.findById(req.params.comment_id, (err, comment)=>{
		if(err)
			res.redirect('back');
		else{
			res.render('comments/edit', {campground_id: req.params.id, comment:comment});
		}
	});
});

//UPDATE COMMENT//
router.put('/:comment_id', middleware.checkCommentOwnership, (req, res)=>{
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment)=>{
		if(err)
			res.redirect('back');
		else{
			res.redirect('/campgrounds/' + req.params.id); //id is defined in app.js
		}
	});
	//res.send('hello');
});

//DELETE COMMENT//
router.delete('/:comment_id', middleware.checkCommentOwnership, (req, res)=>{
	//find by id and remove
	Comment.findByIdAndRemove(req.params.comment_id, (err)=>{
		if(err)
			res.redirect('back');
		else{
			req.flash('success', 'Comment deleted');
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
});

//=======STAY LOGIN MIDDLEWARE==============//


//==========CHECK COMMENT OWNNERSHIP===============//


module.exports = router;
