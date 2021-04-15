module.exports = function(app){

  var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
  const dbControle = require('./dbControle.js');

	// home page (2)
  app.get('/', async function(req,res){
    if (!req.session.userId) {
      res.render('index.ejs')
    } else if (req.session.userId == 'personal') {
      var result = await dbControle.findAllListings();
      res.render('personal/home.ejs', {listing: result});
    } else {
      var result = await dbControle.findUserListings(req);
      res.render('organisation/home.ejs', {listing: result});
    }
  });

	// about page
	app.get('/about', function(req,res){
    res.render('about.ejs');
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
    res.render('test.ejs')
  });

}
