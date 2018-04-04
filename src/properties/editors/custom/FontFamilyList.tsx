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
        return <div className="font-options__filter-switches">
            {/* <div className={bem("font-options__filter-switch", null, { active: this.state.category === FontCategory.Favorites })} title="Show favourites fonts"
                onClick={() => this.onCategoryToggle(FontCategory.Favorites)}>
                <i className="ico-star" />
            </div> */}
            <div className={bem("font-options__filter-switch", null, { active: this.state.category === FontCategory.Popular })} title="Show popular fonts"
                onClick={() => this.onCategoryToggle(FontCategory.Popular)}>
                <i className="ico-popular" />
            </div>
            <div className={bem("font-options__filter-switch", null, { active: this.state.category === FontCategory.Recent })} title="Show recent fonts"
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
            className="prop__option font-options__typeface"
            data-index={index}
            onClick={this.onClick}
        >
            {/* <div className={bem("font-options", "typeface-star", { faved: true })}>
                <i className="ico-star" />
            </div> */}

            <div className="font-options__typeface-meta">
                <div className="font-options__typeface-name">{metadata.name}</div>
                {this.renderVariants(metadata)}
            </div>

            <div className="font-options__typeface-sample-container">
                <div className="font-options__typeface-sample-image" style={style}></div>
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

        return <div className="font-options__typeface-variants">
            {variants.map(x => <div className="font-options__typeface-variant">
                <div className="font-options__typeface-variant-icon" title={x.title}>{x.symbol}</div>
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
        return <div className="flyout__content prop__options-container font-options" >
            <div className="font-options__header">

                {/* 1st header line */}
                <div className="font-options__header-line  font-options__header-line_filters">

                    {/*<div className={bem("font-options", "header-line", "filters")}>*/}
                    <div className="font-options__search">
                        <Search query={this.state.searchTerm} onQuery={this.onSearch} autoFocus />
                    </div>

                    {this.renderSwitches()}
                </div>
            </div>

            <VirtualFontList className="font-options__body"
                ref="list"
                data={this.state.currentList}
                rowHeight={LessVars.propOptionHeight}
                rowRenderer={this.renderFont}
                noContentRenderer={this.renderNoContent}
            />
        </div>
    }
}