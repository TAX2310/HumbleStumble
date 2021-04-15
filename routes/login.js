module.exports = function(app){

	const bcrypt = require('bcrypt');
    	const saltRounds = 10;
  	const MongoClient = require('mongodb').MongoClient;
    	var url = "mongodb+srv://TAX2310:cotch2310@cluster0.lsvo0.mongodb.net/HS?retryWrites=true&w=majority";
    const dbControle = require('./dbControle.js')

  	const redirectLogin = (req, res, next) => {
    	if (!req.session.userId ) {
      		res.redirect('./login')
    	} else { 
      		next (); 
    	}
  	}

	app.get('/login', async function (req,res) {
    	res.render('login.ejs');
  	});

	app.post('/loggedin', async function(req,res) {

		if (req.session.userId != null) {
				res.send("You are already logged in <br />"+'<a href=/'+'>Home</a>');	
			return;
		}

		var accType = await dbControle.checkExistingAccType(req);
		if (accType != null) {
			if(await dbControle.login(req,accType)) {
				req.session.userId = req.body.usrName;
	      		req.session.accType = accType;
	      		// res.render(accType + '/home.ejs');
	      		res.redirect("/")
			} else {
	      		res.send("You have failed to login <br />"+'<a href='+'./'+'>Home</a>');
	      	}
		} else {
			res.send("No account with the user name " + req.body.usrName + " exists. <br />"+'<a href='+'./'+'>Home</a>');
		}
	});

  app.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => {
    	if (err) res.send('sorry somthing whent wrong you did not log out. <a href='+'./'+'>Home</a>');
			res.send('you are now logged out. <a href='+'./'+'>Home</a>');
    });
  });

}