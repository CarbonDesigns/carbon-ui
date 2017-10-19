import React from "react";
import ReactDom from "react-dom";
import Router, { RouteConfig } from "react-router/lib/Router";
import browserHistory from "react-router/lib/browserHistory";
import {IntlProvider, addLocaleData} from 'react-intl';
import en from 'react-intl/locale-data/en';
import ru from 'react-intl/locale-data/ru';

import messages from "./i18n/en.js";

import Root from "./Root";
import "./Index.less";

var currentLocale = "en";
addLocaleData([...en, ...ru]);

import { loadCore } from "./CarbonLoader";
import { backend, logger } from "carbon-api";

// const {whyDidYouUpdate} = require('why-did-you-update');
// whyDidYouUpdate(React);

const rootRoute = {
    childRoutes: [
        {
            path: "/",
            indexRoute: {
                component: require("./LandingSelector")
            },
            childRoutes: [
                {
                    component: require("./WebPage"),
                    childRoutes: [
                        {
                            path: "@:companyName",
                            getComponent(nextState, cb) {
                                require.ensure([], (require) => {
                                    cb(null, require("./dashboard/DashboardPage"));
                                }, "carbon-dashboard");
                            }
                        },
                        {
                            path: "library(/:resourceId)",
                            getComponent(nextState, cb) {
                                require.ensure([], (require) => {
                                    cb(null, require("./communityLibrary/CommunityLibrary"));
                                }, "carbon-library");
                            }
                        },
                        {
                            path: "thankyou",
                            getComponent(nextState, cb) {
                                require.ensure([], (require) => {
                                    cb(null, require("./landing/message"));
                                }, "carbon-thankyou");
                            }
                        },
                        {
                            path: "e/:code",
                            getComponent(nextState, cb) {
                                require.ensure([], (require) => {
                                    cb(null, require("./ErrorPage"));
                                }, "carbon-other");
                            }
                        },
                        {
                            path: "i/:code",
                            getComponent(nextState, cb) {
                                require.ensure([], (require) => {
                                    cb(null, require("./InfoPage"));
                                }, "carbon-other");
                            }
                        },

                        {
                            path: "settings(/:id)",
                            getComponent(nextState, cb) {
                                require.ensure([], (require) => {
                                    cb(null, require("./account/AccountOverview"));
                                }, "carbon-account");
                            }
                        },
                        {
                            path: "account/forgotPassword",
                            getComponent(nextState, cb) {
                                require.ensure([], (require) => {
                                    cb(null, require("./account/ForgotPassword"));
                                }, "carbon-account");
                            }
                        },
                        {
                            path: "account/resetPassword/:token",
                            getComponent(nextState, cb) {
                                require.ensure([], (require) => {
                                    cb(null, require("./account/ResetPassword"));
                                }, "carbon-account");
                            }
                        },
                        {
                            path: "login",
                            getComponent(nextState, cb) {
                                require.ensure([], (require) => {
                                    cb(null, require("./account/LoginPage"));
                                }, "carbon-account");
                            }
                        },
                        {
                            path: "register",
                            getComponent(nextState, cb) {
                                require.ensure([], (require) => {
                                    cb(null, require("./account/RegistrationPage"));
                                }, "carbon-account");
                            }
                        },
                    ]
                },
            ]
        },
        {
            path: "landing",
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    cb(null, require("./landing/LandingPage"));
                }, "carbon-landing");
            }
        },
        {
            path: "app(/@:companyName)(/:appId)",
            getComponent(nextState, cb) {
                loadCore(() => {
                    require.ensure([], (r) => {
                        cb(null, require("./AppStart"));
                    }, "carbon-app-start");
                });
            }
        },

        {
            path: 'm',
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    cb(null, require("./preview/Instructions"));
                }, "carbon-preview-index");
            }
        },
        {
            path: "m/app(/@:companyName)(/:appId)",
            getComponent(nextState, cb) {
                loadCore(() => {
                    require.ensure([], (r) => {
                        cb(null, require("./mirroring/MirroringAppStart"));
                    }, "carbon-mirroring-app-start");
                });
            }
        },
        {
            path: "m/:code",
            getComponent(nextState, cb) {
                loadCore(() => {
                    require.ensure([], (r) =>{
                        cb(null, require("./mirroring/MirroringAppStart"));
                    }, "carbon-mirroring-app-code");
                });
            }
        },
        {
            path: "p/app(/@:companyName)(/:appId)",
            getComponent(nextState, cb) {
                loadCore(() => {
                    require.ensure([], (r) =>{
                        cb(null, require("./preview/PreviewAppStart"));
                    }, "carbon-preview-app-start");
                });
            }
        },
        {
            path: "q/:code",
            getComponent(nextState, cb) {
                loadCore(() => {
                    require.ensure([], (r) => {
                        cb(null, require("./quick/QuickApp"));
                    }, "carbon-quick-app-start");
                });
            }
        },

        {
            path: "a/renew",
            component: require("./account/RenewToken")
        },
        {
            path: "a/external",
            component: require("./account/ExternalLogin")
        },

        {
            path: "*",
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    cb(null, require("./PageNotFound"));
                }, "carbon-page-not-found");
            }
        }
    ]
};

backend.loginNeeded.bind(isGuest => {
    browserHistory.push("/login");
});

const onRouterUpdate = () => {
    logger.trackPageView();
    window.scrollTo(0, 0);
}

ReactDom.render((
    <IntlProvider locale={currentLocale} messages={messages}>
        <Root>
            <Router onUpdate={onRouterUpdate} history={browserHistory} routes={rootRoute}/>
        </Root>
    </IntlProvider>
), document.getElementById("reactContainer"));