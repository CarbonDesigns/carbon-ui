import * as React from "react";
import { Component } from "../CarbonFlux";
import * as cx from "classnames";
import ScrollContainer from "./ScrollContainer";
import styled from "styled-components";
import theme from "../theme";

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
            'nav-navigator__item': true,
            'active': g === this.props.activeCategory
        });
        return <div key={g.name} className={classes} onClick={this.onCategoryClick} data-index={i}>
            <span>{g.name}</span>
        </div>
    }

    render() {
        var { config, activeCategory, onCategoryChanged, children, ...other } = this.props;
        if (!config) {
            return null;
        }

        return <NavigatableContainer {...other}>
             <div className="nav-navigator">
                <ScrollContainer className="wrap thin" x={false}>
                    {config.groups.map(this.renderCategory)}
                </ScrollContainer>
            </div>

            <div className="nav-container">
                {this.props.children}
            </div>
        </NavigatableContainer>;
    }
}

const NavigatableContainer = styled.div`
    display:flex;
    flex-direction:column;
    position:relative;

    .nav-container {
        /* border-width: @stencil_margin; */
        /* border-color: @stencil_container_bg; */
        box-sizing: border-box;
        position:relative;
        z-index: 2;
        position: relative;

        .tab-page_search  & {
            /* .box-shadow(none); */
        }

        display: flex;
        flex: auto;
    }

    .nav-navigator {
        left: 0;
        top:0;
        padding-top:${theme.margin1};

        .wrap{
            height:100%;
        }

        z-index: 1;
        position:absolute;
        width: 1rem;
        height:100%;

        & ~ .nav-container {
            transition: transform .3s;
            margin-left: 1.1rem;
            box-shadow:0 0 16px 10px ${theme.input_background};
        }

        &:hover {
            width: 10rem;

            & ~ .nav-container {
                transition: transform .2s;
                transform: translateX(8.5rem);
            }
        }


        &__item {
            cursor:pointer;
            /* .bbox; */
            height:14px;
            line-height:10px;

            font:${theme.defatul_font};
            color:${theme.text_color};
            position:relative;
            overflow:hidden;
            padding-left:4px;

            white-space:nowrap;
            /* .middler; */
            margin-bottom: 2px;

            &:after {
                /* .aft; */
                top    : 0;
                bottom : 0;
                width  : 5px;
                left   : 2px;
                background-color:red;/*rgba(248, 238, 192, 0.17)); */
            }

            span {
                line-height:14px;
                display:inline-block;
                vertical-align:middle;
                opacity:0.7;
            }


            &.active {
                padding-left:2px;
                border-left:2px solid ${theme.accent};

                span {
                    opacity:1;
                }
            }
        }
    }
`;
