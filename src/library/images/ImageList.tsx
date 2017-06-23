import React from "react";
import cx from "classnames";
import { Component, dispatch, dispatchAction } from "../../CarbonFlux";
import {IconsInfo} from "carbon-core";
import LessVars from "../../styles/LessVars";
import InfiniteScrollContainer from "../../shared/InfiniteScrollContainer";

export default class ImageList extends Component<any, any> {
    constructor(props){
        super(props);
        this.state = {
            initialElements: props.initialItems.map(this._renderItem),
            elementHeight: props.initialItems.map(this._getItemHeight)
        }
    }

    componentWillReceiveProps(nextProps){
        if (nextProps.initialItems !== this.props.initialItems){
            this.setState({
                initialElements: nextProps.initialItems.map(this._renderItem),
                elementHeight: nextProps.initialItems.map(this._getItemHeight)});
        }
    }

    onClicked = (e) =>{
        var templateId = e.currentTarget.dataset.templateId;
        var templateType = e.currentTarget.dataset.templateType;
        dispatchAction({type: "Stencils_Clicked", e, templateType, templateId});
    };
    onLoadMore = page => {
        return this.props.onLoadMore(page)
            .then(data => Object.assign({}, data, {
                elements: data.items.map(this._renderItem),
                elementHeight: data.items.map(this._getItemHeight)
            }))
    };
    _getItemHeight(i){
        if (i.thumbHeight){
            return i.thumbHeight;
        }
        return i.cx.portrait ? LessVars.libraryImageHeightPortrait : LessVars.libraryImageHeight;
    }

    _renderItem = stencil => {
        var imageStyle: any = {
            backgroundImage: 'url(' + stencil.spriteUrl + ')'
        };
        if (stencil.hasOwnProperty("thumbHeight")){
            imageStyle.height = stencil.thumbHeight;
        }
        var image = <i className="image" style={imageStyle} />;
        var credits = (stencil.credits) && <a className="credits ext-link" href={stencil.credits.link} target="_blank"><span>{stencil.credits.name}</span></a>
        return <div
            key={stencil.id}
            className={cx("stencil image-holder", stencil.cx)}
            title={stencil.name}
            data-template-type={stencil.type}
            data-template-id={stencil.id}
            onClick={this.onClicked}
        >
            {image}
            {credits}
        </div>;
    };

    render(){
        return <InfiniteScrollContainer className={this.props.className}
                                        elementHeight={this.state.elementHeight}
                                        containerHeight={this.props.containerHeight}
                                        initialElements={this.state.initialElements}
                                        onLoadMore={this.onLoadMore}/>
    }
}
