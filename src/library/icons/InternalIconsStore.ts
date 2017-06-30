import IconFinderApi from "./IconFinderApi";
import IconsActions from "./IconsActions";
import CarbonActions from "../../CarbonActions";
import { handles, CarbonStore, dispatch } from '../../CarbonFlux';
import { Image, Brush, ContentSizing, ArtboardType, UIElementFlags, IconSetSpriteManager } from "carbon-core";
import Toolbox from "../Toolbox";

var key = 0;

interface InternalIconInfo {
    pageId: string
    artboard: any;
    element: any;
}

export class InternalIconsStore extends CarbonStore<any>{
    [name: string]: any;

    constructor() {
        super();

        this.state = {
            icons: []
        };
    }

    createElement({templatePid, templateAid, templateId, templateWidth, templateHeight}) {
        var element = new Image();

        element.setProps({
            width: templateWidth ? templateWidth : 46,
            height: templateHeight ? templateHeight : 46,
            source: Image.createElementSource(templatePid, templateAid, templateId)
        });

        return element;
    }

    @handles(CarbonActions.pageAdded)
    onPageAdded({ page }) {
        var iconSetArtboards = page.getAllResourceArtboards(ArtboardType.IconSet);
        var iconSets = this.state.iconSets.slice();
        for (var i = 0; i < iconSetArtboards.length; ++i) {
            iconSets.push(this._buildIconSet(iconSetArtboards[i]));
        }

        this.setState({ iconSets: iconSets });
    }

    _buildiconSet(artboard) {
        var iconSet = {
            pageId: artboard.parent().id(),
            artboard: artboard,
            elements: []
        }
        var elements = iconSet.elements;
        artboard.applyVisitor(e => {
            if (e.hasFlags(UIElementFlags.Icon)) {
                elements.push(e);
            }
        })

        return iconSet;
    }


    buildIconGroup(groups, set) {
        let elements = set.elements;
        var group = {
            name: set.artboard.name(),
            templates:[],
            spriteUrl:null,
            spriteUrl2x:null,
            size:null
        }

        groups.push(group);

        return IconSetSpriteManager.getSpriteForIconSet(set.artboard, 32).then(data => {
            var x = 0;
            group.spriteUrl = data.spriteUrl,
            group.spriteUrl2x = data.spriteUrl2x,
            group.size = data.size
            for (let e of elements) {
                group.templates.push({
                    "autoPosition": "center",
                    "id": e.id(),
                    "type":InternalIconsStore.StoreType,
                    "pageId": set.pageId,
                    "artboardId": set.artboard.id(),
                    "realHeight": e.height(),
                    "realWidth": e.width(),
                    "style": {padding:4},
                    "spriteMap": [
                        x,
                        0,
                        32,
                        32
                    ],
                    title: e.name()
                });
                x+=32;
            }
        });
    }

    getIconsConfig() {
        var iconSets = this.state.iconSets;
        if (!iconSets) {
            return [];
        }

        var config = {
            groups:[],
            id:''
        };
        var promises = [];
        for (var set of iconSets) {
            promises.push(this.buildIconGroup(config.groups, set));
        }

        return Promise.all(promises).then(()=>config);
    }

    @handles(CarbonActions.loaded)
    onAppLoaded({ app }) {
        var iconSetArtboards = app.getAllResourceArtboards(ArtboardType.IconSet);
        var iconSets = [];
        for (var i = 0; i < iconSetArtboards.length; ++i) {
            iconSets.push(this._buildiconSet(iconSetArtboards[i]));
        }

        this.setState({ iconSets: iconSets });
    }

    @handles(CarbonActions.pageRemoved)
    onPageRemoved({ page }) {
        var iconSets = this.state.iconSets.slice();
        for (var i = iconSets.length - 1; i >= 0; --i) {
            if (iconSets[i].pageId === page.id()) {
                iconSets.splice(i, 1);
            }
        }

        this.setState({ iconSets: iconSets });
    }

    @handles(CarbonActions.resourceChanged)
    onResourceChanged({ resourceType, element }) {
        if (resourceType !== ArtboardType.IconSet) {
            return;
        }

        var iconSets = this.state.iconSets.slice();
        let iconSet = this._buildiconSet(element);

        let inserted = false;
        for (var i = 0; i < iconSets.length; ++i) {
            if (iconSets[i].artboard === element) {
                iconSets[i] = iconSet;
                inserted = true;
                break;
            }
        }

        if (!inserted) {
            iconSets.push(iconSet);
        }

        this.setState({ iconSets: iconSets });
    }

    @handles(CarbonActions.resourceDeleted)
    onIconSetDeleted({ resourceType, element }) {
        if (resourceType !== ArtboardType.IconSet) {
            return;
        }

        let iconSets = this.state.iconSets.slice();
        var index = iconSets.findIndex(p => p.id === element.id());
        if (index !== -1) {
            iconSets.splice(index, 1);
            this.setState({ iconSets: iconSets });
        }
    }

    static StoreType = "internalIcons";
}

export default Toolbox.registerStore(InternalIconsStore.StoreType, new InternalIconsStore());

