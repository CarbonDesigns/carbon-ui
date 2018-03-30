import * as React from "react";
import EditorComponent, {IEditorProps} from "./EditorComponent";
import * as cx from "classnames";
import { FormattedMessage } from "react-intl";
import bem from '../../utils/commonUtils';
import { Constraints } from "carbon-core";
import DropDownEditor from "./DropdownEditor";
import Dropdown from "../../shared/Dropdown";
import { HorizontalConstraint, VerticalConstraint, IConstraints } from "carbon-core";
import GuiSelect from "../../shared/ui/GuiSelect";

type HorizontalConstraintSelect = new (props) => GuiSelect<HorizontalConstraint>;
type VerticalConstraintSelect = new (props) => GuiSelect<VerticalConstraint>;

const HorizontalConstraintSelect = GuiSelect as HorizontalConstraintSelect;
const VerticalConstraintSelect = GuiSelect as VerticalConstraintSelect;

function horizontalLabel(c: HorizontalConstraint) {
    switch (c) {
        case HorizontalConstraint.Left:
            return "@constraints.left";
        case HorizontalConstraint.Right:
            return "@constraints.right";
        case HorizontalConstraint.LeftRight:
            return "@constraints.leftAndRight";
        case HorizontalConstraint.Center:
            return "@constraints.center";
        case HorizontalConstraint.Scale:
            return "@constraints.scale";
    }

    assertNever(c);
}

function verticalLabel(c: VerticalConstraint) {
    switch (c) {
        case VerticalConstraint.Top:
            return "@constraints.top";
        case VerticalConstraint.Bottom:
            return "@constraints.bottom";
        case VerticalConstraint.TopBottom:
            return "@constraints.topAndBottom";
        case VerticalConstraint.Center:
            return "@constraints.center";
        case VerticalConstraint.Scale:
            return "@constraints.scale";
    }
    assertNever(c);
}

export default class ConstraintsEditor extends EditorComponent<IConstraints, IEditorProps> {
    verticalToggle(v) {
        var self = this;
        return function (event) {
            event.preventDefault();
            var p = self.props.p.get("value");

            var oldV = p.v;
            var newV;

            if(oldV === VerticalConstraint.Scale) {
                newV = v;
            }
            else if (v === VerticalConstraint.Center) {
                if (oldV & VerticalConstraint.Center) {
                    newV = VerticalConstraint.Scale;
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

            if (oldH === HorizontalConstraint.Scale) {
                newH = h;
            }
            else if (h === HorizontalConstraint.Center) {
                if (oldH & HorizontalConstraint.Center) {
                    newH = HorizontalConstraint.Scale;
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

    _onChangeHorizontal = (c: HorizontalConstraint) => {
        var p = this.props.p.get("value");
        var newConstraint = Constraints.create(c, p.v)
        this.setValueByCommand(newConstraint);
    }

    _onChangeVertical = (c: VerticalConstraint) => {
        var p = this.props.p.get("value");
        var newConstraint = Constraints.create(p.h, c)
        this.setValueByCommand(newConstraint);
    }

    private static renderVerticalLabel = (item) => <FormattedMessage id={verticalLabel(item)} tagName="p" />;
    private static renderHorizonalLabel = (item) => <FormattedMessage id={horizontalLabel(item)} tagName="p" />;

    render() {
        var classes = this.prop_cn(
            null,
            this.widthClass(this.props.className || "prop_width-1-1")
        );

        var c: IConstraints = this.props.p.get('value');

        return <div className={classes}>
            <div className={this.b('name')}><FormattedMessage id={this.displayName()} /></div>
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
                                <i className="ico-vertical-double-arrow" />
                            </div>
                            <VerticalConstraintSelect
                                mods="small"
                                selectedItem={c.v}
                                items={ConstraintsEditor.VerticalConstraints}
                                renderItem={ConstraintsEditor.renderVerticalLabel}
                                onSelect={this._onChangeVertical}>
                            </VerticalConstraintSelect>
                        </div>

                        <div className="prop_constraints__dropdown">
                            <div className="prop_constraints__dropdown-icon">
                                <i className="ico-horizontal-double-arrow" />
                            </div>
                            <HorizontalConstraintSelect
                                mods="small"
                                selectedItem={c.h}
                                onSelect={this._onChangeHorizontal}
                                items={ConstraintsEditor.HorizontalConstraints}
                                renderItem={ConstraintsEditor.renderHorizonalLabel}>
                            </HorizontalConstraintSelect>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }

    static VerticalConstraints = [VerticalConstraint.Top, VerticalConstraint.Bottom, VerticalConstraint.TopBottom, VerticalConstraint.Center, VerticalConstraint.Scale];
    static HorizontalConstraints = [HorizontalConstraint.Left, HorizontalConstraint.Right, HorizontalConstraint.LeftRight, HorizontalConstraint.Center, HorizontalConstraint.Scale];
}