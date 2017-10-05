import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { CarbonLabel } from "../CarbonFlux";
import { SideMenu } from "./SideMenu";

export interface IContentPageProps extends IReactElementProps {
    label: string;
    id: any;
}

export class ContentPage extends React.Component<IContentPageProps, any> {
    render() {
        return <div className={cx(this.props.className, "sidemenu-container__page")}>{this.props.children}</div>;
    }
}

interface ISideMenuContainerState {
    activePageId:any;
}

interface ISideMenuContainerProps extends IReactElementProps{
    activePageId?:any;
    onActiveChanged?:(id:any)=>void;
}

export class SideMenuContainer extends React.Component<ISideMenuContainerProps, ISideMenuContainerState> {
    static contextTypes = {
        router: PropTypes.any,
        intl: PropTypes.object
    }

    constructor(props, context) {
        super(props, context);
        this.state = {activePageId:props.activePageId}
    }

    _buildItemsFromChildren() {
        return (this.props.children as any).map(p => { return { label: p.props.label, id: p.props.id } })
    }

    _buildContent() {
        if(this.state.activePageId) {
            return this.props.children.find(c=>c.props.id === this.state.activePageId);
        }
        else {
            return this.props.children[0];
        }
    }

    _onActiveChanged = (id) => {
        if(this.state.activePageId !== id) {
            this.setState({activePageId:id});

            if(this.props.onActiveChanged) {
                this.props.onActiveChanged(id);
            }
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if(nextProps) {
            this.setState({activePageId:nextProps.activePageId});
        }
    }

    render() {
        return <section className="sidemenu-container">
            <SideMenu items={this._buildItemsFromChildren()} activeId={this.state.activePageId} onActiveChanged={this._onActiveChanged} />
            <div className="sidemenu-container_content">
                {this._buildContent()}
            </div>
        </section>;
    }
}