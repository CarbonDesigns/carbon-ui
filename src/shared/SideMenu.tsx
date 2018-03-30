import * as React from "react";
import * as PropTypes from "prop-types";
import * as cx from "classnames";
import { CarbonLabel } from "../CarbonFlux";

export interface ISideMenuItem {
    label: string;
    id: any;
}

interface ISideMenuProps extends IReactElementProps {
    items: ISideMenuItem[];
    onActiveChanged?: (id: any) => void;
    activeId?: any;
}

interface ISideMenuState {
    activeItemId: any;
    active:boolean;
}

export class SideMenu extends React.Component<ISideMenuProps, ISideMenuState> {
    constructor(props) {
        super(props);
        var activeId = this.props.activeId;
        if (!activeId && props.items.length) {
            activeId = props.items[0].id;
        }

        this.state = { activeItemId: activeId, active:false };
    }

    _itemClicked = (e) => {
        var id = e.currentTarget.dataset.itemId;
        this.setState({ activeItemId: id, active:false });
        if (this.props.onActiveChanged) {
            this.props.onActiveChanged(id);
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (nextProps) {
            this.setState({ activeItemId: nextProps.activeId, active:false });
        }
    }

    _toggleActive=()=> {
        this.setState({active:!this.state.active})
    }

    render() {
        var items = this.props.items || [];
        return <div className={cx("side-menu", {active:this.state.active})}>
            <div className="side-menu__activeselector form__heading fs-header" onClick={this._toggleActive}>
                {items.filter(x=>x.id===this.state.activeItemId).map(x=><CarbonLabel tagName="h3" id={x.label}/>)}
            </div>
            <div className={cx("side-menu__items")}>
                {items.map(x => {
                    return <div key={x.id}>
                        <span className={cx("side-menu_item", { "side-menu_item__active": (x.id) === this.state.activeItemId })} data-item-id={x.id} onClick={this._itemClicked}>
                            <CarbonLabel id={x.label} />
                        </span>
                    </div>
                })}
            </div>
        </div>
    }
}

