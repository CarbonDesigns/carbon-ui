import IconFinderApi from "./IconFinderApi";
import IconsActions from "./IconsActions";
import {handles, CarbonStore, dispatch} from '../../CarbonFlux';
import {Image, Brush, ContentSizing} from "carbon-core";
import Toolbox from "../Toolbox";

var key = 0;

export class IconFinderStore extends CarbonStore<any>{
    [name: string]: any;

    constructor(){
        super();

        this._api = new IconFinderApi();

        this.state = {
            error: false,
            message: "",
            term: "football",
            hasMore: false,
            results: []
        };
    }

    createElement(templateId){
        var icon = this.findById(templateId);
        var element = new Image();
        element.setProps({
            width: icon.realWidth, height: icon.realHeight,
            source: icon.spriteUrl ? Image.createUrlSource(icon.spriteUrl) : Image.EmptySource,
            fill: Brush.Empty,
            sizing: ContentSizing.fit,
            sourceProps: {
                cors: true,
                svg: icon.svg,
                urls: icon.urls,
                width: icon.realWidth,
                height: icon.realHeight,
                cw: icon.realWidth
            }
        });
        return element;
    }

    findById(id){
        return this.state.results.find(x => x.id === id);
    }

    @handles(IconsActions.search, IconsActions.webSearch)
    search({term}){
        if (term){
            this.setState({
                term, error: false, message: "", results: [], hasMore: true
            });
        }
    }

    runQuery(page){
        if (!this.state.term){
            return Promise.reject(new Error("No iconfinder search term"));
        }
        return this._api.search(this.state.term, page)
            .then(data => this.handleResults(data))
            .catch(e =>{
                dispatch(IconsActions.iconFinderError("Could not connect"));
                throw e;
            });
    }

    handleResults(data){
        var page = data.icons.map(x => {
            var largestSize = x.raster_sizes[x.raster_sizes.length-1].size;
            var thumbUrl = null;
            var thumbSize = 128;
            for (var i = x.raster_sizes.length -1; i >= 0; --i){
                var raster = x.raster_sizes[i];
                if (raster.size <= 256){
                    var format = raster.formats.find(x => x.format === "png");
                    if (format){
                        thumbUrl = format.preview_url;
                    }
                    thumbSize = raster.size;
                    break;
                }
            }

            if (thumbUrl === null){
                return this.notFound();
            }

            var sizeDesc = x.raster_sizes.length === 1 ? x.raster_sizes[0].size + "px" :
                x.raster_sizes[0].size + "px-" + largestSize + "px";

            var baseUrl = thumbUrl.substring(0, thumbUrl.lastIndexOf('/'));

            var icon: any = {
                id: ++key + "", //sometimes the same icon is returned on different pages
                type: IconFinderStore.StoreType,
                name: sizeDesc + ", " + x.tags.join(", "),
                spriteUrl: thumbUrl,
                realWidth: thumbSize,
                realHeight: thumbSize,
                premium: x.is_premium,
                urls: {
                    raw: baseUrl,
                    links: x.raster_sizes
                        .filter(s => s.formats.find(f => f.format === "png"))
                        .map(s => {
                            return {
                                w: s.size,
                                url: s.formats.find(f => f.format === "png").preview_url.substring(baseUrl.length)
                            }
                        })
                }
            };

            if (!x.is_premium && x.type === "vector" && x.vector_sizes.length){
                var svg = x.vector_sizes[0].formats.find(f => f.format === "svg");
                if (svg){
                    icon.svg = IconFinderApi.Base + svg.download_url;
                }
            }

            return icon;
        });
        var newState: any = {};
        if (page.length){
            newState = {results: this.state.results.concat(page)};
        }
        else{
            if (!this.state.results.length){
                dispatch(IconsActions.iconFinderNoResults());
            }
            newState.hasMore = false;
        }
        this.setState(newState);
        return {items: page, hasMore: page.length > 0};
    }

    notFound(){
        return {
            id: ++key + "",
            type: IconFinderStore.StoreType,
            name: "404 - Not Found",
            spriteUrl: "",
            realWidth: 50,
            realHeight: 50
        };
    }

    @handles(IconsActions.iconFinderNoResults)
    handleNoResults(){
        this.setState({message: "Nothing found..."});
    }

    @handles(IconsActions.iconFinderError)
    handleError({message}){
        this.setState({message, error: true});
    }

    static StoreType = "iconFinder";
}

export default Toolbox.registerStore(IconFinderStore.StoreType, new IconFinderStore());
