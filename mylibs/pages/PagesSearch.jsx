

import React from "react";
import FlyoutButton from '../shared/FlyoutButton';
import FlyoutActions from '../FlyoutActions';
import cx from 'classnames';
import {Component} from '../CarbonFlux';
import {richApp} from "../RichApp";
import PagesActions from './PagesActions';

export default class PagesSearch extends Component {

    constructor(props) {
        super(props);
        this.state = {active:false};
    }

    onChange=(event)=>{
        var text = event.target.value;

        if(!text.length) {
            this.setState({active:false});
            richApp.dispatch(FlyoutActions.show(null));
            return;
        }

        var searchResult = [];
        for(var i = 0; i < this.props.pageGroups.length; ++i) {
            var group = this.props.pageGroups[i];
            var groupResult = [];
            for(var j = 0; j < group.pages.length; ++j) {
                var page = group.pages[j];
                if(page.name.indexOf(text) !== -1) {
                    groupResult.push(page);
                }
            }
            if(groupResult.length) {
                searchResult.push({group:group, pages:groupResult});
            }
        }

        this.setState({active:true});
        richApp.dispatch(FlyoutActions.show(this.refs.host, this.showResult(searchResult), {syncWidth:true, targetVertical:'bottom', targetHorizontal:'right'}));
    }

    _renderGroup(group) {
        return <li className="result-group-item">
            <div>{group.group.name}</div>
            <ul className="result-pages">
                {group.pages.map(p=>{
                    return <li className="result-page">{p.name}</li>
                })}
            </ul>

        </li>
    }

    showResult(serchResult){
        return <div className="pages-serach-flyout">
            <ul className="result-group">
                {serchResult.map(r=>this._renderGroup(r))}
            </ul>
        </div>
    }

    render() {
        var className = cx({active:this.state.active});
        return <label id="pages-search" className={className} ref="host">
            <input ref="input" type="text" onChange={this.onChange}/>
            <i className="ico-search"/>
        </label>;
    }
}