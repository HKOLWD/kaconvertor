var express = require('express');
var router = express.Router();
var fs = require('fs');
var json2csv = require('json2csv');
var csv = require('csv-parser');
var empty = require('is-empty');

//
// Stores the mapping defaults (in = out) based on the
// column headers found in the logic below.
var headerMap = {};
var csvParams = {};
router.get('/', function(req, res) {
    var options = req.session.csvopts;
    var props = 'CSVEncoding=UTF8\n';
    props += 'RTAEncoding=UTF8\n';
    props += 'CSVSeparator='+options.separator+'\n';
    props += '#DateFormat=yyyy-MM-dd\n';

    setHeaders(req, res, function(r) {
        res.render('mapper', {
            title: 'Map Article Data',
            hdrs: headerMap,
            props: props,
            inputFile: 'uploads/' + req.query.filename,
            csvparams : JSON.stringify(csvParams)
        });
    });
 });

function setHeaders(req, res, callback) {
    var options = req.session.csvopts;
    /*var options = {
        raw: false,     // do  decode to utf-8 strings
        separator: csvParams.sep, // specify optional cell separator
        quote: csvParams.qte,     // specify optional quote character
        escape: csvParams.esc,    // specify optional escape character (defaults to quote value)
        newline: csvParams.nlc  // specify a newline character
    };*/
    console.log('### PARSE options '+JSON.stringify(options));
    var stream = csv(options);

    fs.createReadStream('uploads/'+req.query.filename)
        .pipe(stream)
        .on('headers', function (hdrs) {
            console.log('### HEADERs '+JSON.stringify(hdrs));

            for(var hd in hdrs) {
                console.log('### HEADER '+hdrs[hd]);
                if(!empty(hdrs[hd])) {
                    headerMap[hdrs[hd]] = hdrs[hd];
                }
            }
            console.log('### HEADERMAP '+JSON.stringify(headerMap));
            this.end();
        })
        .on('data', function (data) {
            //console.log('### Data '+JSON.stringify(data));
        })
        .on('error', function (err) {
            console.log('### ERROR '+JSON.stringify(err));
        })
        .on('end', function () {
            callback();
            console.log('DONE');
        })
        .on('close', function () {
            console.log('Close');
            callback();
        });

}

module.exports = router;
