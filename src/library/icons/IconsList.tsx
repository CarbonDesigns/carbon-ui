import React from "react";
import ReactDom from "react-dom";
import { Component, dispatch, handles, dispatchAction } from "../../CarbonFlux";
import { IconsInfo } from "carbon-core";
import StencilsActions from '../stencils/StencilsActions';
import LessVars from "../../styles/LessVars";
import InfiniteScrollContainer from "../../shared/InfiniteScrollContainer";
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
        this.state = {
            initialElements: props.initialItems.map(this._renderItem),
            containerWidth: 0,
            containerHeight: 0,
            scrollKey: 0
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.initialItems !== this.props.initialItems) {
            this.setState({ initialElements: nextProps.initialItems.map(this._renderItem) });
        }
    }

    componentDidMount() {
        super.componentDidMount();
        var node = ReactDom.findDOMNode(this.props.container) as any;
        this.setState({ containerHeight: node.offsetHeight, containerWidth: node.offsetWidth });
    }

    onClicked = (e) => {
        var templateId = e.currentTarget.dataset.templateId;
        var templateType = e.currentTarget.dataset.templateType;
        dispatchAction({ type: "Stencils_Clicked", e, templateType, templateId });
    };

    onLoadMore = page => {
        return this.props.onLoadMore(page)
            .then(data => Object.assign({}, data, { elements: data.items.map(this._renderItem) }))
    };

    @handles(LayoutActions.resizePanel, LayoutActions.togglePanelGroup, LayoutActions.windowResized)
    onResizePanel() {
        setTimeout(() => {
            var node = ReactDom.findDOMNode(this.props.container) as any;
            if (node) {
                this.setState({
                    containerHeight: node.offsetHeight,
                    containerWidth: node.offsetWidth,
                    //hard to maintain scroll position during panel resize, so just create a new instance...
                    scrollKey: ++this.state.scrollKey
                });
            }
        }, 50);
    }

    _renderItem = i => {
        var iconStyle: any = {
            fontFamily: IconsInfo.defaultFontFamily
        };
        if (i.spriteUrl) {
            iconStyle.backgroundImage = 'url(' + i.spriteUrl + ')';
        }
        return <div className="stencil icon-holder"
            title={i.name}
            key={i.id || i.name}
            data-template-type={i.type || "icon"}
            data-template-id={i.id || i.name}
            onClick={this.onClicked}>
            <i className="icon" style={iconStyle} key={"icon" + (i.id || i.name)}>{i.spriteUrl ? "" : String.fromCharCode(i.value)}</i>
            {this._renderPrice(i)}
        </div>;
    };
    _renderPrice(i) {
        if (i.premium) {
            return <a className="price ext-link"><span>$</span></a>;
        }
        return null;
    }
    // onMouseEnter = e => {
    //     if (this._setTimer){
    //         clearTimeout(this._setTimer);
    //     }
    //     var target = e.currentTarget;
    //     this._setTimer = setTimeout(() => this.showSet(target), 500);
    // };
    // showSet(target){
    //     dispatch(FlyoutActions.show(target, <IconFinderSet/>, {targetVertical:'top', targetHorizontal: 'right'}));
    // }

    render() {
        if (!this.state.containerHeight) {
            return <div />;
        }
        var padding = LessVars.stencilsContainerPadding;
        var cols = (this.state.containerWidth - padding.left - padding.right) / LessVars.iconStencilHeight | 0;
        return <InfiniteScrollContainer className={this.props.className}
            key={this.state.scrollKey}
            elementHeight={LessVars.iconStencilHeight / cols}
            containerHeight={this.state.containerHeight}
            initialElements={this.state.initialElements}
            onLoadMore={this.onLoadMore} />
    }
}
