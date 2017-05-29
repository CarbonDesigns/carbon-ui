
import StencilsActions from "./StencilsActions";
import {handles, CarbonStore} from "../../CarbonFlux";

export default class SearchStencilsStore extends CarbonStore<any>{
    [name: string]: any;

    constructor(options){
        super(options);
        this.state = {
            searchConfig: {groups: []}
        };
        this._configs = [];
    }

    @handles(StencilsActions.search)
    search({q}){
        var result = {groups: []};
        var r = new RegExp(q, "gi");
        for (var i = 0; i < this._configs.length; i++){
            var config = this._configs[i];
            for (var j = 0; j < config.groups.length; j++){
                var group = config.groups[j];
                for (var k = 0; k < group.templates.length; k++){
                    var template = group.templates[k];
                    r.lastIndex = 0;
                    if (r.test(template.title)){
                        var searchGroup = this._findOrCreateGroup(result, config.name);
                        searchGroup.templates.push(template);
                    }
                }
            }
        }

        this.setState({searchConfig: result});
    }

    getResults(){
        return this.state.searchConfig;
    }

    _findOrCreateGroup(config, name){
        for (var i = 0; i < config.groups.length; i++){
            var group = config.groups[i];
            if (group.name === name){
                return group;
            }
        }
        var newGroup = {name: name, templates: []};
        config.groups.push(newGroup);
        return newGroup;
    }
}
