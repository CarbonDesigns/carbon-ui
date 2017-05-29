import Unsplash, {toJson} from "unsplash-js";
import ImagesActions from "./ImagesActions";
import {handles, CarbonStore, dispatch} from "../../CarbonFlux";
import {Image} from "carbon-core";
import Toolbox from "../Toolbox";

const PageSize = 15;

export class UnsplashStore extends CarbonStore<any> {
    [name: string]: any;

    constructor(){
        super();

        this._unsplash = new Unsplash({
            applicationId: "0acf8fe9a6e08e2d801b9198fc156f3e943480b5e87a3a7fff2f2c772bf5dd08",
            secret: "",
            callbackUrl: ""
        });

        this.state = {
            error: false,
            message: "",
            term: "cars",
            hasMore: false,
            results: []
        };
    }

    findById(id){
        return this.state.results.find(x => x.id === id);
    }

    createElement(id){
        var image = this.findById(id);
        var element = new Image();
        element.setProps({
            width: image.realWidth, height: image.realHeight,
            source: Image.createUrlSource(image.url),
            sourceProps: {cors: true, urls: image.urls, width: image.realWidth, height: image.realHeight, cw: image.realWidth}
        });
        return element;
    }

    @handles(ImagesActions.search, ImagesActions.webSearch)
    search({term}){
        if (term){
            this.setState({
                term, error: false, message: "", results: [], hasMore: true
            });
        }
    }

    runQuery(page){
        if (!this.state.term){
            return Promise.reject(new Error("No unsplash search term"));
        }
        return this._unsplash.photos.searchPhotos(this.state.term, undefined, page, PageSize)
            .then(toJson)
            .then(data => this.handleResults(data))
            .catch(e =>{
                dispatch(ImagesActions.unsplashError("Could not connect"));
                throw e;
            });
    }

    handleResults(data){
        var page = data.map(x =>{
            return {
                id: x.id,
                type: UnsplashStore.StoreType,
                name: x.width + "x" + x.height + " " + x.categories.map(x => x.title).join(", "),
                spriteUrl: x.urls.small,
                url: x.urls.full,
                realWidth: x.width,
                realHeight: x.height,
                cx: {
                    portrait: x.height >= x.width
                },
                fill: true,
                credits: {
                    name: 'by ' + x.user.name,
                    link: x.user.links.html
                },
                urls: {
                    raw: x.urls.raw,
                    links: [
                        {
                            w: 200,
                            url: x.urls.thumb.substr(x.urls.raw.length)
                        },
                        {
                            w: 400,
                            url: x.urls.small.substr(x.urls.raw.length)
                        },
                        {
                            w: 1080,
                            url: x.urls.regular.substr(x.urls.raw.length)
                        },
                        {
                            w: x.width,
                            url: x.urls.full.substr(x.urls.raw.length)
                        }
                    ]
                }
            };
        });
        var newState: any = {};
        if (page.length){
            newState = {results: this.state.results.concat(page)};
        }
        else{
            if (!this.state.results.length){
                dispatch(ImagesActions.unsplashNoResults());
            }
            newState.hasMore = false;
        }
        this.setState(newState);
        return {items: page, hasMore: page.length > 0};
    }

    @handles(ImagesActions.unsplashNoResults)
    handleNoResults(){
        this.setState({message: "Nothing found..."});
    }

    @handles(ImagesActions.unsplashError)
    handleError({message}){
        this.setState({message, error: true});
    }

    static StoreType = "unsplash";
}

export default Toolbox.registerStore(UnsplashStore.StoreType, new UnsplashStore());