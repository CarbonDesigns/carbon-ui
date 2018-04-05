import * as React from "react";
import * as ReactDom from "react-dom";
// import Router, { RouteConfig } from "react-router/Router";
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
// import browserHistory from "react-router/browserHistory";
import { IntlProvider, addLocaleData } from 'react-intl';
import * as en from 'react-intl/locale-data/en';
import * as ru from 'react-intl/locale-data/ru';
import messages from "./i18n/en.js";

import Root from "./Root";
import "./Index.less";

import { loadCore } from "./CarbonLoader";
import { backend, logger } from "carbon-api";
import { hot } from "react-hot-loader";
import { RenewToken } from "./account/RenewToken";
import { ExternalLogin } from "./account/ExternalLogin";
import { IRouteComponentProps } from "./RouteComponent";
import { LandingSelector } from "./LandingSelector";
import { LandingPage } from "./landing/LandingPage";

var currentLocale = "en";
addLocaleData([...en, ...ru]);

interface AsyncComponentProps {
    loader: () => Promise<any>;
    routeProps?: any;
    loadCore?: boolean;
}
class AsyncComponent extends React.PureComponent<AsyncComponentProps, any> {
    private component: any;
    private updateOnMount: boolean;
    private mounted: boolean;
    private loading = false;

    componentDidMount() {
        this.mounted = true;
        if (this.updateOnMount) {
            this.updateOnMount = false;
            this.forceUpdate();
        }
    }

    render() {
        if (this.component) {
            return <this.component {...this.props.routeProps} />;
        }

        if (!this.loading) {
            this.loading = true;
            this.load().finally(() => this.loading = false);
        }

        return <div></div>
    }

    private load() {
        let core = this.props.loadCore ? loadCore() : Promise.resolve();
        return core
            .then(() => this.props.loader())
            .then((component) => {
                this.component = component.default;
                if (this.mounted) {
                    this.forceUpdate();
                }
                else {
                    this.updateOnMount = true;
                }
                return component;
            })
            .catch((reason) => {
                this.component = <div>error</div>;
                if (this.mounted) {
                    this.forceUpdate();
                }
                else {
                    this.updateOnMount = true;
                }
                return reason;
            });
    }
}

// const {whyDidYouUpdate} = require('why-did-you-update');
// whyDidYouUpdate(React);

// const rootRoute = {
//     childRoutes: [
//         {
//             path: "/",
//             indexRoute: {
//                 component: require("./LandingSelector")
//             },
//             childRoutes: [
//                 {
//                     component: require("./WebPage"),
//                     childRoutes: [
//                         {
//                             path: "@:companyName",
//                             getComponent(nextState, cb) {
//                                 require.ensure([], (require) => {
//                                     cb(null, require("./dashboard/DashboardPage"));
//                                 }, "dashboard");
//                             }
//                         },
//                         {
//                             path: "library(/:resourceId)",
//                             getComponent(nextState, cb) {
//                                 require.ensure([], (require) => {
//                                     cb(null, require("./communityLibrary/CommunityLibrary"));
//                                 }, "library");
//                             }
//                         },
//                         {
//                             path: "thankyou",
//                             getComponent(nextState, cb) {
//                                 require.ensure([], (require) => {
//                                     cb(null, require("./landing/message"));
//                                 }, "thankyou");
//                             }
//                         },
//                         {
//                             path: "e/:code",
//                             getComponent(nextState, cb) {
//                                 require.ensure([], (require) => {
//                                     cb(null, require("./ErrorPage"));
//                                 }, "other");
//                             }
//                         },
//                         {
//                             path: "i/:code",
//                             getComponent(nextState, cb) {
//                                 require.ensure([], (require) => {
//                                     cb(null, require("./InfoPage"));
//                                 }, "other");
//                             }
//                         },

//                         {
//                             path: "settings(/:id)",
//                             getComponent(nextState, cb) {
//                                 require.ensure([], (require) => {
//                                     cb(null, require("./account/AccountOverview"));
//                                 }, "account");
//                             }
//                         },
//                         {
//                             path: "account/forgotPassword",
//                             getComponent(nextState, cb) {
//                                 require.ensure([], (require) => {
//                                     cb(null, require("./account/ForgotPassword"));
//                                 }, "account");
//                             }
//                         },
//                         {
//                             path: "account/resetPassword/:token",
//                             getComponent(nextState, cb) {
//                                 require.ensure([], (require) => {
//                                     cb(null, require("./account/ResetPassword"));
//                                 }, "account");
//                             }
//                         },
//                         {
//                             path: "login",
//                             getComponent(nextState, cb) {
//                                 require.ensure([], (require) => {
//                                     cb(null, require("./account/LoginPage"));
//                                 }, "account");
//                             }
//                         },
//                         {
//                             path: "register",
//                             getComponent(nextState, cb) {
//                                 require.ensure([], (require) => {
//                                     cb(null, require("./account/RegistrationPage"));
//                                 }, "account");
//                             }
//                         },
//                     ]
//                 },
//             ]
//         },
//         {
//             path: "landing",
//             getComponent(nextState, cb) {
//                 require.ensure([], (require) => {
//                     cb(null, require("./landing/LandingPage"));
//                 }, "landing");
//             }
//         },
//         {
//             path: "app(/@:companyName)(/:appId)",
//             getComponent(nextState, cb) {
//                 loadCore(() => {
//                     require.ensure([], (r) => {
//                         cb(null, require("./AppStart"));
//                     }, "app-start");
//                 });
//             }
//         },

//         {
//             path: 'm',
//             getComponent(nextState, cb) {
//                 require.ensure([], (require) => {
//                     cb(null, require("./preview/Instructions"));
//                 }, "preview-index");
//             }
//         },
//         {
//             path: "m/app(/@:companyName)(/:appId)",
//             getComponent(nextState, cb) {
//                 loadCore(() => {
//                     require.ensure([], (r) => {
//                         cb(null, require("./mirroring/MirroringAppStart"));
//                     }, "mirroring-app-start");
//                 });
//             }
//         },
//         {
//             path: "m/:code",
//             getComponent(nextState, cb) {
//                 loadCore(() => {
//                     require.ensure([], (r) => {
//                         cb(null, require("./mirroring/MirroringAppStart"));
//                     }, "mirroring-app-code");
//                 });
//             }
//         },
//         {
//             path: "p/app(/@:companyName)(/:appId)",
//             getComponent(nextState, cb) {
//                 loadCore(() => {
//                     require.ensure([], (r) => {
//                         cb(null, require("./preview/PreviewAppStart"));
//                     }, "preview-app-start");
//                 });
//             }
//         },
//         {
//             path: "q/:code",
//             getComponent(nextState, cb) {
//                 loadCore(() => {
//                     require.ensure([], (r) => {
//                         cb(null, require("./quick/QuickApp"));
//                     }, "quick-app-start");
//                 });
//             }
//         },

//         {
//             path: "a/renew",
//             component: require("./account/RenewToken")
//         },
//         {
//             path: "a/external",
//             component: require("./account/ExternalLogin")
//         },

//         {
//             path: "*",
//             getComponent(nextState, cb) {
//                 require.ensure([], (require) => {
//                     cb(null, require("./PageNotFound"));
//                 }, "page-not-found");
//             }
//         }
//     ]
// };

backend.loginNeeded.bind(isGuest => {
    //browserHistory.push("/login");
});

const onRouterUpdate = () => {
    logger.trackPageView();
    window.scrollTo(0, 0);
}

const appStartChunk = props => <AsyncComponent routeProps={props} loadCore loader={() => import(/* webpackChunkName: "app-start" */ "./AppStart")} />;
const quickAppStartChunk = props => <AsyncComponent routeProps={props} loadCore loader={() => import(/* webpackChunkName: "quick-app-start" */ "./quick/QuickApp")} />;
const mirrorringAppStartChunk = props => <AsyncComponent routeProps={props} loadCore loader={() => import(/* webpackChunkName: "mirroring-app-start" */ "./mirroring/MirroringAppStart")} />;
const previewAppStartChunk = props => <AsyncComponent routeProps={props} loadCore loader={() => import(/* webpackChunkName: "preview-app-start" */ "./preview/PreviewAppStart")} />;

const previewIndexChunk = props => <AsyncComponent routeProps={props} loader={() => import(/* webpackChunkName: "preview-index" */ "./preview/Instructions")} />;
const pageNotFoundChunk = props => <AsyncComponent routeProps={props} loader={() => import(/* webpackChunkName: "page-not-found" */ "./PageNotFound")} />;

ReactDom.render(
    <BrowserRouter>
        <IntlProvider locale={currentLocale} messages={messages}>
            <Root>
                <Route exact path='/' component={LandingSelector} />
                <Route path='/landing' component={LandingPage} />
                <Route path='/app(/@:companyName)?(/:appId)?' render={appStartChunk} />
                <Route path='/m' render={previewIndexChunk} />
                <Route path='/q/:code' render={quickAppStartChunk} />
                <Route path='/m/app(/@:companyName)(/:appId)' render={mirrorringAppStartChunk} />
                <Route path='/m/:code' render={mirrorringAppStartChunk} />
                <Route path='/p/app(/@:companyName)(/:appId)' render={previewAppStartChunk} />

                <Route path='/a/renew' component={RenewToken} />
                <Route path='/a/external' component={ExternalLogin} />

                {/* <Route render={pageNotFoundChunk} /> */}
            </Root>
        </IntlProvider>
    </BrowserRouter>,
    document.getElementById("reactContainer"));