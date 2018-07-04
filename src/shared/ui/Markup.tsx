import * as React from "react";
import styled, {css} from "styled-components";

export const MarkupLine = styled.div.attrs<{
    slim?:boolean,
    submit?:boolean,
    space?:boolean,
    center?:boolean,
    stretch?:boolean,
    horizontal?:boolean,
    fill?:boolean}>({})`
    margin-top   : 1rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: flex-start;
    flex: 0 0 auto;
    flex-direction: column;

    ${p=>p.slim? css`
        margin-top: 0;
        margin-bottom: 0;
    `:''}

    ${p=>p.submit? css`
        margin-top   : 2rem;
        margin-bottom: 1rem;
    `:''}

    ${p=>p.center? css`
        align-items: center;
    `:''}

    ${p=>p.stretch? css`
        align-items: stretch;
    `:''}

    ${p=>p.fill? css`
        flex: auto;
    `:''}
`;

export const Markup = styled.div.attrs<{space?:boolean}>({})`
    display:flex;
    flex-direction: column;
    flex: auto;
`;
