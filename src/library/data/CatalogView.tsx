import React from "react";
import { FormattedHTMLMessage } from 'react-intl';
import { Component, dispatch, dispatchAction } from "../../CarbonFlux";
import ScrollContainer from "../../shared/ScrollContainer";

interface CatalogViewProps extends ISimpleReactElementProps {
    config: any;
    templateType?: string;
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
                this.categoryNodes[i].scrollIntoView({block: "start"});
            }
        }
    }

    private onClicked = (e) => {
        var templateId = e.currentTarget.dataset.templateId;
        var templateType = e.currentTarget.dataset.templateType;
        dispatchAction({ type: "Stencils_Clicked", e, templateId, templateType });
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
                        <strong><FormattedHTMLMessage id={g.name} defaultMessage={g.name} /></strong>
                    </div>
                    <div className="data__fields">
                        {g.children.map(x => <div key={x.name} className="stencil stencil_data stencil_bordered"
                            data-template-type={this.props.templateType || x.templateType}
                            data-template-id={x.templateId}
                            onClick={this.onClicked}>
                            <div className="data__field">
                                <span className="data__title">{x.name}</span>
                                {x.examples.map(e => <span className="data__example" key={e}>{e}</span>)}
                            </div>
                        </div>)}
                    </div>
                </section>
            })}
        </ScrollContainer>;
    }
}


