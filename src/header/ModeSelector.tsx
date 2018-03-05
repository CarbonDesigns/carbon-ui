import React from "react";
import PropTypes, { bool } from "prop-types";
import { listenTo, Component, handles, dispatch } from "../CarbonFlux";
import styled from "styled-components";
import { app } from "carbon-core";
import { FormattedMessage, defineMessages } from 'react-intl';
import cx from "classnames";
import appStore from "../AppStore";

interface IModeSelectorProps extends IReactElementProps {

}

interface IModeSelectorState {
    activeMode?:string;
}

export default class ModeSelector extends Component<IModeSelectorProps, IModeSelectorState> {
    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }

    constructor(props) {
        super(props);
        this.state = {
            activeMode: appStore.state.activeMode,
        }
    }

    @listenTo(appStore)
    onChange() {
        this.setState({
            activeMode: appStore.state.activeMode
        });
    }

    render() {
        return <ModeBar>
            {
                ['edit', 'prototype', 'preview'].map((item) => {
                    return (
                        <ModeBarItem active={(item === this.state.activeMode)} key={item}
                            onClick={() => app.setMode(item)}>
                            <div className="big-icon"></div>
                            <div className="pill-cap">
                                <FormattedMessage id={'mode.' + item} />
                            </div>
                        </ModeBarItem>
                    )
                })
            }
        </ModeBar>;
    }
}

const ModeBar = styled.div`
`;

const ModeBarItem = styled.div.attrs<{active?:boolean}>({
    active:false
})`
    background: ${props=>props.active?"red":"green"};
    &.big-icon {

    }

    &.pill-cap {

    }
`;