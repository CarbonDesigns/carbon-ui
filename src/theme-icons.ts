import styled, { css } from "styled-components";
import { backend } from "carbon-core"

function icon(name, w, h): { src: string, width: number, height: number } {
    return {
        src: iconPath(name),
        width: w,
        height: h
    }
}

function iconPath(name) {
    return backend.cdnEndpoint + "/target/res/app/i/" + name;
}

export default {
    tool_selection: icon("tool_selection.svg", 20, 20),
    tool_directSelection: icon("tool_directSelection.svg", 20, 20),
    tool_image: icon("tool_image.svg", 16, 16),
    tool_line: icon("tool_line.svg", 20, 20),
    tool_oval: icon("tool_oval.svg", 20, 20),
    tool_path: icon("tool_path.svg", 16, 17),
    tool_pen: icon("tool_pen.svg", 16, 17),
    tool_rectangle: icon("tool_rectangle.svg", 19, 19),
    tool_text: icon("tool_text.svg", 14, 20),
    tool_triangle: icon("tool_triangle.svg", 20, 20),
    tool_polygon: icon("tool_polygon", 20, 20),
    tool_star: icon("tool_star.svg", 20, 20),
    tool_hand: icon("tool_hand.svg", 20, 20),
    tool_artboard: icon("tool_artboard.svg", 17, 18),
    tool_artboardViewer: icon("tool_artboardViewer.svg", 20, 20),
    panel_closer: icon("panel_closer.svg", 15, 15),
    p_properties: icon("p_properties.svg", 17, 17),
    p_layers: icon("p_layers.svg", 11, 12),
    menu_main: icon("menu_main.svg", 20, 20),
    undo: icon("undo.svg", 17, 13),
    redo: icon("redo.svg", 17, 13),
    zoom_in: icon("zoom-in.svg", 15, 15),
    zoom_out: icon("zoom-out.svg", 15, 15),
    triangle_down: icon("triangle_down.svg", 7, 7),
    path_binary: icon("path_binary.svg", 20, 20),
    group: icon("path_binary.svg", 20, 20), // TODO:
    path_union: icon("path_binary.svg", 20, 20), // TODO:
    path_difference: icon("path_binary.svg", 20, 20), // TODO:
    path_subtract: icon("path_binary.svg", 20, 20), // TODO:
    path_intersect: icon("path_binary.svg", 20, 20), // TODO:
    repeat_menu: icon("repeat.svg", 19, 11),
    repeat_small: icon("repeat_small.svg", 20, 12),
    symbols_small: icon("symbols_small.svg", 16, 20),
    layer_collapsed: icon("layer_c.svg", 6, 8),
    layer_expanded: icon("layer_e.svg", 8, 6),
}