import React from "react";
import PropTypes from "prop-types";
import BladePage from "../BladePage";
import { app, backend, IPage, Rect, workspace, IUIElement, ArtboardType, Symbol, IArtboard, GroupContainer, ISymbol, Point, ISharedPageSetup, ISharedResource, ResourceScope, IPublishPageResult, Screenshot } from "carbon-core";
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
import BladeContainer from "../BladeContainer";
import EditableList from "../../../shared/EditableList";
import AddButton from "../../../shared/ui/AddButton";
import { ArtboardSelectorBlade } from "../ArtboardSelectorBlade";

type ScreenshotList = new (props) => EditableList<Screenshot>;
const ScreenshotList = EditableList as ScreenshotList;

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
    screenshots: Screenshot[];
    publishedPageId: string;
}

const EmptySetup: ISharedPageSetup = { name: "", description: "", tags: "", scope: ResourceScope.Public, coverUrl: "", screenshots: [] };

export default class PublishBlade extends Component<void, IPublishBladeState> {
    context: {
        bladeContainer: BladeContainer
    }

    constructor(props) {
        super(props);

        this.state = {
            publishStep: "1",
            defaultSetup: EmptySetup,
            screenshots: [],
            publishedPageId: ""
        };
    }

    canHandleActions() {
        return true;
    }
    onAction(action: PublishAction) {
        switch (action.type) {
            case "Publish_Published":
                if (action.response.ok === true) {
                    this.setState({ publishStep: "2", publishedPageId: action.response.result.galleryId });
                    this.state.page.setProps({ name: action.response.result.name });
                }
                break;
        }
    }

    componentDidMount() {
        super.componentDidMount();
        let pages = app.pages;
        if (pages.length === 1) {
            this.pageSelected(pages[0]);
        }
    }

    private pageSelected = (page: IPage) => {
        let promise: Promise<ISharedResource | null>;
        if (page.props.galleryId) {
            promise = backend.shareProxy.getPageSetup(page.props.galleryId);
        }
        else {
            promise = Promise.resolve(null);
        }

        promise.then(setup => {
            this.setState({ page });

            if (!setup || setup.authorId !== backend.getUserId()) {
                var tiles = this.createTiles(page);
                tiles.sort((a, b) => b.w * b.h - a.w * a.h);

                let tiler = new Tiler(BoardSize, BoardSize);
                tiles = tiler.run(tiles);

                this.renderTiles(page, tiles);
                this.setState({ defaultSetup: EmptySetup });
            }
            else {
                this.setState({ defaultSetup: setup, coverUrl: setup.coverUrl, screenshots: setup.screenshots });
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
        return workspace.view.renderElementToDataUrl(element, CoverRect, dpr);
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
    }

    private onAddScreenshot = () => {
        this.onEditScreenshot(null);
    }
    private onEditScreenshot = (screenshot?: Screenshot) => {
        let artboard = null;
        if (screenshot) {
            artboard = app.findNodeByIdBreadthFirst(screenshot.id);
        }
        this.context.bladeContainer.addChildBlade(`blade_edit-publish-image`, ArtboardSelectorBlade, "@publish.addScreenshot",
            {
                page: this.state.page,
                artboard,
                onChosen: this.screenshotEditCompleted,
                dpr: Dpr
            });

        return false;
    }
    private onDeleteScreenshot = (screenshot: Screenshot) => {
        let screenshots = this.state.screenshots.slice();
        let index = screenshots.indexOf(screenshot);
        screenshots.splice(index, 1);
        this.setState({ screenshots });
    }

    private imageEditCompleted = (coverUrl?: string) => {
        this.context.bladeContainer.close(2);
        if (coverUrl) {
            this.setState({ coverUrl });
            dispatchAction({ type: "Publish_CoverSelected", coverUrl });
        }
    }

    private screenshotEditCompleted = (oldArtbard: IArtboard, newArtboard: IArtboard, dataUrl: string) => {
        let screenshots = this.state.screenshots.slice();
        let updated = false;

        if (oldArtbard) {
            let old = screenshots.find(x => x.id === oldArtbard.id());
            if (old) {
                old.id = newArtboard.id();
                old.name = newArtboard.name();
                old.url = dataUrl;
                updated = true;
            }
        }

        if (!updated) {
            let existing = screenshots.findIndex(x => x.id === newArtboard.id());
            if (existing !== -1) {
                screenshots.splice(existing, 1);
            }

            screenshots.push({id: newArtboard.id(), name: newArtboard.name(), url: dataUrl});
        }
        this.setState({ screenshots });
    }

    private close = () => {
        this.context.bladeContainer.close(1);
    }

    render() {
        return <BladeBody>
            <TabContainer currentTabId={this.state.publishStep}>
                <TabArea className="gui-pages">
                    <TabPage className="gui-page" tabId="1">
                        <MarkupLine mods="stretch">
                            <div className="gui-input">
                                <p className={"gui-input__label"}>
                                    <FormattedMessage id="@publish.choosePage" />
                                </p>
                                {this.renderPageSelect()}
                            </div>
                        </MarkupLine>

                        <MarkupLine mods="stretch">
                            <p className={"gui-input__label"}>
                                <FormattedMessage id="@publish.createCover"  />
                            </p>
                        </MarkupLine>
                        <MarkupLine className="publish__avatar" mods={["stretch", "horizontal"]}>
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

                        <MarkupLine mods="stretch">
                            <p className={"gui-input__label"}>
                                <FormattedMessage id="@publish.screenshots"  />
                            </p>
                            <ScreenshotList data={this.state.screenshots} idGetter={x => x.id} nameGetter={x => x.name}
                                onEdit={this.onEditScreenshot}
                                onDelete={this.onDeleteScreenshot}/>
                            <AddButton className="publish__addscreen" onClick={this.onAddScreenshot} caption="@publish.addScreenshot"/>
                        </MarkupLine>

                        <PublishPageForm page={this.state.page} coverUrl={this.state.coverUrl} defaultSetup={this.state.defaultSetup} screenshots={this.state.screenshots} />
                    </TabPage>
                    <TabPage className="gui-page" tabId="2">
                        <MarkupLine><FormattedMessage id="@publish.done" tagName="p" /></MarkupLine>
                        <MarkupLine mods="slim">
                            <a className="publish__link" href={"/library/" + this.state.publishedPageId} target="_blank">
                                <FormattedMessage tagName="p" id="@publish.viewInGallery" />
                            </a>
                        </MarkupLine>
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
        let pages = app.pages;
        let caption = pages.length ? "@choosePage" : "@noPages";

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
        intl: PropTypes.object,
        bladeContainer: PropTypes.any
    }
}
