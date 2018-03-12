import createTheme from 'styled-components-theme';

export const colors = {
    accent:'#ff3d7d',
    panel_background:'#292929',
    text:'#d7d7d7',
    text_active:'#ff4295',
    text_color: '#ffffff',
    workspace_background:'#131313',
    h1font: "400 18px 'Roboto', sans-serif;",
    h2font: "400 13px 'Roboto', sans-serif;"
}

const theme = createTheme(...Object.keys(colors));
export default theme