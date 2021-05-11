module.exports = function(app){
  const schedule = require('node-schedule');
  const dbControle = require('./dbControle.js');

  var sch;

  schedule.scheduleJob('0 0 0 * * *', function(){
  	var dt = new Date();
  	var month = dt.getMonth();
  	var year = dt.getFullYear();
  	var daysInMonth = new Date(year, month, 0).getDate();
  	sch = "0 59 23 " + daysInMonth + " * *"
  	console.log(sch)
  });

  schedule.scheduleJob('0 0 0 * * *', function(){
    console.log("move expired")
  	dbControle.moveExpiredListing();
  });

  schedule.scheduleJob('0 0 0 * * *', async function(){
    
    var allAcc = await dbControle.findAllAcc();
  	for (var i = 0; i < allAcc.length; i++) {
      var count = 0;
      var total = 0;
  		var listings = await dbControle.findVolunteerdExpiredListings(allAcc[i]);
  		for (var j = 0; j < listings.length; j++) {
  			if(listings[j].rating != null){
          total += listings[j].rating;
          count += 1;
        }
  		};
  		
  		var avg = total/count;

      dbControle.updateAvgRating(allAcc[i]._id, avg)	

      var rank = null;

      if (listings.length <= 1){
        rank = 'bronze'
      } else if (listings.length >= 2 & listings.length < 7) {
        rank = 'silver'
      } else if (listings.length >= 7 & listings.length < 14) {
        rank = 'gold'
      } else if (listings.length >= 14) {
        rank = 'platinum'
      } 
      dbControle.updateRank(rank, allAcc[i]._id) 
  	};
  });

  schedule.scheduleJob(sch, async function(){
    console.log("reset rank")
    var allAcc = await dbControle.findAllAcc();
    for (var i = 0; i < allAcc.length; i++) {
    	dbControle.resetRank(allAcc[i].rank, allAcc[i]._id);
    }
  });
}