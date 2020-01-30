import * as React from "react";
import styled from "styled-components";
import { CarbonLabel } from "../CarbonFlux";
import { LineBottom } from "../components/CommonStyle";

interface IMainMenuProjectsProps {
    recentProjects:any[];
}

export default class MainMenuProjects extends React.Component<IMainMenuProjectsProps, any>{
    render(){
        return <MainMenuProjectsContainer>
            <ProjectList>
                <ListHeader><CarbonLabel id="@project.recent"/></ListHeader>
                {this.props.recentProjects.map((p,i)=><div/>)}
            </ProjectList>
        </MainMenuProjectsContainer>
    }
}

const ListHeader = styled.div`
    &::after {
        ${LineBottom};
    }
`;

const ProjectList = styled.div`

`;

const MainMenuProjectsContainer = styled.div`

`;