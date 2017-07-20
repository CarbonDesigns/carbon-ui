import React from "react";
import PropTypes from "prop-types";
import {FormattedMessage} from "react-intl";
import ScrollContainer from "../../shared/ScrollContainer";
import {Component} from "../../CarbonFlux";
import BladePage from "./BladePage";

export default class BladeContainer extends React.Component {
    constructor(props) {
        super(props);
        this.blades = [];
        this.state = {blades: this.blades}
    }

    close(bladeId) {
        var blades = this.blades.slice();
        if (blades.length > bladeId) {
            blades.splice(bladeId, blades.length - bladeId);
            this.blades = blades;
            this.setState({blades: this.blades});
        }
    }

    addChildBlade(id, bladeType, caption, props, noheader, contentProps) {
        var blades = this.blades.slice();
        var index = blades.findIndex(b=>b.id === id);
        var newBlade = {
            bladeFactory: React.createFactory(bladeType),
            id, caption, props, noheader, contentProps
        };
        if (index >= 0) {
            blades.splice(index, 1, newBlade)
        }
        else {
            index = blades.length;
            blades.push(newBlade);
        }
        this.blades = blades;
        this.setState({blades: this.blades});

        return index;
    }

    scrollToLast(){
        if(this.refs.container) {
            this.refs.container.lastChild.scrollIntoView(true);
        }
    }

    // _renderBlade(blade, index) {
    //     return <BladePage currentBladeId={index}
    //                       id={blade.id}
    //                       caption={blade.caption}
    //                       key={blade.id}
    //                       noheader={blade.noheader}>
    //         {blade.bladeFactory(blade.props)}
    //     </BladePage>
    // }

    render() {
        if(!this.state.blades.length){
            return null;
        }

        var blades = this.state.blades.map((blade, index)=>
            <BladePage
                key={blade.id}
                currentBladeId={index}
                id={blade.id}
                caption={blade.caption}
                contentProps={blade.contentProps}
                noheader={blade.noheader}
            >
                { blade.bladeFactory(blade.props) }
            </BladePage>
        );

        return (
            <div className="blades" {...this.props} ref="container">
                <div className="blades__bg-overlay"></div>
                {blades}
            </div>
        )
    }

    getChildContext() {
        return {
            blades         : this.state.blades,
            bladeContainer : this
        };
    }
}

BladeContainer.childContextTypes = {
    blades         : PropTypes.arrayOf(PropTypes.any),
    bladeContainer : PropTypes.any
};
