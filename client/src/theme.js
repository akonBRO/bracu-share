import { createTheme } from '@mui/material/styles';

// BRAC University Official Brand Colors
const bracuBlue = '#253494';
const bracuSilver = '#999999';
const bracuBlack = '#000000';

export const theme = createTheme({
  palette: {
    mode: 'light', // We can add a dark mode toggle later
    primary: {
      main: bracuBlue,
    },
    secondary: {
      main: bracuSilver,
    },
    text: {
      primary: bracuBlack,
      secondary: '#5f6368', // A softer gray for secondary text
    },
    background: {
      default: '#f8f9fa', // A very light gray for the app background
      paper: '#ffffff',   // White for cards, sidebars, etc.
    },
  },
  typography: {
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 500 },
    h5: { fontSize: '1.25rem', fontWeight: 500 },
    h6: { fontSize: '1.1rem', fontWeight: 500 },
    button: {
      textTransform: 'none', // Buttons will have normal capitalization
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8, // A slightly softer border radius
  },
  components: {
    // Style overrides for specific components
    MuiAppBar: {
      styleOverrides: {
        root: {
          elevation: 0,
          borderBottom: '1px solid #e0e0e0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20, // Pill-shaped buttons
        },
      },
    },
  },
});