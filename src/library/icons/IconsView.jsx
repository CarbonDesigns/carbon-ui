import React from "react";

import IconsList from "./IconsList";
import {Component} from "../../CarbonFlux";
import {FormattedHTMLMessage} from "react-intl";

export default class IconsView extends Component{
    render(){
        return <div>
            {this.props.config && this.props.config.groups.map(g => {
                return <section className="stencils-group" key={g.name}>
                    <div className="stencils-group__name">
                        <FormattedHTMLMessage tagName="strong" id={g.name}/>
                    </div>
                    {/*<IconsList icons={g.templates}/>*/}
                </section>
            })}
        </div>;
    }
}
