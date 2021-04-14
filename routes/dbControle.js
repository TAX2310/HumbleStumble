const bcrypt = require('bcrypt');
	const saltRounds = 10;
    const path = require('path');
const MongoClient = require('mongodb').MongoClient;
    const url = "mongodb+srv://TAX2310:cotch2310@cluster0.lsvo0.mongodb.net/HS?retryWrites=true&w=majority";

async function checkExistingAcc(req) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, async function(err, client) {
	        if (err) throw err;
	        var db = client.db ('HS');
	        var result_personal = await db.collection('personal').findOne({usrName: req.body.usrName});
	        var result_organisation = await db.collection('organisation').findOne({usrName: req.body.usrName});

	        if(result_personal != null || result_organisation != null){
				client.close();
				resolve(true);
	        };
	        client.close();
	        reject(false);
	    });
	});
};

async function checkExistingAccType(req) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, async function(err, client) {
	        if (err) throw err;
	        var db = client.db ('HS');
	        var result_personal = await Promise.resolve(db.collection('personal').findOne({usrName: req.body.usrName}));
	        var result_organisation = await Promise.resolve(db.collection('organisation').findOne({usrName: req.body.usrName}));

	        if(result_personal != null ){
				client.close();
				resolve('personal');
	        } else if (result_organisation != null ){
	        	client.close();
	        	resolve('organisation');
	        }
	        client.close();
	        reject(null);
	    });
	});
};

async function checkExistingListing(req) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, async function(err, client) {
	        if (err) throw err;
	        var db = client.db ('HS');
            var result = await db.collection('listing').findOne({title: req.body.title});

	        if(result == null){
				client.close();
				resolve(true);
	        };
	        client.close();
	        resolve(false);
	    });
	});
};

function createListing (req) {
	MongoClient.connect(url, async function(err, client) {
        if (err) throw err;
        var db = client.db ('HS');
	    db.collection('listing').insertOne({
			user: req.sanitize(req.session.userId),
	    	title: req.sanitize(req.body.title),
	    	location: req.sanitize(req.body.location),
			description: req.sanitize(req.body.description)
		});
        client.close();
    });
};

function updateListing (req) {
	MongoClient.connect(url, async function(err, client) {
        if (err) throw err;
        console.log('1')
        var db = client.db ('HS');
	    db.collection('listing').updateOne({title: req.query.title},{ $set: {
	    	title: req.sanitize(req.body.title),
	    	location: req.sanitize(req.body.location),
			description: req.sanitize(req.body.description)
		}});
        client.close();
    });
};

function createAcc (req,type) {
	MongoClient.connect(url, async function(err, client) {
        if (err) throw err;
        var db = client.db ('HS');
        var plainPassword = req.sanitize(req.body.password);
        var hashedPassword = await bcrypt.hash(plainPassword, saltRounds)
        db.collection(type).insertOne({
			usrName: req.sanitize(req.body.usrName),
			password: hashedPassword,
			email: req.sanitize(req.body.email),
			accType: type
        });
        req.session.userId = req.body.usrName;
        req.session.accType = type;
        client.close();
    });
};

async function login (req, type) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, async function(err, client) {
	        if (err) throw err;
	        var db = client.db ('HS');
	        var acc = await db.collection(type).findOne({usrName : req.body.usrName});
	        client.close();
	        var plainPassword = req.sanitize(req.body.password);
			var hashedPassword = acc.password;
			await bcrypt.compare(plainPassword, hashedPassword, function(err, result) {
	    		resolve(result);	      
			});
	    });
	});
    
};

async function findOneListing (req) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, async function(err, client) {
            if (err) throw err;
            var db = client.db ('HS');
            await db.collection('listing').findOne({title: req.query.title}, function(err, result) {
            	resolve(result)
            });
            client.close();
	    });
	});
}

async function findUserListings (req) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var db = client.db('HS');
            db.collection('listing').find({user: req.session.userId}).toArray((err, results) => {
                if (err) throw err;
                client.close();
                resolve(results);
            });
            client.close();
        });
	});
}

async function deleteListing (req) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var db = client.db('HS');
            db.collection('listing').remove({title: req.query.title});
            client.close();
            resolve();
        });
	});
}

module.exports.checkExistingAcc = checkExistingAcc;
module.exports.checkExistingListing = checkExistingListing;
module.exports.createAcc = createAcc;
module.exports.createListing = createListing;
module.exports.updateListing = updateListing;
module.exports.checkExistingAccType = checkExistingAccType;
module.exports.login = login;
module.exports.findOneListing = findOneListing;
module.exports.findUserListings = findUserListings;
module.exports.deleteListing = deleteListing;


