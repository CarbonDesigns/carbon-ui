import React from "react";
import PropTypes, { bool } from "prop-types";
import { listenTo, Component, handles, dispatch } from "../CarbonFlux";
import styled from "styled-components";
import { app } from "carbon-core";
import { FormattedMessage, defineMessages } from 'react-intl';
import cx from "classnames";
import appStore from "../AppStore";
import theme from "../theme";
import icons from "../theme-icons";

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
                            <Icon icon={icons['menu_'+item]}></Icon>
                            <Cap>
                                <FormattedMessage id={'mode.' + item} />
                            </Cap>
                        </ModeBarItem>
                    )
                })
            }
        </ModeBar>;
    }
}

const ModeBar = styled.div`
    white-space:nowrap;
    padding: 0 10px;
    position:relative;
    display:block;
`;

const Icon = styled.div.attrs<{icon?:any}>({})`
    ${props=>props.icon}
`;

const Cap = styled.div`
    margin-left: .5rem;
    position: relative;
    left: -3px;
    letter-spacing: 2.6px;
`;

const ModeBarItem = styled.div.attrs<{active?:boolean}>({})`
    color: ${(props:any)=>props.active?theme.text_active:theme.text};
    font: ${theme.h1font};
    padding: 0 10px 0 6px;
    position: relative;
    height: 100%;
    display: inline-flex;
    line-height:47px;
    margin-right:40px;
    align-items:center;
`;