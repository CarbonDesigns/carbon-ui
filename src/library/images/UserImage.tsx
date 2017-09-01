import React from "react";
import cx from "classnames";
import { ImageLandscapeHeight, ImagePortraitHeight } from "../LibraryDefs";
import { UserImageStencil } from "./UserImagesStore";

export function getUserImageHeight(i: UserImageStencil) {
    return i.thumbHeight;
}

type UserImageProps = {
    stencilType: string;
    stencil: UserImageStencil;
    onClicked: (e: React.MouseEvent<HTMLElement>) => void;
}

export const UserImage = (props: UserImageProps) => {
    var stencil = props.stencil;
    var imageStyle: any = {
        backgroundImage: 'url(' + stencil.thumbUrl + ')',
        backgroundSize: stencil.cover ? "cover" : "contain"
    };
    return <div
        key={stencil.id}
        className="stencil stencil_userImage"
        title={stencil.title}
        data-stencil-type={props.stencilType}
        data-stencil-id={stencil.id}
        onClick={props.onClicked}
    >
        <i style={imageStyle} />
    </div>;
}

