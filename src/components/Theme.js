import { ThemeProvider } from "styled-components";
import { createGlobalStyle } from "styled-components";

const theme = {
  colors: {
    primary: "#FDA214",
    primaryLight: "#FFB84A",
    secondary: "#F2F2F2",
    light: "#FCFCFC",
    dark: "#152938",
    jungleMist: "#BCCED9",
    pickledBluewood: "#304859",
    gothic: "#7191A5",
    hippieBlue: "#6395B8",
    mystic: "#DFE7EC",
  },
};

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Atkinson Hyperlegible', sans-serif;
    font-size: 18px;
    height: 100vh;
    overflow-x: hidden;
  }

  button {
    font-family: 'Atkinson Hyperlegible', sans-serif;
    font-size: 16px;
  }

  h1 {
      font-size: 48px;
  }

  h2 {
      font-size: 32px;
  }

  h3 {
      font-size: 20px;
  }

  .memory-game {
      display: flex;
      flex-direction: column;
      height: 100vh;
  }
`;

const Theme = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

export default Theme;
