import * as React from "react";
import * as PropTypes from "prop-types";

import { Component, handles } from "../../../CarbonFlux";
import { FormGroup, FormLine } from "./Form";

import { app, Invalidate } from "carbon-core";
import { FormattedMessage } from "react-intl";
import { TabPageStyled } from "../../../components/CommonStyle";

export default class CanvasSettings extends Component<any, any> {
    refs: {
        showPixels: HTMLInputElement;
        pixelGrid: HTMLInputElement;
        showFrames: HTMLInputElement;
        clipArtboards: HTMLInputElement;
    }

    static contextTypes = {
        workspace: PropTypes.object,
        intl: PropTypes.object
    }

    constructor(props) {
        super(props);
        this.state = {
            showPixels: false,
            pixelGrid: false,
            showFrames: app.showFrames(),
            clipArtboards: app.clipArtboards()
        };
    }

    componentWillMount() {
        super.componentWillMount();
        this.state = {
            showPixels: this.context.workspace.view.showPixels(),
            pixelGrid: this.context.workspace.view.showPixelGrid(),
            showFrames: app.showFrames(),
            clipArtboards: app.clipArtboards()
        };
    }

    showPixelsChanged = (e) => {
        var checked = this.refs.showPixels.checked;
        this.setState({ showPixels: checked });
        this.context.workspace.view.showPixels(checked);
        Invalidate.request();
    };

    pixelGridChanged = (e) => {
        var checked = this.refs.pixelGrid.checked;
        this.setState({ pixelGrid: checked });
        this.context.workspace.view.showPixelGrid(checked);
        Invalidate.request();
    };

    showFramesChanged = (e) => {
        var checked = this.refs.showFrames.checked;
        this.setState({ showFrames: checked });
        app.showFrames(checked);
        Invalidate.request();
    }

    clipArtboardsChanged = (e) => {
        var checked = this.refs.clipArtboards.checked;
        this.setState({ clipArtboards: checked });
        app.clipArtboards(checked);
        Invalidate.request();
    }

    render() {
        return <TabPageStyled className="view-settings__page">
            <div className="view-settings__page-heading">
                <FormattedMessage tagName="h3" id="@canvas" />
            </div>
            <section className="view-settings__page-body">
                <FormGroup name="Rendering">
                    <FormLine>
                        <label className="gui-check">
                            <input type="checkbox"
                                ref="showPixels"
                                checked={this.state.showPixels}
                                onChange={this.showPixelsChanged} />
                            <i />
                            <FormattedMessage id="@show.pixels" />
                        </label>
                    </FormLine>
                    <FormLine>
                        <label className="gui-check">
                            <input type="checkbox"
                                ref="pixelGrid"
                                checked={this.state.pixelGrid}
                                onChange={this.pixelGridChanged} />
                            <i />
                            <FormattedMessage id="@pixelGrid" />
                        </label>
                    </FormLine>
                    <FormLine>
                        <label className="gui-check">
                            <input type="checkbox"
                                ref="showFrames"
                                checked={this.state.showFrames}
                                onChange={this.showFramesChanged} />
                            <i />
                            <FormattedMessage id="@show.frames" />
                        </label>
                    </FormLine>
                    <FormLine>
                        <label className="gui-check">
                            <input type="checkbox"
                                ref="clipArtboards"
                                checked={this.state.clipArtboards}
                                onChange={this.clipArtboardsChanged} />
                            <i />
                            <FormattedMessage id="@settings.clipArtboards" />
                        </label>
                    </FormLine>
                </FormGroup>
            </section>
        </TabPageStyled>;
    }
}