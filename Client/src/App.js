import {
  createTheme,
  ThemeProvider
} from '@mui/material';
import './App.css';
import View from './pages/View';

function App() {
  const theme = createTheme({
    palette: {
      // primary: {
      //   main: '#ff5722', // Change primary color
      // },
      // secondary: {
      //   main: '#707d8b', // Change secondary color
      // },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <View/>
    </ThemeProvider>
  );
}

export default App;
