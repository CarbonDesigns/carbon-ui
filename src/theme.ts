import createTheme from 'styled-components-theme';

export const colors = {
    accent:'#ff3d7d',
    icon_default:'#fff',
    panel_background:'#292929',
    flyout_background: '#272727',
    flyout_shadow: '0 0 4px 1px rgba(0, 0, 0, 0.5)',
    text:'#d7d7d7',
    text_active:'#ff4295',
    text_color: '#ffffff',
    button_default: "#9b9a9b",
    button_hover: "white",
    button_active: "#e94565",
    button_disabled:"#525252",
    workspace_background:'#131313',
    h1font: "400 18px 'Roboto', sans-serif;",
    h2font: "400 14px 'Roboto', sans-serif;",
    default_font: "400 12px 'Roboto', sans-serif;",
    link_font: "400 10px 'Roboto', sans-serif;",
    input_font: "400 12px 'Roboto', sans-serif;",
    prop_font: "400 9px 'Roboto', sans-serif;",
    prop_name_font: "400 14px 'Roboto', sans-serif;",
    link_padding: "8px",
    input_background: "#212121",
    layer_page_background: "#212121",
    layer_selection_background: "#3498DB",
    layer_hover_background: "#2980B9"
}

const theme = createTheme(...Object.keys(colors));
export default theme