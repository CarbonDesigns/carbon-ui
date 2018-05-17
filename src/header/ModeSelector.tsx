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
                            <SelectorIcon icon={icons['top_'+item]} active={(item === this.state.activeMode)}></SelectorIcon>
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

const SelectorIcon = styled(Icon).attrs<any>({})`
    background-color:${props=>props.active?theme.text_active:theme.text};
`;

const ModeBar = styled.div`
    white-space:nowrap;
    padding: 0 10px;
    position:relative;
    display:flex;
    align-items:center;
`;

const Cap = styled.div`
    margin-left: 15px;
    position: relative;
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
    height:47px;
    margin-right:40px;
    align-items:center;
    cursor:pointer;
    position:relative;
    ${props=>props.active?css`
        &::after {
            content: " ";
            position:absolute;
            display:block;
            left:0;
            right:0;
            bottom: 2px;
            height:2px;
            background-color:${theme.accent};
        }
    `:''};
`;