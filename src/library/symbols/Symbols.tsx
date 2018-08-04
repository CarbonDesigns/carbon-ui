import * as React from "react";
import SpriteView from "../SpriteView";
import Navigatable from "../../shared/Navigatable";
import { dispatchAction, StoreComponent } from "../../CarbonFlux";
import { FormattedMessage } from "react-intl";
import bem from '../../utils/commonUtils';
import { PageSelect } from "../../shared/ui/GuiSelect";
import { MarkupLine, Markup } from "../../shared/ui/Markup";
import SymbolsStore, { SymbolsStoreState } from "./SymbolsStore";
import { IPage, app } from "carbon-core";
import Refresher from "../Refresher";
import { SymbolsColumnWidth, SymbolsOverscanCount } from "../LibraryDefs";
import styled from "styled-components";
import theme from "../../theme";
import MainButton from "../../components/MainButton";

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
                <EmptyMessage>
                    <FormattedMessage tagName="p" id="@symbols.noneFound" />
                </EmptyMessage>
                <MarkupLine center>
                    <ImportButton label="@symbols.import" onClick={this.onAddMore} />
                </MarkupLine>
            </Markup>;
        }

        var page = this.state.currentPage;
        var config = this.state.config;

        return <SymbolsContainer>
            <LibraryHeaderContainer>
                {this.renderPageSelect(page)}
            </LibraryHeaderContainer>
            <NavigatableContent
                activeCategory={this.state.activeCategory}
                onCategoryChanged={this.onCategoryChanged}
                config={config}>

                <Refresher visible={this.state.dirtyConfig} onClick={this.onRefreshLibrary} loading={!!this.state.operation} />

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
                    templateType={SymbolsStore.storeType} />
            </NavigatableContent>
        </SymbolsContainer>
    }

    private renderPageSelect(page: IPage) {
        return <PageSelect className={bem("stencils-page", "select")} selectedItem={page} onSelect={this.onPageSelected}
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

const LibraryHeaderContainer = styled.div`
    position:relative;
    margin: 0 ${theme.margin1} 0 ${theme.margin1};
    box-sizing: border-box;
    z-index: 3;
    height:24px;
`;

const EmptyMessage = styled(MarkupLine).attrs({ center: true })`
    font:${theme.text_normal};
    color:${theme.text_color};
`;

const SymbolsContainer = styled.div`
    display:grid;
    position:relative;
    grid-template-rows: 26px 1fr;
    width:100%;
    height:100%;
`;

const ImportButton = styled(MainButton).attrs<any>({})`
    padding: 10px 20px;
    height: 36px;
`;

const NavigatableContent = styled(Navigatable).attrs<any>({})`
    width: 100%;
    padding: 0 0;
    bottom: 0;
    top:0;
    display: flex;
    flex-direction: column;
    overflow:hidden;
`;