module.exports = function(app){

  const bcrypt = require('bcrypt');
      const saltRounds = 10;
    const MongoClient = require('mongodb').MongoClient;
      var url = "mongodb+srv://TAX2310:cotch2310@cluster0.lsvo0.mongodb.net/HS?retryWrites=true&w=majority";
    const dbControle = require('../dbControle.js')
  const { check, validationResult } = require('express-validator');

    const redirectLogin = (req, res, next) => {
      if (!req.session.userName ) {
          res.redirect('../login')
      } else { 
          next (); 
      }
    }

  app.get('/create_account', function (req,res) {
    res.render('create_account/user_selection.ejs');
  });

  app.get('/create_account/personal', function (req,res) {
    res.render('create_account/personal.ejs', {error: null});
  });

  app.post('/create_account/personal_post',
    [check('email').isEmail(),
    check('usrName').isAlphanumeric().not().isEmpty(),
    check('password').isLength({ min: 5, max:100 }),
    check('bio').not().isEmpty()],
    async function (req,res) {
  
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('create_account/personal.ejs', {error: errors}); 
    } else {
      if (await dbControle.checkExistingAcc(req)){
        res.render('create_account/personal.ejs', {error: 'username already in use'});
      } else {
        await dbControle.createAcc(req, 'personal');
        req.session.userName = req.body.usrName;
        req.session.accType = 'personal';
        res.redirect("/")
      }

    } 
  });

  app.get('/create_account/organisation', function (req,res) {
    res.render('create_account/organisation.ejs', {error: null});
  });

  app.post('/create_account/organisation_post', [check('email').isEmail(), check('usrName').isAlphanumeric().not().isEmpty(), check('password').isLength({ min: 5, max:100 }), check('bio').not().isEmpty()],
  async function (req,res) {
  
    const errors = validationResult(req);
    console.log(errors)

    if (!errors.isEmpty()) {
      res.render('create_account/organisation.ejs', {error: errors}); 
    } else {
      if (await dbControle.checkExistingAcc(req)){
        res.render('create_account/organisation.ejs', {error: 'username already in use'});
      } else {
        await dbControle.createAcc(req, 'organisation');
        req.session.userName = req.body.usrName;
        req.session.accType = 'organisation';
        res.redirect("/")
      }

    } 
  });

  app.get('/login', async function (req,res) {
    res.render('login.ejs');
  });

  app.post('/loggedin', async function(req,res) {

    if (req.session.userName != null) {
        res.send("You are already logged in <br />"+'<a href=/'+'>Home</a>'); 
      return;
    }

    var accType = await dbControle.checkExistingAccType(req);
    console.log(accType)
    if (accType != null) {
      if(await dbControle.login(req,accType)) {
        req.session.userName = req.body.usrName;
        req.session.accType = accType;
        res.redirect("/")
      } else {
        res.send("You have failed to login <br />"+'<a href='+'./'+'>Home</a>');
      };
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

  app.get('/display_acc', redirectLogin, async function (req,res) {
    if(req.query.usr == req.session.userName){
      res.redirect('/display_usr_acc')
    }
    var accResult = await dbControle.findOneAcc(req.query.usr);
    if(accResult.accType == 'organisation'){
      var expiredListings = await dbControle.findUserExpiredListings(req.query.usr)
      console.log(expiredListings)
    } else {
      var expiredListings = await dbControle.findVolunteerdExpiredListings(req.query.usr)
    }
    res.render('display_acc.ejs', { accType: req.session.accType, acc: accResult, expired_listing: expiredListings})
  });

  app.get('/display_usr_acc', redirectLogin, async function (req,res) {
    console.log(req.session.userName)
    var accResult = await dbControle.findOneAcc(req.session.userName);
    if (req.session.accType == 'organisation') {
      var expiredListings = await dbControle.findUserExpiredListings(req.session.userName);
      var listings = await dbControle.findUserListings(req)
      console.log(expiredListings)
    }else {
      var expiredListings = await dbControle.findVolunteerdExpiredListings(req.session.userName);
      var listings = await dbControle.findVolunteerdListings(req.session.userName);
    }
    res.render('display_usr_acc.ejs', { acc: accResult, expired_listing: expiredListings, listing: listings})
  });

}