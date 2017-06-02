import React from 'react';
import EditorComponent, {IEditorProps, IEditorState} from "./EditorComponent";
import cx from 'classnames';
import {FormattedHTMLMessage} from "react-intl";
import bem from '../../utils/commonUtils';
import {Constraints} from "carbon-core";
import DropDownEditor from "./DropdownEditor";
import Dropdown from "../../shared/Dropdown";
import { HorizontalConstraint, VerticalConstraint } from "carbon-core";
import GuiSelect from "../../shared/ui/GuiSelect";

function horizontalFromIndex(index){
    switch(index){
        case 0:
            return HorizontalConstraint.Left;
        case 1:
            return HorizontalConstraint.Right;
        case 2:
            return HorizontalConstraint.LeftRight;
        case 3:
            return HorizontalConstraint.Center;
        default:
            return HorizontalConstraint.Scale;
    }
}

function verticalFromIndex(index){
    switch(index){
        case 0:
            return VerticalConstraint.Top;
        case 1:
            return VerticalConstraint.Bottom;
        case 2:
            return VerticalConstraint.TopBottom;
        case 3:
            return VerticalConstraint.Center;
        default:
            return VerticalConstraint.Scale;
    }
}

function formatValue(val) {
    return val
}

interface IConstrainsEditorState extends IEditorState<any>{
    dropdownHorizontal: number;
    dropdownVertical: number;
}

export default class ConstraintsEditor extends EditorComponent<IEditorProps, IConstrainsEditorState> {

    constructor(props) {
        super(props);

        this.state = {dropdownHorizontal:1, dropdownVertical:1};
    }

    verticalToggle(v) {
        var self = this;
        return function (event) {
            event.preventDefault();
            var p = self.props.p.get("value");

            var oldV = p.v;
            var newV;

            if (v === VerticalConstraint.Center) {
                if (oldV & VerticalConstraint.Center) {
                    newV = 0;
                } else {
                    newV = v;
                }
            } else {
                if (oldV & v) {
                    newV = oldV & ~v;
                } else {
                    newV = oldV | v;
                }

                newV &= ~VerticalConstraint.Center;
            }

            var newConstraint = Constraints.create(p.h, newV || VerticalConstraint.Top)
            self.setValueByCommand(newConstraint);
        }
    }

    horizontalToggle(h) {
        var self = this;
        return function (event) {
            event.preventDefault();
            var p = self.props.p.get("value");
            var oldH = p.h;
            var newH;

            if (h === HorizontalConstraint.Center) {
                if (oldH & HorizontalConstraint.Center) {
                    newH = 0;
                } else {
                    newH = h;
                }
            } else {
                if (oldH & h) {
                    newH = oldH & ~h;
                } else {
                    newH = oldH | h;
                }

                newH &= ~HorizontalConstraint.Center;
            }

            var newConstraint = Constraints.create(newH || HorizontalConstraint.Left, p.v)
            self.setValueByCommand(newConstraint);
        }
    }

    _onChangeHorizontal = (optionIndex) =>{
        //this.setState({dropdownHorizontal: optionIndex});
        var p = this.props.p.get("value");
        var newConstraint = Constraints.create(horizontalFromIndex(optionIndex), p.v)
        this.setValueByCommand(newConstraint);
    }

    _onChangeVertical = (optionIndex) =>{
        //this.setState({dropdownVertical: optionIndex});
        var p = this.props.p.get("value");
        var newConstraint = Constraints.create(p.h, verticalFromIndex(optionIndex))
        this.setValueByCommand(newConstraint);
    }

    render() {
        var classes = this.prop_cn(
            null,
            this.widthClass(this.props.className || "prop_width-1-1")
        );

        var c = this.props.p.get('value');
        var dropdownHorizontal = 4;
        if(c.h === HorizontalConstraint.LeftRight) {
            dropdownHorizontal = 2;
        } else if (c.h === HorizontalConstraint.Left) {
            dropdownHorizontal = 0;
        } else if (c.h === HorizontalConstraint.Right) {
            dropdownHorizontal = 1;
        } else if (c.h === HorizontalConstraint.Center) {
            dropdownHorizontal = 3;
        }

        var dropdownVertical = 4;
        if(c.v === VerticalConstraint.TopBottom) {
            dropdownVertical = 2;
        } else if (c.v === VerticalConstraint.Top) {
            dropdownVertical = 0;
        } else if (c.v === VerticalConstraint.Bottom) {
            dropdownVertical = 1;
        } else if (c.v === VerticalConstraint.Center) {
            dropdownVertical = 3;
        }


        return <div className={classes}>
            <div className={this.b('name') }><FormattedHTMLMessage id={this.displayName()}/></div>
            <div className={this.b('editor')}>
                <div className="prop_constraints__wrapper">
                    <div className="prop_constraints__parent">
                        <div className={bem("prop_constraints", "knot", {
                            top1: true,
                            active: c.v & VerticalConstraint.Top
                        })}></div>
                        <div className={bem("prop_constraints", "knot", {
                            right1: true,
                            active: c.h & HorizontalConstraint.Right
                        })}></div>
                        <div className={bem("prop_constraints", "knot", {
                            bottom1: true,
                            active: c.v & VerticalConstraint.Bottom
                        })}></div>
                        <div className={bem("prop_constraints", "knot", {
                            left1: true,
                            active: c.h & HorizontalConstraint.Left
                        })}></div>
                        <div className="prop_constraints__object">
                            <div className={bem("prop_constraints", "knot", {
                                top2: true,
                                active: (c.v & VerticalConstraint.Center) || (c.v & VerticalConstraint.Top)
                            })}></div>
                            <div className={bem("prop_constraints", "knot", {
                                bottom2: true,
                                active: (c.v & VerticalConstraint.Center) || (c.v & VerticalConstraint.Bottom)
                            })}></div>
                            <div className={bem("prop_constraints", "knot", {
                                right2: true,
                                active: (c.h & HorizontalConstraint.Center) || (c.h & HorizontalConstraint.Right)
                            })}></div>
                            <div className={bem("prop_constraints", "knot", {
                                left2: true,
                                active: (c.h & HorizontalConstraint.Center) || (c.h & HorizontalConstraint.Left)
                            })}></div>

                            <div className={bem("prop_constraints", "lock", {
                                horizontal: true,
                                width: true,
                                active: c.h & HorizontalConstraint.Center
                            })} onClick={this.horizontalToggle(HorizontalConstraint.Center)}></div>
                            <div className={bem("prop_constraints", "lock", {
                                vertical: true,
                                height: true,
                                active: c.v & VerticalConstraint.Center
                            })} onClick={this.verticalToggle(VerticalConstraint.Center)}></div>
                            <div className={bem("prop_constraints", "lock", {
                                vertical: true,
                                top: true,
                                active: c.v & VerticalConstraint.Top
                            })} onClick={this.verticalToggle(VerticalConstraint.Top)}></div>
                            <div className={bem("prop_constraints", "lock", {
                                horizontal: true,
                                right: true,
                                active: c.h & HorizontalConstraint.Right
                            })} onClick={this.horizontalToggle(HorizontalConstraint.Right)}></div>
                            <div className={bem("prop_constraints", "lock", {
                                vertical: true,
                                bottom: true,
                                active: c.v & VerticalConstraint.Bottom
                            })} onClick={this.verticalToggle(VerticalConstraint.Bottom)}></div>
                            <div className={bem("prop_constraints", "lock", {
                                horizontal: true,
                                left: true,
                                active: c.h & HorizontalConstraint.Left
                            })} onClick={this.horizontalToggle(HorizontalConstraint.Left)}></div>
                        </div>
                    </div>
                    <div className="prop_constraints__dropdowns">
                        <div className="prop_constraints__dropdown">
                            <div className="prop_constraints__dropdown-icon">
                                <i className="ico--vertical-double-arrow"/>
                            </div>
                            <GuiSelect
                                mods="line"
                                selectedItem={dropdownHorizontal}
                                onSelect={this._onChangeHorizontal}>
                                <p>Left</p>
                                <p>Right</p>
                                <p>Left &amp; Right</p>
                                <p>Center</p>
                                <p>Scale</p>
                            </GuiSelect>
                        </div>

                        <div className="prop_constraints__dropdown">
                            <div className="prop_constraints__dropdown-icon">
                                <i className="ico--horizontal-double-arrow"/>
                            </div>
                            <GuiSelect
                                mods="line"
                                selectedItem={dropdownVertical}
                                onSelect={this._onChangeVertical}>
                                <p>Top</p>
                                <p>Bottom</p>
                                <p>Top &amp; bottom</p>
                                <p>Center</p>
                                <p>Scale</p>
                            </GuiSelect>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }


    onChange = (e) => {
    };
}