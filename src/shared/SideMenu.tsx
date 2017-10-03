import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";
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
}

export class SideMenu extends React.Component<ISideMenuProps, ISideMenuState> {
    constructor(props) {
        super(props);
        var activeId = this.props.activeId;
        if(!activeId && props.items.length) {
            activeId = props.items[0].id;
        }

        this.state = { activeItemId: activeId };
    }

    _itemClicked = (e) => {
        var id = e.currentTarget.dataset.itemId;
        this.setState({ activeItemId: id });
        if (this.props.onActiveChanged) {
            this.props.onActiveChanged(id);
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if(nextProps) {
            this.setState({activeItemId:nextProps.activeId});
        }
    }

    render() {
        var items = this.props.items || [];
        return <div className="side-menu">
            {items.map(x => {
                return <div key={x.id}>
                    <span className={cx("side-menu_item", { "side-menu_item__active": (x.id) === this.state.activeItemId })} data-item-id={x.id} onClick={this._itemClicked}>
                        <CarbonLabel id={x.label} />
                    </span>
                </div>
            })}
        </div>
    }
}

