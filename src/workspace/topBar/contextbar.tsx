import * as React from "react";
import * as cx from "classnames";
import Dots from "../../shared/dots";

// import {Pane, PaneList, PaneListItem, PaneRow, PaneButton} from "../../shared/Pane";
import { Pane } from "../../shared/Pane";
import { PaneRow } from "../../shared/Pane";
import { PaneLabel } from "../../shared/Pane";
import { PaneButton } from "../../shared/Pane";
import { PaneList } from "../../shared/Pane";
import { PaneListItem } from "../../shared/Pane";
import CarbonActions, { CarbonAction } from "../../CarbonActions";
import { app, Selection, Environment, ContextBarPosition, workspace } from "carbon-core";
import { handles, Component, CarbonLabel } from "../../CarbonFlux";
import FlyoutButton from "../../shared/FlyoutButton";


export class ContextButton extends React.Component<any, any> {
    render() {
        var renderedCaption;
        var renderedIcon;

        if (this.props.icon) {
            switch (this.props.icon) {
                case 'dots':
                    renderedIcon = (<i className="contextbar__icon"><Dots /></i>);
                    break;
                default:
                    renderedIcon = <i className={cx("contextbar__icon", this.props.icon)} />;
            }
        }
        if (this.props.children) {
            renderedCaption = (<span className="contextbar__cap">{this.props.children}</span>);
        }

        let {children, icon, actionId, actionArg, ...rest} = this.props;
        let title = workspace.shortcutManager.getActionHotkey(actionId);

        return (
            <div className="contextbar__button" data-action={actionId} data-action-arg={actionArg} title={title} onClick={this.props.onClick}>
                {renderedIcon}
                {renderedCaption}
            </div>
        )
    }
}

ContextButton['props'] = {
    icon: ''
};

export class ContextDropdown extends React.Component<any, any> {
    private renderPill = () => {
        var label = this.props.label;
        var icon;

        switch (this.props.icon) {
            case 'dots':
                icon = <i key="icon" className="contextbar__icon contextbar__icon_dots"><Dots /></i>;
                break;
            default:
                icon = (<i key="icon" className={cx("contextbar__icon", this.props.icon)}></i>);
        }
        return <div className="contextbar__dropdown-pill">
            {icon}
            <CarbonLabel id={label} />
            <div className="contextbar__dropdown-arrow"></div>
        </div>;
    }

    render() {
        return (
            <div className="contextbar__dropdown">
                <FlyoutButton position={{ targetHorizontal: "right" }} renderContent={this.renderPill}>
                    <div className="contextbar__dropdown-panel">
                        {this.props.children}
                    </div>
                </FlyoutButton>
            </div>
        )
    }
}

ContextButton['props'] = {
    icon: ''
};

export default class ContextBar extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            pinned: true,
            items: []
        };
    }

    canHandleActions() {
        return true;
    }

    onAction(action: CarbonAction) {
        switch (action.type) {
            case "Carbon_Selection":
                this.onElementSelected();
                return;
        }
    }

    // @handles(CarbonActions.activeLayerChanged)
    onElementSelected() {
        var menu: any = { items: [] };
        var context = {
            selectComposite: Selection.selectComposite()
        };
        app.onBuildMenu.raise(context, menu);
        // this.setState({ items: menu.items, isolationActive: app.isolationActive() });
    }

    private static onClick(e: React.MouseEvent<HTMLElement>) {
        let actionId = e.currentTarget.dataset.action;
        let actionArg = e.currentTarget.dataset.actionArg;
        app.actionManager.invoke(actionId, actionArg);
    }

    _renderItem(item) {
        if (!item.items) {
            return <ContextButton key={item.name} onClick={ContextBar.onClick} icon={item.icon} actionId={item.actionId} actionArg={item.actionArg}><CarbonLabel id={item.name} /></ContextButton>;
        }

        if (item.items.every(a => a.disabled)) {
            return null;
        }

        if (!item.rows || item.rows.length === 1) {
            let hasIcons = item.items.some(x => x.icon);
            return <ContextDropdown key={item.name} icon={item.icon} label={item.name}>
                <Pane>
                    <PaneList>
                        {item.items.map(a => <PaneListItem key={item.name + a.name} onClick={ContextBar.onClick} icon={a.icon} disabled={a.disabled} actionId={a.actionId} actionArg={a.actionArg} padded={hasIcons}>
                            <CarbonLabel id={a.name} />
                            <span className="pane-shortcut">{workspace.shortcutManager.getActionHotkey(a.actionId)}</span>
                        </PaneListItem>)}
                    </PaneList>
                </Pane>
            </ContextDropdown>
        }


        return <ContextDropdown icon={item.icon} label={item.name} key={item.name}>
            <Pane>
                {item.rows.map((r, i) => {
                    var rowItems = item.items.filter(a => a.row === i).map(a => <PaneButton key={a.name} onClick={ContextBar.onClick} icon={a.icon} label={a.name} disabled={a.disabled} actionId={a.actionId} actionArg={a.actionArg} />);
                    if (!rowItems.length) {
                        return null;
                    }
                    return [<PaneLabel key={r + 'label'}><CarbonLabel id={r} /></PaneLabel>,
                    <PaneRow key={r + 'row'}>
                        {rowItems}
                    </PaneRow>]
                })}
            </Pane>
        </ContextDropdown>
    }

    render() {
        var contextbar_classname = cx("contextbar", { "contextbar_pinned": this.state.pinned });

        return (
            <div className={contextbar_classname}>

                {/* Left part */}
                <div className="contextbar__part contextbar__part_left">
                    {this.state.items.filter(a => a.contextBar & ContextBarPosition.Left).map(this._renderItem)}
                </div>

                {/* Right part */}
                <div className="contextbar__part contextbar__part_right">
                    {this.state.items.filter(a => a.contextBar & ContextBarPosition.Right).map(this._renderItem)}
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

// export class AltContext extends React.Component<any, any> {

//     constructor(props) {
//         super(props);
//         this.state = { secondaryIsOpen: false };
//     }

//     _openSecondary = () => {
//         this.setState({ secondaryIsOpen: true });
//     };

//     _closeSecondary = () => {
//         this.setState({ secondaryIsOpen: false });
//     };

//     render() {

//         var cn = cx("altcontext", { "altcontext_secondary-open": this.state.secondaryIsOpen });
//         return <div className={cn}>
//             {/* First (main) page*/}
//             <div className="altcontext__primary" onClick={this._openSecondary}>
//                 <Pane>
//                     <PaneList>
//                         <PaneRow>
//                             <PaneButton icon="ico-small-move-upper">Action one</PaneButton>
//                             <PaneButton icon="ico-small-move-lower" />
//                         </PaneRow>
//                         <PaneRow>
//                             <PaneButton icon="ico-small-send-to-foreground" />
//                             <PaneButton icon="ico-small-send-to-background" />
//                         </PaneRow>
//                     </PaneList>
//                 </Pane>
//             </div>

//             <div className="altcontext__secondary">
//                 <Pane>
//                     <PaneList>
//                         <PaneRow>
//                             <PaneButton icon="ico-small-move-upper">Action one</PaneButton>
//                             <PaneButton icon="ico-small-move-lower" />
//                         </PaneRow>
//                         <PaneRow>
//                             <PaneButton icon="ico-small-send-to-foreground" />
//                             <PaneButton icon="ico-small-send-to-background" />
//                             <PaneButton icon="ico-small-send-to-background" />
//                             <PaneButton icon="ico-small-send-to-background" />
//                         </PaneRow>
//                         <PaneRow>
//                             <PaneButton icon="ico-small-move-upper" />
//                             <PaneButton icon="ico-small-send-to-background" />
//                             <PaneButton icon="ico-small-move-upper" />
//                         </PaneRow>
//                     </PaneList>
//                 </Pane>

//             </div>

//             <div className="altcontext__secondary-closer" onClick={this._closeSecondary} />
//         </div>
//     }
// }