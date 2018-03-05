import interact from "interact.js";
import {findTransformProp, nodeOffset} from "../utils/domUtil";

export class DragAndDrop {
    private _stencilInteraction: Interact.Interactable = null;
    private _viewPortInteraction: Interact.Interactable = null;

    setup(options){
        if (this._viewPortInteraction){
            return;
        }

        var transformProp = findTransformProp();

        this._stencilInteraction = interact('.stencil:not(.stencil_modified)')
            .draggable({max: Infinity})
            .on('dragstart', event => {
                event.interaction.x = 0;
                event.interaction.y = 0;

                var helperNode = this.cloneNode(event.target);
                document.body.appendChild(helperNode);
                event.interaction.helperNode = helperNode;

                options.onDragStart(event, event.interaction);
                event.preventDefault();
            })
            .on('dragmove', function(event){
                event.interaction.x += event.dx;
                event.interaction.y += event.dy;

                event.interaction.helperNode.style[transformProp] = 'translate(' + event.interaction.x + 'px, ' + event.interaction.y + 'px)';
            })
            .on("dragend", event =>{
                document.body.removeChild(event.interaction.helperNode);
                event.preventDefault();
            });

        this._viewPortInteraction = interact("#viewport")
            .dropzone({
                accept: ".stencil"
            })
            .on('dragenter', (event) => {
                event.interaction.helperNode.style.visibility = "hidden";
                options.onDragEnter(event.dragEvent, event.interaction);
            })
            .on('dragleave', function(event){
                event.interaction.helperNode.style.visibility = "visible";
                options.onDragLeave(event.dragEvent, event.interaction);
            })
            .on('drop', function(event){
                options.onDrop(event.dragEvent, event.interaction);
            });
    }

    cloneNode(parent): HTMLElement {
        var node = parent.childNodes[0];
        var offset = nodeOffset(node);
        var helperNode = node.cloneNode(true);
        helperNode.style.zIndex = 1000;
        helperNode.style.position = "absolute";
        helperNode.style.left = offset.left + "px";
        helperNode.style.top = offset.top + "px";
        helperNode.style.cursor = "pointer";
        helperNode.style.width = node.offsetWidth + "px";
        helperNode.style.height = node.offsetHeight + "px";
        helperNode.classList.add("stencil_dragging");
        return helperNode;
    }

    dispose(){
        if (this._stencilInteraction){
            this._stencilInteraction.unset();
            this._stencilInteraction = null;
        }
        if (this._viewPortInteraction){
            this._viewPortInteraction.unset();
            this._viewPortInteraction = null;
        }
    }
}

export default new DragAndDrop();