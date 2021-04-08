module.exports = function(app){

  const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const path = require('path');
  const MongoClient = require('mongodb').MongoClient;
    const url = "mongodb+srv://TAX2310:cotch2310@cluster0.lsvo0.mongodb.net/HS?retryWrites=true&w=majority";
  const { check, validationResult } = require('express-validator');



  app.get('/create_account', function (req,res) {
    res.render('create_account/user_selection.ejs');
  });

  app.get('/create_account/personal', function (req,res) {
    res.render('create_account/personal.ejs', {error: ''});
  });

  app.post('/create_account/personal_post', [check('email').isEmail(), check('usrName').not().isEmpty(), check('password').isLength({ min: 5, max:100 })],
  async function (req,res) {
  
    const errors = validationResult(req);

    console.log(errors)

    if (!errors.isEmpty()) {
      res.render('create_account/personal.ejs', {error: 'one ore more field did not pass validation'}); }
    else {
      MongoClient.connect(url, async function(err, client) {
        if (err) throw err;
        var db = client.db ('HS');
        var result_personal = await db.collection('personal_usr').findOne({usrName: req.body.usrName});
        var result_organisation = await db.collection('organisation').findOne({usrName: req.body.usrName});
    
        console.log(result_personal);
        if(result_personal != null || result_organisation != null){
          res.render('create_account/personal.ejs', {error: 'username already in use'});
          client.close();
          return;
        };

        var plainPassword = req.sanitize(req.body.password);
        var hashedPassword = await bcrypt.hash(plainPassword, saltRounds)
        db.collection('personal_usr').insertOne({
          usrName: req.sanitize(req.body.usrName),
          password: hashedPassword,
          email: req.sanitize(req.body.email)
        });
        req.session.userId = req.body.usrName;
        req.session.accType = 'personal';
        client.close();
        res.render('/personal/home.ejs');
      });
    } 
  });

  app.get('/create_account/organisation', function (req,res) {
    res.render('create_account/organisation.ejs', {error: ''});
  });

  app.post('/create_account/organisation_post', [check('email').isEmail(), check('usrName').not().isEmpty(), check('password').isLength({ min: 5, max:100 })],
  async function (req,res) {
  
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('create_account/organisation.ejs', {error: 'one ore more field did not pass validation'}); }
    else {
      MongoClient.connect(url, async function(err, client) {
        if (err) throw err;
        var db = client.db ('HS');
        var result_personal = await db.collection('personal_usr').findOne({usrName: req.body.usrName});
        var result_organisation = await db.collection('organisation').findOne({usrName: req.body.usrName});
        
        if(result_personal != null || result_organisation != null){
          res.render('create_account/organisation.ejs', {error: 'username already in use'});
          client.close();
          return;
        };
        
        var plainPassword = req.sanitize(req.body.password);
        var hashedPassword = await bcrypt.hash(plainPassword, saltRounds)
        db.collection('organisation').insertOne({
          usrName: req.sanitize(req.body.usrName),
          password: hashedPassword,
          email: req.sanitize(req.body.email)
        });
        req.session.userId = req.body.usrName;
        req.session.accType = 'organisation';
        client.close();
        res.render('organisation/home.ejs');
      });
    } 
  });
}