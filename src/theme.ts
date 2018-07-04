import createTheme from 'styled-components-theme';
import * as tinycolor from "tinycolor2";
const accent = '#ff3d7d';
export const colors = {
    accent:accent,
    accent_secondary: tinycolor(accent).spin(19).darken(4).toString(),
    icon_default:'#fff',
    panel_background:'#292929',
    flyout_background: '#272727',
    margin1:'9px',
    margin2:'18px',
    rightPropSize:"48px",
    prop_height:'24px',
    flyout_shadow: '0 0 4px 1px rgba(0, 0, 0, 0.5)',
    dropdown_shadow: '0px 1px 1px 0px rgba(0,0,0,0.5)',
    text:'#d7d7d7',
    text_active:'#ff4295',
    text_color: '#ffffff',
    text_color_alternate: '#000',
    text_color_lowimportance:'#afacac',
    button_default: "#9b9a9b",
    stencil_background: "#fff",
    button_hover: "white",
    button_active: "#e94565",
    button_disabled:"#525252",
    workspace_background:'#131313',
    h1font: "400 18px 'Roboto', sans-serif;",
    h2font: "400 14px 'Roboto', sans-serif;",
    font_largeInput: "400 16px 'Roboto', sans-serif;",
    default_font: "400 12px 'Roboto', sans-serif;",
    link_font: "400 10px 'Roboto', sans-serif;",
    tab_font: "400 10px 'Roboto', sans-serif;",
    input_font: "400 12px 'Roboto', sans-serif;",
    prop_font: "400 9px 'Roboto', sans-serif;",
    prop_name_font: "400 14px 'Roboto', sans-serif;",
    link_padding: "8px",
    input_background: "#212121",
    layer_page_background: "#212121",
    layer_selection_background: "#3498DB",
    layer_hover_background: "#2980B9",
    inactive_tab_button: '#212121'
}

const theme = createTheme(...Object.keys(colors));

export default theme