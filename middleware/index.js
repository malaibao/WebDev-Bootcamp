var Campground = require('../models/campground');
var Comment = require('../models/comment');

//all middleware

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function (req, res, next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, (err, foundCampground)=>{
			if(err){
				req.flash('error', 'Campground not found');
				res.redirect('back');
			}else{
				if(foundCampground.author.id.equals(req.user._id)){ //type not same
					next();
				}else{
					//res.send('No permission to edit the campground');
					req.flash('error', "You don't have permission to do that.");
					res.redirect('/campgrounds');
				}	
			}
		});
	}else{
		req.flash('error', 'You need to log in to do that');
		res.redirect('back');
	}
};

middlewareObj.checkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, (err, foundComment)=>{
			if(err){
				req.flash('error', 'Comment not found');
				res.redirect('back');
			}else{
				console.log("AUTHOR IS " + foundComment.author);
				if(foundComment.author.id.equals(req.user._id)){
					next();
				}else{
					req.flash('error', "You don't have permission to do that.");
					res.redirect('back');
				}
			}
		});
	}else{
		req.flash('error', 'You need to log in to do that');
		res.redirect('back');
	}	
};

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash('error', 'You need to log in to do that');
	res.redirect('/login');
}

// var middlewareObj = {
//     checkCampgroundOwnership: function(){

//     },

// };

//middlewareObj.checkCampgroundOwnership =  function checkCampgroundOwnership
//middlewareObj.checkCampgroundOwnership =  function checkCampgroundOwnership


module.exports = middlewareObj;