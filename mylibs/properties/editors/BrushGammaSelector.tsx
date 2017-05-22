import React from "react";
import classNames from 'classnames';

import Dropdown from "../../shared/Dropdown"

export class BrushGammaSelector extends Dropdown{
    render(){
        var activeItem = this.props.selectedItem;
        var dropClasses = classNames('drop drop-down', {
            _active: this.state.open
        }, this.props.className);

        var selectedGamma = Gammas[activeItem];

        return <div className={dropClasses} onMouseDown={this.toggle} onKeyDown={this.onKeyDown} onBlur={this.close} tabIndex={0}>
            <div className="drop__pill">
                <span>{selectedGamma.name}</span>
                <i className="ico ico-triangle"/>
            </div>
            {this.renderContent()}
        </div>;
    }
    renderContent(){
        return <div className="drop__content drop-content_auto-width" ref="dropContainer">
            {
                Gammas.map(x => {
                    //onClick does not work for some strange reason
                    return <div className="drop__list" onMouseDown={this.selectItem} key={x.name}>
                        <div className="drop__item drop__item_squish">
                            <span>{x.name}</span>
                            <div className="swatches__gamma-show">
                                {x.colors.map(c => {
                                    var style = {backgroundColor: c};
                                    return <i style={style} key={c}/>;
                                })}
                            </div>
                        </div>
                    </div>;
                })
            }
        </div>
    }
}

export var Gammas = [
    {
        name: "Grayscales",
        colors: [
            "#000",
            "#fff",
            "#353535",
            "#6d6d6d",
            "#8d8d8d",
            "#aeaeae",
            "#dddddd"
        ]
    },
    {
        name: "Flat UI",
        colors: [
            "#34495E",
            "#2C3E50",
            "#ECF0F1",
            "#bdc3c7",
            "#BDC3C7",
            "#95A5A6",
            "#7F8C8D",
            "#1ABC9C",
            "#F1C40F",
            "#F39C12",
            "#E67E22",
            "#D35400",
            "#E74C3C",
            "#C0392B",
            "#16A085",
            "#2ECC71",
            "#27AE60",
            "#3498DB",
            "#2980B9",
            "#9B59B6",
            "#8E44AD"
        ]
    },
    {
        name: "Spring",
        colors: [
            "#66ffff",
            "#66ffcc",
            "#66ff99",
            "#66ff66",
            "#66ff33",
            "#66ff00",
            "#66ccff",
            "#66cccc",
            "#66cc99",
            "#66cc66",
            "#66cc33",
            "#66cc00",
            "#6699ff",
            "#6699cc",
            "#669999",
            "#669966",
            "#669933",
            "#669900"
        ]
    },
    {
        name: "Summer",
        colors: [
            "#ffffff",
            "#ffffcc",
            "#ffff99",
            "#ffff66",
            "#ffff33",
            "#ffff00",
            "#ffccff",
            "#ffcccc",
            "#ffcc99",
            "#ffcc66",
            "#ffcc33",
            "#ffcc00",
            "#ff99ff",
            "#ff99cc",
            "#ff9999",
            "#ff9966",
            "#ff9933",
            "#ff9900",
            "#ff66ff",
            "#ff66cc",
            "#ff6699",
            "#ff6666",
            "#ff6633"
        ]
    }
];