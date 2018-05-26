import * as React from "react";
import * as ReactDom from "react-dom";
import * as cx from "classnames";
import { Component, listenTo, stopPropagationHandler, CarbonLabel, dispatch } from "../CarbonFlux";
import { ensureElementVisible } from "../utils/domUtil";
import { ICancellationHandler, cancellationStack } from "./ComponentStack";
import { Workspace, app } from "carbon-core";
import styled from "styled-components";
import theme from "../theme";

type ContextMenuItemState = {
    submenuVisible: boolean;
};

class ContextMenuItem extends Component<any, ContextMenuItemState> {
    constructor(props) {
        super(props);
        this.state = {
            submenuVisible: false
        };
    }

    private onClick(event) {
        if (!this.props.item.disabled) {
            app.actionManager.invoke(this.props.item.actionId, this.props.item.actionArg);
        }
        this.props.onClose();
    }
    private onMouseEnter = () => {
        this.setState({ submenuVisible: true });
    }
    private onMouseLeave = () => {
        this.setState({ submenuVisible: false });
    }
    private onSubmenuCancelled = () => {
        this.setState({ submenuVisible: false });
    }

    render() {
        var item = this.props.item;
        if (item === '-') {
            return <Separator />
        }

        if (this.props.item.items) {
            return <ContextMenuItemContainer hasIcon={this.props.hasIcons} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
                {/* {item.icon && <i className={cx("icon", item.icon)} />} */}
                <ContextMenuItemLabel>{this.props.item.label || this.formatLabel(item.name)}</ContextMenuItemLabel>
                {/* <div className={b('item-arrow')}></div> */}
                {this.state.submenuVisible && <SubMenu disabled={item.disabled} onClose={this.props.onClose} items={this.props.item.items} onCancelled={this.onSubmenuCancelled} />}
            </ContextMenuItemContainer>
        }
        return <ContextMenuItemContainer hasIcon={!item.icon && this.props.hasIcons}
            disabled={this.props.item.disabled}
            onMouseDown={stopPropagationHandler} onClick={this.onClick.bind(this)}>
            {/* {item.icon && <i className={cx("icon", item.icon)} />} */}
            <ContextMenuItemLabel>{this.props.item.label || this.formatLabel(this.props.item.name)}</ContextMenuItemLabel>
            <ContextMenuItemShortcut>{Workspace.shortcutManager.getActionHotkey(item.actionId)}</ContextMenuItemShortcut>
        </ContextMenuItemContainer>
    }
}

interface SubMenuProps extends ISimpleReactElementProps {
    items: any[];
    disabled?: boolean;
    onCancelled: () => void;
    onClose: () => void;
}
class SubMenu extends Component<SubMenuProps> implements ICancellationHandler {
    componentDidMount() {
        super.componentDidMount();
        let node = ReactDom.findDOMNode(this) as HTMLElement;
        ensureElementVisible(node, document.documentElement, 0, 40);

        //if there is no space on the right, flip on the other side
        if (node.style.right === "0px") {
            node.style.right = "100%";
        }

        cancellationStack.push(this);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        cancellationStack.pop();
    }

    onCancel() {
        this.props.onCancelled();
    }

    render() {
        let hasIcons = this.props.items.some(x => x.icon);
        return <ContextSubMenuStyled>
            {this.props.items.map(item => <ContextMenuItem item={item} onClose={this.props.onClose} key={item.name || item.actionArg} hasIcons={hasIcons} />)}
        </ContextSubMenuStyled>
    }
}

export default class ContextMenu extends Component<any, any> {
    menu: any;

    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
    }

    drawContent() {
        return this.props.children;
    }

    onClick = (e) => {
        this.open();
        e.stopPropagation();
    };

    open = () => {
        if (!this.state.open) {
            this.toggle();
        }
    };

    close = () => {
        if (this.state.open) {
            this.toggle();
        }
    };

    _showMenu(event?) {
        this.props.onBuildMenu(event)
            .then((menu) => {
                this.setState({ menu: menu, x: event.pageX, y: event.pageY });
            });
    }

    _hideContextMenu = () => {
        this.setState({ menu: null });
    };

    toggle = (event?, target?, action?) => {
        if (!this.state.open) {
            this._showMenu(event);
        }
        else {
            this._hideContextMenu();
        }
    };

    _runOnOpenCallback() {
        if (typeof this.props.onOpened === 'function') {
            this.props.onOpened();
        }
    }

    _runOnCloseCallback() {
        if (typeof this.props.onClosed === 'function') {
            this.props.onClosed();
        }
    }
    onMouseDown = (e) => {
        e.stopPropagation();
    };

    onRightClick = (e) => {
        //react events are singletons
        this.toggle({ offsetX: e.offsetX, offsetY: e.offsetY, pageX: e.pageX, pageY: e.pageY });

        e.preventDefault();
        e.stopPropagation();
    };

    onDocumentClick = (e) => {
        this.close();
    };

    bind(eventTarget) {
        eventTarget.addEventListener("contextmenu", this.onRightClick);
        document.addEventListener("click", this.onDocumentClick);
    }

    unbind(eventTarget) {
        super.componentWillUnmount();
        eventTarget.removeEventListener("contextmenu", this.onRightClick);
        document.removeEventListener("click", this.onDocumentClick);
    }

    renderMenu(menu) {
        let hasIcons = menu.items.some(x => x.icon);
        return <ContextMenuStyled>
            {menu.items.map((item, i) => <ContextMenuItem onClose={this._hideContextMenu} item={item} key={'u' + item.name + i} hasIcons={hasIcons} />)}
        </ContextMenuStyled>;
    }

    render() {
        var host = document.body;
        if (!host || !this.state.menu) {
            return <div></div>;
        }

        return ReactDom.createPortal(<ContextMenuContainer ref={x => this.menu = x} onClose={this._hideContextMenu} style={{ position: 'absolute', left: this.state.x, top: this.state.y }} >{this.renderMenu(this.state.menu)}</ContextMenuContainer>, host);
    }
}

class ContextMenuContainer extends Component<any, any> {
    refs: {
        menu:HTMLElement
    }

    _onMouseDown = (event) => {
        this.props.onClose();
    }

    _preventDefault = (event) => {
        event.stopPropagation();
    }

    componentDidMount() {
        let menu = this.refs.menu;
        if(!menu) {
            return;
        }
        ensureElementVisible(menu, document.documentElement, 0, 40);
    }

    render() {
        return <div onMouseDown={this._onMouseDown} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <div ref="menu" onMouseDown={this._preventDefault} {...this.props}>{this.props.children}</div>
        </div>
    }
}

const Separator = styled.li`
    margin: 0.3rem 0;
    border-top: 1px solid ${theme.input_background};
`;

const ContextMenuStyled = styled.ul`
    background:${theme.flyout_background};
    box-shadow: ${theme.flyout_shadow};
    padding: ${theme.margin1} 0;
    color: ${theme.text_color};
    font: ${theme.default_text};
    position:relative;
`;

const ContextSubMenuStyled = styled(ContextMenuStyled) `
    left:100%;
    position: absolute;
`;

const ContextMenuItemContainer = styled.li.attrs<any>({}) `
    height:22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    white-space: nowrap;
    height: 2rem;
    padding: 0 ${theme.margin1};
    cursor:pointer;
    color: ${p => p.disabled ? theme.button_disabled : theme.button_default};
    &:hover {
        color:${p => p.disabled ? theme.button_disabled : theme.button_hover};
    }
    z-index:5;
    min-width:160px;
`;

const ContextMenuItemLabel = styled.span`
`;

const ContextMenuItemShortcut = styled.span`
    margin-left:${theme.margin2};
`;

