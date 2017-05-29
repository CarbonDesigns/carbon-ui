import React from "react";
import {FormattedMessage} from "react-intl";

export function FormGroup(props) {
    return <div className="form__group">
        <div className="form__heading">
            <h6><FormattedMessage id={props.name}/></h6>
        </div>
        {props.children}

    </div> ;
}

export function FormLine(props) {
    return <section className="form__line">
        {props.children}
    </section> ;
}