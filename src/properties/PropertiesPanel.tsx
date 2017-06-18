import React from 'react';
import {Component, listenTo} from "../CarbonFlux";
import {richApp} from "../RichApp";
import Panel from '../layout/Panel'
import ScrollContainer from "../shared/ScrollContainer";

import {PropertyHeader as NameAndLockProps} from "./PropertyHeader";
import {PropertyGroup} from "./PropertyGroup";

import PropertyStore from "./PropertyStore";
import Immutable from 'immutable';

var test = Immutable.fromJS(
    {
    }
);


interface IPropertiesPanelProps{

}

interface IPropertiesPanelState {
    groups:any;
    element:any,
    nameProperty:any;
    lockedProperty:any;
}

class PropertiesPanel extends Component<IPropertiesPanelProps, IPropertiesPanelState> {
    @listenTo(PropertyStore)
    onChange(){
        this.setState({
            element: PropertyStore.state.selection,
            groups: PropertyStore.state.groups,
            nameProperty: PropertyStore.state.nameProperty,
            lockedProperty: PropertyStore.state.lockedProperty
        });
    }

    @listenTo(richApp.layoutStore)
    onLayoutChanged() {
        if(!this.refs.panel) {
            return; // can be called when panel is hidden
        }
        var panel: any = this.refs["panel"];
        panel.updateSizeClasses();
    }


    render(){
        return (
            <Panel ref="panel" {...this.props} header="Properties" id="edit-panel">
                {this.renderProperties()}
            </Panel>
        );
    }

    componentWillUnmount() {
        super.componentWillUnmount();
    }


    renderProperties(){
        if (!this.state){
            return null;
        }

        var content = null;
        var propGroups = this.state.groups;
        if (propGroups
            && !Array.isArray(propGroups)
            && typeof propGroups.map === 'function'
            && typeof propGroups.unshift === 'function'
        ) {
            //prop_groups = prop_groups.unshift(test);
            //fixme sometimes it's an object, other times an immutable

            content = propGroups.map(prop_group =>{
                if (prop_group.get("hidden")){
                    return null;
                }
                return <PropertyGroup e={this.state.element} g={prop_group} key={prop_group.get("label")}/>;
            })
        }

        return <ScrollContainer id="edit__properties" className="thin dark">
            <NameAndLockProps
                e={this.state.element}
                nameProperty={this.state.nameProperty}
                lockedProperty={this.state.lockedProperty}
            />
            {content}
        </ScrollContainer>
    }
}

export default PropertiesPanel;
