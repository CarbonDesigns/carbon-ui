import { backend } from "carbon-api"

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
    tool_selection: icon("tool_selection.svg", 14, 14),
    tool_directSelection: icon("tool_direct.svg", 20, 20),
    tool_image: icon("tool_image.svg", 19, 12),
    tool_line: icon("tool_line.svg", 20, 20),
    tool_oval: icon("tool_oval.svg", 21, 21),
    tool_path: icon("tool_path.svg", 14, 14),
    tool_pen: icon("tool_pen.svg", 14, 14),
    tool_rectangle: icon("tool_rectangle.svg", 14, 14),
    tool_text: icon("tool_text.svg", 19, 12),
    tool_triangle: icon("tool_triangle.svg", 21, 18),
    tool_polygon: icon("tool_polygon.svg", 20, 20),
    tool_star: icon("tool_star.svg", 19, 18),
    tool_hand: icon("tool_hand.svg", 20, 20),
    tool_artboard: icon("tool_artboard.svg", 14, 14),
    tool_artboardViewer: icon("tool_artboardViewer.svg", 20, 20),
    panel_closer: icon("panel_closer.svg", 15, 15),
    p_properties: icon("p_props.svg", 17, 17),
    p_layers: icon("p_layers.svg", 11, 12),
    p_symbols: icon("p_symbols.svg", 15, 17),
    p_preview: icon("p_preview.svg", 20, 20),//TODO:
    menu_main: icon("menu_main.svg", 20, 20),
    menu_feedback: icon("menu_feedback.svg", 13, 13),
    menu_tutorial: icon("menu_tutorial.svg", 10, 12),
    undo: icon("undo.svg", 17, 13),
    redo: icon("redo.svg", 17, 13),
    zoom_in: icon("zoom-in.svg", 15, 15),
    zoom_out: icon("zoom-out.svg", 15, 15),
    triangle_down: icon("triangle_down.svg", 7, 7),
    path_binary: icon("path_binary.svg", 20, 20),
    path_union: icon("path_union.svg", 24, 23),
    path_difference: icon("path_diff.svg", 22, 21),
    path_subtract: icon("path_subtract.svg", 24, 23),
    path_intersect: icon("path_intersect.svg", 23, 22),

    google: icon("google.svg", 20, 12),
    facebook: icon("facebook.svg", 8, 17),
    microsoft: icon("microsoft.svg", 14, 14),
    twitter: icon("twitter.svg", 14, 12),

    repeat_menu: icon("repeat.svg", 19, 19),
    repeat_small: icon("repeat.svg", 19, 19),
    symbols_small: icon("symbols_small.svg", 16, 20),
    m_arrange: icon("m_arrange.svg", 19, 19),
    m_pathop: icon("m_pathop.svg", 19, 19),
    m_group: icon("m_group.svg", 19, 19),
    layer_collapsed: icon("l_collapsed.svg", 10, 10),
    layer_expanded: icon("l_expanded.svg", 10, 10),
    layer_visible: icon("layer_visible.svg", 11, 6),
    l_group_open: icon("l_group_open.svg", 16, 15),
    l_group_closed: icon("l_group_closed.svg", 16, 15),
    l_rectangle: icon("l_rect.svg", 13, 13),
    l_circle: icon("l_oval.svg", 13, 13),
    l_triangle: icon("l_triangle.svg", 15, 11),
    l_text: icon("l_text.svg", 16, 10),
    "l_line-text": icon("l_text.svg", 16, 10),
    l_polygon: icon("l_polygon.svg", 16, 16),
    l_line: icon("l_line.svg", 12, 11),
    layer_lock: icon("layer_lock.svg", 7, 11),
    layer_unlock: icon("layer_lock.svg", 7, 11), // TODO:
    layer_code: icon("layer_code.svg", 9, 9),
    top_edit: icon("top_design2.svg", 13, 25),
    top_prototype: icon("top_prototype.svg", 24, 19),
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
    text_left: icon("text_left.svg", 14, 16),
    text_right: icon("text_right.svg", 14, 16),
    text_center: icon("text_center.svg", 14, 16),
    text_dist: icon("text_dist.svg", 14, 16),
    text_top: icon("text_top.svg", 13, 5),
    text_middle: icon("text_middle.svg", 13, 8),
    text_bottom: icon("text_bottom.svg", 13, 5),
    join1: icon("join1.svg", 14, 14),
    join2: icon("join2.svg", 14, 14),
    join3: icon("join3.svg", 14, 14),
    ends1: icon("ends1.svg", 14, 14),
    ends2: icon("ends2.svg", 14, 14),
    ends3: icon("ends3.svg", 14, 14),
    add: icon("add.svg", 12, 12),
    delete: icon("add.svg", 12, 12),//TODO:
    edit: icon("add.svg", 12, 12),// TODO
    point_straight: icon("p_straight.svg", 26, 15),
    point_mirrored: icon("p_mirrored.svg", 28, 16),
    point_assymetric: icon("p_assymetric.svg", 28, 16),
    point_disconnected: icon("p_disconnected.svg", 24, 16),
    social_icons: icon("social-icons.svg", 0, 0),// TODO
}