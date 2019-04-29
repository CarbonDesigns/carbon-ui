import * as React from "react";
import styled from "styled-components";
import theme from "../theme";

export default class MainMenuGallery extends React.Component<any, any>{
    render(){
        return <MainMenuGalleryContainer>
            Gallery
        </MainMenuGalleryContainer>
    }
}

const MainMenuGalleryContainer = styled.div`
    position:relative;
    height:100%;
    width:100%;
    &::after {
        content:" ";
        display:block;
        height:100%;
        max-height:540px;
        width:1px;
        position:absolute;
        left:0;
        background-color: ${theme.separator_color};
        background-image: linear-gradient(180deg, ${theme.separator_color} 0%, ${theme.workspace_background} 100%);
    }
`;