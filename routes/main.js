module.exports = function(app){
	// sesions (13)

  const bcrypt = require('bcrypt');
    const saltRounds = 10;
  const MongoClient = require('mongodb').MongoClient;
    var url = "mongodb+srv://TAX2310:cotch2310@cluster0.lsvo0.mongodb.net/HS?retryWrites=true&w=majority";
  var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

  const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('./login')
    } else { 
      next (); 
    }
  }

	const { check, validationResult } = require('express-validator');

	// home page (2)
  app.get('/', function(req,res){
    if (!req.session.userId) {
      res.render('index.ejs')
    } else if (req.session.userId == 'personal') {
      res.render('personal/home.ejs')
    } else {
      res.render('organisation/home.ejs')
    }
  });


	// about page
	app.get('/about', function(req,res){
    res.render('about.ejs');
  });

	// Search page
  app.get('/search', redirectLogin, function(req,res){
    res.render("search.ejs");
	});

	app.post('/search-result', function (req, res) {

		// MongoClient.connect(url, function(err, client){
		// 	if(err) throw err;
		// 	var db = client.db('HS');
		// 	db.collection('recipes').find({name: req.body.keyword}).toArray((findErr, results) => {
  //       if (findErr) throw findErr;
		// 		res.render('list.ejs', {recipe: results});
		//   });
  //     client.close();
		// });

  });


	app.get('/list', redirectLogin, function(req, res) {

		// MongoClient.connect(url, function (err, client) {
		// 	if (err) throw err;
		// 	var db = client.db('HS');
		// 	db.collection('recipes').find().toArray((findErr, results) => {
		// 		if (findErr) throw findErr;
		// 		res.render('list.ejs', {recipe: results});
  //     });
  //     client.close();
		// });

	});
	// sesions (13)
	app.get('/display', redirectLogin, function(req, res) {

   //  MongoClient.connect(url, function (err, client) {
   //    if (err) throw err;

   //    var db = client.db('HS');
			// // CRUD operation (11)
   //    db.collection('recipes').find({name: req.query.topic}).toArray((findErr, results) => {
   //      if (findErr) throw findErr;
   //        res.render('display.ejs', {recipe: results});
   //    });
   //    client.close();
   //  });
  });


	app.get('/add-listing', redirectLogin, function(req,res){
    res.render("add-recipe.ejs");
  });
	app.post('/add-listing_post', [check('name').isLength({ min: 5, max:100 }), check('time').not().isEmpty(), check('ingredients').not().isEmpty(), check('directions').not().isEmpty()], function (req,res) {
		// form validations (9)
	 	const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.render('add-recipe.ejs');
		} else {
     //  MongoClient.connect(url, function(err, client) {
     //    if (err) throw err;
     //    var db = client.db ('HS');
				
     //    db.collection('recipes').insertOne({
					// user: req.sanitize(req.session.userId),
     //    	name: req.sanitize(req.body.name),
     //    	time: req.sanitize(req.body.time),
					// ingredients: req.sanitize(req.body.ingredients),
					// directions: req.sanitize(req.body.directions),
     //    });
     //    client.close();
     //    res.send(' This book is added to the database, name: '+ req.body.name + ' price '+ req.body.price + '<a href='+'./'+'>Home</a>');
     //  });
		}
  });

  app.get('/delete', redirectLogin, function(req, res) {
   //  MongoClient.connect(url, function (err, client) {
   //    if (err) throw err;
   //    var db = client.db('HS');

   //    db.collection('recipes').deleteOne({name: req.query.topic, user: req.session.userId}, function(err, obj) {
   //      if (err) throw err;
   //      if(obj.result.n == 1){
			// 	  res.send('Recipe Deleted ' + '<a href='+'./'+'>Home</a>');
   //      } else {
			// 	  res.send('you cab only delete recipes that you authored ' + '<a href='+'./'+'>Home</a>');
   //      }
   //      client.close();
			// });
   //  });
  });

	app.get('/update', redirectLogin, function(req, res) {
		var updateName = req.query.topic;
    // MongoClient.connect(url, function (err, client) {
    //   if (err) throw err;
    //   var db = client.db('HS');
    //   db.collection('recipes').find({name: req.query.topic}).toArray((findErr, results) => {
    //     if (findErr) throw findErr;
				// if(results[0].user == req.session.userId) {
    //       res.render('update-recipe.ejs', {recipe: results});
    //     } else res.send('you can only update recipes that you authored ' + '<a href='+'./'+'>Home</a>');
				// client.close();
    //   });
    // });
  });

	app.post('/recipe-updated', [check('name').isLength({ min: 5, max:100 }), check('time').not().isEmpty(), check('ingredients').not().isEmpty(), check('directions').not().isEmpty()], function (req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.redirect('add-recipe.ejs'); 
    }
    else {
     //  MongoClient.connect(url, function(err, client) {
     //    if (err) throw err;
     //      var db = client.db ('HS');
					// db.collection('recipes').update({name: updateName},{
					// 	$set: {
     //          user: req.sanitize(req.session.userId),
     //        	name: req.sanitize(req.body.name),
     //        	time: req.sanitize(req.body.time),
     //        	ingredients: req.sanitize(req.body.ingredients),
     //        	directions: req.sanitize(req.body.directions),
     //      	}
     //      });
     //      client.close();
     //      res.send(' This book is added to the database, name: '+ req.body.name + ' price '+ req.body.price + '<a href='+'./'+'>Home</a>');
     //  });
    }
  });

	// api can be accesed using http://www.doc.gold.ac.uk/usr/239/api
	app.get('/api', function (req,res) {
  //   MongoClient.connect(url, function (err, client) {
  //    	if (err) throw err
  //    	var db = client.db('HS');
  //     db.collection('recipes').find().toArray((findErr, results) => {
  //     	if (findErr) throw findErr;
  //     	else res.json(results);
  //       client.close();
  // 		});
		// });
	});

}
