var React = require('react'),
  DOM = React.DOM,
  div = DOM.div,
  h2 = DOM.h2,
  h3 = DOM.h3,
  section = DOM.section,
  p = DOM.p,
  ul = DOM.ul,
  li = DOM.li,
  a = DOM.a,
  dt = DOM.dt,
  dl = DOM.dl,
  dd = DOM.dd,
  ol = DOM.ol
  strong = DOM.strong;

function partition(list, predicate) {
  var groups = {yes: [], no: []};
  for(var i = 0, len = list.length; i < len; i++) {
    var item = list[i];
    if (predicate(item, i)) {
      groups.yes.push(item);
    } else {
      groups.no.push(item);
    }
  }
  return [groups.yes, groups.no];
}

var ServiceDashboardClass = React.createClass({
  // We initialise its state by using the `props` that were passed in when it
  // was first rendered.
  getInitialState: function() {
    return {
      services: this.props.services,
      serviceGroups: this.props.serviceGroups
    }
  },

  // For ease of illustration, we just use the React JS methods directly
  // (no JSX compilation needed)
  render: function() {
    var midPoint = Math.ceil((this.state.services.length + this.state.serviceGroups.length) / 2);

    var groups = partition(this.state.services, function(service, i) {
      return (i + 1) <= midPoint;
    });

    var firstHalf = groups[0],
        secondHalf = groups[1];

    return section({id: 'service-dashboards'}, 
      h2(null, 'Service dashboards'),
      div({className: 'service-listing'}, 
        h3(null, 'Detailed dashboards'),
        p({className: 'count'}, this.state.services.length + this.state.serviceGroups.length)),
      div(null,
        p(null ,'Services providing regularly updated, detailed data to GOV.UK'),
        ServiceListComponent({items: firstHalf}),
        ServiceListComponent({items: secondHalf, sibling: dl(null,
            dt({className: 'service_groups'}, 'Service Groups'),
            dl(null,
              ol({children: this.state.serviceGroups.map(function (service) {
              return li(null,
                a({ href: '/performance/' + service.slug}, service.title));
              })})
            )
          )
        })
      )
    );
  },
});

var ServiceDashboardComponent = React.createFactory(ServiceDashboardClass);

exports.ServiceDashboard = function (services, serviceGroups) {
  return React.renderToStaticMarkup(ServiceDashboardComponent({
    services: services,
    serviceGroups: serviceGroups
  }));
};

var OverviewDashboardClass = React.createClass({

  // We initialise its state by using the `props` that were passed in when it
  // was first rendered.
  getInitialState: function() {
    return {
      highVolumeServices: this.props.highVolumeServices
    }
  },

  // For ease of illustration, we just use the React JS methods directly
  // (no JSX compilation needed)
  render: function() {
    return section({id: 'overview-dashboards'},
        div({className: 'service-listing'},
          h3(null, 'Overview dashboards'),
          p({className: 'count'}, this.state.highVolumeServices.length)),
        div(null,
          p(null, 'Services providing quarterly data to GOV.UK'),
          p(null,
            a({href: '/performance/services'}, strong(null, 'View all services'))))
      );
  }
});

var OverviewDashboardComponent = React.createFactory(OverviewDashboardClass);

exports.OverviewDashboard = function (highVolumeServices) {
  return React.renderToStaticMarkup(OverviewDashboardComponent({
    highVolumeServices: highVolumeServices
  }));
}

var ActivityDashboardClass = React.createClass({

  // We initialise its state by using the `props` that were passed in when it
  // was first rendered.
  getInitialState: function() {
    return {
      contentDashboards: this.props.contentDashboards
    }
  },

  render: function() {
    var midPoint = Math.ceil(this.state.contentDashboards.length / 2);

    var groups = partition(this.state.contentDashboards, function (dashboard, i) {
      return (i + 1) <= midPoint;
    });

    var firstHalf = groups[0],
      secondHalf = groups[1];

    return section({id: 'activity-dashboards'},
      h2(null, 'GOV.UK activity dashboards'),
      div({className:'cols3 service-listing'},
        h3(null, 'Activity dashboards'),
        p({className: 'count'}, this.state.contentDashboards.length + 1)
      ),
      div({className: 'cols3 add3'},
        p(null, 'Web traffic on our site, including a look at how our content is being used.'),
        p(null,
          a({href:'/performance/site-activity'},
            strong(null, 'GOV.UK site activity overview')
          )
        ),
        h3({className: 'underline'}, 'Department activity dashboards'),
        ServiceListComponent({items: firstHalf}),
        ServiceListComponent({items: secondHalf})
      )
    );
  }
});

var ActivityDashboardComponent = React.createFactory(ActivityDashboardClass);

exports.ActivityDashboard = function (contentDashboards) {
  return React.renderToStaticMarkup(ActivityDashboardComponent({
    contentDashboards: contentDashboards
  }));
};

var ServiceListClass = React.createClass({
  getInitialState: function() {
    return {
      items: this.props.items,
      sibling: this.props.sibling
    };
  },

  render: function() {
    var sibling = this.state.sibling;

    if (sibling) {
      return div({className: 'service-listing'},
        ul({children: this.state.items.map(function(service) {
            return li(null,
              a({ href: '/performance/' + service.slug}, service.title));
        })}),
        sibling);
    } else {
      return div({className: 'service-listing'},
        ul({children: this.state.items.map(function(service) {
            return li(null,
              a({ href: '/performance/' + service.slug}, service.title));
        })}));
    }
  }
});

var ServiceListComponent = React.createFactory(ServiceListClass);
