module.exports = function(app){

	const bcrypt = require('bcrypt');
    	const saltRounds = 10;
  	const MongoClient = require('mongodb').MongoClient;
    	var url = "mongodb+srv://TAX2310:cotch2310@cluster0.lsvo0.mongodb.net/HS?retryWrites=true&w=majority";

  	const redirectLogin = (req, res, next) => {
    	if (!req.session.userId ) {
      		res.redirect('./login')
    	} else { 
      		next (); 
    	}
  	}

	app.get('/login', function (req,res) {
    	res.render('login.ejs');
  	});

	app.post('/loggedin', function(req,res) {

		if (req.session.userId != null) {
			if (req.session.accType == 'personal') {
				res.send("You are already logged in <br />"+'<a href=/'+'>Home</a>');
			} else {
				res.send("You are already logged in <br />"+'<a href=/'+'>Home</a>');
			}
			
			return;
		}

    	var plainPassword = req.sanitize(req.body.password);
		var logged_in = false;
    	MongoClient.connect(url, async function(err, client) {
	      	if (err) throw err;
	      	var db = client.db ('HS');

	      	var personal_login = await db.collection("personal_usr").findOne({usrName : req.body.usrName});
	      	var organisation_login = await db.collection("organisation").findOne({usrName : req.body.usrName});

	      	if (personal_login != null){
	      		var hashedPassword = personal_login.password;
				await bcrypt.compare(plainPassword, hashedPassword, function(err, result) {
					if (result == true) {
	              		req.session.userId = req.body.usrName;
	              		req.session.accType = 'personal';
	              		res.render('personal/home.ejs');
	            	}
				});
	      	} else if (organisation_login != null) {
	      		var hashedPassword = organisation_login.password;
				await bcrypt.compare(plainPassword, hashedPassword, function(err, result) {
					if (result == true) {
	              		req.session.userId = req.body.usrName;
	              		req.session.accType = 'organisation';
	              		console.log(req.session.accType);
	              		res.render('organisation/home.ejs');
	            	}
				});
	      	} else {
	      		res.send("You have failed to login <br />"+'<a href='+'./'+'>Home</a>');
	      	}
	    });
	});

  app.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => {
    	if (err) res.send('sorry somthing whent wrong you did not logg out. <a href='+'./'+'>Home</a>');
			res.send('you are now logged out. <a href='+'./'+'>Home</a>');
    });
  });

}