import {IconsInfo} from "carbon-core";
import {handles, CarbonStore} from '../../CarbonFlux';
import IconsActions from "./IconsActions";

export default class SearchIconsStore extends CarbonStore{
    constructor(options){
        super(options);
        this.state = {
            searchConfig: {groups: []}
        };
    }

    @handles(IconsActions.search)
    search(action){
        var q = action.term;
        var result = {groups: []};
        var r = new RegExp(q, "gi");

        var icons = IconsInfo.fonts[IconsInfo.defaultFontFamily];
        for (var i = 0; i < icons.length; i++) {
            var icon = icons[i];
            r.lastIndex = 0;
            if (r.test(icon.name)){
                var searchGroup = this._findOrCreateGroup(result, "Library icons");
                searchGroup.templates.push(icon);
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
        var group = {name: name, templates: []};
        config.groups.push(group);
        return group;
    }
}
