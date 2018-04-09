import styled, {css} from "styled-components"
import theme from "../theme";

export const PropertyLineContainer = styled.div`
    display:grid;
    grid-template-columns:1fr 2fr;
    justify-items: center;
    grid-column-gap: 10px;
    padding:0 9px;
    margin-top: 9px;
    width:100%;
    min-height:36px;
`;

export const PropertyListContainer = styled.div`
    margin-top: 9px;
    width:100%;
`;

export const PropertyNameContainer = styled.div`
    font:${theme.prop_name_font};
    color:${theme.text_color};
    min-width:40px;
    width:100%;
    margin:auto 0;
`;

export const PropertyWithSubtitleContainer = styled.div`
    display:block;
    height:24px;
    overflow:visible;
`;

export const PropertySmallNameContainer = styled(PropertyNameContainer)`
    font:${theme.prop_font};
    text-align:center;
`

export const PropertyTupleContainer = styled.div`
    display: inline-grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 18px;
    justify-content:space-between;
    align-items:center;
    width: 100%;
`;

export const PropertyListHeader = styled.div`
    width:100%;
    height: 25px;
    line-height:15px;
    display:flex;
    align-items:center;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    background:${theme.input_background};
    font:${theme.prop_name_font};
    color:${theme.text_color};
    padding: 0 9px;
`;
