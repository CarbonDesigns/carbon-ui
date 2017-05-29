import React from "react";
import {FormattedHTMLMessage} from 'react-intl';
import StencilsActions from "../stencils/StencilsActions";
import {Component, dispatch} from "../../CarbonFlux";

export default class CatalogView extends Component{
    onClicked = (e) =>{
        var templateId = e.currentTarget.dataset.templateId;
        var templateType = e.currentTarget.dataset.templateType;
        dispatch(StencilsActions.clicked(e, templateType, templateId));
    };

    render(){
        if (!this.props.config){
            return null;
        }

        return <div>
            {this.props.config.map(g => {
                return <section className="stencils-group" key={g.name} ref={g.name} data-name={g.name}>
                    <div className="stencils-group__name">
                        <strong><FormattedHTMLMessage id={g.name} defaultMessage={g.name}/></strong>
                    </div>
                    <div className="data__fields">
                        {g.children.map(x => <div key={x.name} className="stencil"
                            data-template-type={this.props.templateType || x.templateType}
                            data-template-id={x.templateId}
                            onClick={this.onClicked}>
                                <div className="data__field">
                                    <span className="data__title">{x.name}</span>
                                    {x.examples.map(e => <span className="data__example" key={e}>{e}</span>)}
                                </div>
                        </div>)}
                    </div>
                </section>
            })}
        </div>;
    }
}


