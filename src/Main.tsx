import React from "react";
import ReactDom from "react-dom";
import { AppContainer } from 'react-hot-loader';
import { IntlProvider, addLocaleData } from 'react-intl';
import Root from "./Root";
import "./Index.less";
import en from 'react-intl/locale-data/en';
import ru from 'react-intl/locale-data/ru';
import messages from "./i18n/en.js";

let currentLocale = "en";
addLocaleData([...en, ...ru]);

let renderApp = CurrentRoot => {
    ReactDom.render((
        <AppContainer>
            <IntlProvider locale={currentLocale} messages={messages}>
                <CurrentRoot/>
            </IntlProvider>
        </AppContainer>
    ), document.getElementById("reactContainer"));
}

renderApp(Root);

if (module.hot) {
    module.hot.accept(() => {
        const NextRoot = require("./Root");
        renderApp(NextRoot);
    });
}