import React from "react";

//import ImageList from "./ImageList";
import {Component} from "../../CarbonFlux";
import {FormattedHTMLMessage} from "react-intl";

export default class ImageView extends Component<any, any>{
    render(){
        var {formatMessage} = this.context.intl;
        return <div>
            {this.props.config && this.props.config.groups.map(g => {
                return <section className="stencils-group" key={formatMessage({id:g.name})}>
                    <div className="stencils-group__name">
                        <FormattedHTMLMessage tagName="strong" id={g.name}/>
                    </div>
                    {/*<ImageList images={g.templates}/>*/}
                </section>
            })}
        </div>;
    }
}
