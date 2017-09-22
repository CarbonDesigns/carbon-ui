import React from "react";
import PropTypes from "prop-types";
import bem from 'bem';
import {FormattedMessage} from "react-intl";
import ScrollContainer from "../../shared/ScrollContainer";
import {Component} from "../../CarbonFlux";
import BladeHeader from "./BladeHeader";


export class BladeBody extends Component<ISimpleReactElementProps> {
    constructor(props) {
        super(props);
    }

    render (){
        var cn = bem("blade", "body", null, this.props.className);
        return <div {...this.props} className={cn}></div>
    }
}

export interface BladePageProps {
    id: string;
    currentBladeId: number;
    caption: string;
    noheader?: boolean;
}

export type BladePageState = {
    visible: boolean;
}

export default class BladePage extends Component<BladePageProps, BladePageState> {
    renderBody() {
        return this.props.children;
    }

    constructor(props) {
        super(props);
        this.state = {visible: false};
    }

    componentDidMount() {
        super.componentDidMount();
        setTimeout(()=>{ this.setState({visible: true}); }, 100);
        this.context.bladeContainer.scrollToLast();
    }

    _close_blade=()=>{
        this.context.bladeContainer.close(this.props.currentBladeId);
    };

    getChildContext(){
        return {currentBladeId: this.props.currentBladeId};
    }


    render() {
        return (
            <div className="blade" id={this.props.id}>
                <div className={ bem('blade', 'content',  {visible: this.state.visible}) }>

                    { this.props.noheader ? null
                        : <BladeHeader caption={this.props.caption}/>
                    }

                    <ScrollContainer className="thin">
                        {this.props.children}
                    </ScrollContainer>

                    <div className="blade__closer" onClick={()=> { this._close_blade(); }}><i /></div>
                </div>
            </div>
        )
    }

    static contextTypes = {
        intl: PropTypes.object,
        bladeContainer: PropTypes.any
    };
    static childContextTypes = {
        currentBladeId: PropTypes.number
    }
}