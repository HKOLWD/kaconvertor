var fs = require('fs');
var clone = require('clone');
var json2csv = require('json2csv');
var mkdirp = require('mkdirp');
var csv = require('csv-parser');
var empty = require('is-empty');

var counter = 1; // For html extractions
var rowCount = 0; // For records
var outlines = [];
var columnMap = [];
var fields = [];
var extractHtmlFromFields = [];
var timeStamp = Date.now();

//{"check bij":"check bij","cluster":"cluster","vraag":"vraag","status":"status","prio":"prio",
// "antwoord":"antwoord","e_antwoord":"on","nieuwe tekst":"nieuwe tekst","e_nieuwe tekst":"on","zoekmachine termen":"TERMS",
// "zoekmachine beschrijving":"zoekmachine beschrijving","update gevraagd":"update gevraagd","\r\n":"",
// "createimportprops":"","
// importprops":"CSVEncoding=UTF8\r\nRTAEncoding=UTF8\r\nCSVSeparator=,\r\n#DateFormat=yyyy-MM-dd\r\n"}
module.exports = function(inputFile, req, callback) {
    var mappingdata = req.body;
    console.log('IN HTML EXTRACTOR '+JSON.stringify(mappingdata));
    var options = req.session.csvopts;
    /*var options = {
        raw: false,     // do  decode to utf-8 strings
        separator: csvParameters.sep, // specify optional cell separator
        quote: csvParameters.qte,     // specify optional quote character
        escape: csvParameters.esc,    // specify optional escape character (defaults to quote value)
        newline: csvParameters.nl  // specify a newline character
    };*/
    var stream = csv(options);
    mkdirp('output/' + timeStamp + '/html', function (err) {
        //
        // Import.props?
        if(mappingdata.createimportprops==="on") {
            fs.writeFile('output/' + timeStamp+'/import.properties', mappingdata.importprops, function(err) {
               console.log('Import props written');
            });
        }
        fs.createReadStream(inputFile)
            .pipe(stream)
            .on('headers', function (hdrs) {
                //console.log('IN HEADERS');
                //
                // Set the appropriate headers for the appropriate actions
                for(var hd in hdrs) {
                    //
                    // For output
                    // Collect headers and extraction columns
                    if(!empty(mappingdata[hdrs[hd]])) {
                        fields.push(mappingdata[hdrs[hd]]);
                        var headerMap = {};
                        headerMap[hdrs[hd]] = mappingdata[hdrs[hd]];
                        columnMap.push(headerMap);

                        if(mappingdata["e_"+hdrs[hd]] === "on") {
                            //
                            // For extraction
                            extractHtmlFromFields.push(hdrs[hd]);
                        }
                    }
                }
            })
            .on('data', function (dta) {
                //console.log('IN DATA '+Date.now());
                rowCount++;
                if(dta) {
                    stream.pause();
                    //console.log('### dta: '+JSON.stringify(dta));

                    var row = {};
                    //
                    // Iterate the input headers and put data
                    // in object with output headers as properties
                    for(var colNr in columnMap) {
                        for(var prop in columnMap[colNr]) {
                            //
                            // Uncomment for semantics ;)
                            //console.log('### Input header: ' + JSON.stringify(prop));
                            //console.log('### Input data: ' + JSON.stringify(dta[prop]));
                            //console.log('### Output header: ' + JSON.stringify(columnMap[colNr][prop]));
                            if (!empty(prop) && !empty(dta[prop]) && !empty(columnMap[colNr][prop])) {
                                if (extractHtmlFromFields.includes(prop)) {

                                    //
                                    // Extract html to separate file
                                    var fileLocation = 'output/' + timeStamp + '/';
                                    var propName = columnMap[colNr][prop].replace(/\s/,'_');
                                    var fileName = 'html/html_extraction_'+propName+'_'+ counter + '.html';
                                    counter++;
                                    fs.writeFile(fileLocation+fileName, dta[prop], function (err) {
                                        //
                                        // Replace csv contents with file location
                                        row[columnMap[colNr][prop]] = fileName;
                                        //
                                        console.log('### ROW '+JSON.stringify(row));
                                        stream.resume();
                                    });

                                } else {
                                    row[columnMap[colNr][prop]] = dta[prop];
                                    stream.resume();
                                }
                            }
                        }
                    }
                    outlines.push(row);
                }
            })
            .on('end', function () {
                // We are done, write the final csv
                console.log('File END with ' + rowCount + ' rows');
                var timeOut = setTimeout(function() {
                    console.log('Setting timeout');
                    writeOutputCsv('output/' + timeStamp, callback);
                    }, 1000);

//                clearTimeout(timeOut);
                //stream.close();
                //console.log('outlines '+JSON.stringify(outlines));
                //writeOutputCsv('output/' + timeStamp, callback);
            })
            .on('finish', function () {
                // We are done, write the final csv
                console.log('File FINISH with ' + rowCount + ' rows');
                //console.log('outlines '+JSON.stringify(outlines));

                //writeOutputCsv('output/' + timeStamp, callback);
            });

    });
};

function writeOutputCsv(outputDir, callback) {
    console.log('IN OUTPUT');
    var csvData = json2csv({ data: outlines, fields: fields});
    fs.writeFile(outputDir+'/result.csv', csvData, function(err) {
        if (err) throw err;
        console.log('Saved CSV');
        callback(outputDir);
    });
}

