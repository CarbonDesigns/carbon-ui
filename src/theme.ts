import createTheme from 'styled-components-theme';

export const colors = {
    main: '#393276',
    dark: '#0D083B',
    light: '#837EB1'
}

const theme = createTheme(...Object.keys(colors));
export default theme