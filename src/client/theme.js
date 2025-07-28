import { lightBlue } from '@mui/material/colors';

const defaultTheme = {
  typography: {
    fontFamily: [
      '"Helvetica Neue"',
      'Arial',
      'Meiryo',
      '"Hiragino Kaku Gothic ProN"',
      '"Hiragino Sans"',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.25rem',
      fontWeight: 'bolder',
      lineHeight: 1.2,
      letterSpacing: '0.05rem',
      fontFeatureSettings: '"palt" 1',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 'bolder',
      lineHeight: 1.2,
      letterSpacing: '0.04rem',
      fontFeatureSettings: '"palt" 1',
    },
    h3: {
      fontSize: '1.6rem',
      fontWeight: 'bolder',
      lineHeight: 1.2,
      letterSpacing: '0.03rem',
      fontFeatureSettings: '"palt" 1',
    },
    h4: {
      fontSize: '1.35rem',
      fontWeight: 'bolder',
      lineHeight: 1.3,
      letterSpacing: '0.03rem',
      fontFeatureSettings: '"palt" 1',
    },
    h5: {
      fontSize: '1.15rem',
      fontWeight: 'bolder',
      lineHeight: 1.3,
      letterSpacing: '0.02rem',
      fontFeatureSettings: '"palt" 1',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 'bolder',
      lineHeight: 1.3,
      letterSpacing: '0.02rem',
      fontFeatureSettings: '"palt" 1',
    },
    body1: {
      lineHeight: 1.7,
    },
    body2: {
      lineHeight: 1.7,
    },
    subtitle1: {
      lineHeight: 1.5,
    },
    subtitle2: {
      lineHeight: 1.5,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: lightBlue[50],
        },
      },
    },
  },
};

export default defaultTheme;
