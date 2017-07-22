import React from "react";
import ReactDom from "react-dom";
import { Component, dispatch, handles, dispatchAction } from "../../CarbonFlux";
import { IconsInfo } from "carbon-core";
import StencilsActions from '../stencils/StencilsActions';
import LessVars from "../../styles/LessVars";
//import InfiniteGrid from "../../shared/InfiniteGrid";
import LayoutActions from '../../layout/LayoutActions';
//import FlyoutActions from "../../FlyoutActions";
//import IconFinderSet from "./IconFinderSet";


interface IIconsListProps extends IReactElementProps {
    container: any;
    onLoadMore: (a: any) => any;
    initialItems: any[];
}

export default class IconsList extends Component<IIconsListProps, any>{
    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(nextProps) {
    }

    componentDidMount() {
        super.componentDidMount();
        var node = ReactDom.findDOMNode(this.props.container) as any;
        this.setState({ containerHeight: node.offsetHeight, containerWidth: node.offsetWidth });
    }


}
