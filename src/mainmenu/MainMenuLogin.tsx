import * as React from "react";
import styled from "styled-components";
import { CarbonLabel } from "../CarbonFlux";
import theme from "../theme";

export default class MainMenuLogin extends React.Component<any, any>{
    render() {
        return <MainMenuLoginContainer>
            <LoginHeader><CarbonLabel id="@login.header" /></LoginHeader>
        </MainMenuLoginContainer>
    }
}

const MainMenuLoginContainer = styled.div`
    width: 280px;
    /* margin: 0 auto; */
`;

const LoginHeader = styled.div`
    font: ${theme.h1font};
    color: ${theme.text_color};
`;