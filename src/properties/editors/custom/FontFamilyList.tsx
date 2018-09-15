import * as React from "react";
import * as ReactDom from "react-dom";
import { CarbonStore, StoreComponent, dispatch, dispatchAction } from "../../../CarbonFlux";
import Search from "../../../shared/Search";
import LessVars from "../../../styles/LessVars";
import { GuiSpinner } from "../../../shared/ui/GuiComponents";
import { backend, FontMetadata, FontWeight, FontStyle } from "carbon-core";
import bem from '../../../utils/commonUtils';
import fontStore, { FontStoreState } from "./FontStore";
import VirtualList from "../../../shared/collections/VirtualList";
import { FontCategory } from "./FontActions";
import { Markup, MarkupLine } from "../../../shared/ui/Markup";
import { FormattedMessage } from "react-intl";
import CarbonActions from '../../../CarbonActions';
import styled from "styled-components";
import theme from "../../../theme";

type VirtualFontList = new (props) => VirtualList<FontMetadata>;
const VirtualFontList = VirtualList as VirtualFontList;

export default class FontFamilyList extends StoreComponent<any, FontStoreState>{
    refs: {
        list: VirtualList<FontMetadata>;
    }

    constructor(props) {
        super(props, fontStore);
    }

    componentDidMount() {
        super.componentDidMount();
        fontStore.loadFonts();
    }

    onSearch = term => {
        dispatchAction({ type: "Fonts_Search", term })
        this.refs.list.reset();
    };

    private onClick = e => {
        var index = parseInt(e.currentTarget.dataset.index);
        var fontMetadata = this.state.currentList[index];
        this.props.onSelected(fontMetadata);
        dispatch(CarbonActions.cancel());
    };

    private onCategoryToggle(category: FontCategory) {
        dispatchAction({ type: "Fonts_ToggleCategory", category });
    }

    private renderSwitches() {
        return <div className="_filter-switches">
            {/* <div className={bem("_filter-switch", null, { active: this.state.category === FontCategory.Favorites })} title="Show favourites fonts"
                onClick={() => this.onCategoryToggle(FontCategory.Favorites)}>
                <i className="ico-star" />
            </div> */}
            <div className={bem("_filter-switch", null, { active: this.state.category === FontCategory.Popular })} title="Show popular fonts"
                onClick={() => this.onCategoryToggle(FontCategory.Popular)}>
                <i className="ico-popular" />
            </div>
            <div className={bem("_filter-switch", null, { active: this.state.category === FontCategory.Recent })} title="Show recent fonts"
                onClick={() => this.onCategoryToggle(FontCategory.Recent)}>
                <i className="ico-recent" />
            </div>
        </div>
    }

    private renderFont = (metadata: FontMetadata, index: number) => {
        let spriteMap = this.state.webFonts.spriteMap[metadata.name];
        let scale = (LessVars.propOptionHeight - 2) / spriteMap[3];
        let style: React.CSSProperties = {
            backgroundImage: this.state.webSpriteUrl,
            backgroundPosition: -spriteMap[0] + 'px ' + -spriteMap[1] + 'px',
            backgroundSize: this.state.webFonts.spriteSize[0] + "px " + this.state.webFonts.spriteSize[1] + "px",
            width: spriteMap[2] + "px",
            height:spriteMap[3] + "px",
            transform: "scale(" + scale + ")"
        };

        return <section
            className="prop__option _typeface"
            data-index={index}
            onClick={this.onClick}
        >
            {/* <div className={bem("font-options", "typeface-star", { faved: true })}>
                <i className="ico-star" />
            </div> */}

            <div className="_typeface-meta">
                <div className="_typeface-name">{metadata.name}</div>
                {this.renderVariants(metadata)}
            </div>

            <div className="_typeface-sample-container">
                <div className="_typeface-sample-image" style={style}></div>
            </div>
        </section>
    }

    private renderVariants(metadata: FontMetadata) {
        let variants: { symbol: string, title: string }[] = [];
        if (metadata.fonts.some(x => x.weight < FontWeight.Regular)) {
            variants.push({ symbol: "l", title: "Light" });
        }
        if (metadata.fonts.some(x => x.weight > FontWeight.Regular)) {
            variants.push({ symbol: "b", title: "Bold" });
        }
        if (metadata.fonts.some(x => x.style === FontStyle.Italic)) {
            variants.push({ symbol: "it", title: "Italic" });
        }
        if (metadata.subsets && metadata.subsets.indexOf("cyrillic")) {
            variants.push({ symbol: "ru", title: "Russian" });
        }

        return <div className="_typeface-variants">
            {variants.map(x => <div className="_typeface-variant">
                <div className="_typeface-variant-icon" title={x.title}>{x.symbol}</div>
            </div>)}
        </div>;
    }

    private renderNoContent = () => {
        return <Markup>
            <MarkupLine>
                <FormattedMessage tagName="p" id="@empty" />
            </MarkupLine>
        </Markup>;
    }

    render() {
        return <FontOptionsContainer>
            <div className="_header">

                {/* 1st header line */}
                <div className="_header-line  _header-line_filters">

                    {/*<div className={bem("font-options", "header-line", "filters")}>*/}
                    <div className="_search">
                        <Search query={this.state.searchTerm} onQuery={this.onSearch} autoFocus />
                    </div>

                    {this.renderSwitches()}
                </div>
            </div>

            <VirtualFontList className="_body"
                ref="list"
                data={this.state.currentList}
                rowHeight={LessVars.propOptionHeight}
                rowRenderer={this.renderFont}
                noContentRenderer={this.renderNoContent}
            />
        </FontOptionsContainer>
    }
}

const FontOptionsContainer = styled.div`
    padding-bottom: 20px;
    height: 27rem;
    max-height: 27rem;
    color:${theme.text_color};
    font:${theme.input_font};
    background:${theme.input_background};
    box-shadow:${theme.dropdown_shadow};
    padding:${theme.margin1} 0;
    z-index:1000;

     ._header {
            padding-bottom: 5px;
            &-line {
                &_filters {
                    display:flex;
                    align-items: stretch;
                    flex-wrap: nowrap;
                }
                &_heading {
                    display:flex;
                    padding:  5px 10px;
                    align-items: center;
                }

            }
        }

        ._body {
            position:relative;
            padding-bottom: 15px;
        }

        ._search {
            flex-grow: 2;
        }

        ._filter-switches {
            display:flex;
            align-items: stretch;
            flex-wrap: nowrap;
        }

        ._filter-switch {
            display:flex;
            align-items: center;
            flex-wrap: nowrap;
            width: 32px;
            opacity:0.5;
            &:hover {
                opacity:1;

            }
            &_active {
                opacity:1;
            }

            >i {
                transform: scale(0.8);
                transition: all 0.1s;
            }
            &:hover i {
                transform: scale(0.8);
            }
        }

        ._collapse-styles {
            margin-left: auto;
        }




        .prop__optgroup-title {
            display:none;
        }

        .prop__optgroup-title,
        ._typeface {
            padding: 0 0 0 10px;

            ._body_narrow & {
                padding: 5px 10px;
            }
        }

        ._typeface {
            text-align:left;
            display: flex;
            align-items: stretch;
            flex-wrap: nowrap;
            width:100%;
            height:100%;

            &-star {
                display: flex;
                align-items: center;
                flex-wrap: nowrap;
                padding: 2px 10px;
                margin-left: -10px;
                >i {
                    opacity:0.2;
                    transform:scale(0.8);
                    transition:all 0.1s;

                }
                &_faved > i {
                    opacity:1;
                }
                &:hover > i {
                    transform:scale(1);
                }
            }

            &-meta {
                display: flex;
                align-items: stretch;
                flex-wrap: nowrap;
                ._body_narrow & {
                    flex-direction: column;
                }
                flex-grow: 1;
                padding: 2px 0;
            }

            &-name {
                display: flex;
                align-items: center;
                flex-wrap: nowrap;
                width: 15rem;
                overflow: hidden;
            }

            &-variants {
                display: flex;
                align-items: center;
                flex-wrap: nowrap;

                flex-grow : 1;
                margin-left: 10px;
            }

            &-variant {
                display:flex;
                align-items:center;
                flex-wrap:nowrap;
                height: 2em;
                width: 1.5em;
                margin-right: 1px;


                &-icon {
                    opacity:0.3;
                }
            }

            &-sample-container {
                width: 150px;
            }
            &-sample-image {
                position: absolute;
                transform-origin: 2px 2px;
            }
        }
`;