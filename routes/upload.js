var express = require('express');
var router = express.Router();
var timeStamp = Date.now();

router.post('/', function(req, res) {
    //console.log('## FILE: '+JSON.stringify(req.files.csvFile)); // the uploaded file object
    console.log('### FORM SUBMISSION '+JSON.stringify(req.body));
    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    var options = {
        raw: false,     // do  decode to utf-8 strings
        separator: req.body.separatorchr, // specify optional cell separator
        quote: req.body.quotationchr,     // specify optional quote character
        escape: req.body.escapechr
        // specify optional escape character (defaults to quote value)
        //newline: req.body.newlinechr // specify a newline character
    };

    req.session.csvopts = options;

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let csvFile = req.files.csvFile;
    var fileName = timeStamp+'_'+csvFile.name;
    csvFile.mv('uploads/'+fileName, function(err) {
        if (err) {
            //return res.status(500).send(err);
            console.log('##ERR '+JSON.stringify(err));
        }
        //res.send('File uploaded!');
        res.redirect('/mapper?filename='+fileName);
    });
});

module.exports = router;
