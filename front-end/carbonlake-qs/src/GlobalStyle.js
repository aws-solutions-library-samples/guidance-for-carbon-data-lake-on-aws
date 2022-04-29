
import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`


/*==================== GLOBAL VARIABLES ====================*/
:root {
  --header-height: 3.5rem;
  /* --nav-width: 219px; */
  --nav-width: 20em;

  /*========== Colors ==========*/
  --color-white: #ffffff;
  --first-color: #6923d0;
  --first-color-light: #f4f0fa;
  --title-color: #19181b;
  --title-color-dark-mode: #ffffffd4;
  --text-color: #58555e;
  --text-color: #58555e;
  --text-color-light: #a5a1aa;
  --body-color: #f9f6fd;
  --container-color: #ffffff;
  --container-color-dark-mode: #000000;
  --bgs-color-bg: #12a03d;
  --bgs-color-text1: #001959;
  --bgs-color-text2-bright: #28E460;
  --bgs-color-text2: #1fba4e;

  /*========== Font and Typography ==========*/
  --body-font: 'Poppins', sans-serif;
  --largest-font-size: 1.3rem;
  --large-font-size: 1.1rem;
  --normal-font-size: 0.938rem;
  --small-font-size: 0.75rem;
  --smaller-font-size: 0.75rem;

  /*========== Font Weight ==========*/
  --font-medium: 500;
  --font-semi-bold: 600;

  /*========== z-index: ==========*/
  --z-fixed: 100;

  /*========== Media Query Vars: ==========*/
  --xxs-device: 320px;
  --xs-device: 570px;
  --sm-device: 650px;
  --med-device: 768px;
  --lg-device: 870px;
  --xl-device: 960px;
  --xxl-device: 1200px;
  --xxxl-device: 1024px;
}

/*========== BASE ==========*/
* {
  margin: 0;
  /* box-sizing: border-box; */
  /* list-style-type: none; */
  text-decoration: none;
  font-family: 'Poppins', sans-serif;
}
*,
::before,
::after {
  box-sizing: border-box;
}
body {
  margin: var(--header-height) 0 0 0;
  /* padding: 1rem 1rem 0; */
  font-family: var(--body-font);
  font-size: var(--normal-font-size);
  background-color: var(--body-color);
  color: var(--text-color);
}
.header-logo {
  color: var(--first-color);
  font-size: var(--largest-font-size);
}

h3 {
  margin: 0;
}

a {
  text-decoration: none;
}
img {
  max-width: 100%;
  height: auto;
}

`;
