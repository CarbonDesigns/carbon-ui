import PrioritySet from "./PrioritySet";
import {handles, CarbonStore} from "../CarbonFlux";

import CarbonActions from "../CarbonActions";
import { IUIElement } from "carbon-model";

interface IRecentStoreState{
    elements: any;
}
export default class AbstractRecentStore extends CarbonStore<IRecentStoreState>{
    [name: string]: any;

    constructor(name){
        super();

        this._queue = new PrioritySet(20);

        var elements = {groups: [{name: name, templates: []}]};
        this.state = {elements: elements};
    }
    getItems(){
        return this._queue.toArray();
    }
    getConfig(){
        return this.state;
    }
    findById(id){
        return this._queue.findById(id);
    }

    //@handles(CarbonActions.elementSelected)
    _onElementSelected = ({selection}) => {
        if (this.mustAddToRecent(this._trackedElement, this._trackData)){
            this.addToRecent(this._trackedElement);
            this._trackedElement = null;
            this._trackData = null;
        }

        if (selection.count()){
            let element = null;
            let mustTrack = true;
            selection.each(e => {
                if (element){
                    mustTrack = false;
                    return false;
                }
                element = e;
            });
            if (mustTrack && this.canAddElement(element)){
                this._trackedElement = element;
                this._trackData = this.getTrackData(element);
            }
        }
    };

    //@handles(CarbonActions.elementUsed)
    _onElementUsed({element}){
        if (this.canAddElement(element)){
            this.addToRecent(element);
        }
    }

    mustAddToRecent(e, data){
        if (!e || !data || !this.canAddElement(e)){
            return false;
        }
        for (var propName in data){
            if (e.props[propName] !== data[propName]){
                return true;
            }
        }
        return false;
    }
    addToRecent(e){
        var elementConfig = this.createElementConfig(e);

        this._queue.push(elementConfig);
        var newState = {elements: {groups: this.state.elements.groups}};
        newState.elements.groups[0].templates = this._queue.asEnumerable();
        this.setState(newState);
    }

    canAddElement(e){
        return true;
    }
    getTrackData(e){
        throw new Error("Not implemented");
    }
    createElementConfig(e){
        throw new Error("Not implemented");
    }
}