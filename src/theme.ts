import createTheme from 'styled-components-theme';

export const colors = {
    panel_background:'#292929',
    text:'#d7d7d7',
    text_active:' #ff4295',
    workspace_background:'#131313',
    h1font: "400 18px 'Roboto', sans-serif;"
}

const theme = createTheme(...Object.keys(colors));
export default theme