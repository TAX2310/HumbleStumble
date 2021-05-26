module.exports = function(app){

  const dbControle = require('../dbControle.js');

  // GET routing method to render homone page depending on logged in status and account type
  app.get('/', async function(req,res){
    if (!req.session.userName) {
      var result = await dbControle.findAllListings();
      res.render('index.ejs', {listing: result, user: null})
    } else if (req.session.accType == 'personal') {
      var result = await dbControle.findAllListings();
      res.render('personal/home.ejs', {listing: result, user: req.session});
    } else {
      var result = await dbControle.findUserListings(req);
      res.render('organisation/home.ejs', {listing: result, user: req.session});
    }
  });
}
