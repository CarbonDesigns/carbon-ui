import IconFinderApi from "./IconFinderApi";
import IconsActions, { IconsAction } from "./IconsActions";
import CarbonActions, { CarbonAction } from "../../CarbonActions";
import { CarbonStore, dispatchAction } from '../../CarbonFlux';
import { util, IArtboard, Image, Brush, ContentSizing, ArtboardType, UIElementFlags, PatchType, app, Page, IArtboardProps, IPage, IUIElement, ISize, Artboard } from "carbon-core";
import Toolbox from "../Toolbox";
import { IToolboxStore, StencilInfo, ToolboxConfig, ToolboxGroup, Stencil, SpriteStencilInfo, PageSpriteCacheItem, SpriteStencil } from "../LibraryDefs";
import IconSetSpriteManager from "../IconSetSpriteManager";
import { Operation } from "../../shared/Operation";

export type InternalIconsStoreState = {
    config: ToolboxConfig<SpriteStencil>;
    configVersion: number;
    dirtyConfig: boolean;
    changedId: string | null;
    activeCategory: any;
    lastScrolledCategory: any;
    operation: Operation;
}

type ArtboardState = {
    pageId: string;
    artboardId: string;
    version: string;
}

const IconSize = 32;
const DeletedVersion = "deleted";

export class InternalIconsStore extends CarbonStore<InternalIconsStoreState> implements IToolboxStore {
    storeType = "internalIcons";

    private artboardStates: ArtboardState[] = [];

    constructor() {
        super();

        this.state = {
            config: null,
            configVersion: 0,
            dirtyConfig: false,
            changedId: null,
            lastScrolledCategory: null,
            activeCategory: null,
            operation: null
        };
    }

    findStencil(info: SpriteStencilInfo) {
        for (let i = 0; i < this.state.config.groups.length; ++i) {
            for (let j = 0; j < this.state.config.groups[i].items.length; ++j) {
                let stencil = this.state.config.groups[i].items[j];
                if (stencil.id === info.stencilId && stencil.pageId === info.pageId) {
                    return stencil;
                }
            }
        }
        return null;
    }

    createElement(stencil: SpriteStencil) {
        let element = new Image();
        let page = app.getImmediateChildById(stencil.pageId);
        let sourceElement = page.findNodeByIdBreadthFirst(stencil.id);
        let artboard = sourceElement.findAncestorOfType<IArtboard>(Artboard);

        element.setProps({
            width: stencil.realWidth,
            height: stencil.realHeight,
            source: Image.createElementSource(stencil.pageId, artboard.id(), stencil.id)
        });

        return element;
    }
    elementAdded() {
    }

    getConfig() {
        if (!this.state.config) {
            this.setConfig();
        }
        return this.state.config;
    }

    onAction(action: CarbonAction | IconsAction) {
        super.onAction(action);

        switch (action.type) {
            case "Icons_Refresh":
                this.updateDirtySets();
                return;
            case "Icons_Update":
            case "Carbon_AppUpdated":
                this.setConfig();
                return;
            case "Carbon_PropsChanged":
                if (action.element instanceof Page && action.props.iconSpriteCache) {
                    // if the page is updated by another user, make a refresh in a new cycle
                    // to ensure that all other changes are applied first
                    dispatchAction({ type: "Icons_Update", async: true });
                }
                return;

            case "Carbon_ResourceAdded":
                this.onResourceAdded(action.resourceType, action.resource);
                return;
            case "Carbon_ResourceChanged":
                this.onResourceChanged(action.resourceType, action.resource);
                return;
            case "Carbon_ResourceDeleted":
                this.onIconSetDeleted(action.resourceType, action.resource, action.parent);
                return;

            case "Icons_ClickedCategory":
                this.onCategoryClicked(action.category);
                return;
            case "Icons_ScrolledToCategory":
                this.onScrolledToCategory(action.category);
                return;
        }
    }

    private onResourceAdded(resourceType: ArtboardType, artboard: IArtboard) {
        if (resourceType !== ArtboardType.IconSet) {
            return;
        }

        this.markArtboardAsDirty(artboard.parent().id(), artboard.id());

        if (!this.state.config) {
            this.updateDirtySets();
        }
        else {
            this.setState({ dirtyConfig: true });
        }
    }

    private onResourceChanged(resourceType, artboard: IArtboard) {
        if (resourceType !== ArtboardType.IconSet) {
            return;
        }

        this.markArtboardAsDirty(artboard.parent().id(), artboard.id());
        this.setState({ dirtyConfig: true });
    }

    private onIconSetDeleted(resourceType, artboard: IArtboard, page: IPage) {
        if (resourceType !== ArtboardType.IconSet) {
            return;
        }

        this.markArtboardAsDirty(page.id(), artboard.id(), DeletedVersion);
        this.setState({ dirtyConfig: true });
    }

    private setConfig() {
        let pages = app.pages.filter(x => x.props.iconSpriteCache);

        let newStates: ArtboardState[] = [];
        for (let i = 0; i < pages.length; ++i) {
            let cacheItems = pages[i].props.iconSpriteCache as PageSpriteCacheItem[];
            for (let j = 0; j < cacheItems.length; ++j) {
                newStates.push({ pageId: pages[i].id(), artboardId: cacheItems[j].id, version: cacheItems[j].version });
            }
        }

        if (this.artboardStates.length) {
            if (this.areSameArtboardStates(this.artboardStates, newStates) || !this.hasDirtyArtboards()) {
                let config = this.buildToolboxConfig(pages);
                this.setState({ dirtyConfig: false, config, configVersion: ++this.state.configVersion, operation: null });
                this.artboardStates = newStates;
            }
            else {
                this.setState({ dirtyConfig: true });
            }
        }
        else {
            let config = this.buildToolboxConfig(pages);
            let activeCategory = this.state.activeCategory || config.groups[0];

            this.setState({ dirtyConfig: false, config, activeCategory, configVersion: ++this.state.configVersion });
            this.artboardStates = newStates;
        }
    }

    private buildToolboxConfig(pages: IPage[]) {
        let config: ToolboxConfig<SpriteStencil> = {
            id: util.createUUID(),
            groups: []
        }

        for (let i = 0; i < pages.length; ++i) {
            let page = pages[i];
            let cacheItems = pages[i].props.iconSpriteCache as PageSpriteCacheItem[];

            for (let j = 0; j < cacheItems.length; j++) {
                let cacheItem = cacheItems[j];
                let artboard = page.getImmediateChildById<IArtboard>(cacheItem.id);
                let elements = this.buildIconSet(artboard);
                let group: ToolboxGroup<SpriteStencil> = {
                    name: artboard.name(),
                    items: []
                }

                let x = 0;
                for (let k = 0; k < elements.length; ++k) {
                    let element = elements[k];
                    group.items.push({
                        id: element.id(),
                        realWidth: IconSize,
                        realHeight: IconSize,
                        spriteMap: { x, y: 0, width: IconSize, height: IconSize },
                        title: element.name(),
                        spriteSize: cacheItem.spriteSize,
                        spriteUrl: cacheItem.spriteUrl,
                        spriteUrl2x: cacheItem.spriteUrl2x,
                        pageId: page.id()
                    });
                    x += IconSize;
                }
                config.groups.push(group);
            }
        }

        return config;
    }

    private buildIconSet(artboard: IArtboard): IUIElement[] {
        var elements: IUIElement[] = [];

        artboard.applyVisitor(e => {
            if (e.hasFlags(UIElementFlags.Icon)) {
                elements.push(e);
            }
        });

        elements.sort((a, b) => {
            let rect1 = a.getBoundingBoxGlobal();
            let rect2 = b.getBoundingBoxGlobal();

            if (rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y) {
                return rect1.x - rect2.x;
            }
            return rect1.y - rect2.y;
        });

        return elements;
    }

    private updateDirtySets() {
        let dirtyArtboards = this.artboardStates.filter(x => !x.version || x.version === DeletedVersion);
        if (!dirtyArtboards.length) {
            return;
        }

        this.setState({ operation: Operation.start() });
        app.beginUpdate();

        let promises = [];
        let artboards: IArtboard[] = [];
        for (let i = dirtyArtboards.length - 1; i >= 0; --i) {
            let artboardState = dirtyArtboards[i];
            let page = app.getImmediateChildById(artboardState.pageId);

            if (!page) {
                this.deleteArtboardState(artboardState.pageId, artboardState.artboardId);
                continue;
            }

            let artboard = page.getImmediateChildById<IArtboard>(artboardState.artboardId);
            if (!artboard || artboardState.version === DeletedVersion) {
                this.deleteArtboardState(artboardState.pageId, artboardState.artboardId);
                page.patchProps(PatchType.Remove, "iconSpriteCache", {
                    id: artboardState.artboardId
                });
                continue;
            }

            artboardState.version = util.createUUID();
            artboards.push(artboard);

            let elements = this.buildIconSet(artboard);
            promises.push(IconSetSpriteManager.buildAndUploadSprite(artboard.id(), artboardState.version, elements, IconSize));
        }
        Promise.all(promises)
            .then(results => {
                for (let i = 0; i < results.length; ++i) {
                    let result = results[i];
                    let artboard = artboards[i];
                    artboard.parent().patchProps(PatchType.Remove, "iconSpriteCache", {
                        id: artboard.id()
                    });
                    artboard.parent().patchProps(PatchType.Insert, "iconSpriteCache", result);
                }
            })
            .then(() => this.state.operation.stop())
            .finally(() => app.endUpdate());
    }

    private onCategoryClicked(category) {
        this.setState({ activeCategory: category, lastScrolledCategory: category });
    }

    private onScrolledToCategory(category) {
        this.setState({ activeCategory: category });
    }

    private areSameArtboardStates(a: ArtboardState[], b: ArtboardState[]) {
        if (a.length !== b.length) {
            return false;
        }
        return a.every(x => b.findIndex(y => y.pageId === x.pageId && y.artboardId === x.artboardId && y.version === x.version) !== -1);
    }

    private markArtboardAsDirty(pageId: string, artboardId: string, version = "") {
        let state = this.artboardStates.find(x => x.pageId === pageId && x.artboardId === artboardId);
        if (state) {
            state.version = version;
        }
        else {
            this.artboardStates.push({
                artboardId,
                pageId,
                version
            });
        }
    }
    private deleteArtboardState(pageId: string, artboardId: string) {
        let i = this.artboardStates.findIndex(x => x.pageId === pageId && x.artboardId === artboardId);
        if (i !== -1) {
            this.artboardStates.splice(i, 1);
        }
    }
    private hasDirtyArtboards() {
        return this.artboardStates.some(x => !x.version || x.version === DeletedVersion);
    }
}

export default Toolbox.registerStore(new InternalIconsStore());

