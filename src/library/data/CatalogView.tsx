import * as React from "react";
import { FormattedMessage } from 'react-intl';
import { Component, dispatch, dispatchAction } from "../../CarbonFlux";
import ScrollContainer from "../../shared/ScrollContainer";
import { ToolboxConfig, DataStencil } from "../LibraryDefs";

interface CatalogViewProps extends ISimpleReactElementProps {
    config: ToolboxConfig<DataStencil>;
    templateType: string;
    onScrolledToCategory?: (category) => void;
    scrollToCategory?: any;
}

export default class CatalogView extends Component<CatalogViewProps> {
    private categoryNodes: HTMLElement[] = [];

    componentWillReceiveProps(nextProps: CatalogViewProps) {
        if (nextProps.config !== this.props.config) {
            this.categoryNodes.length = 0;
        }
    }

    componentDidUpdate(prevProps: CatalogViewProps, prevState) {
        if (prevProps.scrollToCategory !== this.props.scrollToCategory) {
            let i = this.props.config.groups.indexOf(this.props.scrollToCategory);
            if (i >= 0 && i < this.categoryNodes.length) {
                this.categoryNodes[i].scrollIntoView({ block: "start" });
            }
        }
    }

    private onClicked = (e) => {
        dispatchAction({ type: "Stencils_Clicked", e: {ctrlKey: e.ctrlKey, metaKey: e.metaKey, currentTarget: e.currentTarget}, stencil: { ...e.currentTarget.dataset } });
    }

    private onScroll = (e: React.ChangeEvent<HTMLElement>) => {
        let groups = this.props.config.groups;
        let activeCategoryIndex = -1;
        let bottom = e.target.scrollTop + e.target.clientHeight;

        for (let i = 0; i < this.categoryNodes.length; i++) {
            let node = this.categoryNodes[i];

            if (node.offsetTop + node.clientHeight >= bottom) {
                break;
            }

            activeCategoryIndex = i;
        }

        if (activeCategoryIndex !== -1) {
            this.props.onScrolledToCategory(groups[activeCategoryIndex]);
        }
    }

    private registerCategoryNode = (node: HTMLElement) => {
        this.categoryNodes.push(node);
    }

    render() {
        if (!this.props.config) {
            return null;
        }

        return <ScrollContainer className="fill" onScroll={this.onScroll}>
            {this.props.config.groups.map(g => {
                return <section className="stencils-group" key={g.name} data-name={g.name}>
                    <div className="stencils-group__name" ref={this.registerCategoryNode}>
                        <strong><FormattedMessage id={g.name} defaultMessage={g.name} /></strong>
                    </div>
                    <div className="data__fields">
                        {g.items.map(x => <div key={x.title} className="stencil stencil_data stencil_bordered"
                            data-stencil-type={this.props.templateType}
                            data-stencil-id={x.id}
                            onClick={this.onClicked}>
                            <div className="data__field">
                                <span className="data__title">{x.title}</span>
                                {x.examples.map(e => <span className="data__example" key={e}>{e}</span>)}
                            </div>
                        </div>)}
                    </div>
                </section>
            })}
        </ScrollContainer>;
    }
}


