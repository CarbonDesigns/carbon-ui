import React from "react";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import ScrollContainer from "../../shared/ScrollContainer";
import { Component } from "../../CarbonFlux";
import BladePage from "./BladePage";
import { ICancellationHandler, cancellationStack } from "../../shared/ComponentStack";

type BladeDefinition = {
    bladeFactory: React.ComponentFactory<{}, React.Component>,
    id: string;
    caption: string;
    props: object;
    noheader: boolean;
}

export interface BladeContainerProps {

}
export interface BladeContainerState {
    blades: BladeDefinition[];
}

export default class BladeContainer extends Component<BladeContainerProps, BladeContainerState> implements ICancellationHandler {
    refs: {
        container: HTMLDivElement;
    }

    constructor(props) {
        super(props);
        this.state = { blades: [] }
    }

    onCancel() {
        if (this.state.blades.length) {
            this.close(this.state.blades.length - 1);
        }
    }

    close(bladeId) {
        if (this.state.blades.length > bladeId) {
            var blades = this.state.blades.slice();
            blades.splice(bladeId, blades.length - bladeId);
            this.setState({ blades });

            if (blades.length === 0) {
                cancellationStack.pop();
            }
        }
    }
    closeLast() {
        this.close(this.state.blades.length - 1);
    }

    addChildBlade(id, bladeType, caption, props?, noheader?) {
        if (this.state.blades.length === 0) {
            cancellationStack.push(this);
        }

        var blades = this.state.blades.slice();
        var index = blades.findIndex(b => b.id === id);
        var newBlade = {
            bladeFactory: React.createFactory(bladeType),
            id, caption, props, noheader
        };
        if (index >= 0) {
            blades.splice(index, 1, newBlade)
        }
        else {
            index = blades.length;
            blades.push(newBlade);
        }
        this.setState({ blades: blades });

        return index;
    }

    scrollToLast() {
        if (this.refs.container) {
            (this.refs.container.lastChild as HTMLElement).scrollIntoView(true);
        }
    }

    render() {
        if (!this.state.blades.length) {
            return null;
        }

        var blades = this.state.blades.map((blade, index) =>
            <BladePage
                key={blade.id}
                currentBladeId={index}
                id={blade.id}
                caption={blade.caption}
                noheader={blade.noheader}
            >
                {blade.bladeFactory(blade.props)}
            </BladePage>
        );

        let {children, ...rest} = this.props;
        return (
            <div className="blades" {...rest} ref="container">
                <div className="blades__bg-overlay"></div>
                {blades}
            </div>
        )
    }

    getChildContext() {
        return {
            blades: this.state.blades,
            bladeContainer: this
        };
    }

    static childContextTypes = {
        blades: PropTypes.arrayOf(PropTypes.any),
        bladeContainer: PropTypes.any
    };
}