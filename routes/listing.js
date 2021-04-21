module.exports = function(app){  

    const dbControle = require('./dbControle.js');
    const { check, validationResult } = require('express-validator');

    const redirectLogin = (req, res, next) => {

        if (!req.session.userId ) {
            res.redirect('./login')
        } else { 
            next (); 
        }
    }

    const redirectPersonal = (req, res, next) => {

        if (req.session.accType == 'personal') {
            res.send('You cannot acces this page with a personal account <a href='+'./'+'>Home</a>');
        } else { 
            next (); 
        }
    }

    const redirectOrganisation = (req, res, next) => {

        if (req.session.accType == 'organisation') {
            res.send('You cannot acces this page with a organisation account <a href='+'./'+'>Home</a>');
        } else { 
            next (); 
        }
    }

    app.get('/organisation/add_listing', redirectLogin, redirectPersonal, function(req,res){

        res.render("organisation/add_listing.ejs", {listing: null, error: null, update: false});
    });

    app.post('/organisation/listing_post', [check('title').isLength({ min: 5, max:100 }), check('location').not().isEmpty(), check('description').not().isEmpty()], 
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

    app.get('/organisation/update_listing', redirectLogin, redirectPersonal, async function(req,res){

        var result = await dbControle.findOneListing(req);
        res.render("organisation/add_listing.ejs", {listing: result, error: null, update: true});
    });

    app.get('/organisation/delete', redirectLogin, redirectPersonal, async function(req, res) {

        await dbControle.deleteListing(req);
        res.redirect('list');
    });

    app.post('/organisation/listing_update_post', [check('title').isLength({ min: 5, max:100 }), check('location').not().isEmpty(), check('description').not().isEmpty()], 
    redirectLogin, redirectPersonal, async function (req,res) {

        const error = validationResult(req);
        if (error.isEmpty() == false) {
            res.render('organisation/add-listing.ejs', {listing: req.body, error: error, update: true});
        } else {
            await dbControle.updateListing(req)
            res.send('listing has been updated, title: '+ req.body.title + '<a href='+'../'+'>Home</a>');
        }
    });

    app.get('/organisation/list', redirectLogin, redirectPersonal, async function(req, res) {

        var results = await dbControle.findUserListings(req);
        res.render('list.ejs', {listing: results, user: req.session});
    });

    app.get('/personal/list', redirectLogin, redirectOrganisation, async function(req, res) {

        var results = await dbControle.findAllAvailableListings();
        res.render('list.ejs', {listing: results, user: req.session});
    });

    app.get('/display_listing', redirectLogin, async function(req, res) {

        console.log(req.query)
        var result = await dbControle.findOneListing(req);
        console.log(result)
        res.render('display_listing.ejs', {listing: result, user: req.session});
    });

    app.post('/search_listing', async function (req, res) {

        result = await dbControle.searchListing(req);
        res.render('list.ejs', {listing: result, user: req.session});

    });

    app.get('/personal/accept_listing', async function (req, res) {

        dbControle.acceptListing(req);
        var result = await dbControle.findOneListing(req);
        res.send('you have accepted listing, title: '+ result.title + '<a href='+'../'+'>Home</a>');

    });

};




