import * as React from "react";
import * as ReactDom from "react-dom";
import * as cx from "classnames";
import {richApp} from '../../../RichApp'
import {TabContainer} from "../../../shared/TabContainer";

import ColumnsSettings    from "./ColumnsSettings";
import CanvasSettings     from "./CanvasSettings";
import GuidesSettings     from "./GuidesSettings";
import SnapSettings       from "./SnapSettings";
import {FormattedMessage} from "react-intl";

import ViewSettingsPage     from "./ViewSettingsPage";
import {FormHeading, FormLine, FormGroup} from "../../../shared/FormComponents"
import {GuiRadio, GuiCheckbox, GuiInlineLabel}           from "../../../shared/ui/GuiComponents";


export default class ViewSettingsPopup extends TabContainer {
    constructor(props){
        super(props);
    }

    _dropdownTab(tab, i){
        var tabId = (i + 1) + "";
        var className = cx("view-settings__tab", {
            active: tabId === this.state.tabId
        });
        // class active
        return (
            <div className={className} id={tab.id} key={tab.id} ref={"header" + tabId}
                 data-target-tab={tabId}
                 onClick={this.changeTab}>
                <i />
                <FormattedMessage id={tab.label}/>
            </div>
        )
    }

    static renderIcon(){
        return <i/>
    }

    render(){
        return <div className="flyout__content">
            <div className="view-settings__content   form form_compact">
                <div className="view-settings__tabs">
                    {
                        [
                            {
                                id: "view-settings__tab_canvas",
                                label: "General"
                            },
                            {
                                id: "view-settings__tab_columns",
                                label: "Columns"
                            },
                            {
                                id: "view-settings__tab_guides",
                                label: "Guides"
                            },
                            // {
                            //     id: "view-settings__tab_grid",
                            //     label: "Grid"
                            // },
                            // {
                            //     id: "view-settings__tab_rulers",
                            //     label: "Rulers"
                            // },
                            {
                                id: "view-settings__tab_snapping",
                                label: "Snapping"
                            },
                            // {
                            //     id: "view-settings__tab_frame",
                            //     label: "Frame"
                            // }
                        ].map((tab, i) => this._dropdownTab(tab, i))
                    }
                </div>


                <div data-current-tab={this.state.tabId} className="view-settings__pages  gui-pages" ref="tabContainer">

                    <CanvasSettings  ref="tab1"/>
                    <ColumnsSettings ref="tab2"/>
                    <GuidesSettings  ref="tab3"/>
                    <SnapSettings ref="tab4"/>

{/*                    <ViewSettingsPage slug="snapping" heading="Snapping" ref="tab4" switcher={true} checked={true} onChange={this.showChanged} >
                        <FormGroup heading="Snap to">
                            <FormLine><GuiCheckbox label="columns"/></FormLine>
                            <FormLine><GuiCheckbox label="guides"/></FormLine>
                            <FormLine><GuiCheckbox label="grid"/></FormLine>
                            <FormLine><GuiCheckbox label="object corners"/></FormLine>
                            <FormLine><GuiCheckbox label="object centers"/></FormLine>
                            <FormLine><GuiCheckbox label="edge centers"/></FormLine>
                        </FormGroup>

                        <FormGroup>
                            <FormLine><GuiCheckbox label="snap to locked objects"/></FormLine>
                        </FormGroup>
                    </ViewSettingsPage>
*/}
                    {/*<ViewSettingsPage slug="grid" heading="Grid" switch={true} ref="tab4" >
                        <FormGroup heading="Horizontal lines">
                            <FormLine>
                                <GuiInlineLabel text="Size"/>
                                <div className="gui-inline-data">
                                    <label className="gui-spinner gui-inliner">
                                        <input size={5} type="text"/>
                                    </label>
                                    <label className="gui-radio gui-inliner">
                                        <input name="radio1" type="radio"/>
                                        <i />
                                        <span>px</span>
                                    </label>
                                    <label className="gui-radio gui-inliner">
                                        <input name="radio1" type="radio"/>
                                        <i />
                                        <span>%</span>
                                    </label>
                                </div>
                            </FormLine>

                            <FormLine>
                                <GuiCheckbox inline={true} label="Accent each"/>
                                <label className="gui-check gui-inline-label">
                                    <input type="checkbox"/>
                                    <i />
                                    <FormattedMessage id="Accent each"/>
                                </label>
                            <div className="gui-inline-data">
                                    <label className="gui-spinner gui-inliner">
                                        <input size={5} type="text"/>
                                    </label>
                                   <span className="gui-inliner"> <FormattedMessage id="line"/> </span>
                                </div>
                            </FormLine>
                        </FormGroup>

                        <FormGroup heading="Vertical lines">
                            <FormLine>
                                <GuiInlineLabel text="Size"/>
                                <div className="gui-inline-data">
                                    <label className="gui-spinner gui-inliner">
                                        <input size={5} type="text"/>
                                    </label>
                                    <label className="gui-radio gui-inliner">
                                        <input name="radio1" type="radio"/>
                                        <i />
                                        <span>px</span>
                                    </label>
                                    <label className="gui-radio gui-inliner">
                                        <input name="radio1" type="radio"/>
                                        <i />
                                        <span>%</span>
                                    </label>
                                </div>
                            </FormLine>
                            <FormLine>
                                <GuiCheckbox inline={true} label="Accent each"/>
                                <div className="gui-inline-data">
                                    <label className="gui-spinner gui-inliner">
                                        <input size={5} type="text"/>
                                    </label>
                                    <span className="gui-inliner"><FormattedMessage  id="line"/></span>
                                </div>
                            </FormLine>
                        </FormGroup>

                        <FormGroup heading="Appearance">
                            <FormLine>
                                <section className="gui-pushbuttons">
                                    <GuiInlineLabel text="style"/>
                                    <div className="gui-inline-data">
                                        <div className="gui-pushbutton _pressed" data-switcher="_pressed">
                                            <i className="pushbutton-grid-style pushbutton-grid-style_dots"/>
                                        </div>
                                        <div className="gui-pushbutton " data-switcher="_pressed">
                                            <i className="pushbutton-grid-style pushbutton-grid-style_corners"/>
                                        </div>
                                        <div className="gui-pushbutton " data-switcher="_pressed">
                                            <i className="pushbutton-grid-style pushbutton-grid-style_dashes"/>
                                        </div>
                                        <div className="gui-pushbutton " data-switcher="_pressed">
                                            <i className="pushbutton-grid-style pushbutton-grid-style_lines"/>
                                        </div>
                                    </div>
                                </section>
                            </FormLine>

                            <FormLine>
                                <GuiInlineLabel text="opacity"/>
                                <div className="gui-inline-data">
                                    <div className="gui-slider gui-slider_horizontal">
                                        <div className="gui-slider__track">
                                            <div className="gui-slider__handle"/>
                                        </div>
                                    </div>
                                </div>
                            </FormLine>
                        </FormGroup>

                        <FormGroup heading="Position">
                            <FormLine> <GuiCheckbox label="show on page only"/> </FormLine>
                            <FormLine> <GuiCheckbox label="show grid above page"/> </FormLine>
                        </FormGroup>
                    </ViewSettingsPage>

                    <ViewSettingsPage slug="rulers" heading="Rulers" switch={true} ref="tab5" >
                        <FormGroup heading="Type">
                            <FormLine> <GuiCheckbox label="ruler.horizontal" defaultMessage="horizontal"/> </FormLine>
                            <FormLine> <GuiCheckbox label="ruler.vertical" defaultMessage="vertical"/> </FormLine>
                        </FormGroup>

                        <FormGroup heading="Show">
                            <FormLine> <GuiCheckbox label="numbers on rulers"/> </FormLine>
                            <FormLine> <GuiCheckbox label="rulers out of page borders"/> </FormLine>
                            <FormLine> <GuiCheckbox label="selection sizes on rulers"/> </FormLine>
                        </FormGroup>
                    </ViewSettingsPage>


                    <ViewSettingsPage slug="frame" heading="Frame" switch={true} ref="tab7">
                        <FormGroup heading="Appearance">
                            <FormLine>
                                <GuiRadio mods="line" label="Stretchable"       name="frame_appearance"/>
                                <GuiRadio mods="line" label="Fixed, below page" name="frame_appearance"/>
                                <GuiRadio mods="line" label="Fixed, above page" name="frame_appearance"/>
                            </FormLine>
                        </FormGroup>

                        <FormGroup heading="Device">
                            <FormLine>
                                <GuiRadio mods="line" label="Get from page settings" name="radio1"/>
                                <GuiRadio mods="line" label="Get from page settings" name="radio1"/>

                                <select className="in-bl">
                                    <optgroup label="iOS">
                                        <option value={0}>IPhone</option>
                                        <option value={1}>IPad</option>
                                    </optgroup>
                                    <optgroup label="Android">
                                        <option value={0}>Samsung Galaxy S3</option>
                                        <option value={1}>Nokia</option>
                                    </optgroup>
                                    <optgroup label="Windows">
                                        <option value={0}>HTC</option>
                                        <option value={1}>Nokia</option>
                                    </optgroup>
                                </select>
                            </FormLine>
                        </FormGroup>
                    </ViewSettingsPage>
                */}
                </div>
            </div>
        </div>
    }
}