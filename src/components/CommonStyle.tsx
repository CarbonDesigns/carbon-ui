import styled from "styled-components";
import theme from "../theme";

export const FlyoutBody = styled.div`
    background: ${theme.flyout_background};
    box-shadow: ${theme.flyout_shadow};
    padding:12px;
`;

export const HorizontalGroup = styled.div`
    display:flex;
`;

export const VerticalGroup = styled.div`
    display:flex;
    flex-direction:column;
`;