module.exports = function(app){

  const dbControle = require('./dbControle.js');

	// home page (2)
  app.get('/', async function(req,res){
    if (!req.session.userId) {
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

  app.get('/test', async function (req,res) {
    // await dbControle.moveExpiredListing();
    // var acc = {
    //   usrName: "tmill004"
    // }
    // dbControle.findApplyedListings(acc);
    var startDate1 = new Date("02/10/2012");
    var startDate2 = new Date("01/10/2012");

    var diff= (startDate2 - startDate1)
    console.log(diff)
  });

}
