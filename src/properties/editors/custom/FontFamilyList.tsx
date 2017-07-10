import React from 'react';
import ReactDom from 'react-dom';
import Infinite from "react-infinite";
import {Component, CarbonStore, handles, Dispatcher} from "../../../CarbonFlux";
import Search from "../../../shared/Search";
import LessVars from "../../../styles/LessVars";
import FlyoutActions from "../../../FlyoutActions";
import FontFamilyActions from "./FontFamilyActions";
import { GuiCheckbox, GuiSpinner }           from "../../../shared/ui/GuiComponents";
import {backend} from "carbon-core";
import bem from '../../../utils/commonUtils';
import GuiSelect from "../../../shared/ui/GuiSelect";


export default class FontFamilyList extends Component<any, any>{
    refs: {
        search: Search
        scrollContainer: HTMLElement
    }

    constructor(props) {
        super(props);
        this.state = {
            elements: [],
            metadata: [],
            isInfiniteLoading: false,
            page: 0,
            pageCount: Number.MAX_VALUE,
            query: '',
            waiting: false
        };
    }

    componentDidMount(){
        super.componentDidMount();
        this.refs.search.focus();
    }
    componentDidUpdate(){
        this.initScroller();
    }
    componentWillUnmount(){
        super.componentWillUnmount();

        var antiscroll = $(ReactDom.findDOMNode(this.refs.scrollContainer)).data('antiscroll');
        if (antiscroll){
            antiscroll.destroy();
        }
    }

    @handles(FontFamilyActions.pageLoaded)
    _pageLoaded(action){
        this.setState({
            isInfiniteLoading: false,
            elements: this.appendPage(action.result, action.page),
            metadata: this.state.metadata.concat(action.result.fonts),
            pageCount: action.result.pageCount,
            waiting: false
        });
    }

    handleInfiniteLoad = () => {
        if (this.state.page >= this.state.pageCount || this.state.waiting){
            return;
        }
        var nextPage = this.state.page + 1;
        this.setState({
            isInfiniteLoading: true,
            page: nextPage,
            waiting: true
        });

        var operation = this.state.query ?
            backend.fontsProxy.search(this.state.query, nextPage) :
            backend.fontsProxy.system(nextPage);

        operation
            .then(result => Dispatcher.dispatch(FontFamilyActions.pageLoaded(result, nextPage)));
    };
    handleSearch = query => {
        this.setState({elements: [], query, page: 0, pageCount: Number.MAX_VALUE});
        if (!query || !this.state.elements.length){
            this.handleInfiniteLoad();
        }
    };

    appendPage(result, page){
        var fonts = result.fonts;
        var elements = this.state.elements;
        var mapping = {
          1 : {key: 'popular', children: 'Popular'}  ,
          2 : {key: 'all'    , children: 'All'   }  ,
        };

        if (!this.state.query && mapping.hasOwnProperty(page) ){
            elements.push(
                <section key={mapping[page].key} className="prop__option">
                     <span className="prop__optgroup-title">{mapping[page].children}</span>
                </section>
            );
        }

        let font, i, imageUrl;
        const l = fonts.length;

        for (i = 0; i < l; ++i) {
            font = fonts[i];
            imageUrl = backend.cdnEndpoint + "/fonts/" + font.path + "/sample.png";

            elements.push(
                <section
                    key={font.name + page}
                    className="prop__option"
                    data-font={font.name}
                    onClick={this.onClick}
                >
                    <div className="font-options__sample" style={{ backgroundImage: `url('${imageUrl}')` }}></div>
                </section>
            );
        }

        return elements;
    }

    elementInfiniteLoad() {
        if (!this.state.waiting){
            return null;
        }
        // return <section className="prop__option">Loading...</section>
        return <GuiSpinner/>
    }

    onClick = e => {
        var family = e.currentTarget.dataset.font;
        var fontMetadata = this.state.metadata.find(x => x.name === family);
        this.props.onSelected(fontMetadata);
        Dispatcher.dispatch(FlyoutActions.show(null));
    };

    initScroller(){
        var wrap = ReactDom.findDOMNode(this.refs.scrollContainer);
        $(wrap).antiscroll({
            onlyOnWindows: false,
            initialDisplay: false
        });
    }

    _onCategorySelect = () => {
        console.log(arguments)
    };

    render(){

        var searchMessage = this.context.intl.formatMessage({id:"Search...", defaultMessage:"Search..."});

        //fixme :   translate everything !
        return <div className="flyout__content prop__options-container font-options" >
            <div className="font-options__header">

                {/* 1st header line */}
                <div className="font-options__header-line  font-options__header-line_filters">

                    {/*<div className={bem("font-options", "header-line", "filters")}>*/}
                    <div className="font-options__search">
                        <Search placeholder={searchMessage} onQuery={this.handleSearch} ref="search"/>
                    </div>

                    <div className="font-options__filter-switches">
                        <div className="font-options__filter-switch  font-options__filter-switch_fav"
                            title="Show favourites only"
                        >
                            <i className="ico--star"/>
                        </div>
                        {/*<div className="font-options__filter-switch  font-options__filter-switch_used">
                            <i className="ico--recent"/>
                        </div> */}
                    </div>

                    <div className="font-options__category-selector">
                        {/*<GuiSelect
                            mods="line"
                            selectedItem={0}
                            onSelect={this._onCategorySelect}
                        >
                            <p>All</p>
                            <p>User uploaded</p>
                            <p>Adobe Typekit</p>
                            <p>Myfonts.com</p>
                        </GuiSelect>*/}
                    </div>
                </div>

                {/* 2nd header line */}
                {/*<div className="font-options__header-line  font-options__header-line_heading">*/}
                    {/*<p>230 typefaces</p>*/}
                    {/*<div className="font-options__collapse-styles">*/}
                        {/*<GuiCheckbox label="translate me!" defaultMessage="collapse styles" mods="small"/>*/}
                    {/*</div>*/}
                {/*</div>*/}
            </div>

            <div className="font-options__body  antiscroll-wrap" ref="scrollContainer">
                <Infinite className="prop__options antiscroll-inner"
                    elementHeight={LessVars.propOptionHeight}
                    containerHeight={LessVars.flyoutMaxHeight}
                    infiniteLoadBeginEdgeOffset={300}
                    onInfiniteLoad={this.handleInfiniteLoad}
                    loadingSpinnerDelegate={this.elementInfiniteLoad()}
                    isInfiniteLoading={this.state.isInfiniteLoading}
                >
                    <div className="prop__optgroup-title" key={'category-unpopular'}>Unpopular</div>
                    {
                        [
                            'ofl/slabo27px',
                            'ofl/lato',
                            'ofl/sourcesanspro',
                            'other/blokkneue',
                            'ofl/montserrat',
                            'ofl/raleway',
                            'ofl/ptsans',
                            'ofl/lora',
                            'apache/robotoslab',
                            'apache/opensanscondensed',
                            'apache/opensans'
                        ].map(font=>
                        <section
                            key={font + 1234444}
                            className="prop__option  font-options__typeface"
                            data-font={'arial'}
                            onClick={console.log}
                        >

                            <div className={bem("font-options", "typeface-star", {faved: true})}>
                                <i className="ico--star"/>
                            </div>

                            <div className="font-options__typeface-meta">
                                <div className="font-options__typeface-name">{font.split('/')[1]}</div>

                                <div className="font-options__typeface-variants">
                                    <div className="font-options__typeface-variant">
                                        <div className="font-options__typeface-variant-icon" title="Italic">i</div>
                                    </div>
                                    <div className="font-options__typeface-variant">
                                        <div className="font-options__typeface-variant-icon" title="Russian">ru</div>
                                    </div>
                                </div>
                            </div>

                            <div className="font-options__typeface-sample-container">
                                <div className="font-options__typeface-sample-image" style={{ backgroundImage: `url('//carbonstatic.azureedge.net/fonts/${font}/sample.png')` }}></div>
                            </div>


                        </section>)
                    }
                    <div className="prop__optgroup-title" key={'category-popular'}>Popular</div>
                    {this.state.elements}
                </Infinite>
            </div>
        </div>
    }

}