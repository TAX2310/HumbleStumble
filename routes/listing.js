const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
        res.redirect('./login')
    } else { 
        next (); 
    }
}

const redirectPersonal = (req, res, next) => {
    if (req.session.accType == 'personal') {
        res.send('You cannot acces this page with a personal account   <a href='+'./'+'>Home</a>');
    } else { 
        next (); 
    }
}

app.get('/organisation/add-listing', redirectLogin, redirectAcc, function(req,res){
    MongoClient.connect(url, function(err, client) {
        if (err) throw err;
        var db = client.db ('HS');
        db.collection('listing').findOne({title: req.query.title}, function(err, result) {
            if (err) throw err;
            res.render("/organisation/add-listing.ejs" {listing: results});
        });
        client.close();
    });
  });

app.post('/organisation/add-listing_post', [check('title').isLength({ min: 5, max:100 }), check('location').not().isEmpty(), check('description').not().isEmpty()], 
function (req,res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('/organisation/add-listing.ejs' );
	} else {
    
        MongoClient.connect(url, function(err, client) {
            if (err) throw err;
            var db = client.db ('HS');
            var result = await db.collection('listing').findOne({title: req.body.title});
    		
            if (!result) {		
                db.collection('listing').insertOne({
        			user: req.sanitize(req.session.userId),
                	title: req.sanitize(req.body.name),
        			description: req.sanitize(req.body.ingredients),
                });
                res.send('This oportunity has been listed under, title: '+ req.body.title + '<a href='+'/organisation/home'+'>Home</a>');
                return;
            }
            client.close();
            res.send('This oportunity already exists, title: '+ req.body.title + '<a href='+'/organisation/home'+'>Home</a>');
        });
	}
});

app.get('/organisation/list', redirectLogin, redirectPersonal, function(req, res) {

    MongoClient.connect(url, function (err, client) {
        if (err) throw err;
        var db = client.db('HS');
        db.collection('listing').find({organisation: req.session.userId}).toArray((err, results) => {
            if (err) throw err;
            res.render('/organisation/list.ejs', {listing: results});
        });
        client.close();
    });
});

