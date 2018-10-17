import {
  teal, grey, deepOrange, orange, blue
} from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

function theme() {
  return createMuiTheme({
    palette: {
      primary: {
        ...teal,
        light: teal[50],
        dark: teal[700],
        dark2: teal[800]
      },
      secondary: grey,
      tertiary: {
        color: blue[500],
        hover: {
          color: 'white'
        }
      },
      danger: deepOrange,
      info: blue,
      warning: orange
    },
    typography: {
      useNextVariants: true,
      htmlFontSize: 15,
      fontFamily: '"LatoWebMedium", "Helvetica Neue", Helvetica, Arial, sans-serif'
    },
    body1: {
      margin: 0
    }
  });
}

export default theme;