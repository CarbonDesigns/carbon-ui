import * as React    from "react";
import * as ReactDom from "react-dom";
import {util}   from "carbon-api";
import cx       from "classnames";
import { Component } from "../CarbonFlux";
import { searchStack, ISearchHandler } from "./ComponentStack";
import styled from "styled-components";
import theme from "../theme";

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

export default class Search extends Component<SearchProps, SearchState> implements ISearchHandler {
    private onChangeDebounced: () => any;
    private lastQuery: string;

    refs: {
        input: HTMLInputElement;
    }

    constructor(props: SearchProps){
        super(props);
        this.state = {query: props.query || ""};
    }

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
    componentDidMount() {
        super.componentDidMount();
        searchStack.push(this);
    }
    componentWillUnmount() {
        super.componentWillUnmount();
        searchStack.pop();
    }

    onSearch() {
        this.focus();
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
    focus(){
        var input = this.refs.input;
        input.focus();
        input.select();
    }
    render(){
        let { placeholder, autoFocus, onQuery, className, children, query, ...other } = this.props;
        placeholder = placeholder || "@search";
        // const cn = cx('search-field', className);
        return <SearchContainer {...other} >
            <input  placeholder={this.formatLabel(placeholder)} onChange={this.onChange}
                value={this.state.query}
                autoFocus={autoFocus}
                ref="input"/>
            <div className="search-field__ico">
                <i className="ico-search"/>
            </div>
        </SearchContainer>;
    }
}

const SearchContainer = styled.div`
    width:100%;
    padding: ${theme.margin1};

    input {
        width:100%;
        height:27px;
        border-radius: 2px;
        background-color: ${theme.input_background};
        color: ${theme.text_color};
        font: ${theme.input_font};
        box-shadow: ${theme.input_shadow};
        padding: 0 ${theme.margin1};

        &::placeholder {
            color:${theme.input_placeholder_color};
        }
    }
`;
