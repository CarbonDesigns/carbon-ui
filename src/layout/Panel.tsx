import {Component} from '../CarbonFlux';
import React from 'react';
import PropTypes from "prop-types";
import immutable from 'immutable';
import LayoutActions from './LayoutActions';
import {richApp, app} from "../RichApp";
import {domUtil} from "carbon-core";


import cx from 'classnames';
import bem_mod from '../utils/commonUtils';
import {FormattedHTMLMessage} from "react-intl";


interface IPanelProps {
    id:string;
    header:string;
    panelName?:string;
    className?:string;
    index?:number;
}

interface IPanelState {
    widthClass:any;
    heightClass:any;
    mode?:any;
}

export default class Panel extends Component<IPanelProps, IPanelState> {
    static propTypes = {
        id: PropTypes.string,
        header: PropTypes.string
    }

    constructor(props){
        super(props);
        this.state = {widthClass:null, heightClass:null};
    }

    componentDidMount(){
        super.componentDidMount();

       // richApp.Dispatcher.dispatchAsync(LayoutActions.resizingPanel(this.props, false));

        this.updateSizeClasses();
    }

    width(){
        var panel = this.refs['panel'] as HTMLElement;
        return panel.offsetWidth;
    }

    height(){
        var panel = this.refs['panel'] as HTMLElement;
        return panel.offsetHeight;
    }

    updateSizeClasses(){

        var width = this.width();
        var height = this.width();
        var wc = Math.round(width  / 100);
        var wh = Math.round(height / 100);

        var mode = 'normal';
        if                        (width < 200) {mode = 'narrow';}
        else if (width >= 251  &&  width < 320) {mode = 'wide'  ;}
        else if (width >= 321)                  {mode = 'widest';}

        var swc = "w"+wc;
        var shc = "h"+wh;
        if(this.state.mode !== mode || this.state.widthClass !== swc || this.state.heightClass !== shc){
            this.setState({widthClass:swc, heightClass:shc, mode:mode});
        }
    }

    componentDidUpdate(prevProps:any, prevState:any){
        super.componentDidUpdate(prevProps, prevState);
        this.updateSizeClasses();
    }

    _resolveOnGroupCloseClick = (container)=>(e)=>{
        app.Dispatcher.dispatch(LayoutActions.togglePanelGroup(container, e))
    };

    render() {
        var classname = bem_mod("panel", null, [this.state.heightClass, this.state.widthClass], this.props.className);

        return (
            <div className={classname} name={this.props.panelName} id={this.props.id} ref="panel"  data-mode={this.state.mode}>
                <div className="panel__header">
                    <div className="panel__icon"><i/></div>
                    <div className="panel__name">
                        <FormattedHTMLMessage id={this.props.header} tagName="h3" defaultMessage={this.props.header}/>
                    </div>
                    <div className="panel__settings-pill" ><i></i></div>
                    <div className="panel__closer" onClick={this._resolveOnGroupCloseClick({index : this.props.index})}><i></i></div>
                </div>

                <div className="panel__body">
                    {this.props.children}
                </div>

                {/* <div className="panel__settings">
                    <div className="panel__settings-heading">
                        <hgroup>
                            <i className="ico ico--settings"/>
                            <FormattedHTMLMessage id={"Settings"} tagName="h4" defaultMessage={"Settings"}/>
                        </hgroup>
                        <div className="panel__settings-closer">
                            <i className="icon ico--close"/>
                        </div>
                    </div>
                    <div className="panel__settings-body"></div>
                </div> */}
            </div>
        );
    }

}
