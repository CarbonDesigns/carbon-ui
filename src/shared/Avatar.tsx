import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";

const DefaultSize = 40;

function hsv_to_rgb(h, s, v, format = 'rgb') {
    var b, f, g, i, p, q, r, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - (f * s));
    t = v * (1 - ((1 - f) * s));
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    switch (format) {
        case 'array':
            return [r * 255, g * 255, b * 255];
        case 'rgb':
            return "rgb(" + ((r * 255).toFixed(0)) + ", " + ((g * 255).toFixed(0)) + ", " + ((b * 255).toFixed(0)) + ")";
    }
}

function create_avatar_color_from_user_id(user_id:number, colors_in_gamma = 38) {
    let almost_random_number, brightness, saturation, step;
    const _RANDOM_KOEF_1 = 171713;
    const _RANDOM_KOEF_2 = 42346727;
    almost_random_number = (_RANDOM_KOEF_1 * user_id) * _RANDOM_KOEF_2;
    step = almost_random_number % colors_in_gamma;
    saturation = .4;
    brightness = .8;
    return hsv_to_rgb(step / colors_in_gamma, saturation, brightness);
}

function stringHash(text:string):number {
    var hash = 0, i, chr;
    if (text.length === 0) {
        return hash
    }

    for (i = 0; i < text.length; i++) {
        chr = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

export class Avatar extends React.Component<any, any> {
    refs: {
        canvas: any;
    }

    componentDidMount() {
        if (!this.props.url) {
            var context = this.refs.canvas.getContext("2d");

            var devicePixelRatio = window.devicePixelRatio || 1;
            var backingStoreRatio =
                context.backingStorePixelRatio ||
                context.webkitBackingStorePixelRatio ||
                context.mozBackingStorePixelRatio ||
                context.msBackingStorePixelRatio ||
                context.oBackingStorePixelRatio ||
                1;

            // on some machines it is non integer, it affects rendering
            // browser zoom is also changing this value, so need to make sure it is never 0
            let contextScale = Math.max(1, Math.round(devicePixelRatio / backingStoreRatio));
            var w = this.props.width || DefaultSize;
            var h = this.props.height || DefaultSize;

            context.canvas.width = w * contextScale;
            context.canvas.height = h * contextScale;
            context.scale(contextScale, contextScale);

            var text = (this.props.userName || 'Ca').substr(0, 2);
            if(text.length < 2) {
                text += ' ';
            }
            text = text[0].toUpperCase() + text[1].toLowerCase();
            var color = create_avatar_color_from_user_id(stringHash(text));

            context.fillStyle = color;
            context.strokeStyle = "black";
            context.lineWidth = 3;
            context.rect(0, 0, w, h);
            context.fill();
            context.stroke();
            context.font = `${0 | w / 2}px Poppins, Open Sans, Helvetica, sans-serif`;
            context.textBaseline = 'middle';
            context.textAlign = "center";
            context.fillStyle = "black";
            context.fillText(text, w / 2 | 0, h / 2 | 0, w);
        }
    }

    render() {
        let width = this.props.width || DefaultSize;
        let height = this.props.height || DefaultSize;
        if (this.props.url) {
            return <img className="user-avatar" style={{width, height}} width={width} height={height} src={this.props.url} />
        } else {
            return <canvas ref="canvas" className="user-avatar" style={{width, height}}></canvas>
        }
    }
}