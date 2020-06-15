import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#004C92',
    },
    background: {
      paper: '#F2F5F8',
    },
  },
  typography: {
    fontFamily: 'Montserrat, Verdana, Arial, sans-serif',
    fontSize: 16,
  },

  overrides: {
    MuiAppBar: {
      root: {
        fontFamily: 'Karla, Verdana, Arial, sans-serif',
        fontSize: 18,
      },
    },
  },
});

export default theme;
