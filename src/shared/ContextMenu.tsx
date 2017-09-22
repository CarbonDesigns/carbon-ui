import React from "react";
import ReactDOM from "react-dom";
import cx from 'classnames';
import FlyoutActions from '../FlyoutActions';
import flyoutStore from '../FlyoutStore';
import { Component, listenTo, stopPropagationHandler, CarbonLabel, dispatch } from "../CarbonFlux";
import bem from "../utils/commonUtils";
import { ensureElementVisible } from "../utils/domUtil";
import { ICancellationHandler, cancellationStack } from "./ComponentStack";
import { workspace, app } from "carbon-core";

function b(a?, b?, c?) { return bem("context-menu", a, b, c) }

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
            app.actionManager.invoke(this.props.item.actionId);
        }
        dispatch(FlyoutActions.hide());
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
            return <li className={b('separator')} />
        }

        if (this.props.item.items) {
            return <li className={b('item', null)} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
                {item.icon && <i className={cx("icon", b("icon"), item.icon)} />}
                <span className={b("label")}>{this.formatLabel(item.name)}</span>
                <div className={b('item-arrow')}></div>
                {this.state.submenuVisible && <SubMenu className={b("submenu", { disabled: item.disabled })} items={this.props.item.items} onCancelled={this.onSubmenuCancelled} />}
            </li>
        }
        return <li className={b("item", { disabled: this.props.item.disabled, "with-icon": item.icon })} onMouseDown={stopPropagationHandler} onClick={this.onClick.bind(this)}>
            {item.icon && <i className={cx("icon", b("icon"), item.icon)} />}
            <span className={b("label")}>{this.formatLabel(this.props.item.name)}</span>
            <span className={b("shortcut")}>{workspace.shortcutManager.getActionHotkey(item.actionId)}</span>
        </li>
    }
}

interface SubMenuProps extends ISimpleReactElementProps {
    items: any[];
    onCancelled: () => void;
}
class SubMenu extends Component<SubMenuProps> implements ICancellationHandler {
    componentDidMount() {
        super.componentDidMount();
        let node = ReactDOM.findDOMNode<HTMLElement>(this);
        ensureElementVisible(node, document.documentElement);

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
        return <ul className={this.props.className}>
            {this.props.items.map(item => <ContextMenuItem item={item} key={item.name} />)}
        </ul>
    }
}

export default class ContextMenu extends Component<any, any> {
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
                var flyoutTarget = 'flyout_target'; // this.refs['menu'].parentNode;
                var flyoutContent = this.renderMenu(menu);
                var flyoutPosition = this._getFlyoutPositionFromEvent(event);

                this._popupContextMenu(flyoutTarget, flyoutContent, flyoutPosition);
            });
    }


    _popupContextMenu(target, content, position, onClose?) {
        dispatch(FlyoutActions.show(target, content, position, onClose));
    };

    _hideContextMenu() {
        dispatch(FlyoutActions.hide());
    };

    _getFlyoutPositionFromEvent(event) {
        return { absolute: true, x: event.pageX, y: event.pageY }
    };

    toggle = (event?, target?, action?) => {
        if (!this.state.open) {
            this.setState({ open: true });
            this._showMenu(event);
        }
        else {
            this.setState({ open: false });
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

    @listenTo(flyoutStore)
    storeChanged() {
        var target = flyoutStore.state.target;

        if (target === this.refs.menu) {
            this._runOnOpenCallback();
        }
        else if (!target && this.state.open) {
            this.setState({ open: false });
            this._runOnCloseCallback();
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

    _renderMenuItem = (item, ind) => {
        // console.log(ind, item, arguments);
        return <ContextMenuItem item={item} key={'u' + item.name + ind} />
    };

    renderMenu(menu) {
        return <ul className="context-menu txt">
            {menu.items.map(this._renderMenuItem)}
        </ul>;
    }

    render() {
        return <div ref="menu"></div>
    }

}


