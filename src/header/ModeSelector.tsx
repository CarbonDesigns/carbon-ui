import * as React from "react";
import * as PropTypes from "prop-types";
import { listenTo, Component, handles, dispatch } from "../CarbonFlux";
import styled, {css} from "styled-components";
import { app } from "carbon-core";
import { FormattedMessage, defineMessages } from 'react-intl';
import * as cx from "classnames";
import appStore from "../AppStore";
import theme from "../theme";
import icons from "../theme-icons";
import Icon from "../components/Icon";

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
                ['edit', 'prototype'].map((item) => {
                    return (
                        <ModeBarItem active={(item === this.state.activeMode)} key={item}
                            onClick={() => app.setMode(item)}>
                            {/* <SelectorIcon icon={icons['top_'+item]} active={(item === this.state.activeMode)}></SelectorIcon> */}
                            <Cap>
                                <FormattedMessage id={'mode.' + item} />
                            </Cap>
                            {(item === this.state.activeMode) && <SelectionIndicator/>}
                        </ModeBarItem>
                    )
                })
            }
        </ModeBar>;
    }
}

const SelectionIndicator = styled.div`
    position:absolute;
    top:0;
    right:0;
    bottom:0;
    width:3px;
    background:${theme.accent};
`;

const ModeBar = styled.div`
    white-space:nowrap;
    position:relative;
    display:flex;
    align-items:center;
    flex-direction:column;
`;

const Cap = styled.div`
    position: relative;
`;

const ModeBarItem = styled.div<{active?:boolean}>`
    color: ${(props:any)=>props.active?theme.text_color:theme.text_inactive};
    font: ${theme.leadFont};
    position: relative;
    display: inline-flex;
    line-height:40px;
    writing-mode: vertical-lr;
    text-orientation: mixed;
    width:40px;
    margin: 20px 0;
    align-items:center;
    cursor:pointer;
    position:relative;
    transform: rotate(180deg);
    text-transform:uppercase;
   ;
`;