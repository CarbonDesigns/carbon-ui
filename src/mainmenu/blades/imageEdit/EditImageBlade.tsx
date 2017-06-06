import React from "react";
import { Component } from "../../../CarbonFlux";
import { BladeBody } from "../BladePage";
import ImageEditor, { ImageEditorResult } from "./ImageEditor";
import { IPage } from "carbon-core";

interface IEditImageBladeProps {
    image?: string;
    page?: IPage;

    onComplete: (result: ImageEditorResult) => void;
}

export default class EditImageBlade extends Component<IEditImageBladeProps> {
    render() {
        return <BladeBody>
            <ImageEditor image={this.props.image} page={this.props.page} onComplete={this.props.onComplete}/>
        </BladeBody>
    }

    static contextTypes = {
        intl: React.PropTypes.object,
        currentBladeId: React.PropTypes.number,
        bladeContainer: React.PropTypes.any
    }
}