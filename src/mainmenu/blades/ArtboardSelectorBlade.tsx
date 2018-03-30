import * as React from "react";
import { IUIElement, IPage, IArtboard, app, IRect, workspace, backend } from "carbon-core";
import { FormattedMessage } from "react-intl";
import { ArtboardSelect } from "../../shared/ui/GuiSelect";
import { Component } from "../../CarbonFlux";
import { MarkupLine, MarkupSubmit } from "../../shared/ui/Markup";
import { GuiButton, GuiButtonBlock } from "../../shared/ui/GuiComponents";
import { BladeBody } from "./BladePage";
import { ElementPreview } from "./ElementPreview";
import { Blade } from "./Blade";

interface ArtboardSelectorBladeProps {
    dpr: number;
    artboard?: IArtboard;
    page?: IPage;
    onChosen: (oldArtboard: IArtboard, newArtboard: IArtboard, dataUrl: string) => void;
}

interface ArtboardSelectorBladeState {
    artboard: IArtboard;
    image: string;
}

export class ArtboardSelectorBlade extends Blade<ArtboardSelectorBladeProps, ArtboardSelectorBladeState> {
    refs: {
        preview: ElementPreview;
    }

    constructor(props: ArtboardSelectorBladeProps) {
        super(props);

        this.state = {
            artboard: props.artboard,
            image: null
        };
    }

    componentWillReceiveProps(nextProps: ArtboardSelectorBladeProps) {
        this.setState({ artboard: nextProps.artboard });
    }

    private getArtboards() {
        if (this.props.page) {
            return this.props.page.getAllArtboards();
        }
        return app.getAllArtboards()
    }

    private artboardChosen = (artboard: IArtboard) => {
        this.setState({ artboard });
    }

    private onOk = () => {
        if (this.state.artboard) {
            this.props.onChosen(this.props.artboard, this.state.artboard, this.refs.preview.toDataUrl());
            this.closeLast();
        }
    }
    private onCancel = () => {
        this.closeLast();
    }

    render() {
        return <BladeBody className="select-artboard">
            <MarkupLine mods="stretch">
                <div className="gui-input">
                    <ArtboardSelect
                        className="drop_down"
                        caption="@chooseArtboard"
                        items={this.getArtboards()}
                        selectedItem={this.state.artboard}
                        renderItem={artboard => <p>{artboard.name}</p>}
                        onSelect={this.artboardChosen}>
                    </ArtboardSelect>
                </div>
            </MarkupLine>

            <MarkupLine>
                <ElementPreview className="select-artboard__preview" ref="preview" element={this.state.artboard} dpr={this.props.dpr} />
            </MarkupLine>

            <MarkupSubmit>
                <GuiButtonBlock>
                    <GuiButton mods="hover-cancel" onClick={this.onCancel} caption="@cancel" />
                    <GuiButton mods="submit" onClick={this.onOk} caption="@save" disabled={!this.state.artboard} />
                </GuiButtonBlock>
            </MarkupSubmit>
        </BladeBody>
    }
}