import React from "react";
import ReactDom from "react-dom";
import interact from "interact.js";
import { Component } from "../../CarbonFlux";
import { findTransformProp, nodeOffset } from "../../utils/domUtil";

type SortableProps<T> = {
    data: T[];
    onSorted: (newData: T[]) => void;
    dragSelector?: string;
}

const transformProp = findTransformProp();

export default class Sortable<T> extends Component<SortableProps<T>> {
    static defaultProps: Partial<SortableProps<any>> = {
        dragSelector: ".sortable-item"
    }

    private dragInteraction: Interact.Interactable;
    private dropInteraction: Interact.Interactable;
    private initialElements: HTMLElement[];

    componentDidMount() {
        super.componentDidMount();
        this.attach();
    }

    componentDidUpdate() {
        this.detach();
        this.attach();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.detach();
    }

    attach() {
        if (this.dragInteraction) {
            return;
        }

        let currentNode = ReactDom.findDOMNode<HTMLElement>(this);
        console.assert(currentNode.childNodes.length === 1, "Sortable must contain a single child");

        let container = currentNode.childNodes[0] as HTMLElement;
        this.dragInteraction = interact(this.props.dragSelector)
            .draggable({
                max: Infinity,
                autoScroll: {
                    container: container,
                    margin: 20,
                    distance: 5,
                    interval: 10
                },
                axis: "y",
                restrict: {
                    restriction: container,
                }
            })
            .on('dragstart', this.onDragStart)
            .on('dragmove', this.onDragMove)
            .on("dragend", this.onDragEnd);

        this.dropInteraction = interact(container)
            .dropzone({
                accept: this.props.dragSelector
            })
            .on("drop", this.onDrop);
    }

    detach() {
        if (this.dragInteraction) {
            this.dragInteraction.unset();
            this.dragInteraction = null;
        }
        if (this.dropInteraction) {
            this.dropInteraction.unset();
            this.dropInteraction = null;
        }
    }

    private onDragStart = event => {
        event.interaction.y = 0;

        this.initialElements = Array.prototype.slice.call(event.target.parentElement.childNodes);

        var helperNode = this.cloneNode(event.target);
        document.body.appendChild(helperNode);
        event.interaction.helperNode = helperNode;

        event.target.style.visibility = "hidden";
    }

    private onDragMove = (event) => {
        event.interaction.y += event.dy;
        event.interaction.helperNode.style[transformProp] = 'translate(0px, ' + event.interaction.y + 'px)';

        let target = event.target as HTMLElement;
        let targetRect = target.getBoundingClientRect();
        let move = 0;
        if (event.clientY < targetRect.top && target.previousElementSibling) {
            target.parentNode.insertBefore(target, target.previousElementSibling);
        }
        else if (event.clientY > targetRect.bottom && target.nextElementSibling) {
            target.parentNode.insertBefore(target.nextElementSibling, target);
        }
    }

    private onDragEnd = event => {
        document.body.removeChild(event.interaction.helperNode);

        event.target.style.visibility = "visible";
    }

    private onDrop = (event) => {
        let newElements = Array.prototype.slice.call(event.interaction.element.parentElement.childNodes);
        let newData: T[] = [];

        for (let i = 0; i < newElements.length; i++) {
            let element = newElements[i];
            let origIndex = this.initialElements.indexOf(element);
            let item = this.props.data[origIndex];
            newData.push(item);
        }
        this.initialElements = null;

        this.props.onSorted(newData);
    }

    private cloneNode(node: HTMLElement){
        var offset = nodeOffset(node);
        var helperNode = node.cloneNode(true) as HTMLElement;
        helperNode.style.zIndex = "1000";
        helperNode.style.position = "absolute";
        helperNode.style.left = offset.left + "px";
        helperNode.style.top = offset.top + "px";
        helperNode.style.width = node.offsetWidth + "px";
        helperNode.style.height = node.offsetHeight + "px";
        helperNode.classList.add("dragging");
        return helperNode;
    }

    render() {
        return <div>
            {this.props.children}
        </div>
    }
}