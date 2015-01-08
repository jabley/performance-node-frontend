var Mustache = require('mustache')
  Dashboard = require('performanceplatform-client.js'),
  express = require('express'),
  fs = require('fs'),
  request = require('request')
  Q = require('q');

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

    var datasources = [], // A array of all backing services to talk to
      modules = dashboard.modules;

    for (var i = 0, len = modules.length; i < len; i++) {
      var m = modules[i];
      if (m.tabs) {
        for (var j = 0, n = m.tabs.length; j < n; j++) {
          datasources.push[m.tabs[j]['data-source']];
        }
      } else {
        datasources.push(m['data-source']);
      }
    }

    // Remove duplicate requests to backing services
    var jobURLs = datasources.map(dataURL).reduce(function(p, c) {
        if (p.indexOf(c) < 0) {
          p.push(c);
        }
        return p;
    }, []);

    // Provide a way of mapping URLs to results
    var jobs = jobURLs.map(function (url) {
      return {
        url: url,
        rp: requestPromise({url: url})
      };
    });

    // Want an array of promises to play with
    var backingServiceRequests = jobs.map(function (job) {
      return job.rp;
    })

    // Wait for all the promises to complete
    Q.allSettled(backingServiceRequests)
    .then(function (results) {
      var dashboardComponents = require('server/components/dashboard');

      //render the template
      render(res, '/server/templates/dashboard.html', {
        dashboardHeading: dashboardComponents.DashboardHeading(dashboard),
        dashboardFooter: dashboardComponents.DashboardFooter(dashboard)
      });
    });
  })
  .catch(function (error) {
    console.log(error);
    res.status(500);
  });
});

function dataURL(datasource) {
  var baseURL = 'https://www.performance.service.gov.uk/data/' +
    datasource['data-group'] + '/' + datasource['data-type'];
  var qs = queryString(datasource['query-params']);
  return baseURL + (qs.length > 0 ? '?' + qs : '');
}

function queryString(queryParams) {
  var params = [
    'sort_by',
    'duration',
    'period',
    'group_by',
    'limit',
    'start_at',
    'end_at',
  ].map(function (p) {
    if (queryParams.hasOwnProperty(p) && typeof(queryParams[p]) !== 'object') {
      return p + '=' + queryParams[p];
    }
    return '';
  }).filter(function (e) {
    return e.length > 0;
  });

  var multiParams = [
    'filter_by',
    'group_by',
    'collect',
  ].map(function (p) {
    var result = [];
    if (queryParams.hasOwnProperty(p) && typeof(queryParams[p]) === 'object') {
      for (var i = 0, len = queryParams[p].length; i < len; i++) {
        result.push(p + '=' + queryParams[p][i]);
      }
    }
    return result;
  }).filter(function (e) {
    return e.length > 0;
  });

  for (var i = 0, n = multiParams.length; i < n; i++) {
    params.push.apply(params, multiParams[i]);
  }

  return params.join('&');
}

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
        var msg = 'Unexpected status code: ' + res.statusCode + ' <' + options.url + '>';
        log.error(msg);
        err = new Error(msg);
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
