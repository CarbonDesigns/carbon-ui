import { Component } from '../CarbonFlux';
import * as React from "react";
import * as PropTypes from "prop-types";
import immutable from 'immutable';
import LayoutActions from './LayoutActions';
import { richApp, app } from "../RichApp";
import * as cx from "classnames";
import bem_mod from '../utils/commonUtils';
import { FormattedMessage } from "react-intl";
import styled from "styled-components";
import theme from "../theme";
import icons from "../theme-icons";
import IconButton from '../components/IconButton';
import Icon from '../components/Icon';


interface IPanelProps {
    id: string;
    header: string;
    panelName?: string;
    className?: string;
    index?: number;
    noheader?: boolean;
    icon?: any;
}

interface IPanelState {
    widthClass: any;
    heightClass: any;
    mode?: any;
}


export default class Panel extends Component<IPanelProps, IPanelState> {
    static propTypes = {
        id: PropTypes.string,
        header: PropTypes.string,
        icon: PropTypes.any
    }

    private panel: HTMLElement;

    constructor(props) {
        super(props);
        this.state = { widthClass: null, heightClass: null };
    }

    componentDidMount() {
        super.componentDidMount();

        // richApp.Dispatcher.dispatchAsync(LayoutActions.resizingPanel(this.props, false));

        this.updateSizeClasses();
    }

    width() {
        var panel = this.panel;
        return panel.offsetWidth;
    }

    height() {
        var panel = this.panel;
        return panel.offsetHeight;
    }

    updateSizeClasses() {

        var width = this.width();
        var height = this.width();
        var wc = Math.round(width / 100);
        var wh = Math.round(height / 100);

        var mode = 'normal';
        if (width < 200) { mode = 'narrow'; }
        else if (width >= 251 && width < 320) { mode = 'wide'; }
        else if (width >= 321) { mode = 'widest'; }

        var swc = "w" + wc;
        var shc = "h" + wh;
        if (this.state.mode !== mode || this.state.widthClass !== swc || this.state.heightClass !== shc) {
            this.setState({ widthClass: swc, heightClass: shc, mode: mode });
        }
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        super.componentDidUpdate(prevProps, prevState);
        this.updateSizeClasses();
    }

    _resolveOnGroupCloseClick = (container) => (e) => {
        if (this.panel.parentElement.classList.contains('dragging')) {
            return;
        }

        app.Dispatcher.dispatch(LayoutActions.togglePanelGroup(container, e))
    };

    renderHeader() {
        if(this.props.noheader) {
            return;
        }

        return <PanelHeader>
            {/* <Icon className="icon" icon={this.props.icon}></Icon> */}
            <PanelName>
                <FormattedMessage id={this.props.header} defaultMessage={this.props.header} />
            </PanelName>
            {/* <IconButton className="panel_closer" icon={icons.panel_closer} onMouseDown={(e) => e.preventDefault()} onClick={this._resolveOnGroupCloseClick({ index: this.props.index })} /> */}
        </PanelHeader>
    }

    render() {
        var classname = bem_mod("panel", null, [this.state.heightClass, this.state.widthClass], this.props.className);

        return (
            <PanelStyled name={this.props.panelName} id={this.props.id} innerRef={x => this.panel = x} data-mode={this.state.mode}>
                {this.renderHeader()}

                <PanelBody>
                    {this.props.children}
                </PanelBody>
            </PanelStyled>
        );
    }
}

const PanelStyled = styled.div.attrs<{name?:string, id?:any}>({})`
    background-color:${theme.panel_background};
    display: flex;
    flex-direction: column;
    width:100%;
    height:100%;
`;

const PanelBody = styled.div`
    display: flex;
    flex-direction: column;
    flex: auto;
    height:100%;
`;

const PanelHeader = styled.div`
    color:${theme.text_color};
    font: ${theme.h2font};
    display:flex;
    flex: 0 0 auto;
    align-items: center;
    padding: 5px 9px;
    width: 100%;
    background-repeat: repeat;
    height:32px;
    cursor:pointer;
    user-select: none;

    > .icon,
    > .panel_closer > .icon {
        background-color: ${theme.accent};
        background:linear-gradient(to right, ${theme.accent} 0%, ${theme.accent.darken(0.1)} 100%);
    }
`;

const PanelName = styled.div`
    flex: auto;
    display: flex;
    align-items: center;
    text-transform: uppercase;
    letter-spacing: 1.44px;
    margin-left:12px;
`;