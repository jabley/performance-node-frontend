var React = require('react'),
  DOM = React.DOM,
  a = DOM.a,
  aside = DOM.aside,
  dd = DOM.dd,
  div = DOM.div,
  dl = DOM.dl,
  dt = DOM.dt,
  footer = DOM.footer,
  h1 = DOM.h1,
  h2 = DOM.h2,
  h3 = DOM.h3,
  header = DOM.header,
  li = DOM.li,
  main = DOM.main,
  ol = DOM.ol,
  p = DOM.p,
  section = DOM.section,
  span = DOM.span,
  strong = DOM.strong,
  ul = DOM.ul;

var DashboardHeadingClass = React.createClass({
  // We initialise its state by using the `props` that were passed in when it
  // was first rendered.
  getInitialState: function() {
    return {
      dashboard: this.props.dashboard
    }
  },

  render: function() {
    return header(null,
      DashboardBannerComponent({ dashboard: this.state.dashboard }),
      DashboardAsideComponent({ dashboard: this.state.dashboard })
    );
  }
});

var DashboardHeadingComponent = React.createFactory(DashboardHeadingClass);

exports.DashboardHeading = function (dashboard) {
  return React.renderToStaticMarkup(DashboardHeadingComponent({
    dashboard: dashboard
  }));
};

var DashboardBannerClass = React.createClass({
  // We initialise its state by using the `props` that were passed in when it
  // was first rendered.
  getInitialState: function() {
    return {
      dashboard: this.props.dashboard
    }
  },

  render: function() {
    return main(null,
      h1(null,
        span({className: 'strapline'}, 'Dashboard'),
        this.state.dashboard.title
      ),
      p({className: 'tagline'}, 
        'This dashboard shows information about how the ',
        strong(null, this.state.dashboard.title),
        ' is currently performing'
      )
    );
  }  
})

var DashboardBannerComponent = React.createFactory(DashboardBannerClass);

var DashboardAsideClass = React.createClass({
  // We initialise its state by using the `props` that were passed in when it
  // was first rendered.
  getInitialState: function() {
    return {
      dashboard: this.props.dashboard
    }
  },

  render: function() {
    return aside({role: 'complementary'},
      div({className: 'related-pages'},
        div({
          className: 'related-transaction',
          itemScope: 'itemscope',
          itemProp: 'http://schema.org/GovernmentService'
        },
          h3(null, 'Visit this service'),
          a({
            itemProp: 'name',
            href: this.state.dashboard.relatedPages.transaction.url
          },
          this.state.dashboard.relatedPages.transaction.title)
        )
      ),
      div({className: 'big-screen-link-container'},
        h3(null, 'View the dashboard'),
        a({
          className: 'big-screen-link',
          href: 'https://www.performance.service.gov.uk/big-screen/' + this.state.dashboard.slug
        }, 'Full screen mode')
      )
    );
  }  
})

var DashboardAsideComponent = React.createFactory(DashboardAsideClass);
