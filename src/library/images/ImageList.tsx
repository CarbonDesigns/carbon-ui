// import React from "react";
// import cx from "classnames";
// import { Component, dispatch, dispatchAction } from "../../CarbonFlux";
// import { IconsInfo, IPaginatedResult } from "carbon-core";
// import LessVars from "../../styles/LessVars";
// import InfiniteList from "../../shared/InfiniteList";
// import { IStencil } from "../ToolboxConfiguration";

// type ImageStencilList = new (props) => InfiniteList<IImageStencil>;
// const ImageStencilList = InfiniteList as ImageStencilList;

// interface IImageListProps extends ISimpleReactElementProps {
//     onLoadMore: (startIndex: number, stopIndex: number) => Promise<IPaginatedResult<IImageStencil>>;
// }

// export default class ImageList extends Component<IImageListProps> {
//     refs: {
//         list: InfiniteList<IImageStencil>;
//     }

//     onClicked = (e) =>{
//         var templateId = e.currentTarget.dataset.templateId;
//         var templateType = e.currentTarget.dataset.templateType;
//         dispatchAction({type: "Stencils_Clicked", e, templateType, templateId});
//     };

//     _getItemHeight(i: IImageStencil){
//         if (i.thumbHeight){
//             return i.thumbHeight;
//         }
//         return i.portrait ? LessVars.libraryImageHeightPortrait : LessVars.libraryImageHeight;
//     }

//     _renderItem = (stencil: IImageStencil) => {
//         var imageStyle: any = {
//             backgroundImage: 'url(' + stencil.thumbUrl + ')'
//         };
//         if (stencil.hasOwnProperty("thumbHeight")){
//             imageStyle.height = stencil.thumbHeight;
//         }
//         var image = <i className="image" style={imageStyle} />;
//         var credits = (stencil.credits) && <a className="credits ext-link" href={stencil.credits.link} target="_blank"><span>{stencil.credits.name}</span></a>
//         return <div
//             key={stencil.id}
//             className={cx("stencil image-holder", {cover: stencil.cover, portrait: stencil.portrait})}
//             title={stencil.title}
//             data-template-type={stencil.type}
//             data-template-id={stencil.id}
//             onClick={this.onClicked}
//         >
//             {image}
//             {credits}
//         </div>;
//     };

//     render(){
//         return <ImageStencilList className={this.props.className}
//                                  ref="list"
//                                  rowHeight={this._getItemHeight}
//                                  rowRenderer={this._renderItem}
//                                  loadMore={this.props.onLoadMore}/>
//     }
// }
