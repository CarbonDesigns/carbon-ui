import React    from "react";
import ReactDom from "react-dom";
import {util}   from "carbon-core";
import cx       from "classnames";
import { Component } from "../CarbonFlux";

const DEBOUNCE_DELAY_MS = 500;

interface SearchProps extends ISimpleReactElementProps {
    onQuery: (term: string) => void;
    query?: string;
    placeholder?: string;
    autoFocus?: boolean;
}

type SearchState = {
    query: string;
}

export default class Search extends Component<SearchProps, SearchState>{
    private onChangeDebounced: () => any;
    private lastQuery: string;

    refs: {
        input: HTMLInputElement;
    }

    constructor(props: SearchProps){
        super(props);
        this.state = {query: props.query || ""};
    }
    query(term){
        this.setState({query: term});
        this.props.onQuery(term);
    }
    onChange = (e) => {
        let newQuery: string = e.target.value;
        this.setState({query: newQuery});

        let trimmed = newQuery.trim();
        if (this.lastQuery !== trimmed) {
            this.lastQuery = trimmed;
            this.onChangeDebounced();
        }
    };
    componentWillReceiveProps(nextProps: Readonly<SearchProps>, context) {
        if (nextProps.query !== this.state.query) {
            this.setState({ query: nextProps.query });
        }
    }
    componentWillMount(){
        this.onChangeDebounced = util.debounce(() => {
            this.props.onQuery(this.state.query);
        }, DEBOUNCE_DELAY_MS);
    }
    focus(){
        var input = this.refs.input;
        input.focus();
        input.select();
    }
    render(){
        let { placeholder, autoFocus, onQuery, className, children, query, ...other } = this.props;
        placeholder = placeholder || "@search";
        const cn = cx('search-field', className);
        return <div {...other} className={cn}>
            <input className="search-field__input" placeholder={this.formatLabel(placeholder)} onChange={this.onChange}
                value={this.state.query}
                autoFocus={autoFocus}
                ref="input"/>
            <div className="search-field__ico">
                <i className="ico--search"/>
            </div>
        </div>;
    }
}
