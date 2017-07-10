import React from "react";
import BladePage from "../BladePage";
import { app, backend, IPage, Rect, Workspace, IUIElement, ArtboardType, Symbol, IArtboard, GroupContainer, ISymbol, Point, ISharedPageSetup, ResourceScope } from "carbon-core";
import { Component, dispatchAction } from "../../../CarbonFlux";
import cx from 'classnames';
import { FormattedMessage } from "react-intl";
import { Markup, MarkupLine } from "../../../shared/ui/Markup";
import { GuiButton, GuiButtonStack, GuiInput, GuiTextArea } from "../../../shared/ui/GuiComponents";
import { BladeBody } from "../BladePage";
import { PageSelect } from "../../../shared/ui/GuiSelect";
import bem from "../../../utils/commonUtils";
import EditImageBlade, { EditImageResult } from "../imageEdit/EditImageBlade";
import Tiler, { ITile } from "./Tiler";
import PublishPageForm from "./PublishPageForm";
import TabContainer, { TabArea, TabPage } from "../../../shared/TabContainer";
import { PublishAction } from "./PublishActions";

const BoardSize = 3;
const CoverSide = 300;
//giving some space for zooming in the crop editor
const CoverRect = Rect.fromSize(CoverSide * 2, CoverSide * 2);
const Dpr = 2;

interface IPublishBladeState {
    page?: IPage;
    coverUrl?: string;
    tiles?: ITile[];
    publishStep: string;
    defaultSetup: ISharedPageSetup;
}

const EmptySetup: ISharedPageSetup = { name: "", description: "", tags: "", scope: ResourceScope.Public, coverUrl: "" };

export default class PublishBlade extends Component<void, IPublishBladeState> {
    constructor(props) {
        super(props);

        this.state = {
            publishStep: "1",
            defaultSetup: EmptySetup
        };
    }

    canHandleActions() {
        return true;
    }
    onAction(action: PublishAction) {
        switch (action.type) {
            case "Publish_Published":
                if (action.response.ok === true) {
                    this.setState({ publishStep: "2" });
                    this.state.page.setProps({ name: action.response.result.name });
                }
                break;
        }
    }

    componentDidMount() {
        super.componentDidMount();
        let pages = app.pagesWithSymbols();
        if (pages.length === 1) {
            this.pageSelected(pages[0]);
        }
    }

    private pageSelected = (page: IPage) => {
        let promise: Promise<ISharedPageSetup | null>;
        if (page.props.galleryId) {
            promise = backend.shareProxy.getPageSetup(page.props.galleryId);
        }
        else {
            promise = Promise.resolve(null);
        }

        promise.then(setup => {
            this.setState({ page });

            if (!setup) {
                var tiles = this.createTiles(page);
                tiles.sort((a, b) => b.w * b.h - a.w * a.h);

                let tiler = new Tiler(BoardSize, BoardSize);
                tiles = tiler.run(tiles);

                this.renderTiles(page, tiles);
                this.setState({ defaultSetup: EmptySetup });
            }
            else {
                this.setState({ defaultSetup: setup, coverUrl: setup.coverUrl });
            }
        });
    }

    private randomizePreview = () => {
        for (let i = 0; i < 20; ++i) {
            let tiles = this.createTiles(this.state.page);
            if (tiles.length <= 1) {
                return;
            }

            tiles.sort((a, b) => a.id - b.id);

            let tiler = new Tiler(BoardSize, BoardSize);
            tiles = tiler.run(tiles);

            let oldTiles = this.state.tiles;
            for (let j = 0; i < oldTiles.length && j < tiles.length; ++j) {
                if (oldTiles[j].item !== tiles[j].item) {
                    this.renderTiles(this.state.page, tiles);
                    return;
                }
            }
        }
    }

    private renderTiles(page: IPage, tiles: ITile[]) {
        const margin = 2;
        const step = CoverSide / BoardSize;

        let group = new GroupContainer();
        group.boundaryRect(Rect.fromSize(CoverSide, CoverSide));
        for (let i = 0; i < tiles.length; ++i) {
            let tile = tiles[i];
            let symbol = tile.item as ISymbol;

            let sr = symbol.boundaryRect();
            let tr = sr.fit(Rect.fromSize(tile.w * step - margin, tile.h * step - margin));
            symbol.applyScaling(Point.create(tr.width / sr.width, tr.height / sr.height), Point.Zero);

            let pos = tr.topLeft();
            pos = pos.add2(tile.pos[1] * step + margin / 2, tile.pos[0] * step + margin / 2);
            symbol.applyTranslation(pos);

            group.add(symbol);
        }

        this.setState({ coverUrl: this.renderPreview(group), tiles });
    }

    private createTiles(page: IPage): ITile[] {
        let symbolMasters = page.getAllArtboards().filter(x => x.props.type === ArtboardType.Symbol);
        return symbolMasters.map(artboard => this.createTile(page, artboard));
    }

    private createTile(page: IPage, artboard: IArtboard) {
        let rect = artboard.boundaryRect();
        let ratio = rect.width / rect.height;
        let w, h;
        //square
        if (ratio > .5 && ratio < 1.5) {
            if (rect.width < 200) {
                w = 1;
                h = 1;
            }
            else if (rect.width < 600) {
                w = 2;
                h = 2;
            }
            else {
                w = 3;
                h = 3;
            }
        }
        //wide
        else if (ratio >= 1.5) {
            w = 2;
            h = 1;
        }
        //tall
        else {
            w = 1;
            h = 2;
        }

        var item = new Symbol();
        item.setProps({ source: { pageId: page.id(), artboardId: artboard.id() }, br: rect })
        return { w, h, item, id: Math.random() };
    }

    private renderPreview(element: IUIElement) {
        const dpr = 2;
        return Workspace.view.renderElementToDataUrl(element, CoverRect, dpr);
    }

    private openImageEditor = (ev) => {
        this.context.bladeContainer.addChildBlade(`blade_edit-publish-image`, EditImageBlade, "@caption.editCover",
            {
                page: this.state.page,
                onComplete: this.imageEditCompleted,
                allowCropping: true,
                image: this.state.coverUrl,
                dpr: Dpr,
                previewSize: CoverRect
            });
    };

    private imageEditCompleted = (res: EditImageResult) => {
        this.context.bladeContainer.close(2);
        if (res) {
            let coverUrl;
            switch (res.type) {
                case "dataUrl":
                    coverUrl = res.dataUrl;
                    break;
                case "element":
                    coverUrl = this.renderPreview(res.element);
                    break;
                case "url":
                    coverUrl = res.url;
                    break;
                case "none":
                    coverUrl = null;
                    break;
                default:
                    assertNever(res);
                    break;
            }
            if (coverUrl) {
                this.setState({ coverUrl });
                dispatchAction({ type: "Publish_CoverSelected", coverUrl });
            }
        }
    }

    private close = () => {
        this.context.bladeContainer.close(1);
    }

    render() {
        return <BladeBody>
            <TabContainer currentTabId={this.state.publishStep}>
                <TabArea className="gui-pages">
                    <TabPage className="gui-page" tabId="1">
                        <MarkupLine>
                            <div className="gui-input">
                                <p className={"gui-input__label"}>
                                    <FormattedMessage id="@publish.choosePage" />
                                </p>
                                {this.renderPageSelect()}
                            </div>
                        </MarkupLine>

                        <MarkupLine>
                            <p className={"gui-input__label"}>
                                <FormattedMessage id="@publish.choosePage1" defaultMessage="Create your cover" />
                            </p>
                        </MarkupLine>
                        <MarkupLine className="publish__avatar">
                            <figure className="publish__avatar-image"
                                style={{ backgroundImage: "url('" + this.state.coverUrl + "')" }}
                            />
                            <GuiButtonStack className="publish__avatar-controls">
                                <GuiButton
                                    mods="hover-white"
                                    icon="refresh"
                                    disabled={!this.state.page}
                                    onClick={this.randomizePreview}
                                />
                                <GuiButton
                                    mods="hover-success"
                                    icon="edit"
                                    disabled={!this.state.page}
                                    onClick={this.openImageEditor}
                                />
                            </GuiButtonStack>
                        </MarkupLine>

                        <PublishPageForm page={this.state.page} coverUrl={this.state.coverUrl} defaultSetup={this.state.defaultSetup} />
                    </TabPage>
                    <TabPage className="gui-page" tabId="2">
                        <MarkupLine><FormattedMessage id="@publish.done" tagName="p" /></MarkupLine>
                        <MarkupLine className="publish__avatar">
                            <figure className="publish__avatar-image" style={{ backgroundImage: "url('" + this.state.coverUrl + "')" }} />
                        </MarkupLine>
                        <MarkupLine>
                            <GuiButton caption="@close" mods="hover-white" onClick={this.close} />
                        </MarkupLine>
                    </TabPage>
                </TabArea>
            </TabContainer>
        </BladeBody>
    }

    private renderPageSelect() {
        let pages = app.pagesWithSymbols();
        let caption = pages.length ? "@choosePage" : "@noPagesWithSymbols";

        return <PageSelect
            className="drop_down"
            selectedItem={this.state.page}
            items={pages}
            renderItem={page => <p>{page.name()}</p>}
            caption={caption}
            onSelect={this.pageSelected}>
        </PageSelect>;
    }

    static contextTypes = {
        intl: React.PropTypes.object,
        bladeContainer: React.PropTypes.any
    }
}
