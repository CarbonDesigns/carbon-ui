import React    from "react";
import ReactDom from "react-dom";
import {util}   from "carbon-core";
import cx       from "classnames";
import { Component } from "../CarbonFlux";

const DEBOUNCE_DELAY_MS = 500;

export default class Search extends Component<any, any>{
    onChangeDebounced: () => any;

    refs: {
        input: HTMLInputElement;
    }

    constructor(props){
        super(props);
        this.state = {query: ""};
    }
    query(term){
        this.setState({query: term});
        this.props.onQuery(term);
    }
    onChange = (e) => {
        this.setState({query: e.target.value});
        this.onChangeDebounced();
    };
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
        let { placeholder, onQuery, className, ...other } = this.props;
        placeholder = placeholder || "@search";
        const cn = cx('search-field', className);
        return <div {...other} className={cn}>
            <input className="search-field__input" placeholder={this.formatLabel(placeholder)} onChange={this.onChange} value={this.state.query} ref="input"/>
            <div className="search-field__ico">
                <i className="ico--search"/>
            </div>
        </div>;
    }
}
