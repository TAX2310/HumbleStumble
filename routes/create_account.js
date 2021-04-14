module.exports = function(app){

  const dbControle = require('./dbControle.js');
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
      res.render('create_account/personal.ejs', {error: 'one ore more field did not pass validation'}); 
    } else {

      if (await promise.resolve(dbControle.checkExistingAcc(req))){
        res.render('create_account/personal.ejs', {error: 'username already in use'});
      } else {
        await dbControle.createAcc(req, 'personal');
        res.render('personal/home.ejs');
      }
    } 
  });

  app.get('/create_account/organisation', function (req,res) {
    res.render('create_account/organisation.ejs', {error: ''});
  });

  app.post('/create_account/organisation_post', [check('email').isEmail(), check('usrName').not().isEmpty(), check('password').isLength({ min: 5, max:100 })],
  async function (req,res) {
  
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('create_account/organisation.ejs', {error: 'one ore more field did not pass validation'}); 
    } else {
      if (await dbControle.checkExistingAcc(req)){
        res.render('create_account/personal.ejs', {error: 'username already in use'});
      } else {
        await dbControle.createAcc(req, 'organisation');
        res.render('organisation/home.ejs');
      }

    } 
  });
}