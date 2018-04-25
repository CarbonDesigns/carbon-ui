import * as React from "react";
import * as ReactDom from "react-dom";
import * as cx from "classnames";
import {Component} from "../../CarbonFlux";
import {richApp} from "../../RichApp";
import FlyoutButton from "../../shared/FlyoutButton";

import ViewSettingsPopup from "./ViewSettings/ViewSettingsPopup";

export default class ViewSettingsButton extends Component<any>{
    refs: {
        button:HTMLElement;
    }
    constructor(props){
        super(props);
    }

    onOpened = () => {
        var node = this.refs.button;
        node.classList.add("_active");
    };

    onClosed = () => {
        var node = this.refs.button;
        node.classList.remove("_active");
    };

    renderIcon():any {

    }

    render(){
        var classes = cx(this.props.className, "drop drop-down", "view-settings");
        return <FlyoutButton className={classes} ref="button"
                             renderContent={this.renderIcon}
                             position={{targetVertical: "bottom", targetHorizontal: "right", disableAutoClose: true}}
                             onOpened={this.onOpened}
                             onClosed={this.onClosed}>
            <ViewSettingsPopup ref="popup" />
        </FlyoutButton>;
    }
}