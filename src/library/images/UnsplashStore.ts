import Unsplash, {toJson} from "unsplash-js";
import ImagesActions, { ImagesAction } from "./ImagesActions";
import {handles, CarbonStore, dispatch} from "../../CarbonFlux";
import { Image, IPaginatedResult, util } from "carbon-core";
import Toolbox from "../Toolbox";
import { IToolboxStore, Stencil, StencilInfo } from "../LibraryDefs";

const PageSize = 15;

export interface UnsplashStencil extends Stencil {
    type: string;
    url: string;
    urls?: any[],
    portrait: boolean;
    thumbUrl: string;
    thumbHeight: number;
    credits: {
        link: string;
        name: string;
    }
}

export type UnsplashStoreState = {
    error: boolean;
    term: string;
    results: any[];
}

export class UnsplashStore extends CarbonStore<UnsplashStoreState> implements IToolboxStore {
    storeType = "unsplash";

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
            term: "cars",
            results: []
        };
    }

    findStencil(info: StencilInfo) {
        return this.state.results.find(x => x.id === info.stencilId);
    }

    createElement(stencil: UnsplashStencil){
        var element = new Image();
        element.setProps({
            width: stencil.realWidth, height: stencil.realHeight,
            source: Image.createUrlSource(stencil.url),
            sourceProps: {cors: true, urls: stencil.urls, width: stencil.realWidth, height: stencil.realHeight, cw: stencil.realWidth}
        });
        return element;
    }
    elementAdded() {
    }

    onAction(action: ImagesAction) {
        super.onAction(action);

        switch (action.type) {
            case "Images_UnsplashSearch":
                if (action.q){
                    this.setState({
                        term: action.q, error: false, results: []
                    });
                }
                return;
        }
    }

    runQuery(start: number, stop: number): Promise<IPaginatedResult<any>> {
        if (!this.state.term){
            return Promise.reject(new Error("No unsplash search term"));
        }

        let startPage = Math.floor(start / PageSize);
        let stopPage = Math.ceil(stop / PageSize);

        let promises = [];
        for (let i = startPage; i < stopPage; ++i) {
            promises.push(this._unsplash.search.photos(this.state.term, i + 1, PageSize)
                .then(x => {
                    if (x.status !== 200) {
                        throw new Error("Could not contact unsplash");
                    }
                    return x;
                })
                .then(x => toJson(x)));
        }

        return Promise.all(promises)
            .then((pages) => {
                let images = [];
                if (!pages.length) {
                    return { pageData: images, totalCount: 0 };
                }

                //return more than asked since we already have data anyway
                let startIndex = start % PageSize;
                let stopIndex = pages[0].results.length;
                images = pages[0].results.slice(startIndex, stopIndex);

                for (let i = 1; i < pages.length - 1; ++i) {
                    util.pushAll(images, pages[i].results);
                }

                return { pageData: images, totalCount: pages[0].total };
            })
            .then(data => this.handleResults(data, start))
            .catch(e =>{
                dispatch(ImagesActions.unsplashError());
                throw e;
            });
    }

    handleResults(data, start: number): IPaginatedResult<UnsplashStencil>{
        var page = data.pageData.map(x =>{
            return {
                id: x.id,
                type: this.storeType,
                title: x.description || "Image",
                thumbUrl: x.urls.small,
                url: x.urls.full,
                realWidth: x.width,
                realHeight: x.height,
                portrait: x.height >= x.width,
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

        let results = this.state.results;
        for (let i = 0; i < page.length; ++i) {
            results[i + start] = page[i];
        }
        this.setState({ results });

        return {pageData: page, totalCount: data.totalCount};
    }

    @handles(ImagesActions.unsplashError)
    handleError(){
        this.setState({error: true});
    }
}

export default Toolbox.registerStore(new UnsplashStore());