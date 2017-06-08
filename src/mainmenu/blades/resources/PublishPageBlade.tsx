import React from "react";
import BladePage from "../BladePage";
import { app, backend, ShareProxy, IPage, Rect, Workspace, IUIElement, ArtboardType, Symbol, IArtboard, GroupContainer, ISymbol, Point } from "carbon-core";
import { Component } from "../../../CarbonFlux";
import cx from 'classnames';
import { FormattedMessage } from "react-intl";
import { Markup, MarkupLine } from "../../../shared/ui/Markup";
import { GuiButton, GuiButtonStack, GuiInput, GuiTextArea } from "../../../shared/ui/GuiComponents";
import { BladeBody } from "../BladePage";
import electronEndpoint from "electronEndpoint";
import { PageSelect } from "../../../shared/ui/GuiSelect";
import bem from "../../../utils/commonUtils";
import EditImageBlade, { EditImageResult } from "../imageEdit/EditImageBlade";
import Tiler, { ITile } from "./Tiler";

const BoardSize = 3;
const CoverSide = 300;
//giving some space for zooming in the crop editor
const CoverRect = Rect.fromSize(CoverSide * 2, CoverSide * 2);
const Dpr = 2;

interface IPublishBladeState {
    page?: IPage;
    dataUrl?: string;
    name: string;
    description: string;
    tags: string;
    isPublic: boolean;
    done: boolean;
    progress: any;
    tiles?: ITile[];
}

export default class PublishBlade extends Component<void, IPublishBladeState> {
    constructor(props) {
        super(props);

        this.state = {
            name: "",
            description: "",
            tags: "",
            isPublic: false,
            done: false,
            progress: null
        };
    }

    componentDidMount() {
        super.componentDidMount();
        let pages = app.pagesWithSymbols();
        if (pages.length === 1) {
            this.pageSelected(pages[0]);
        }
    }

    private pageSelected = (page: IPage) => {
        var tiles = this.createTiles(page);
        tiles.sort((a, b) => b.w * b.h - a.w * a.h);

        let tiler = new Tiler(BoardSize, BoardSize);
        tiles = tiler.run(tiles);

        this.renderTiles(page, tiles);
    }

    private randomizePreview = () => {
        for (let i = 0; i < 20; ++i){
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

    private renderTiles(page: IPage, tiles: ITile[]){
        const margin = 2;
        const step = CoverSide / BoardSize;

        let group = new GroupContainer();
        group.boundaryRect(Rect.fromSize(CoverSide, CoverSide));
        for (let i = 0; i < tiles.length; ++i) {
            let tile = tiles[i];
            let symbol = tile.item as ISymbol;

            let sr = symbol.boundaryRect();
            let tr = sr.fit(Rect.fromSize(tile.w * step - margin, tile.h * step - margin));
            symbol.applyScaling(Point.create(tr.width/sr.width, tr.height/sr.height), Point.Zero);

            let pos = tr.topLeft();
            pos = pos.add2(tile.pos[1] * step + margin/2, tile.pos[0] * step + margin/2);
            symbol.applyTranslation(pos);

            group.add(symbol);
        }

        this.setState({ page: page, dataUrl: this.renderPreview(group), tiles });
    }

    private createTiles(page: IPage): ITile[]{
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
        item.setProps({ source: { pageId: page.id(), artboardId: artboard.id()}, br: rect })
        return { w, h, item, id: Math.random() };
    }

    private renderPreview(element: IUIElement) {
        const dpr = 2;
        return Workspace.view.renderElementToDataUrl(element, CoverRect, dpr);
    }

    _publishPage = () => {
        // TODO: show progress bar here
        app.activePage.export().then(data => {
            ShareProxy.publish({
                name: this.state.name || '',
                description: this.state.description || '',
                tags: this.state.tags || '',
                isPublic: !!this.state.isPublic,
                pageData: JSON.stringify(data),
                previewPicture: this.state.dataUrl
            })
                .then((result) => {
                    this.setState({ done: true });
                    //this.props.completed(this.state.isPublic, result.data);
                })
        });
    };

    _onChangeName = (event) => {
        this.setState({ name: event.target.value });
    };

    _onChangePublic = (event) => {
        this.setState({ isPublic: event.target.value });
    };

    _onDescriptionChange = (event) => {
        this.setState({ description: event.target.value });
    };

    _onChangeTags = (event) => {
        this.setState({ tags: event.target.value });
    };

    openImageEditor = (ev) => {
        this.context.bladeContainer.addChildBlade(`blade_edit-publish-image`, EditImageBlade, this.formatLabel("@caption.editCover"),
            {
                page: this.state.page,
                onComplete: this.imageEditCompleted,
                allowCropping: true,
                image: this.state.dataUrl,
                dpr: Dpr,
                previewSize: CoverRect
            });
    };

    private imageEditCompleted = (res: EditImageResult) => {
        this.context.bladeContainer.close(2);
        if (res) {
            if (res.type === "element") {
                this.setState({ dataUrl: this.renderPreview(res.element) });
            }
            else if (res.type === "dataUrl") {
                this.setState({ dataUrl: res.dataUrl });
            }
            else if (res.type === "url") {
                this.setState({ dataUrl: res.url });
            }
        }
    }

    _saveToDisk() {
        electronEndpoint.saveResource(() => {
            return app.activePage.export().then(data => {
                return {
                    name: this.state.name,
                    data: data,
                    description: this.state.description,
                    tags: this.state.tags,
                    image: this.state.dataUrl
                }
            });

        });
    }

    _renderPublishButton() {
        if (app.isElectron()) {
            return <MarkupLine>
                <GuiButton mods="submit" onClick={this._saveToDisk.bind(this)} caption="btn.save" defaultMessage="Save"
                    icon={true} />
            </MarkupLine>
        }

        return <MarkupLine>
            {
                (this.state.progress == null)
                    ?
                    <GuiButton mods="submit" onClick={this._publishPage} caption="btn.publish" defaultMessage="Publish"
                        icon={true} />
                    :
                    <GuiButton mods="submit" onClick={this._publishPage} caption="btn.publish" defaultMessage="Publish"
                        icon={true} progressColor="rgba(255,255,255,.2)" progressPercents={this.state.progress} />
            }

        </MarkupLine>
    }

    render() {
        var dataUrl = "url('" + this.state.dataUrl + "')"
        return <BladeBody>
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
                    style={{ backgroundImage: "url('" + this.state.dataUrl + "')" }}
                />
                <GuiButtonStack className="publish__avatar-controls">
                    <GuiButton
                        mods="hover-white"
                        icon="refresh"
                        onClick={this.randomizePreview}
                    />
                    <GuiButton
                        mods="hover-success"
                        icon="edit"
                        onClick={this.openImageEditor}
                    />
                </GuiButtonStack>
            </MarkupLine>

            <MarkupLine mods="space">
                <GuiInput caption="@publish.name" placeholder="Give it some cool name" />
            </MarkupLine>

            <MarkupLine>
                <GuiTextArea caption="@publish.description" placeholder="What inspired you?" />
            </MarkupLine>
            <MarkupLine>
                <GuiInput caption="@tags" placeholder="buttons, ios, flat, etc" />
            </MarkupLine>

            <MarkupLine>
                <div className="gui-input">
                    <p className={"gui-input__label"}>
                        <FormattedMessage id="translateme!" defaultMessage={"Тип все дела"} />
                    </p>

                    <label className="gui-radio gui-radio_line">
                        <input type="radio" checked={true} onChange={console.log} data-option="activeArtboard" />
                        <i />
                        <span><FormattedMessage id="@publish.public" /></span>
                    </label>

                    <label className="gui-radio gui-radio_line">
                        <input type="radio" checked={false} onChange={console.log} data-option="activePage" />
                        <i />
                        <FormattedMessage id="@publish.private" />
                    </label>

                </div>
            </MarkupLine>

            {this._renderPublishButton()}
        </BladeBody>
    }

    private renderPageSelect() {
        let pages = app.pagesWithSymbols();
        let caption = pages.length ? "@choosePages" : "@noPagesWithSymbols";

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
