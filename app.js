var Mustache = require('mustache'),
  express = require('express'),
  fs = require('fs'),
  https = require('https'),
  $ = require('jquery');

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
  // Fetch meta data
  var client = https.get('https://stagecraft.preview.performance.service.gov.uk/public/dashboards', function(sRes) {
    var data = '';
    sRes.on('data', function(chunk) {
      data += chunk;
    }).on('end', function() {
      // parse meta data
      var dashboards = JSON.parse(data)['items'];

      var contentDashboards = dashboards.filter(
        dashboardType(['content'])
      ).filter(function(d) {
        return d['slug'] !== 'site-activity';
      }).sort(serviceSort);;

      var services = dashboards.filter(dashboardType(['transaction', 'other'])).sort(serviceSort);
      var serviceGroups = dashboards.filter(dashboardType(['service-group'])).sort(serviceSort);;
      var highVolumeServices = dashboards.filter(dashboardType(['high-volume-transaction'])).sort(serviceSort);;

      var dashboardComponents = require('server/components/homepage');

      // render content
      var layoutTemplate = loadTemplate(__dirname + '/node_modules/govuk_template_mustache/views/layouts/govuk_template.html');
      var contentTemplate = loadTemplate(__dirname + '/server/templates/homepage.html');
      res.send(Mustache.render(layoutTemplate, {
        assetPath: '/assets/',
        pageTitle: 'GOV.UK – Performance',
        content: Mustache.render(contentTemplate, {
          serviceDashboard: dashboardComponents.ServiceDashboard(services, serviceGroups)
        })
      }));
    });
  }).on('error', function(e) {
    res.status(500);
  });
});

function serviceSort(a, b) {
  return a.title.toUpperCase().localeCompare(b.title.toUpperCase());
};

function dashboardType(types) {
  return function(d) {
    return types.indexOf(d['dashboard-type']) != -1;
  }
}

function loadTemplate(path) {
  return fs.readFileSync(path, {
    encoding: 'utf-8'
  });
}

app.get('/performance/*', function (req, res) {
  res.send("Dashboard template"); 
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

})
