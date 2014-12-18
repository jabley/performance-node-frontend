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

    var firstHalf = this.state.services.filter(function(service, i) {
      return (i + 1) <= midPoint;
    });
    var secondHalf = this.state.services.filter(function(service, i) {
      return (i + 1) > midPoint;
    });

    return section({id: 'service-dashboards'}, 
      h2(null, 'Service dashboards'),
      div({className: 'service-listing'}, 
        h3(null, 'Detailed dashboards'),
        p({className: 'count'}, this.state.services.length + this.state.serviceGroups.length)),
      div(null,
        p(null ,'Services providing regularly updated, detailed data to GOV.UK'),
        div({className: 'service-listing'},
          ul({children: firstHalf.map(function(service) {
              return li(null,
                a({ href: '/performance/' + service.slug}, service.title));
          })
        })),
        div({className: 'service-listing'},
          ul({children: secondHalf.map(function(service) {
              return li(null,
                a({ href: '/performance/' + service.slug}, service.title));
          })}),
          dl(null,
            dt({className: 'service_groups'}, 'Service Groups'),
            dl(null,
              ol({children: this.state.serviceGroups.map(function (service) {
              return li(null,
                a({ href: '/performance/' + service.slug}, service.title));
              })})
            )
          )
        )
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
