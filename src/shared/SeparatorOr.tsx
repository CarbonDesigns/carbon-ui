import React from "react";
import {FormattedMessage} from "react-intl";

export default function(default_message, id="translateme"){
    return <p className="separator-or"><FormattedMessage id={id} defaultMessage={default_message}/></p>
}

