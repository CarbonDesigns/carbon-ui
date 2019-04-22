import styled, {css} from "styled-components"
import theme from "../theme";

export const PropertyLineContainer = styled.div`
    display:grid;
    grid-template-columns:minmax(max-content, 80px) 1fr;
    justify-items: center;
    grid-column-gap: 10px;
    padding:0 9px;
    margin-top: 9px;
    width:100%;
    min-height:36px;
    align-items: center;
`;

export const PropertyFullLineContainer = styled.div`
    display:grid;
    grid-template-columns:1fr;
    padding:0 9px;
    margin-top: 9px;
    width:100%;
    min-height:36px;
    align-items: center;
`;

export const PropertyListContainer = styled.div`
    margin: ${theme.margin1} ${theme.margin1} 0 ${theme.margin1};
    border-radius: 4.5px;
    background-color: ${theme.prop_container_background};
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
    width:100%;
`;

export const PropertySmallNameContainer = styled(PropertyNameContainer)`
    font:${theme.prop_font};
    text-align:center;
    cursor:ew-resize;
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
    display:grid;
    grid-template-columns: 1fr 14px;
    align-items:center;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    font:${theme.prop_name_font};
    color:${theme.text_color};
    padding: 0 ${theme.margin1};
`;
