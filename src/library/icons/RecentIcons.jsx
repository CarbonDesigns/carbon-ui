import React from "react";
import {Component, listenTo} from "../../CarbonFlux";
import IconsList from "./IconsList";
import recentIconsStore from "./RecentIconsStore";

export default class RecentIcons extends Component{
    constructor(props){
        super(props);
        this.state = {
            mounted: false
        };
    }

    componentDidMount(){
        super.componentDidMount();
        this.setState({mounted: true});
    }

    _onLoadMore = () => {
        return Promise.resolve({items: [], hasMore: false});
    };

    render(){
        return <div>
            <div className="library-page__content" ref="container">
                {this._renderList()}
            </div>
        </div>;
    }

    _renderList(){
        if (this.state.mounted){
            return <IconsList className="list"
                              container={this.refs.container}
                              initialItems={recentIconsStore.getItems()}
                              onLoadMore={this._onLoadMore}/>;
        }
        return <div/>;
    }
}
