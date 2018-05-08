import * as React from "react";
import {FormattedMessage} from "react-intl";
import styled from "styled-components";
import theme from "../theme";

export default function(id){
    return <SeparatorOr><FormattedMessage id={id}/></SeparatorOr>
}

const SeparatorOr = styled.p`
    margin-top: .5rem;
    font:${theme.default_font};
    text-align:center;
    padding: 1rem 0;
    text-transform: uppercase;
    color:${theme.text_color};

    overflow:hidden;
    line-height: 1;

    > span {
        position:relative;
        display:inline-block;
        &:after,
        &:before
        {
            border-top: 2px solid ${theme.workspace_background};
            content:"";
            width: 100rem;
            position:absolute;
            top: 50%;
        }
        &:before { margin-right: 1rem;  right : 100%; }
        &:after  { margin-left: 1rem;  left  : 100%; }
    }
`;

