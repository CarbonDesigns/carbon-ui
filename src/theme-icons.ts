import styled, { css } from "styled-components";
import {backend} from "carbon-core"

function icon(dx, dy, w, h) {
    return css`
    background-image:url(${backend.cdnEndpoint}/target/res/app/dark.svg);
    background-repeat: no-repeat;
    background-size: 8158px 30px;
    background-position:${dx} ${dy};
    width:${w}px;
    height:${h}px;
    display:inline-block;
`
}

export default {
    menu_design: icon(0, 0, 20, 20)
}