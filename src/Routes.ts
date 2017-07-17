import { loadCore } from "./CarbonLoader";

export default {
    childRoutes: [
        {
            path: "/landing",
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    cb(null, require("./landing/LandingPage"));
                }, "landing");
            }
        },
        {
            path: "app(/@:companyName)(/:appId)",
            getComponent(nextState, cb) {
                loadCore(() => {
                    require.ensure([], (r) => {
                        cb(null, require("./AppStart"));
                    }, "app-start");
                });
            }
        },

        {
            path: 'm',
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    cb(null, require("./preview/Instructions"));
                }, "preview-index");
            }
        },
        {
            path: "m/app(/@:companyName)(/:appId)",
            getComponent(nextState, cb) {
                loadCore(() => {
                    require.ensure([], (r) => {
                        cb(null, require("./mirroring/MirroringAppStart"));
                    }, "mirroring-app-start");
                });
            }
        },
        {
            path: "m/:code",
            getComponent(nextState, cb) {
                loadCore(() => {
                    require.ensure([], (r) => {
                        cb(null, require("./mirroring/MirroringAppStart"));
                    }, "mirroring-app-code");
                });
            }
        },
        {
            path: "p/app(/@:companyName)(/:appId)",
            getComponent(nextState, cb) {
                loadCore(() => {
                    require.ensure([], (r) => {
                        cb(null, require("./preview/PreviewAppStart"));
                    }, "preview-app-start");
                });
            }
        },
        {
            path: "q/:code",
            getComponent(nextState, cb) {
                loadCore(() => {
                    require.ensure([], (r) => {
                        cb(null, require("./quick/QuickApp"));
                    }, "quick-app-start");
                });
            }
        },
        {
            path: "e/:code",
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    cb(null, require("./ErrorPage"));
                }, "other");
            }
        },
        {
            path: "i/:code",
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    cb(null, require("./InfoPage"));
                }, "other");
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
            path: "account",
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    cb(null, require("./account/AccountOverview"));
                }, "account");
            }
        },
        {
            path: "account/forgotPassword",
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    cb(null, require("./account/ForgotPassword"));
                }, "account");
            }
        },
        {
            path: "account/resetPassword/:token",
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    cb(null, require("./account/ResetPassword"));
                }, "account");
            }
        },
        {
            path: "/login",
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    cb(null, require("./account/LoginPage"));
                }, "account");
            }
        },
        {
            path: "/register",
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    cb(null, require("./account/RegistrationPage"));
                }, "account");
            }
        },

        {
            path: "/@:companyName",
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    cb(null, require("./dashboard/DashboardPage"));
                }, "dashboard");
            }
        },

        {
            path: "/",
            component: require("./LandingSelector")
        },

        {
            path: "*",
            getComponent(nextState, cb) {
                require.ensure([], (require) => {
                    cb(null, require("./PageNotFound"));
                }, "page-not-found");
            }
        }
    ]
};