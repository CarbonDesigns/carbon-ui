import * as React from "react";
import * as ReactDom from "react-dom";
import styled, { css } from "styled-components";
import theme from "../theme";
import icons from "../theme-icons";
import { HorizontalGroup } from "../components/CommonStyle";
import ActionIconButton from "../components/ActionIconButton";

class ArrangeCommands extends React.Component<any, any>{
    render() {
        return <div {...this.props}>
            <div style={{ width: 0, height: 0 }}>
                <svg>
                    <defs>
                        <linearGradient x1="1.40106824%" y1="51.4010682%" x2="98.5989318%" y2="51.4010682%" id="linearGradient-h">
                            <stop stopColor="var(--colorStop1)" offset="0%"></stop>
                            <stop stopColor="var(--colorStop2)" offset="100%"></stop>
                        </linearGradient>
                        <linearGradient x1="1.40106824%" y1="51.4010682%" x2="98.5989318%" y2="51.4010682%" id="linearGradient-h-a">
                            <stop stopColor="var(--colorStop3)" offset="0%"></stop>
                            <stop stopColor="var(--colorStop4)" offset="100%"></stop>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <ActionIconButtonStyled id="distributeHorizontally">
                <svg className="c1" width="20px" height="20px" viewBox="0 0 20 20">
                    <rect fill="transparent" x="0" y="0" width="20" height="20"></rect>
                    <g id="dist-h" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" transform="translate(-1.000000, 0.000000)">
                        <g transform="translate(9.608645, 10.238318) rotate(-270.000000) translate(-9.608645, -10.238318) translate(0.233645, 1.488318)">
                            <rect className="action" fill="url(#linearGradient-h)" x="0" y="6.13317757" width="18.3995327" height="4.90654206" rx="1.25"></rect>
                            <rect fill="#4A4A4A" x="0" y="0" width="18.3995327" height="1.22663551" rx="0.613317757"></rect>
                            <rect fill="#4A4A4A" x="0" y="15.9462617" width="18.3995327" height="1.22663551" rx="0.613317757"></rect>
                        </g>
                    </g>
                </svg>
            </ActionIconButtonStyled>
            <ActionIconButtonStyled id="distributeVertically">
                <svg className="c1" width="20px" height="20px" viewBox="0 0 20 20">
                    <rect fill="transparent" x="0" y="0" width="20" height="20"></rect>
                    <g id="dist-v" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <g transform="translate(0.000000, 0.476636)">
                            <rect className="action" fill="url(#linearGradient-h)" x="0" y="6.13317757" width="18.3995327" height="4.90654206" rx="1.25"></rect>
                            <rect fill="#4A4A4A" x="0" y="0" width="18.3995327" height="1.22663551" rx="0.613317757"></rect>
                            <rect fill="#4A4A4A" x="0" y="15.9462617" width="18.3995327" height="1.22663551" rx="0.613317757"></rect>
                        </g>
                    </g>
                </svg>
            </ActionIconButtonStyled>
            <ActionIconButtonStyled id="alignLeft">
                <svg className="c1" width="20px" height="20px" viewBox="0 0 20 20">
                    <rect fill="transparent" x="0" y="0" width="20" height="20"></rect>
                    <g id="align-l" stroke="none" strokeWidth="1" fillRule="evenodd" transform="translate(-1.000000, 0.000000)">
                        <g transform="translate(10.044393, 9.750000) rotate(-270.000000) translate(-10.044393, -9.750000) translate(0.544393, 0.250000)">
                            <rect className="action" fill="url(#linearGradient-h)" transform="translate(3.876109, 7.679828) rotate(-270.000000) translate(-3.876109, -7.679828) " x="-3.80371899" y="5.22655667" width="15.3596554" height="4.90654206" rx="1.25"></rect>
                            <rect fill="#4A4A4A" transform="translate(13.447932, 11.359734) rotate(-270.000000) translate(-13.447932, -11.359734) " x="9.44801059" y="8.90646321" width="7.99984231" height="4.90654206" rx="1.25"></rect>
                            <rect fill="#4A4A4A" x="0" y="17.1728972" width="18.3995327" height="1.22663551" rx="0.613317757"></rect>
                        </g>
                    </g>
                </svg>
            </ActionIconButtonStyled>
            <ActionIconButtonStyled id="alignCenter" >
                <svg className="c1" width="20px" height="20px" viewBox="0 0 20 20">
                    <rect fill="transparent" x="0" y="0" width="20" height="20"></rect>
                    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" transform="translate(-1.000000, 0.000000)">
                        <g transform="translate(10.390187, 9.750000) rotate(-270.000000) translate(-10.390187, -9.750000) translate(0.890187, 0.250000)">
                            <rect fill="#D8D8D8" fillRule="evenodd" x="0" y="8.5864486" width="18.3995327" height="1.22663551" rx="0.613317757"></rect>
                            <rect stroke="#4A4A4A" strokeWidth="1.25" x="0.625" y="9.2114486" width="17.1495327" height="1" rx="0.5"></rect>
                            <rect className="action" fill="url(#linearGradient-h)" transform="translate(3.876109, 9.199766) rotate(-270.000000) translate(-3.876109, -9.199766) " x="-5.32365765" y="6.74649533" width="18.3995327" height="4.90654206" rx="1.25"></rect>
                            <rect fill="#4A4A4A" transform="translate(13.695813, 9.199766) rotate(-270.000000) translate(-13.695813, -9.199766) " x="9.69589222" y="6.74649533" width="7.99984231" height="4.90654206" rx="1.25"></rect>
                        </g>
                    </g>
                </svg>
            </ActionIconButtonStyled>
            <ActionIconButtonStyled id="alignRight">
                <svg className="c1" width="20px" height="20px" viewBox="0 0 20 20">
                    <rect fill="transparent" x="0" y="0" width="20" height="20"></rect>
                    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <g transform="translate(9.656542, 9.750000) scale(-1, 1) rotate(-270.000000) translate(-9.656542, -9.750000) translate(0.156542, 0.250000)">
                            <rect className="action" fill="url(#linearGradient-h)" transform="translate(3.876109, 7.679828) rotate(-270.000000) translate(-3.876109, -7.679828) " x="-3.80371899" y="5.22655667" width="15.3596554" height="4.90654206" rx="1.25"></rect>
                            <rect fill="#4A4A4A" transform="translate(13.447932, 11.359734) rotate(-270.000000) translate(-13.447932, -11.359734) " x="9.44801059" y="8.90646321" width="7.99984231" height="4.90654206" rx="1.25"></rect>
                            <rect fill="#4A4A4A" x="0" y="17.1728972" width="18.3995327" height="1.22663551" rx="0.613317757"></rect>
                        </g>
                    </g>
                </svg>
            </ActionIconButtonStyled>
            <ActionIconButton id="alignTop" icon={icons.align_t} />
            <ActionIconButton id="alignMiddle" icon={icons.align_v} />
            <ActionIconButton id="alignBottom" icon={icons.align_b} />
        </div>
    }
}

const ActionIconButtonStyled = styled(ActionIconButton).attrs<any>({}) `
    background: ${theme.panel_background};
    width:20px;
    height:20px;
    cursor:pointer;

    svg rect.action {
        fill: url(#linearGradient-h);
    }

    & svg:hover rect.action {
        fill: url(#linearGradient-h-a);
    }
`;

export default styled(ArrangeCommands).attrs<any>({}) `
    width:100%;
    height: 24px;
    display:flex;
    justify-content:space-evenly;
    flex-direction:row;
    margin-top:12px;

    --colorStop1: ${theme.accent};
    --colorStop2: ${theme.accent.darken(0.3)};
    --colorStop3: ${theme.accent.lighten(0.3)};
    --colorStop4: ${theme.accent.lighten(0.1)};
`;