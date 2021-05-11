const bcrypt = require('bcrypt');
	const saltRounds = 10;
    const path = require('path');
const MongoClient = require('mongodb').MongoClient;
    const ObjectId = require('mongodb').ObjectId; 
    const url = "mongodb+srv://TAX2310:cotch2310@cluster0.lsvo0.mongodb.net/HS?retryWrites=true&w=majority";
const NodeGeocoder = require('node-geocoder');
  	const options = {
    	provider: 'opencage',
    	apiKey: '8d212f8fdd7849e8b2ffb1c8447d9078', 
  	};
  	const geocoder = NodeGeocoder(options);
const schedule = require('node-schedule');

function updateRank (rank, id) {
	MongoClient.connect(url, async function(err, client) {
        if (err) throw err;
        console.log('1')
        var db = client.db ('HS');
	    db.collection('personal').updateOne({_id: new ObjectId(id)},{ $set: {
	    	rank: rank
		}});
        client.close();
    });
};

function resetRank (rank, id) {
	MongoClient.connect(url, async function(err, client) {
        if (err) throw err;
        console.log('1')
        var db = client.db ('HS');
	    db.collection('personal').updateOne({_id: new ObjectId(id)},{ $set: {
	    	rank: null
		}, $push: {
			pastRanks: rank
		}});
        client.close();
    });
};

async function findAllAcc () {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var db = client.db('HS');
            db.collection('personal').find().toArray((err, results) => {
                if (err) throw err;
                client.close();
                resolve(results);
            });
            client.close();
        });
	});
}

async function findOneAcc (user) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, async function(err, client) {
          if (err) throw err;
          var db = client.db ('HS');
          var result_personal = await db.collection('personal').findOne({usrName: user});
          var result_organisation = await db.collection('organisation').findOne({usrName: user});
          if(result_personal != null ){
            client.close();
            resolve(result_personal);
          } else if (result_organisation != null ){
            client.close();
            resolve(result_organisation);
          }
          client.close();
          resolve(null);
      });
  });
}

async function findApplyedListings (acc) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var db = client.db('HS');
            db.collection('expired_listing').find({volunteer: acc.usrName}).sort({expire: -1}).toArray((err, results) => {
                if (err) throw err;
                client.close();
                // console.log(results);
                resolve(results);
            });
            client.close();
        });
	});
}

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
	        resolve(false);
	    });
	});
};

async function checkExistingAccType(req) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, async function(err, client) {
      if (err) throw err;
      var db = client.db ('HS');
      var result_personal = await db.collection('personal').findOne({usrName: req.body.usrName});
      var result_organisation = await db.collection('organisation').findOne({usrName: req.body.usrName});

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
  console.log(req.body.shift)
	MongoClient.connect(url, async function(err, client) {
        if (err) throw err;
        var coords = await geocoder.geocode(req.body.location)
        var db = client.db ('HS');
	    db.collection('listing').insertOne({
			  user: req.sanitize(req.session.userName),
	    	title: req.sanitize(req.body.title),
	    	location: req.sanitize(req.body.location),
	    	coords: coords[0],
        shift: req.body.shift,
        description: req.sanitize(req.body.description),
        expire: new Date(req.body.expire),
        status: 'available',
        volunteer: null
		  });
        client.close();
    });
};

function updateListing (req) {
	MongoClient.connect(url, async function(err, client) {
        if (err) throw err;
        console.log('1')
        var db = client.db ('HS');
	    db.collection('listing').updateOne({_id: new ObjectId(req.query.id)},{ $set: {
	    	title: req.sanitize(req.body.title),
	    	location: req.sanitize(req.body.location),
			description: req.sanitize(req.body.description)
		}});
        client.close();
    });
};

function acceptListing (req) {
	MongoClient.connect(url, async function(err, client) {
      if (err) throw err;
      var db = client.db ('HS');
	    db.collection('listing').updateOne({_id: new ObjectId(req.query.id)},{ $set: {
	    	status: 'unavailable',
			volunteer: req.session.userName
		}});
        client.close();
    });
};

function addRating (req) {
  MongoClient.connect(url, async function(err, client) {
    if (err) throw err;
    var db = client.db ('HS');
    db.collection('listing').updateOne({_id: new ObjectId(req.body.id)},{ $set: {
      rating: parseInt(require.body.rating),
    }});
    client.close();
    });
};

function updateAvgRating (id, avg) {
  MongoClient.connect(url, async function(err, client) {
    if (err) throw err;
    var db = client.db ('HS');
    db.collection('personal').updateOne({_id: new ObjectId(id)},{ $set: {
      avgRating: avg.toFixed(1),
    }});
    client.close();
    });
};

async function createAcc (req,type) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, async function(err, client) {
	        if (err) throw err;
	        var db = client.db ('HS');
	        var plainPassword = req.sanitize(req.body.password);
	        var hashedPassword = await bcrypt.hash(plainPassword, saltRounds)
	        db.collection(type).insertOne({
    				usrName: req.sanitize(req.body.usrName),
    				password: hashedPassword,
    				email: req.sanitize(req.body.email),
            bio: req.sanitize(req.body.bio),
    				accType: type
	        });
	        client.close();
	    });
	    resolve();
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
            await db.collection('listing').findOne({_id: new ObjectId(req.query.id)}, function(err, result) {
            	resolve(result)
            });
            client.close();
	    });
	});
}

async function findOneExpiredListing (req) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, async function(err, client) {
            if (err) throw err;
            var db = client.db ('HS');
            await db.collection('expired_listing').findOne({_id: new ObjectId(req.query.id)}, function(err, result) {
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
            db.collection('listing').find({user: req.session.userName}).toArray((err, results) => {
                if (err) throw err;
                client.close();
                resolve(results);
            });
            client.close();
        });
	});
}

async function findUserExpiredListings (usr) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var db = client.db('HS');
            db.collection('expired_listing').find({user: usr}).toArray((err, results) => {
                if (err) throw err;
                client.close();
                resolve(results);
            });
            client.close();
        });
  });
}

async function findVolunteerdExpiredListings (usr) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var db = client.db('HS');
            db.collection('expired_listing').find({volunteer: usr}).toArray((err, results) => {
                if (err) throw err;
                client.close();
                resolve(results);
            });
            client.close();
        });
  });
}

async function findVolunteerdListings (usr) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var db = client.db('HS');
            db.collection('listing').find({volunteer: usr}).toArray((err, results) => {
                if (err) throw err;
                client.close();
                resolve(results);
            });
            client.close();
        });
  });
}

async function findAllListings () {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var db = client.db('HS');
            db.collection('listing').find().toArray((err, results) => {
                if (err) throw err;
                client.close();
                resolve(results);
            });
            client.close();
        });
	});
}

// async function findAvailableUserListings (usr) {
//   return new Promise((resolve, reject) => {
//     MongoClient.connect(url, function (err, client) {
//             if (err) throw err;
//             var db = client.db('HS');
//             db.collection('listing').find({status: 'available', user: usr}).toArray((err, results) => {
//                 if (err) throw err;
//                 client.close();
//                 resolve(results);
//             });
//             client.close();
//         });
//   });
// }

// async function findExpiredUserListings () {
//   return new Promise((resolve, reject) => {
//     MongoClient.connect(url, function (err, client) {
//             if (err) throw err;
//             var db = client.db('HS');
//             db.collection('listing').find({status: 'available', user: usr}).toArray((err, results) => {
//                 if (err) throw err;
//                 client.close();
//                 resolve(results);
//             });
//             client.close();
//         });
//   });
// }

async function findAllAvailableListings () {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var db = client.db('HS');
            db.collection('listing').find({status: 'available'}).toArray((err, results) => {
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
            db.collection('listing').remove({_id: new ObjectId(req.query.id)});
            client.close();
            resolve();
        });
	});
}

async function searchListing (req) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, async function (err, client) {
            if (err) throw err;
            var db = client.db('HS');
            await db.createIndex("listing", { title: "text"})
            await db.collection('listing').find({
        		"$text": {"$search": req.body.keyword}}, 
        		{ title: 1, textScore: {$meta: "textScore"}}, 
				{ sort: {textScore: {$meta: "textScore"}}
      		}).toArray(function(err, items) {
      			console.log(items);
	        	client.close();
	        	resolve(items);
      		})
        });
	});
}

async function moveExpiredListing() {
	MongoClient.connect(url, async function (err, client) {
        if (err) throw err;
        var db = client.db('HS');
        var result = await findAllListings();
        let ts = Date.now();
        var date = new Date(ts);
        // .toLocaleDateString()
        for (var i = 0; i < result.length; i++) {
        	if(date > result[i].expire){
        		db.collection('listing').remove({_id: new ObjectId(result[i]._id)});
        		db.collection('expired_listing').insertOne(result[i]);
            db.collection('expired_listing').updateOne({_id: new ObjectId(result[i]._id)},{ $set: {
              status: "unavailable",
              rating: null
            }});
        		console.log("ok")
        	}
        }

    });
}

function addRating (id, rating) {
  MongoClient.connect(url, async function (err, client) {
    if (err) throw err;
    var db = client.db('HS');
    db.collection('expired_listing').updateOne({_id: new ObjectId(id)},{ $set: {
      rating: rating
    }});
  });
}

module.exports.checkExistingAcc = checkExistingAcc;
module.exports.checkExistingListing = checkExistingListing;
module.exports.createAcc = createAcc;
module.exports.createListing = createListing;
module.exports.updateListing = updateListing;
module.exports.acceptListing = acceptListing;
module.exports.checkExistingAccType = checkExistingAccType;
module.exports.login = login;
module.exports.findOneListing = findOneListing;
module.exports.findUserListings = findUserListings;
module.exports.findAllListings = findAllListings;
module.exports.searchListing = searchListing;
module.exports.deleteListing = deleteListing;
module.exports.findAllAvailableListings = findAllAvailableListings;
module.exports.moveExpiredListing = moveExpiredListing;
module.exports.findApplyedListings = findApplyedListings;
module.exports.findOneAcc = findOneAcc;
module.exports.findAllAcc = findAllAcc;
module.exports.findUserExpiredListings = findUserExpiredListings;
module.exports.findOneExpiredListing = findOneExpiredListing;
module.exports.findVolunteerdExpiredListings = findVolunteerdExpiredListings;
module.exports.findVolunteerdListings = findVolunteerdListings;
module.exports.addRating = addRating;
module.exports.updateAvgRating = updateAvgRating;
module.exports.updateRank = updateRank;
module.exports.resetRank = resetRank;
