import React from "react";
import bem from 'bem';
import {FormattedMessage} from "react-intl";
import ScrollContainer from "../../shared/ScrollContainer";
import {Component} from "../../CarbonFlux";
import BladeHeader from "./BladeHeader";


export class BladeBody extends Component {
    constructor(props) {
        super(props);
    }

    render (){
        var cn = bem("blade", "body", null, this.props.className);
        return <div {...this.props} className={cn}>{this.props.children}</div>
    }
}

export default class BladePage extends Component {
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
                        : <BladeHeader caption={this.props.caption || this.caption}/>
                    }

                    <ScrollContainer className="blade__scroller thin"  boxProps={this.props.contentProps}>
                        {this.props.children}
                    </ScrollContainer>

                    <div className="blade__closer" onClick={()=> { this._close_blade(); }}><i /></div>
                </div>
            </div>
        )
    }
}

BladePage.contextTypes = { bladeContainer: React.PropTypes.any };

BladePage.childContextTypes = {
    currentBladeId: React.PropTypes.number
};
