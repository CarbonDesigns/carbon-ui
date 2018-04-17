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
    tool_oval: icon("tool_oval.svg", 21, 21),
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
    p_properties: icon("p_props.svg", 17, 17),
    p_layers: icon("p_layers.svg", 11, 12),
    p_symbols: icon("p_symbols.svg", 15, 17),
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
    layer_visible: icon("layer_visible.svg", 11, 6),
    path_invisible: icon("path_binary.svg", 20, 20), // TODO:
    layer_lock: icon("layer_lock.svg", 7, 11),
    layer_unlock: icon("layer_lock.svg", 7, 11), // TODO:
    layer_code: icon("layer_code.svg", 9, 9),
    top_edit: icon("top_design.svg", 9, 9),
    dist_h: icon("dist_h.svg", 20, 20),
    dist_v: icon("dist_v.svg", 20, 20),
    align_l: icon("align_l.svg", 20, 20),
    align_h: icon("align_h.svg", 20, 20),
    align_r: icon("align_r.svg", 20, 20),
    align_t: icon("align_t.svg", 20, 20),
    align_v: icon("align_v.svg", 20, 20),
    align_b: icon("align_b.svg", 20, 20),
    corner1: icon("corner1.svg", 32, 23),
    corner4: icon("corner4.svg", 32, 23),
    checkmark: icon("checkmark.svg", 8, 7),
    settings: icon("settings.svg", 14, 16),
    join1: icon("join1.svg", 14, 14),
    join2: icon("join2.svg", 14, 14),
    join3: icon("join3.svg", 14, 14),
    ends1: icon("ends1.svg", 14, 14),
    ends2: icon("ends2.svg", 14, 14),
    ends3: icon("ends3.svg", 14, 14)
}