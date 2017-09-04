import React from "react";
import cx from "classnames";
import { UnsplashStencil } from "./UnsplashStore";
import { ImageLandscapeHeight, ImagePortraitHeight } from "../LibraryDefs";

export function getUnsplashImageHeight(i: UnsplashStencil) {
    if (i.thumbHeight) {
        return i.thumbHeight;
    }
    return i.portrait ? ImagePortraitHeight : ImageLandscapeHeight;
}

type UnsplashImageProps = {
    stencilType: string;
    stencil: UnsplashStencil;
    onClicked: (e: React.MouseEvent<HTMLElement>) => void;
}

export const UnsplashImage = (props: UnsplashImageProps) => {
    var imageStyle: any = {
        backgroundImage: 'url(' + props.stencil.thumbUrl + ')'
    };
    var image = <i className="unsplash__image" style={imageStyle} />;
    var credits = <a className="unsplash__credits" href={props.stencil.credits.link} target="_blank"><span>{props.stencil.credits.name}</span></a>;
    return <div
        key={props.stencil.id}
        className={cx("stencil unsplash__holder", { "unsplash__holder_portrait": props.stencil.portrait })}
        title={props.stencil.title}
        data-stencil-type={props.stencilType}
        data-stencil-id={props.stencil.id}
        onClick={props.onClicked}
    >
        {image}
        {credits}
    </div>;
}

