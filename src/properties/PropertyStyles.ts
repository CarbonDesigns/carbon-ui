import styled, {css} from "styled-components"
import theme from "../theme";

export const PropertyLineContainer = styled.div`
    display:grid;
    grid-template-columns:1fr 2fr;
    grid-column-gap: 10px;
    padding:0 9px;
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
    display:flex;
    flex-direction:column;
    justify-content:center;
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

    & > * {
        flex:50% 1 1;
    }
`;
