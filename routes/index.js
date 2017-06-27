var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.csvopts) {
      delete req.session.csvopts;
  }
    if(req.files) {
        delete req.files;
    }
  res.render('index', { title: 'Appsolutely Knowledge Article Converter' });
});

module.exports = router;
