import styled, {css} from "styled-components";
import theme from "../theme";
import { TabArea, TabPage } from "../shared/TabContainer";

export const FlyoutBodyNoPadding = styled.div`
    background: ${theme.flyout_background};
    box-shadow: ${theme.flyout_shadow};
`;

export const FlyoutBody = styled(FlyoutBodyNoPadding) `
    padding:12px;
`;

export const HorizontalGroup = styled.div`
    display:flex;
`;

export const VerticalGroup = styled.div`
    display:flex;
    flex-direction:column;
`;

export const TabAreaStyled = styled(TabArea)<any>`
    overflow:hidden;
    position:relative;
    flex: auto;
    display:flex;
    align-items: stretch;
    flex-wrap: nowrap;

    &[data-current-tab="1"] > div{ transform: translateX(0%)}
    &[data-current-tab="2"] > div{ transform: translateX(-100%)}
    &[data-current-tab="3"] > div{ transform: translateX(-200%)}
    &[data-current-tab="4"] > div{ transform: translateX(-300%)}
    &[data-current-tab="5"] > div{ transform: translateX(-400%)}
    &[data-current-tab="6"] > div{ transform: translateX(-500%)}
    &[data-current-tab="7"] > div{ transform: translateX(-600%)}
    &[data-current-tab="8"] > div{ transform: translateX(-700%)}
`;

export const TabPageStyled = styled(TabPage)<any>`
    display: flex;
    flex-direction: column;
    transition: transform .3s;
    width: 100%;
    min-width: 100%;
    flex-shrink: 0;
    position:relative;
    border-radius:4px;
`

export const MainButtonComponent = styled.button`
    height:24px;
    min-width:30px;
    cursor:pointer;
    color: ${theme.text_color};
    background-color: ${theme.button_normal};
    border-radius: 1px;
    border: 0;
    padding: 0;
    margin: 0;
    outline: 0;
`;

export const LineBottom = css`
    position:absolute;
    height:0.5px;
    content: " ";
    left:0;
    right:0;
    bottom:0;
    background: ${theme.separator_color};
`;

export function arrDown(size, color) {
    return css`
        border-color: transparent ${color} ${color} transparent;
        border-width: ${size};
        border-style: solid;
    `
}
export function arrRight(size, color) {
    return css`
        border-color: transparent transparent transparent ${color};
        border-width: ${size};
        border-style: solid none solid solid;
        margin-top : -1px;
    `
}