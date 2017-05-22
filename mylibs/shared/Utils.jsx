import React from "react";
import {FormattedHTMLMessage} from "react-intl";

export function say(defaultMessage, id="translateme", tag="span"){
    var props;
    if (typeof defaultMessage === 'string') {
        props = {id, defaultMessage, tagName:tag};
    }
    else {
        props = Object.assign({id, tagName:tag}, defaultMessage); //todo finish later
    }
    return React.createElement(FormattedHTMLMessage, props);
}

export function ico(ico){
    return <i className={"ico--"+ico}/>
}

export function nodeOffset(elem, parentElem){
    var box    = {top: 0, left: 0},
        parent = {top: 0, left: 0};

    if (typeof elem.getBoundingClientRect === "function") {
        box    = elem.getBoundingClientRect();
        parent = parentElem.getBoundingClientRect();
    }

    return {
        top : box.top  - (parent.top   )  ,
        left: box.left - (parent.left )
    };
}
