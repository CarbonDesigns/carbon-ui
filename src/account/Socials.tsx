import * as React from "react";
import separatorOr from "../shared/SeparatorOr";
import { backend } from "carbon-api";
import { LoginProviders } from "../Constants";
import styled from "styled-components";
import icons from "../theme-icons";

interface ISocialsProps {
    message: string;
}

function onClick(e) {
    var provider = e.currentTarget.dataset.provider;
    backend.loginExternal(provider);
}

var Socials: React.StatelessComponent<ISocialsProps> = props =>
    <SignupIcons>
        {separatorOr(props.message)}
        <SignupIconsLine>
            {
                LoginProviders.map(p =>
                    <div key={p} className={"background " + p.toLowerCase()} >
                        <div className={"icon " + p.toLowerCase()} onClick={onClick} data-provider={p} key={p}>
                        </div>
                    </div>)
            }
        </SignupIconsLine>
    </SignupIcons>;

const SignupIcons = styled.div`

`;

const SignupIconsLine = styled.div`
    display:flex;
    justify-content: space-around;
    .background {
        cursor:pointer;
        &.google:hover   {background-color:#dd4b39;}
        &.twitter:hover  {background-color:#1da1f2;}
        &.facebook:hover {background-color:#3b5998;}
        &.apple:hover    {background-color:#b9b9b9;}
        &.microsoft:hover  {background-color:#00bcf2;}
    }

    .icon {
        background-color: white;
        mask-image: url(${icons.social_icons.src});

        mask-size: 20rem 4rem;
        width:4rem;
        height:4rem;

        &.google{mask-position: 0rem 0;}
        &.apple    {mask-position: 8rem 0;}
        &.facebook {mask-position: 12rem 0;}
        &.twitter  {mask-position: 4rem 0;}
        &.microsoft  {mask-position: 16rem 0;}
    }
`;

export default Socials;