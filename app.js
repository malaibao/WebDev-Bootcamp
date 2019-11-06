var express		= require('express'),
 	app			= express(),
 	bodyParser 	= require('body-parser'),
 	mongoose 	= require('mongoose'),
	Campground 	= require('./models/campground'),
	seedDB		= require("./seed2");
	Comment		= require('./models/comment'),
	User 		= require('./models/user'),
	LocalStrategy = require('passport-local'),
	passportLocalMongoose = require('passport-local-mongoose'),
	passport	= require('passport'),
	methodOverride = require('method-override'),
	flash		= require('connect-flash');


	var commentRoutes	 = require('./routes/comments'),
		campgroundRoutes = require('./routes/campgrounds'),
		indexRoutes		 = require('./routes/index');

mongoose.connect(process.env.DATABASEURL, {
	useNewUrlParser: true,
	useCreateIndex: true
}).then(() => {
	console.log('Connected to DB!');
}).catch(err => {
	console.log('error:', err.message);
});

mongoose.set('useUnifiedTopology', true);

seedDB();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
//app.use(express.static('public'));
app.use(express.static(__dirname + '/public')); //__dirname is .../v5
app.use(methodOverride('_method'));
app.use(require('express-session')({
	secret: "You better work this time",
	resave: false,
	saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

//GLOBAL VAR
app.use((req, res, next)=>{
	res.locals.currentUser = req.user; //for templates
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});

app.use('/', indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);

////////////

// app.listen(process.env.PORT || 3000, ()=>{
// 	console.log('Server is running. Good');
// })

app.listen(process.env.PORT, process.env.IP, 3000, ()=>{
	console.log('Server is running. Good');
});

// var http = require('http');
// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/plain'});
//   res.end('Hello World\n');
// }).listen(1337, "127.0.0.1");
// console.log('Server running at http://127.0.0.1:1337/');
