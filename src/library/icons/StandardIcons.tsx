import React from "react";
import {Component, listenTo, handles} from "../../CarbonFlux";
import IconsList from "./IconsList";
import iconsStore from "./IconsStore";

interface StandardIconsProps extends IReactElementProps {

}

export default class StandardIcons extends Component<StandardIconsProps, any>{
    constructor(props){
        super(props);
        this.state = {
            initialItems: iconsStore.getConfig(),
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
                              initialItems={this.state.initialItems}
                              onLoadMore={this._onLoadMore}/>;
        }
        return <div/>;
    }
}
