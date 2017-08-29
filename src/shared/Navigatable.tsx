import React from "react";
import { Component } from "../CarbonFlux";
import cx from "classnames";
import ScrollContainer from "./ScrollContainer";

//strange webpack bug, scroll container import is removed
ScrollContainer.bind(this);

interface NavigatableProps extends ISimpleReactElementProps {
    config: any;
    onCategoryChanged: (category) => void;
    activeCategory: any;
}

export default class Navigatable extends Component<NavigatableProps>{
    private onCategoryClick = e => {
        let index = parseInt(e.currentTarget.dataset.index);
        let category = this.props.config.groups[index];
        this.props.onCategoryChanged(category);
    }

    private renderCategory = (g, i) => {
        var classes = cx({
            'stencils-navigator__item': true,
            'active': g === this.props.activeCategory
        });
        return <div key={g.name} className={classes} onClick={this.onCategoryClick} data-index={i}>
            <span>{g.name}</span>
        </div>
    }

    render() {
        var { className, config, activeCategory, onCategoryChanged, children, ...other } = this.props;
        if (!config) {
            return null;
        }

        var classes = cx("navigatable", className);
        return <div className={classes} {...other}>
             <div className="stencils-navigator">
                <ScrollContainer className="wrap thin" x={false}>
                    {config.groups.map(this.renderCategory)}
                </ScrollContainer>
            </div>

            <div className="stencils-container">
                {this.props.children}
            </div>
        </div>;
    }
}
