import { Types } from "carbon-core";

export function iconType(element) {
    var icon = 'stencil';

    switch (element.systemType()) {
        case Types.Rectangle       : return "rectangle";
        case Types.GroupContainer  : return "group";
        case Types.ArtboardFrame   : return "smartbox";
        case Types.StateBoard      : return "page";
        case Types.Artboard        : return "page";
        case Types.Image           : return "icon";
        case Types.ImageContent    : return "icon";
        case Types.Circle          : return "circle";
        case Types.Triangle        : return "triangle";
        case Types.Text            : return "line-text";

        case Types.Path            : return "path";
        case Types.Line            : return "line";
        case Types.Polygon         : return "polygon";
        case Types.Star            : return "star";
        case Types.RepeatContainer : return "repeater";
        case Types.RepeatCell      : return "rep-cell";
        case Types.DockPanel       : return "repeater";
        default                    : return "stencil";
    }
}