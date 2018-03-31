import React from "react";
import { Container, IContainer, IUIElement, Selection, Shape, Image } from "carbon-core";
import interact from "interact.js";
import layersStore, { LayerNode } from "./LayersStore";
import { dispatchAction } from "../CarbonFlux";

const DragSelector = "#layers_panel .layer";
const DropSelector = "#layers_panel .layers__container";

enum DropPosition {
    None = 1,
    Above,
    Below,
    Inside
}

/**
 * Dragging principles:
 * - interact.js does not work well with virtual lists, so it is used only for dragging.
 * - each layer reports its mouseMove/Leave/Up events to the controller, which decides when to do the actual drop.
 */
export class LayersDragController {
    private container: HTMLElement;
    private layerInteraction: Interact.Interactable;
    private currentDropPositions: number[] = [];
    private isOverLayer: boolean = false;
    private draggedElements: IUIElement[] = [];

    attach() {
        if (this.layerInteraction) {
            return;
        }

        this.container = document.querySelectorAll(DropSelector)[0] as HTMLElement;

        this.layerInteraction = interact(DragSelector)
            .draggable({
                max: Infinity,
                autoScroll: {
                    container: this.container,
                    margin: 20,
                    distance: 5,
                    interval: 10
                },
                axis: "y",
                restrict: {
                    restriction: this.container,
                }
            })
            .on('dragstart', this.onDragStart)
            .on("dragend", this.onDragEnd);
    }

    detach() {
        if (this.layerInteraction) {
            this.layerInteraction.unset();
            this.layerInteraction = null;
        }
    }

    private onDragStart = event => {
        this.draggedElements.length = 0;
        this.currentDropPositions.length = 0;

        let sourceIndex = parseInt(event.target.dataset.index);
        let sourceLayer = layersStore.state.layers[sourceIndex];

        if (Selection.isElementSelected(sourceLayer.element)) {
            for (let i = 0; i < Selection.elements.length; i++) {
                this.draggedElements.push(Selection.elements[i]);
            }
        }
        else {
            Selection.makeSelection([sourceLayer.element]);
            this.draggedElements.push(sourceLayer.element);
        }

        this.container.classList.add("layers__container_moving");
        if (this.draggedElements.length === 1) {
            this.container.classList.add("single");
        }
        else {
            this.container.classList.add("multi");
        }
        event.preventDefault();
    }

    onDropMove = (event: React.MouseEvent<HTMLElement>) => {
        if (!this.draggedElements.length) {
            return false;
        }
        let targetLayer = event.currentTarget;
        let layerIndex = parseInt(targetLayer.dataset.index);
        let targetElement = layersStore.state.layers[layerIndex].element;
        if (this.draggedElements.indexOf(targetElement) !== -1) {
            return true;
        }

        let newPosition = this.detectDropPosition(event, targetElement);
        let oldPosition = this.currentDropPositions[layerIndex];

        if (newPosition !== DropPosition.None && targetElement.parent !== this.draggedElements[0].parent
            || newPosition === DropPosition.Inside
        ) {
            this.container.classList.add("into");
        }
        else {
            this.container.classList.remove("into");
        }

        if (newPosition === oldPosition) {
            return true;
        }

        if (oldPosition) {
            let oldClass = this.dropPositionClass(oldPosition);
            targetLayer.classList.remove(oldClass);
        }

        let newClass = this.dropPositionClass(newPosition);
        targetLayer.classList.add(newClass);
        this.currentDropPositions[layerIndex] = newPosition;
        this.isOverLayer = true;
        return true;
    }

    onDragLeave = (event: React.MouseEvent<HTMLElement>) => {
        if (!this.draggedElements.length) {
            return false;
        }

        let targetLayer = event.currentTarget;
        let layerIndex = parseInt(targetLayer.dataset.index);
        let dropPosition = this.currentDropPositions[layerIndex];

        if (dropPosition) {
            let dropClass = this.dropPositionClass(dropPosition);
            targetLayer.classList.remove(dropClass);
            this.currentDropPositions[layerIndex] = undefined;
        }
        this.isOverLayer = false;
        return true;
    }

    onDragEnd = event => {
        if (!this.isOverLayer) {
            this.currentDropPositions.length = 0;
            this.draggedElements.length = 0;
        }
        this.container.classList.remove("layers__container_moving");
        this.container.classList.remove("single");
        this.container.classList.remove("multi");
        this.container.classList.remove("into");
    }

    onDrop = (event: React.MouseEvent<HTMLElement>) => {
        if (!this.draggedElements.length) {
            return false;
        }
        let targetLayer = event.currentTarget;
        let layerIndex = parseInt(targetLayer.dataset.index);
        let dropPosition = this.currentDropPositions[layerIndex];

        if (dropPosition) {
            let dropClass = this.dropPositionClass(dropPosition);
            targetLayer.classList.remove(dropClass);

            let parent = this.performDrop(layersStore.state.layers[layerIndex].element, dropPosition);
            Selection.refreshSelection();

            dispatchAction({ type: "Layers_dropped", targetId: parent && parent.id, targetIndex: layerIndex });
        }

        this.draggedElements.length = 0;
        this.currentDropPositions.length = 0;
        return true;
    }

    private performDrop(target: IUIElement, dropPosition: DropPosition): IContainer {
        if (dropPosition === DropPosition.None) {
            return null;
        }

        if (dropPosition === DropPosition.Below || dropPosition === DropPosition.Above) {
            let parent = target.parent;
            let sameParent = parent === this.draggedElements[0].parent;
            let index = parent.children.indexOf(target);

            if (sameParent) {
                if (dropPosition === DropPosition.Below) {
                    --index;
                }
                for (let i = 0; i < this.draggedElements.length; ++i) {
                    let source = this.draggedElements[i];

                    let sourceIndex = parent.children.indexOf(source);
                    if (sourceIndex > index) {
                        ++index;
                    }

                    parent.changePosition(source, index);
                }
            }
            else {
                if (dropPosition === DropPosition.Above) {
                    ++index;
                }

                for (let i = this.draggedElements.length - 1; i >= 0; --i) {
                    let source = this.draggedElements[i];
                    source.setTransform(parent.globalMatrixToLocal(source.globalViewMatrix()));
                    parent.insert(source, index);
                }
            }

            parent.performArrange();
            return parent;
        }

        if (dropPosition === DropPosition.Inside) {
            let parent = target as IContainer;
            for (let i = 0; i < this.draggedElements.length; ++i) {
                let source = this.draggedElements[i];
                source.setTransform(parent.globalMatrixToLocal(source.globalViewMatrix()));
                parent.add(source);
            }

            parent.performArrange();
            return parent;
        }

        assertNever(dropPosition);
    }

    private detectDropPosition(dragEvent: React.MouseEvent<HTMLElement>, targetElement: IUIElement) {
        let targetRect = (dragEvent.currentTarget).getBoundingClientRect();

        if (targetElement instanceof Container) {
            let allowDropInside = this.canDropInside(targetElement);
            let canAccept = (targetElement as IContainer).canAccept(this.draggedElements, false, allowDropInside);
            if (canAccept) {
                if (dragEvent.clientY < targetRect.top + targetRect.height / 4) {
                    return DropPosition.Above;
                }
                if (dragEvent.clientY > targetRect.top + targetRect.height * 3 / 4) {
                    return DropPosition.Below;
                }
                return DropPosition.Inside;
            }
        }

        if (!targetElement.parent.canAccept(this.draggedElements, false, true)) {
            return DropPosition.None;
        }

        if (dragEvent.clientY > targetRect.top + targetRect.height / 2) {
            return DropPosition.Below;
        }

        return DropPosition.Above;
    }

    /**
     * It's inconvenient to drop into shapes and images from layers, therefore these
     * are specifically excluded in order not to introduce more options for canAccept.
     */
    private canDropInside(target: any) {
        return !(target instanceof Shape || target instanceof Image);
    }

    private dropPositionClass(position: DropPosition) {
        switch (position) {
            case DropPosition.None:
                return "layer__dropNotAllowed";
            case DropPosition.Above:
                return "layer__dropAbove";
            case DropPosition.Below:
                return "layer__dropBelow";
            case DropPosition.Inside:
                return "layer__dropInside";
        }

        assertNever(position);
    }
}

export default new LayersDragController();