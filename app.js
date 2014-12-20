var Mustache = require('mustache')
  Dashboard = require('performanceplatform-client.js'),
  express = require('express'),
  fs = require('fs'),
  request = require('request')
  Q = require('q'),
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
  requestPromise({
    url: 'https://stagecraft.production.performance.service.gov.uk' + '/public/dashboards'
  })
  .then(function (data) {
    return JSON.parse(data)['items'];
  })
  .then(function (dashboards) {
    var contentDashboards = dashboards.filter(
      dashboardType(['content'])
    ).filter(function(d) {
      return d['slug'] !== 'site-activity';
    }).sort(serviceSort);

    var services = dashboards.filter(dashboardType(['transaction', 'other'])).sort(serviceSort);
    var serviceGroups = dashboards.filter(dashboardType(['service-group'])).sort(serviceSort);;
    var highVolumeServices = dashboards.filter(dashboardType(['high-volume-transaction'])).sort(serviceSort);;

    var homepageComponents = require('server/components/homepage');

    // render content
    render(res, '/server/templates/homepage.html', {
      serviceDashboard: homepageComponents.ServiceDashboard(services, serviceGroups),
      overviewDashboard: homepageComponents.OverviewDashboard(highVolumeServices),
      activityDashboard: homepageComponents.ActivityDashboard(contentDashboards)
    });
  })
  .catch(function(e) {
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

app.get('/performance/services', function (req, res) {
  render(res, '/server/templates/services.html');
});

app.get('/performance/*', function (req, res) {
  new Dashboard().getConfig(req.path.substring('/performance/'.length))
  .then(function (dashboardConfig) {
    return JSON.parse(dashboardConfig);
  })
  .then(function (dashboard) {
    var dashboardComponents = require('server/components/dashboard');

    //render the template
    render(res, '/server/templates/dashboard.html', {
      dashboardHeading: dashboardComponents.DashboardHeading(dashboard)
    });
  })
  .catch(function (error) {
    console.log(error);
    res.status(500);
  });
});

function render(res, template, contentOptions) {
  contentOptions = contentOptions || {};

  var layoutTemplate = loadTemplate(__dirname + '/node_modules/govuk_template_mustache/views/layouts/govuk_template.html');
  var contentTemplate = loadTemplate(__dirname + template);
  res.send(Mustache.render(layoutTemplate, {
    assetPath: '/assets/',
    pageTitle: 'GOV.UK – Performance',
    content: Mustache.render(contentTemplate, contentOptions)
  }));
}

function requestPromise (options, logger) {
  var deferred = Q.defer();
  var log = logger || console;
  options = options || {};

  if (options.url) {
    log.info('Making a request to:', options.url);

    request(options, function (err, res, body) {
      if (err) {
        return deferred.reject(err);
      } else if (res.statusCode !== 200) {
        log.error('Unexpected status code: ' + res.statusCode);
        err = new Error('Unexpected status code: ' + res.statusCode);
        err.res = res;
        return deferred.reject(err);
      }
      return deferred.resolve(body);
    });
  } else {
    deferred.reject(
      new Error('Please provide a url to query')
    );
  }

  return deferred.promise;
};

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

})
