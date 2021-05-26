module.exports = function(app){
  const schedule = require('node-schedule');
  const dbControle = require('./dbControle.js');

  var sch;

  // schedual method that calculates last day of current month 
  schedule.scheduleJob('0 * * * * *', function(){
  	var dt = new Date();
  	var month = dt.getMonth();
  	var year = dt.getFullYear();
  	var daysInMonth = new Date(year, month, 0).getDate();
  	sch = "0 59 23 " + daysInMonth + " * *"
  });

  // schedual method that moves expired listings every miniute
  schedule.scheduleJob('0 * * * * *', function(){
  	dbControle.moveExpiredListing();
  });

  // schedual method that calculates and updates every users average rating and rank every miniute
  schedule.scheduleJob('0 * * * * *', async function(){
    
    var allAcc = await dbControle.findAllAcc();
  	for (var i = 0; i < allAcc.length; i++) {
      var count = 0;
      var total = 0;
  		var listings = await dbControle.findVolunteerdExpiredListings(allAcc[i].usrName);
  		for (var j = 0; j < listings.length; j++) {
  			if(listings[j].rating != null){
          total += listings[j].rating;
          count += 1;
        }
  		};
  		
  		var avg = total/count;
      console.log(avg)

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

  // schedual method that resets all users rank on the last day of every month
  schedule.scheduleJob(sch, async function(){
    var allAcc = await dbControle.findAllAcc();
    for (var i = 0; i < allAcc.length; i++) {
    	dbControle.resetRank(allAcc[i].rank, allAcc[i]._id);
    }
  });
}