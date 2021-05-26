module.exports = function(app){  

    const dbControle = require('../dbControle.js');
    const { check, validationResult } = require('express-validator');

    // method prevent acces to pages that require logged in status by redirecting to login page  
    const redirectLogin = (req, res, next) => {

        if (!req.session.userName ) {
            res.redirect('../login')
        } else { 
            next (); 
        }
    }

    // method prevent acces to pages that require logged in by organisation account type
    const redirectPersonal = (req, res, next) => {

        if (req.session.accType == 'personal') {
            res.send('You cannot acces this page with a personal account <a href='+'./'+'>Home</a>');
        } else { 
            next (); 
        }
    }

    // method prevent acces to pages that require logged in by personal account type
    const redirectOrganisation = (req, res, next) => {

        if (req.session.accType == 'organisation') {
            res.send('You cannot acces this page with a organisation account <a href='+'./'+'>Home</a>');
        } else { 
            next (); 
        }
    }

    // GET routing method to render add listing page
    app.get('/organisation/add_listing', redirectLogin, redirectPersonal, function(req,res){
        res.render("organisation/add_listing.ejs", {listing: null, error: null, update: false});
    });

    // POST routing method to validate form inputs and create a listing 
    app.post('/organisation/listing_post', [check('title').isLength({ min: 5, max:300 }), check('location').isPostalCode('any').not().isEmpty(), check('description').not().isEmpty()], 
    redirectLogin, redirectPersonal, async function (req,res) {

        console.log(req.body)
        const error = validationResult(req);
        if (error.isEmpty() == false) {
            console.log(error);
            res.render("organisation/add_listing.ejs", {listing: req.body, error: error, update: false});
    	} else {
    		var check = await dbControle.checkExistingListing(req)
            if (check) {
                await dbControle.createListing(req)
                res.send('This oportunity has been listed under, title: '+ req.body.title + '<a href='+'../'+'>Home</a>');
            } else {
                res.send('This oportunity already exists, title: '+ req.body.title + '<a href='+'../'+'>Home</a>');
            } 
        }
    });

    // GET routing method to render update listing page
    app.get('/organisation/update_listing', redirectLogin, redirectPersonal, async function(req,res){

        var result = await dbControle.findOneListing(req);
        res.render("organisation/add_listing.ejs", {listing: result, error: null, update: true});
    });

    // POST routing method to validate form inputs and update a listing 
    app.post('/organisation/listing_update_post', [check('title').isLength({ min: 5, max:100 }), check('location').not().isEmpty().isPostalCode('any'), check('description').not().isEmpty()], 
    redirectLogin, redirectPersonal, async function (req,res) {

        const error = validationResult(req);
        if (error.isEmpty() == false) {
            res.render('organisation/add_listing.ejs', {listing: req.body, error: error, update: true});
        } else {
            await dbControle.updateListing(req)
            res.send('listing has been updated, title: '+ req.body.title + '<a href='+'../'+'>Home</a>');
        }
    });

   // GET routing method to delete a listing
    app.get('/organisation/delete', redirectLogin, redirectPersonal, async function(req, res) {

        await dbControle.deleteListing(req);
        res.redirect('list');
    });

    // GET routing method to render organisation list page
    app.get('/organisation/list', redirectLogin, redirectPersonal, async function(req, res) {

        var results = await dbControle.findUserListings(req);
        res.render('list.ejs', {listing: results, user: req.session});
    });

    // GET routing method to render personal list page
    app.get('/personal/list', redirectLogin, redirectOrganisation, async function(req, res) {

        var results = await dbControle.findAllAvailableListings();
        res.render('list.ejs', {listing: results, user: req.session});
    });

    // GET routing method to render display listing page
    app.get('/display_listing', redirectLogin, async function(req, res) {

        console.log(req.query)
        var result = await dbControle.findOneListing(req);
        console.log(result)
        res.render('display_listing.ejs', {listing: result, user: req.session});
    });

    // GET routing method to render display expired listing page
    app.get('/display_expired_listing', redirectLogin, async function(req, res) {

        console.log(req.query)
        var result = await dbControle.findOneExpiredListing(req);
        console.log(result)
        res.render('display_listing.ejs', {listing: result, user: req.session});
    });

    // GET routing method to render list page with searched results
    app.post('/search_listing', async function (req, res) {

        result = await dbControle.searchListing(req);
        res.render('list.ejs', {listing: result, user: req.session});

    });

    // GET routing method to accept listing
    app.get('/personal/accept_listing', async function (req, res) {

        dbControle.acceptListing(req);
        var result = await dbControle.findOneListing(req);
        res.send('you have accepted listing, title: '+ result.title + '<a href='+'../'+'>Home</a>');
    });

    // GET routing method to add rating to expired listing
    app.post('/add_rating', function (req, res) {
        console.log("add_rating")
        dbControle.addRating(req.body.id, req.body.rating);
        res.redirect('/display_usr_acc');
    });

};




