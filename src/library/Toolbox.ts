import velocity from "velocity-animate";
import dragAndDrop from "./DragAndDrop";
import { handles, CarbonStore, dispatch, dispatchAction } from "../CarbonFlux";
import { richApp } from '../RichApp';
import CarbonActions from "../CarbonActions";
import { StencilsAction } from "./StencilsActions";
import { app, Symbol, Environment, Rect, IDropElementData, IKeyboardState, IUIElement } from "carbon-core";
import { ImageSource, ImageSourceType, IPage, ILayer, ChangeMode, Selection } from "carbon-core";
import { IToolboxStore, StencilInfo, StencilClickEvent } from "./LibraryDefs";

interface Interaction {
    dropElement: HTMLElement;

    dropPromise: Promise<IDropElementData>;
    resolveDrop: (data: IDropElementData) => void;
    rejectDrop: (reason?: any) => void;

    placeholder: IUIElement;
    stencil: StencilInfo;
}

interface ToolboxState {
}

export class Toolbox extends CarbonStore<ToolboxState>{
    private stores: { [name: string]: IToolboxStore };

    constructor() {
        super();
        this.stores = {};

        this.setupDragAndDrop();
    }

    registerStore<T extends IToolboxStore>(store: T): T {
        if (this.stores.hasOwnProperty("name")) {
            throw new Error("Store already registered: " + name);
        }
        this.stores[store.storeType] = store;
        return store;
    }

    onAction(action: StencilsAction) {
        super.onAction(action);

        switch (action.type) {
            case "Stencils_Clicked":
                this.clicked(action.e, action.stencil);
                return;
        }
    }

    clicked(e: StencilClickEvent, stencil: StencilInfo) {
        var element = this.elementFromTemplate(stencil);
        var scale = Environment.view.scale();
        var location = Environment.controller.choosePasteLocation([element], e.ctrlKey || e.metaKey);
        var w = element.boundaryRect().width;
        var h = element.boundaryRect().height;
        var x, y;

        if (location.parent.autoPositionChildren()) {
            var pos = location.parent.center(true);
            x = pos.x - w / 2;
            y = pos.y - h / 2;
        }
        else {
            x = location.x;
            y = location.y;
        }

        var screenPoint = Environment.view.pointToScreen({ x: x * scale, y: y * scale });
        var node = dragAndDrop.cloneNode(e.currentTarget);
        document.body.appendChild(node);
        velocity(node, { left: screenPoint.x, top: screenPoint.y, width: w * scale, height: h * scale, opacity: .1 }, {
            duration: 500,
            easing: 'easeOutCubic',
            complete: () => {
                document.body.removeChild(node);

                Environment.controller.insertAndSelect([element], location.parent, x, y);
                this.onElementAdded(stencil);

                //analytics.event("Toolbox", "Single-click", templateId);
            }
        });
    }

    onDragStart = (event, interaction: Interaction) => {
        interaction.stencil = { ...event.target.dataset };
        var element = this.elementFromTemplate(event.target.dataset);
        interaction.placeholder = element;
        interaction.dropPromise = new Promise<IDropElementData>((resolve, reject) => {
            interaction.resolveDrop = resolve;
            interaction.rejectDrop = reject;
        });
    };
    onDragEnter = (event, interaction: Interaction) => {
        event.dragEnter.classList.add("dragover"); //#viewport
        app.activePage.add(interaction.placeholder, ChangeMode.Self);
        Selection.makeSelection([interaction.placeholder]);
        Environment.controller.beginDragElement(event, interaction.placeholder, interaction.dropPromise);
    };
    onDragLeave = (event, interaction: Interaction) => {
        event.dragLeave.classList.remove("dragover"); //#viewport
        app.activePage.remove(interaction.placeholder, ChangeMode.Self);
        (interaction.placeholder as any).runtimeProps.ctxl = 2;
        interaction.rejectDrop(event);
        interaction.dropPromise = new Promise((resolve, reject) => {
            interaction.resolveDrop = resolve;
            interaction.rejectDrop = reject;
        });
        //analytics.event("Toolbox", "Drag-out", interaction.templateType + "/" + interaction.templateId);
    };
    onDrop = (event: MouseEvent, interaction: Interaction) => {
        app.activePage.remove(interaction.placeholder, ChangeMode.Self);
        interaction.dropElement.classList.remove("dragover"); //#viewport

        interaction.dropPromise.then(() => this.onElementAdded(interaction.stencil));
        interaction.resolveDrop({ elements: [interaction.placeholder], e: event, keys: Environment.controller.keyboardStateFromEvent(event) });

        //analytics.event("Toolbox", "Drag-drop", interaction.templateType + "/" + interaction.templateId);
    };

    elementFromTemplate(info: StencilInfo) {
        var store = this.stores[info.stencilType];
        var element = store.createElement(info);

        app.assignNewName(element);
        this.fitToViewportIfNeeded(element);

        return element;
    }

    imageSourceToString(source: ImageSource) {
        switch (source.type) {
            case ImageSourceType.Url:
                return "url " + source.url;
            case ImageSourceType.Element:
                return "element " + source.elementId;
            case ImageSourceType.None:
                return "none";
        }
        assertNever(source);
    }

    private fitToViewportIfNeeded(element) {
        var viewport = Environment.view.viewportRect();
        var bounds = new Rect(0, 0, viewport.width * .8, viewport.height * .8);
        var current = new Rect(0, 0, element.width(), element.height());
        var fit = current.fit(bounds, true);

        var artboard = Environment.view.page.getActiveArtboard();
        if (artboard) {
            fit = fit.fit(artboard.boundaryRect(), true);
        }

        if (fit.width !== current.width || fit.height !== current.height) {
            element.prepareAndSetProps({ br: element.boundaryRect().withSize(Math.round(fit.width), Math.round(fit.height)) });
        }
    }

    private onElementAdded(info: StencilInfo) {
        var store = this.stores[info.stencilType];
        store.elementAdded(info);

        let stencil = store.findStencil(info);
        dispatchAction({ type: "Stencils_Added", stencilType: info.stencilType, stencil, async: true });
    }

    private setupDragAndDrop() {
        dragAndDrop.setup({
            onDragStart: this.onDragStart,
            onDragEnter: this.onDragEnter,
            onDragLeave: this.onDragLeave,
            onDrop: this.onDrop
        });
    }
}

export default new Toolbox();
