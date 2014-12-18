var Mustache = require('mustache');
var express = require('express');
var fs = require('fs');

var app = express();
app.disable('x-powered-by');

app.get('/', function (req, res) {
  res.redirect(301, '/performance');
});

app.get('/assets/*', function (req, res) {
  var path = __dirname + '/node_modules/govuk_template_mustache' + req.path;
  fs.exists(path, function(exists) {
    if (exists) {
      res.status(200).sendFile(path);
    } else {
      res.status(404);
    }
  });
});

app.get('/performance', function (req, res) {
  var layoutTemplate = fs.readFileSync(__dirname + '/node_modules/govuk_template_mustache/views/layouts/govuk_template.html', { encoding: 'utf-8'});
  var contentTemplate = fs.readFileSync(__dirname + '/server/templates/homepage.html', { encoding: 'utf-8'});
  res.send(Mustache.render(layoutTemplate, {
    assetPath: '/assets/',
    pageTitle: 'GOV.UK – Performance',
    content: Mustache.render(contentTemplate, {})
  }));
  // res.send("Home page template");
});

app.get('/performance/*', function (req, res) {
  res.send("Dashboard template"); 
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

})
