import velocity from "velocity-animate";
import dragAndDrop from "./DragAndDrop";
import {handles, CarbonStore, dispatch} from "../CarbonFlux";
import {richApp} from '../RichApp';
import CarbonActions from "../CarbonActions";
import StencilsActions from "./stencils/StencilsActions";
import { app, ArtboardTemplateControl, Environment, Rect, IDropElementData, IKeyboardState, IUIElement } from "carbon-core";
import { ImageSource, ImageSourceType, IPage, ILayer } from "carbon-core";

interface IInteraction {
    dropElement: HTMLElement;

    dropPromise: Promise<IDropElementData>;
    resolveDrop: (data: IDropElementData) => void;
    rejectDrop: (reason?: any) => void;

    templateType: string;
    templateId: string;
    placeholder: IUIElement;
    sourceId: string;
}

interface IToolboxState{
    pages: IPage[];
    currentPage: IPage | null;
}

export class Toolbox extends CarbonStore<IToolboxState>{
    [name: string]: any;

    constructor(){
        super();
        this._templateConfigCache = {};
        this._stores = {};

        this._setupDragAndDrop();

        this.state = {
            pages:[],
            currentPage: null
        };
    }

    registerStore(name, store){
        if (this._stores.hasOwnProperty("name")){
            throw new Error("Store already registered: " + name);
        }
        this._stores[name] = store;
        return store;
    }

    @handles(CarbonActions.loaded, CarbonActions.restoredLocally)
    onAppLoaded(){
        this.setState({pages: app.pages, currentPage:app.activePage || app.pages[0]});
    }

    @handles(CarbonActions.pageAdded)
    onPageAdded(){
        this.setState({pages: app.pages, currentPage:app.activePage || app.pages[0]});
    }

    @handles(CarbonActions.pageRemoved)
    onPageRemoved(){
        let index = -1;
        if (this.state.currentPage) {
            index = app.pages.indexOf(this.state.currentPage);
        }

        this.setState({pages: app.pages, currentPage:index===-1?app.pages[0]:this.state.currentPage});
    }

    @handles(StencilsActions.changePage)
    pageChanged({page}){
        //var config = this.findProjectConfig(projectType);
        this.setState({currentPage: page});
    }

    @handles(StencilsActions.clicked)
    clicked({e, templateType, templateId, sourceId}){
        var element = this.elementFromTemplate(templateType, templateId, sourceId);
        var scale = Environment.view.scale();
        var location = Environment.controller.choosePasteLocation([element], e.ctrlKey || e.metaKey);
        var w = element.br().width;
        var h = element.br().height;
        var x, y;

        if (location.parent.autoPositionChildren()){
            var pos = location.parent.center(true);
            x = pos.x - w/2;
            y = pos.y - h/2;
        }
        else{
            x = location.x;
            y = location.y;
        }

        var screenPoint = Environment.view.pointToScreen({x: x * scale, y: y * scale});
        var node = dragAndDrop.cloneNode(e.currentTarget);
        document.body.appendChild(node);
        velocity(node, {left: screenPoint.x, top: screenPoint.y, width: w*scale, height: h*scale, opacity: .1}, {
            duration: 500,
            easing: 'easeOutCubic',
            complete: () => {
                document.body.removeChild(node);

                Environment.controller.insertAndSelect([element], location.parent, x, y);
                this._onElementAdded(templateType);

                //analytics.event("Toolbox", "Single-click", templateId);
            }});
    }

    onDragStart = (event, interaction: IInteraction) => {
        var templateId = event.target.dataset.templateId;
        var templateType = event.target.dataset.templateType;
        var sourceId = event.target.dataset.sourceId;
        interaction.templateType = templateType;
        interaction.templateId = templateId;
        interaction.sourceId = sourceId;
        var element = this.elementFromTemplate(templateType, templateId, sourceId);
        interaction.placeholder = element;
        interaction.dropPromise = new Promise<IDropElementData>((resolve, reject) => {
            interaction.resolveDrop = resolve;
            interaction.rejectDrop = reject;
        });
    };
    onDragEnter = (event, interaction: IInteraction) => {
        event.dragEnter.classList.add("dragover"); //#viewport
        Environment.controller.beginDragElement(event, interaction.placeholder, interaction.dropPromise);
    };
    onDragLeave = (event, interaction: IInteraction) => {
        event.dragLeave.classList.remove("dragover"); //#viewport
        interaction.rejectDrop(event);
        interaction.dropPromise = new Promise((resolve, reject) => {
            interaction.resolveDrop = resolve;
            interaction.rejectDrop = reject;
        });
        //analytics.event("Toolbox", "Drag-out", interaction.templateType + "/" + interaction.templateId);
    };
    onDrop = (event: MouseEvent, interaction: IInteraction) => {
        interaction.dropElement.classList.remove("dragover"); //#viewport

        interaction.dropPromise.then(() => this._onElementAdded(interaction.templateType));
        interaction.resolveDrop({elements: [interaction.placeholder], e: event, keys: Environment.controller.keyboardStateFromEvent(event)});

        //analytics.event("Toolbox", "Drag-drop", interaction.templateType + "/" + interaction.templateId);
    };

    elementFromTemplate(templateType, templateId, sourceId){
        var store = this._stores[templateType];
        var element;
        if (store){
            element = store.createElement(templateId);
        }
        else{
            element = new ArtboardTemplateControl();
            element.source({pageId: sourceId, artboardId: templateId});
        }

        // switch (templateType){
        //     case "recentElement":
        //         templateConfig = window.richApp.recentStencilsStore.findById(templateId);
        //         element = UIElement.fromJSON(templateConfig.json);
        //         break;
        //     case "recentImage":
        //         templateConfig = window.richApp.recentImagesStore.findById(templateId);
        //         element = UIElement.fromJSON(templateConfig.json);
        //         break;
        // }

        app.assignNewName(element);
        this._fitToViewportIfNeeded(element);

        return element;
    }

    imageSourceToString(source: ImageSource) {
        switch (source.type) {
            case ImageSourceType.Font:
                return "font " + source.icon;
            case ImageSourceType.Url:
                return "url " + source.url;
            case ImageSourceType.None:
                return "none";
        }
        assertNever(source);
    }

    _fitToViewportIfNeeded(element){
        var viewport = Environment.view.viewportRect();
        var bounds = new Rect(0, 0, viewport.width * .8, viewport.height * .8);
        var current = new Rect(0, 0, element.width(), element.height());
        var fit = current.fit(bounds, true);

        var artboard = Environment.view.page.getActiveArtboard();
        if (artboard){
            fit = fit.fit(artboard.getBoundaryRect(), true);
        }

        if (fit.width !== current.width || fit.height !== current.height){
            element.prepareAndSetProps({br: element.br().withSize(Math.round(fit.width), Math.round(fit.height))});
        }
    }

    _onElementAdded(templateType){
        var store = this._stores[templateType];
        if (store){
            //try cast to interface instead
            store.elementAdded && store.elementAdded();
        }
    }

    private _setupDragAndDrop(){
        dragAndDrop.setup({
            onDragStart: this.onDragStart,
            onDragEnter: this.onDragEnter,
            onDragLeave: this.onDragLeave,
            onDrop: this.onDrop
        });
    }
}

export default new Toolbox();
