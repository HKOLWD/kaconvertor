var express = require('express');
var router = express.Router();

var htmlExtr = require('../htmlExtractor.js');
var zipFolder = require('zip-folder');
var timeStamp = Date.now();

router.post('/', function(req, res) {
    htmlExtr(req.body.fileloc, req, function(resultx) {
        //res.render('result', { title: 'Working!', result: 'Please wait', fileloc : '-' });
        //
        // Result is the location to be zipped for download
        console.log('### RESULT '+JSON.stringify(resultx));
        var fileName = '/zips/kaconverted_articles_'+timeStamp+'.zip';
        zipFolder(resultx, 'public/'+fileName, function(err) {
            if(err) {
                //res.redirect('result', { title: 'Download Result', result: 'Error', fileloc : fileName });
                res.render('result', { title: 'Download Result', result: 'Error', fileloc : fileName });
            } else {
                //res.redirect('result',{ title: 'Download Result', result: 'Success', fileloc : fileName });
                res.render('result', { title: 'Download Result', result: 'Success', fileloc : fileName });
            }
        });
    });
});

module.exports = router;
