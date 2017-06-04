import React from "react";
import { Component } from "../../../CarbonFlux";
import { BladeBody } from "../BladePage";
import ImageEditor from "./ImageEditor";

interface IEditImageBladeProps {
    image: string;

    onComplete: (image: string) => void;
}

export default class EditImageBlade extends Component<IEditImageBladeProps> {
    render() {
        return <BladeBody>
            <ImageEditor image={this.props.image} onComplete={this.props.onComplete}/>
        </BladeBody>
    }

    static contextTypes = {
        intl: React.PropTypes.object,
        currentBladeId: React.PropTypes.number,
        bladeContainer: React.PropTypes.any
    }
}