import * as React from "react";
import separatorOr from "../shared/SeparatorOr";
import { backend } from "carbon-api";
import { LoginProviders } from "../Constants";
import styled from "styled-components";
import icons from "../theme-icons";
import Icon from "../components/Icon";

interface ISocialsProps {
}

function onClick(e) {
    var provider = e.currentTarget.dataset.provider;
    backend.loginExternal(provider);
}

var Socials: React.StatelessComponent<ISocialsProps> = props =>
    <SignupIcons>
        {/* {separatorOr(props.message)} */}
        <SignupIconsLine>
            {
                LoginProviders.map(p =>
                    <div key={p} className={"background " + p.toLowerCase()} onClick={onClick} data-provider={p} >
                        <Icon icon={icons[p.toLowerCase()]}/>
                    </div>)
            }
        </SignupIconsLine>
    </SignupIcons>;

const SignupIcons = styled.div`

`;

const SignupIconsLine = styled.div`
    display:flex;
    justify-content: space-around;
    width: 194px;

    .background {
        width: 24px;
        height: 24px;
        cursor:pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        &.google:hover   {background-color:#dd4b39;}
        &.twitter:hover  {background-color:#1da1f2;}
        &.facebook:hover {background-color:#3b5998;}
        &.apple:hover    {background-color:#b9b9b9;}
        &.microsoft:hover  {background-color:#00bcf2;}
    }
`;

export default Socials;