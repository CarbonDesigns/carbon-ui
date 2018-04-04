import styled from "styled-components";
import theme from "../theme";

export const FlyoutBodyNoPadding = styled.div`
    background: ${theme.flyout_background};
    box-shadow: ${theme.flyout_shadow};
`;

export const FlyoutBody = styled(FlyoutBodyNoPadding)`
    padding:12px;
`;

export const HorizontalGroup = styled.div`
    display:flex;
`;

export const VerticalGroup = styled.div`
    display:flex;
    flex-direction:column;
`;