import React from "react";
import SpriteView from "../SpriteView";
import Navigatable from "../../shared/Navigatable";
import { dispatchAction, StoreComponent } from "../../CarbonFlux";
import { FormattedMessage } from "react-intl";
import { GuiButton } from "../../shared/ui/GuiComponents";
import bem from '../../utils/commonUtils';
import { PageSelect } from "../../shared/ui/GuiSelect";
import { MarkupLine, Markup } from "../../shared/ui/Markup";
import SymbolsStore, { SymbolsStoreState } from "./SymbolsStore";
import { IPage, app } from "carbon-core";
import Refresher from "../Refresher";
import { SymbolsColumnWidth, SymbolsOverscanCount } from "../LibraryDefs";

require("../../import/ImportResourceDialog");

export default class Symbols extends StoreComponent<{}, SymbolsStoreState> {
    refs: {
        spriteView: SpriteView;
    };

    constructor(props) {
        super(props, SymbolsStore);
    }

    private onPageSelected = (page) => {
        dispatchAction({ type: "Symbols_ChangePage", page });
    };

    private onAddMore = () => {
        dispatchAction({ type: "Dialog_Show", dialogType: "ImportResourceDialog", args: { tags: "symbols" } });
    }

    private onRefreshLibrary = () => {
        dispatchAction({ type: "Symbols_Refresh" });
    }

    private onCategoryChanged = category => {
        dispatchAction({ "type": "Symbols_ClickedCategory", category });
    }
    private onScrolledToCategory = category => {
        dispatchAction({ "type": "Symbols_ScrolledToCategory", category });
    }

    private renderPageItem = (page: IPage) => {
        //TODO: add possibility to add page icons?
        return <p key={page.id}>
            {/* <i className="ico inline-ico ico-stencil-set" /> */}
            <span>{page.name}</span>
        </p>
    }

    render() {
        if (!this.state.config) {
            return <Markup>
                <MarkupLine mods="center">
                    <FormattedMessage tagName="p" id="@symbols.noneFound"/>
                </MarkupLine>
                <MarkupLine mods="center">
                    <GuiButton caption="@symbols.import" mods="hover-white" onClick={this.onAddMore} />
                </MarkupLine>
            </Markup>;
        }

        var page = this.state.currentPage;
        var config = this.state.config;

        return <div>
            <div className={bem("library-page", "header", "with-dropdown")}>
                {this.renderPageSelect(page)}
            </div>
            <Navigatable className={bem("library-page", "content")}
                activeCategory={this.state.activeCategory}
                onCategoryChanged={this.onCategoryChanged}
                config={config}>

                <Refresher visible={this.state.dirtyConfig} onClick={this.onRefreshLibrary} loading={!!this.state.operation}/>

                <SpriteView
                    config={config}
                    configVersion={this.state.configVersion}
                    changedId={this.state.changedId}
                    scrollToCategory={this.state.lastScrolledCategory}
                    onScrolledToCategory={this.onScrolledToCategory}
                    overscanCount={SymbolsOverscanCount}
                    columnWidth={SymbolsColumnWidth}
                    sourceId={page.id}
                    borders={true}
                    templateType={SymbolsStore.storeType}/>
            </Navigatable>
        </div>
    }

    private renderPageSelect(page: IPage) {
        return <PageSelect className={bem("stencils-page", "select")} mods="small" selectedItem={page} onSelect={this.onPageSelected}
            items={app.pagesWithSymbols()}
            renderItem={this.renderPageItem}
            renderCustomItems={() => [
                <p key="add_more" onClick={this.onAddMore}>
                    {/* <i className="ico inline-ico ico-stencil-set" /> */}
                    <FormattedMessage id="@symbols.add" />
                </p>
            ]} />;
    }
}
