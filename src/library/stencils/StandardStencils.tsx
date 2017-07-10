import React from "react";
import SpriteView from "./SpriteView";
import Navigateable from "../../shared/Navigateable";
import { dispatchAction, StoreComponent } from "../../CarbonFlux";
import { FormattedMessage } from "react-intl";
import { GuiButton } from "../../shared/ui/GuiComponents";
import bem from '../../utils/commonUtils';
import { PageSelect } from "../../shared/ui/GuiSelect";
import { MarkupLine, Markup } from "../../shared/ui/Markup";
import SymbolsStore, { SymbolsStoreState } from "./SymbolsStore";
import { IPage, app } from "carbon-core";

require("../../import/ImportResourceDialog");

export default class StandardStencils extends StoreComponent<{}, SymbolsStoreState> {
    refs: {
        spriteView: SpriteView;
    };

    constructor(props) {
        super(props, SymbolsStore);
    }

    private onPageSelected = (page) => {
        dispatchAction({ type: "Stencils_ChangePage", page });
    };

    private onAddMore = () => {
        dispatchAction({ type: "Dialog_Show", dialogType: "ImportResourceDialog" });
    }

    private onRefreshLibrary = () => {
        dispatchAction({ type: "Stencils_Refresh" });
    }

    private renderPageItem = (page: IPage) => {
        //TODO: add possibility to add page icons?
        return <p key={page.id()}>
            <i className="ico inline-ico ico-stencil-set" />
            <span>{page.name()}</span>
        </p>
    }

    private renderRefresher() {
        var visible = this.state.dirtyConfig;
        var cn = bem("stencils-refresher", null, { hidden: !visible });
        return <div className={cn}>
            <GuiButton onClick={this.onRefreshLibrary}
                mods={['small', 'hover-white']}
                icon="refresh"
                caption="refresh.toolbox"/>
        </div>
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
            <Navigateable className={bem("library-page", "content")}
                config={config.groups}
                getCategoryNode={c => this.refs.spriteView.getCategoryNode(c)}>
                {this.renderRefresher()}
                <SpriteView config={config} changedId={this.state.changedId} sourceId={page.id()} ref="spriteView" />
            </Navigateable>
        </div>
    }

    private renderPageSelect(page: IPage) {
        return <PageSelect className={bem("stencils-page", "select")} selectedItem={page} onSelect={this.onPageSelected}
            items={app.pagesWithSymbols()}
            renderItem={this.renderPageItem}
            renderCustomItems={() => [
                <p key="add_more" onClick={this.onAddMore}>
                    <i className="ico inline-ico ico-stencil-set" />
                    <FormattedMessage id="@symbols.add" />
                </p>
            ]} />;
    }
}
