import React                  from 'react';
import cx                     from 'classnames';
import Dots                   from "../../shared/dots";

// import {Pane, PaneList, PaneListItem, PaneRow, PaneButton} from "../../shared/Pane";
import {Pane      }           from "../../shared/Pane";
import {PaneRow   }           from "../../shared/Pane";
import {PaneLabel }           from "../../shared/Pane";
import {PaneButton}           from "../../shared/Pane";
import {PaneList     }        from "../../shared/Pane";
import {PaneListItem }        from "../../shared/Pane";
import CarbonActions from "../../CarbonActions";
import {app, Selection, Environment, ContextBarPosition} from "carbon-core";
import {handles, Component, CarbonLabel} from "../../CarbonFlux";


export class ContextButton extends React.Component<any, any> {
    render() {
        var caption;
        var icon;

        if (this.props.icon)
            switch (this.props.icon) {
                case 'dots' :
                    icon = (<i className="contextbar__icon"><Dots/></i>);
                    break;
                default :
                    icon = <i className={cx("contextbar__icon", this.props.icon)}/>;
            }

        if (this.props.children != null) {
            caption = (<span className="contextbar__cap">{this.props.children}</span>);
        }

        return (
            <div className="contextbar__button" onClick={this.props.onClick}>
                { icon }
                { caption }
            </div>
        )
    }
}

ContextButton['props'] = {
    icon : ''
};

export class ContextDropdown extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = { isOpen : false};
    }

    _toggleDropdown = () => {
        this.setState({ isOpen : !this.state.isOpen});
    };

    close() {
        if(this.state.isOpen) {
            this.setState({isOpen: false});
        }
    }

    _onDocumentClick = () => {
        this.close();
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.isOpen) {
            document.addEventListener("click", this._onDocumentClick)
        } else {
            document.removeEventListener("click", this._onDocumentClick)
        }
    }

    render() {
        var label = this.props.label;
        var icon;

        var cn = cx("contextbar__dropdown", { "contextbar__dropdown_open" : this.state.isOpen});

        switch (this.props.icon) {
            case 'dots' :
                icon = <i key="icon" className="contextbar__icon contextbar__icon_dots"><Dots/></i>;
                break;
            default :
                icon = (<i key="icon" className={cx("contextbar__icon", this.props.icon)}></i>);
        }

        return (
            <div className={cn}>
                <div className="contextbar__dropdown-pill" onClick={this._toggleDropdown}>
                    { icon }
                    <CarbonLabel id={label}/>
                    <div className="contextbar__dropdown-arrow"></div>
                </div>

                <div className="contextbar__dropdown-panel">
                    {this.props.children != null ? this.props.children : ''}
                </div>
            </div>
        )
    }
}

ContextButton['props'] = {
    icon : ''
};

export default class ContextBar extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            pinned : true,
            items:[]
        };
    }

    @handles(CarbonActions.elementSelected, CarbonActions.activeLayerChanged)
    onElementSelected(){
        var menu: any = {items: []};
        var context = {
            selectComposite: Selection.selectComposite()
        };
        app.onBuildMenu.raise(context, menu);
        this.setState({items:menu.items});
    }

    _renderItem=(item)=>{
        if(!item.items) {
            return <ContextButton key={item.name} onClick={item.callback} icon={item.icon}><CarbonLabel id={item.name}/></ContextButton>;
        }

        var childItems = item.items.filter(a=>!a.disabled);
        if(childItems.length === 0) {
            return null;
        }

        if(childItems.length === 1) {
            return this._renderItem(childItems[0]);
        }

        if(!item.rows || item.rows.length === 1) {
            return <ContextDropdown key={item.name} icon={item.icon} label={item.name}>
                <Pane>
                    <PaneList>
                        {childItems.map(a=><PaneListItem key={item.name + a.name} onClick={a.callback} icon={a.icon}><CarbonLabel id={a.name}/></PaneListItem>)}
                    </PaneList>
                </Pane>
            </ContextDropdown>
        }


        return <ContextDropdown icon={item.icon} label={item.name} key={item.name}>
            <Pane>
                {item.rows.map((r, i)=> {
                    var rowItems = childItems.filter(a=>a.row === i).map(a=><PaneButton key={a.name} onClick={a.callback} icon={a.icon} label={a.name}/>);
                    if (!rowItems.length){
                        return null;
                    }
                    return [<PaneLabel key={r+'label'}><CarbonLabel id={r}/></PaneLabel>,
                        <PaneRow key={r+'row'}>
                            {rowItems}
                        </PaneRow>]
                })}
            </Pane>
        </ContextDropdown>
    }

    render() {
        var contextbar_classname = cx("contextbar", { "contextbar_pinned" : this.state.pinned});

        return (
            <div className={contextbar_classname}>

                {/* Left part */}
                <div className="contextbar__part contextbar__part_left">
                    {this.state.items.filter(a=>a.contextBar & ContextBarPosition.Left && !a.disabled).map(this._renderItem)}
                </div>

                {/* Right part */}
                <div className="contextbar__part contextbar__part_right">
                    {this.state.items.filter(a=>a.contextBar & ContextBarPosition.Right && !a.disabled).map(this._renderItem)}
                    {/*<ContextDropdown icon="ico-small-align-tops">
                        <Pane>
                            <PaneLabel>Align</PaneLabel>
                            <PaneRow>
                                <PaneButton icon="ico-small-align-tops"/>
                                <PaneButton icon="ico-small-align-middles"/>
                                <PaneButton icon="ico-small-align-bottoms"/>
                                <PaneButton icon="ico-small-align-lefts"/>
                                <PaneButton icon="ico-small-align-centers"/>
                                <PaneButton icon="ico-small-align-rights"/>
                            </PaneRow>
                            <PaneLabel>Distribute</PaneLabel>
                            <PaneRow>
                                <PaneButton icon="ico-small-distribute-tops"/>
                                <PaneButton icon="ico-small-distribute-middles"/>
                                <PaneButton icon="ico-small-distribute-bottoms"/>
                                <PaneButton icon="ico-small-distribute-lefts"/>
                                <PaneButton icon="ico-small-distribute-centers"/>
                                <PaneButton icon="ico-small-distribute-rights"/>
                            </PaneRow>
                            <PaneLabel>Distribute spacing</PaneLabel>
                            <PaneRow>
                                <PaneButton icon="ico-small-equalize-horiz-spaces"/>
                                <PaneButton icon="ico-small-equalize-vert-spaces"/>
                            </PaneRow>
                        </Pane>
                    </ContextDropdown>*/}

                    {/*<ContextDropdown icon="ico-small-order">
                        <Pane>
                            <PaneRow>
                                <PaneButton icon="ico-small-move-upper"/>
                                <PaneButton icon="ico-small-move-lower"/>
                            </PaneRow>
                            <PaneRow>
                                <PaneButton icon="ico-small-send-to-foreground"/>
                                <PaneButton icon="ico-small-send-to-background"/>
                            </PaneRow>
                        </Pane>
                    </ContextDropdown>*/}
                </div>

                {/* Panel controls */}
                {/*<div className="contextbar__controls">
                    <ContextDropdown icon="dots">
                        <Pane>
                            <PaneList>
                                <PaneListItem icon="ico-pin-big">Unpin context panel</PaneListItem>
                                <PaneListItem icon="">Fullscreen</PaneListItem>
                                <PaneListItem>Snap</PaneListItem>
                                <PaneListItem>Grid</PaneListItem>
                            </PaneList>
                        </Pane>
                    </ContextDropdown>
                </div>*/}

            </div>
        )
    }
}

export class AltContext extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = { secondaryIsOpen : false};
    }

    _openSecondary = () => {
        this.setState({ secondaryIsOpen : true});
    };

    _closeSecondary = () => {
        this.setState({ secondaryIsOpen : false});
    };

    render(){

        var cn = cx("altcontext", {"altcontext_secondary-open" : this.state.secondaryIsOpen});
        return <div className={cn}>
            {/* First (main) page*/}
            <div className="altcontext__primary"  onClick={this._openSecondary}>
                <Pane>
                    <PaneList>
                        <PaneRow>
                            <PaneButton icon="ico-small-move-upper">Action one</PaneButton>
                            <PaneButton icon="ico-small-move-lower"/>
                        </PaneRow>
                        <PaneRow>
                            <PaneButton icon="ico-small-send-to-foreground"/>
                            <PaneButton icon="ico-small-send-to-background"/>
                        </PaneRow>
                    </PaneList>
                </Pane>
            </div>

            <div className="altcontext__secondary">
                <Pane>
                    <PaneList>
                        <PaneRow>
                            <PaneButton icon="ico-small-move-upper">Action one</PaneButton>
                            <PaneButton icon="ico-small-move-lower"/>
                        </PaneRow>
                        <PaneRow>
                            <PaneButton icon="ico-small-send-to-foreground"/>
                            <PaneButton icon="ico-small-send-to-background"/>
                            <PaneButton icon="ico-small-send-to-background"/>
                            <PaneButton icon="ico-small-send-to-background"/>
                        </PaneRow>
                        <PaneRow>
                            <PaneButton icon="ico-small-move-upper"/>
                            <PaneButton icon="ico-small-send-to-background"/>
                            <PaneButton icon="ico-small-move-upper"/>
                        </PaneRow>
                    </PaneList>
                </Pane>

            </div>

            <div className="altcontext__secondary-closer" onClick={this._closeSecondary}/>
        </div>
    }
}