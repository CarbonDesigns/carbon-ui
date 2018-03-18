import React from "react";
import ReactDom from "react-dom";
// import Router, { RouteConfig } from "react-router/Router";
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
// import browserHistory from "react-router/browserHistory";
import { IntlProvider, addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import ru from 'react-intl/locale-data/ru';

import messages from "./i18n/en.js";

import Root from "./Root";
import "./Index.less";

var currentLocale = "en";
addLocaleData([...en, ...ru]);

import { loadCore } from "./CarbonLoader";
import { backend, logger } from "carbon-api";

class AsyncComponent extends React.PureComponent<{ asyncComponent: (resolve: any, reject: any) => void; }, any> {
    private component: any;
    private promise: any;
    private updateOnMount: boolean;
    private mounted: boolean;

    componentDidMount() {
        this.mounted = true;
        if (this.updateOnMount) {
            this.updateOnMount = false;
            this.forceUpdate();
        }
    }

    render() {
        if (this.component) {
            return this.component;
        }
        if (!this.promise) {
            this.promise = new Promise((resolve, reject) => {
                this.props.asyncComponent(resolve, reject);
            }).then((component) => {
                this.component = component;
                this.promise = null;
                if (this.mounted) {
                    this.forceUpdate();
                } else {
                    this.updateOnMount = true;
                }
                return component;
            }).catch((reason) => {
                this.component = <div>error</div>;
                this.promise = null;
                if (this.mounted) {
                    this.forceUpdate();
                } else {
                    this.updateOnMount = true;
                }
                return reason;
            })
        }

        return <div></div>
    }
}

class TestComponent extends React.Component<any, any>
{
    render() {
        return <div>datataeasdf</div>
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

ReactDom.render((
    <BrowserRouter>
        <IntlProvider locale={currentLocale} messages={messages}>
            <Root>
                {/* <Route exact path='/' component={ require("./LandingSelector")} /> */}
                <Route path='/landing' render={props => <AsyncComponent asyncComponent={(resolve, reject) => {
                    require.ensure([], (require) => {
                        var factory = React.createFactory(require("./landing/LandingPage"));
                        resolve(factory(props));
                    }, "landing");
                }} />} />
                <Route path='/app(/@:companyName)?(/:appId)?' render={props => <AsyncComponent asyncComponent={(resolve, reject) => {
                    loadCore(() => {
                        require.ensure([], (r) => {
                            var factory = React.createFactory(require("./AppStart"));
                            resolve(factory(props));
                        }, "app-start");
                    });
                }} />} />
                <Route path='m' render={props => <AsyncComponent asyncComponent={(resolve, reject) => {
                    require.ensure([], (require) => {
                        var factory = React.createFactory(require("./preview/Instructions"));
                        resolve(factory(props));
                    }, "preview-index");
                }} />} />
                <Route path='m/app(/@:companyName)(/:appId)' render={props => <AsyncComponent asyncComponent={(resolve, reject) => {
                    loadCore(() => {
                        require.ensure([], (r) => {
                            var factory = React.createFactory(require("./mirroring/MirroringAppStart"));
                            resolve(factory(props));
                        }, "mirroring-app-start");
                    });
                }} />} />
                <Route path='m/:code' render={props => <AsyncComponent asyncComponent={(resolve, reject) => {
                    loadCore(() => {
                        require.ensure([], (r) => {
                            var factory = React.createFactory(require("./mirroring/MirroringAppStart"));
                            resolve(factory(props));
                        }, "mirroring-app-code");
                    });
                }} />} />
                <Route path='p/app(/@:companyName)(/:appId)' render={props => <AsyncComponent asyncComponent={(resolve, reject) => {
                    loadCore(() => {
                        require.ensure([], (r) => {
                            var factory = React.createFactory(require("./preview/PreviewAppStart"));
                            resolve(factory(props));
                        }, "preview-app-start");
                    });
                }} />} />
                <Route path='q/:code' render={props => <AsyncComponent asyncComponent={(resolve, reject) => {
                    loadCore(() => {
                        require.ensure([], (r) => {
                            var factory = React.createFactory(require("./quick/QuickApp"));
                            resolve(factory(props));
                        }, "quick-app-start");
                    });
                }} />} />
                <Route path='a/renew' render={props => {
                    var factory = React.createFactory(require("./account/RenewToken"));
                    return factory(props);
                }} />
                <Route path='a/external' render={props => {
                    var factory = React.createFactory(require("./account/ExternalLogin"));
                    return factory(props);
                }} />
                {/* <Redirect path="*" render={props=><AsyncComponent asyncComponent={(resolve, reject) => {
                        require.ensure([], (require) => {
                            resolve(require("./PageNotFound"));
                        }, "page-not-found");
                    }} />} /> */}
            </Root>
        </IntlProvider>
    </BrowserRouter>
), document.getElementById("reactContainer"));