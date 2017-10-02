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
        return <div {...this.props}></div>;
    }
}

interface ISideMenuContainerState {
    activePageId:any;
}

export class SideMenuContainer extends React.Component<IReactElementProps, ISideMenuContainerState> {
    constructor(props) {
        super(props);
        this.state = {activePageId:null}
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
        this.setState({activePageId:id});
    }

    render() {
        return <section className="sidemenu-container">
            <SideMenu items={this._buildItemsFromChildren()} onActiveChanged={this._onActiveChanged} />
            <div className="sidemenu-container_content">
                {this._buildContent()}
            </div>
        </section>;
    }
}