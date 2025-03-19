import React from "react";
import { lighten, darken, transparentize } from "polished";

const avatar =
  "data:image/jpeg;base64,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";
const baseColor = "#f51f7e";
const colors = {
  red: {
    main: "#ff3d00",
    1000: "#ff5019",
    900: "#",
    800: "#",
    700: "#",
    600: "#",
    500: "#",
    400: "#e86e48",
    300: "#",
    200: "#ffebe5",
    100: "#fff5f2",
  },
  pink: {
    main: "#f51f7e",
    1000: "#f6338a",
    900: "#",
    800: "#",
    700: "#",
    600: "#",
    500: "#",
    400: "#",
    300: "#",
    200: "#fee8f2",
    100: "#fef3f8",
  },
  purpleA: {
    main: "#a200f2",
    1000: "#ab19f3",
    900: "#",
    800: "#",
    700: "#",
    600: "#",
    500: "#",
    400: "#",
    300: "#",
    200: "#f5e5fd",
    100: "#faf2fe",
  },
  purpleB: {
    main: "#651dff",
    1000: "#7435ff",
    900: "#",
    800: "#",
    700: "#",
    600: "#",
    500: "#",
    400: "#",
    300: "#",
    200: "#efe8ff",
    100: "#f7faff",
  },
  blueA: {
    main: "#2ba9bc",
    1000: "#2ba9bc",
    900: "#",
    800: "#",
    700: "#",
    600: "#",
    500: "#",
    400: "#",
    300: "#",
    200: "#2ba9bc",
    100: "#f4f8ff",
  },
  blueB: {
    main: "#009dff",
    1000: "#19a6ff",
    900: "#",
    800: "#",
    700: "#",
    600: "#",
    500: "#",
    400: "#",
    300: "#",
    200: "#e5f5ff",
    100: "#f2faff",
  },
  cyan: {
    main: "#00bcd4",
    1000: "#19c2d8",
    900: "#",
    800: "#",
    700: "#",
    600: "#",
    500: "#",
    400: "#",
    300: "#",
    200: "#e5f8fa",
    100: "#f2fbfd",
  },
  greenA: {
    main: "#2ba9bc",
    1000: "#19c5ae",
    900: "#",
    800: "#",
    700: "#",
    600: "#",
    500: "#",
    400: "#",
    300: "#",
    200: "#e5f8f6",
    100: "#f2fcfa",
  },
  greenB: {
    main: "#64dd17",
    1000: "#73e02e",
    900: "#",
    800: "#",
    700: "#",
    600: "#",
    500: "#",
    400: "#",
    300: "#",
    200: "#effbe7",
    100: "#f7fdf3",
  },
  yellow: {
    main: "#ffab00",
    1000: "#ffb319",
    900: "#",
    800: "#",
    700: "#",
    600: "#",
    500: "#",
    400: "#",
    300: "#",
    200: "#ffab00",
    100: "#fffbf2",
  },
  orange: {
    main: "#ff6f00",
    1000: "#ff7d19",
    900: "#",
    800: "#",
    700: "#",
    600: "#",
    500: "#",
    400: "#",
    300: "#",
    200: "#fff0e5",
    100: "#fff8f2",
  },
  gray: {
    main: "#b1b5bc",
    1000: "#b8bbc2",
    900: "#",
    800: "#",
    700: "#",
    600: "#",
    500: "#",
    400: "#",
    300: "#dfe3ea",
    200: "#eef2f8",
    100: "#f1f5fb",
  },
  default: {
    headline: "#001738",
    subtitle: "#8492a6",
    primaryButton: "#2979ff",
    icon: "#8492a6",
  },
};
const cards1 = [
  {
    logo: (
      // <svg
      //   width="56"
      //   height="56"
      //   viewBox="0 0 56 56"
      //   fill="none"
      //   xmlns="http://www.w3.org/2000/svg"
      // >
      //   <path
      //     d="M23.5 15C23.5 12.51 25.51 10.5 28 10.5C30.49 10.5 32.5 12.51 32.5 15C32.5 17.49 30.49 19.5 28 19.5C25.51 19.5 23.5 17.49 23.5 15ZM35.5 33.75V28.5C35.5 24.36 32.14 21 28 21C23.86 21 20.5 24.36 20.5 28.5V33.75C20.5 34.995 21.505 36 22.75 36H23.5V44.25C23.5 45.495 24.505 46.5 25.75 46.5H30.25C31.495 46.5 32.5 45.495 32.5 44.25V36H33.25C34.495 36 35.5 34.995 35.5 33.75Z"
      //     fill="#2979FF"
      //   />
      //   <path
      //     opacity="0.4"
      //     d="M38.5 18C40.99 18 43 15.99 43 13.5C43 11.01 40.99 9 38.5 9C36.01 9 34 11.01 34 13.5C34 15.99 36.01 18 38.5 18ZM17.5 18C19.99 18 22 15.99 22 13.5C22 11.01 19.99 9 17.5 9C15.01 9 13 11.01 13 13.5C13 15.99 15.01 18 17.5 18ZM19 33.75V28.5C19 25.62 20.365 23.07 22.465 21.42C21.145 20.235 19.42 19.5 17.5 19.5C13.36 19.5 10 22.86 10 27V30.75C10 31.995 11.005 33 12.25 33H13V39.75C13 40.995 14.005 42 15.25 42H19.75C20.995 42 22 40.995 22 39.75V37.425C20.29 37.08 19 35.565 19 33.75ZM38.5 19.5C36.58 19.5 34.855 20.235 33.535 21.42C35.635 23.07 37 25.62 37 28.5V33.75C37 35.565 35.71 37.08 34 37.425V39.75C34 40.995 35.005 42 36.25 42H40.75C41.995 42 43 40.995 43 39.75V33H43.75C44.995 33 46 31.995 46 30.75V27C46 22.86 42.64 19.5 38.5 19.5Z"
      //     fill="#2979FF"
      //   />
      // </svg>
      <svg
        fill="#000000"
        version="1.1"
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        width="800px"
        height="800px"
        viewBox="0 0 512 512"
        enable-background="new 0 0 512 512"
        xml:space="preserve"
      >
        <path
          d="M256,0C114.609,0,0,114.609,0,256s114.609,256,256,256s256-114.609,256-256S397.391,0,256,0z M256,472
      c-119.297,0-216-96.703-216-216S136.703,40,256,40s216,96.703,216,216S375.297,472,256,472z"
        />
        <path
          d="M360.5,128.5h-121v64h-112v192h144v-64h112v-169L360.5,128.5z M255.5,368.5h-112v-160h96v112h16V368.5z M367.5,304.5h-112
      v-160h80v32h32V304.5z"
        />
      </svg>
    ),

    title: "Total Projects",
    cardColor: colors["blueA"][100],
    borderColor: colors["blueA"][400],
    iconColor: colors["blueA"][1000],
    counter: 0,
  },
  {
    logo: (
      // <svg
      //   width="56"
      //   height="56"
      //   viewBox="0 0 56 56"
      //   fill="none"
      //   xmlns="http://www.w3.org/2000/svg"
      // >
      //   <path
      //     d="M37.38 29.205L46.275 30.555C45.66 34.605 43.785 38.235 41.01 41.01L34.65 34.65C36.09 33.21 37.065 31.32 37.38 29.205ZM30.735 9.255L29.31 18.135C33.945 18.885 37.5 22.89 37.5 27.75H46.5C46.5 18.405 39.66 10.695 30.735 9.255ZM27.75 37.5C22.365 37.5 18 33.135 18 27.75C18 22.365 22.365 18 27.75 18V9C17.4 9 9 17.4 9 27.75C9 38.1 17.4 46.5 27.75 46.5C31.77 46.5 35.475 45.225 38.535 43.08L33.36 35.73C31.77 36.84 29.835 37.5 27.75 37.5Z"
      //     fill="#F6338A"
      //   />
      // </svg>
      //       <svg width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" mirror-in-rtl="true">
      //   <path fill="#494c4e" d="M8 6H5c-.553 0-1-.448-1-1s.447-1 1-1h3c.553 0 1 .448 1 1s-.447 1-1 1zM13 10H5c-.553 0-1-.448-1-1s.447-1 1-1h8c.553 0 1 .448 1 1s-.447 1-1 1zM13 14H5c-.553 0-1-.448-1-1s.447-1 1-1h8c.553 0 1 .448 1 1s-.447 1-1 1z"/>
      //   <path fill="#494c4e" d="M18 2v8c0 .55-.45 1-1 1s-1-.45-1-1V2.5c0-.28-.22-.5-.5-.5h-13c-.28 0-.5.22-.5.5v19c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5V21c0-.55.45-1 1-1s1 .45 1 1v1c0 1.1-.9 2-2 2H2c-1.1 0-2-.9-2-2V2C0 .9.9 0 2 0h14c1.1 0 2 .9 2 2z"/>
      //   <path fill="#494c4e" d="M23.71 8.817c.44.438.372 1.212-.148 1.732l-7.835 7.84c-.07.068-.148.126-.227.173l-2.382 1.317c-.33.183-.7.152-.927-.075-.226-.227-.25-.603-.07-.923l1.328-2.373c.042-.085.1-.153.162-.216 0-.012.007-.018.007-.018l7.835-7.84c.52-.52 1.294-.587 1.73-.15l.53.53z"/>
      // </svg>

      <svg
        width="800px"
        height="800px"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title />

        <g data-name="outline color" id="outline_color">
          <path
            class="cls-1"
            d="M22,60a1,1,0,0,1-.5-.13l-9-5a1,1,0,0,1,0-1.74l9-5a1,1,0,0,1,1.43.49A14.29,14.29,0,0,1,24,54a14.4,14.4,0,0,1-1.06,5.38A1,1,0,0,1,22,60Zm-7-6,6.4,3.56A12.17,12.17,0,0,0,22,54a12,12,0,0,0-.54-3.56Z"
          />

          <path
            class="cls-1"
            d="M59,60H22a1,1,0,0,1-.83-.44,1,1,0,0,1-.1-.94A12.33,12.33,0,0,0,22,54a12.13,12.13,0,0,0-.92-4.62,1,1,0,0,1,.1-.94A1,1,0,0,1,22,48H59a1,1,0,0,1,1,1V59A1,1,0,0,1,59,60ZM23.42,58H58V50H23.42A13.87,13.87,0,0,1,24,54,14.27,14.27,0,0,1,23.42,58Z"
          />

          <path class="cls-1" d="M47,56H24a1,1,0,0,1,0-2H47a1,1,0,0,1,0,2Z" />

          <path
            class="cls-1"
            d="M52,59a1,1,0,0,1-1-1V50a1,1,0,0,1,2,0v8A1,1,0,0,1,52,59Z"
          />

          <path
            class="cls-2"
            d="M16.27,48.61a1,1,0,0,1-.91-.59L4.56,23.83a5,5,0,0,1,2.52-6.6l20.17-9A1,1,0,0,1,28.07,10l-20.17,9a3,3,0,0,0-1.52,4L17.18,47.2a1,1,0,0,1-.5,1.32A1,1,0,0,1,16.27,48.61Z"
          />

          <path
            class="cls-3"
            d="M16.74,22.68a1,1,0,0,1-.92-.6,1,1,0,0,1,.51-1.32l8.22-3.67a1,1,0,1,1,.81,1.83l-8.22,3.67A1,1,0,0,1,16.74,22.68Z"
          />

          <path
            class="cls-3"
            d="M16.44,29.38A1,1,0,0,1,16,27.47l6.78-3a1,1,0,0,1,.82,1.82l-6.78,3A1,1,0,0,1,16.44,29.38Z"
          />

          <path
            class="cls-3"
            d="M18.89,34.85a1,1,0,0,1-.41-1.91l2.29-1a1,1,0,0,1,.82,1.82l-2.29,1A1,1,0,0,1,18.89,34.85Z"
          />

          <path
            class="cls-2"
            d="M51,46a.75.75,0,0,1-.26,0,1,1,0,0,1-.7-1.22L57.9,16.11a3,3,0,0,0-.3-2.28,2.9,2.9,0,0,0-1.81-1.4L32.65,6.08A3,3,0,0,0,29,8.2L20.77,38.09a3,3,0,0,0,.29,2.28,3,3,0,0,0,1.81,1.41L31.12,44A1,1,0,0,1,30.6,46L22.35,43.7a5,5,0,0,1-3-2.34,4.93,4.93,0,0,1-.47-3.79L27,7.67a5,5,0,0,1,6.14-3.51L56.31,10.5a5,5,0,0,1,3.51,6.13L52,45.26A1,1,0,0,1,51,46Z"
          />

          <path
            class="cls-3"
            d="M47.46,17.36a1.24,1.24,0,0,1-.27,0L38.51,15A1,1,0,0,1,39,13l8.68,2.38a1,1,0,0,1-.26,2Z"
          />

          <path
            class="cls-3"
            d="M48.77,23.94a1.24,1.24,0,0,1-.27,0L34,20A1,1,0,1,1,34.56,18L49,22a1,1,0,0,1-.26,2Z"
          />

          <path
            class="cls-3"
            d="M47.18,29.73a.78.78,0,0,1-.26,0l-14.47-4A1,1,0,1,1,33,23.81l14.47,4a1,1,0,0,1,.7,1.22A1,1,0,0,1,47.18,29.73Z"
          />

          <path
            class="cls-3"
            d="M45.6,35.52a.84.84,0,0,1-.27,0l-14.47-4a1,1,0,1,1,.53-1.93l14.47,4a1,1,0,0,1,.7,1.23A1,1,0,0,1,45.6,35.52Z"
          />
        </g>
      </svg>
    ),

    title: "Draft",
    cardColor: colors["blueB"][100],
    borderColor: colors["blueB"][400],
    iconColor: colors["blueB"][1000],
    counter: 0,
  },
  {
    logo: (
      
      <svg
        fill="#ffffff"
        width="800px"
        height="800px"
        viewBox="0 0 64 64"
        id="Layer_1_1_"
        version="1.1"
        xml:space="preserve"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
      >
        <g>
          <path d="M63,47.776v-7.553l-3.729-0.955c-0.292-0.945-0.669-1.858-1.125-2.725l1.96-3.309l-5.34-5.341l-3.31,1.961   c-0.866-0.457-1.779-0.834-2.724-1.126L47.776,25h-7.553l-0.955,3.729c-0.945,0.292-1.858,0.669-2.724,1.126l-3.31-1.961L33,28.13   V25h-3c-0.843,0-1.653-0.358-2.221-0.983c-0.576-0.633-0.847-1.454-0.765-2.314C27.159,20.188,28.546,19,30.172,19H33v-9   c0-1.654-1.346-3-3-3h-8V6.172c0-2.646-1.982-4.907-4.512-5.148c-1.408-0.138-2.811,0.33-3.851,1.276C12.597,3.245,12,4.595,12,6v1   H4c-1.654,0-3,1.346-3,3v9h2.828c1.626,0,3.013,1.188,3.158,2.702c0.082,0.86-0.189,1.682-0.765,2.314C5.653,24.642,4.843,25,4,25   H1v9c0,1.654,1.346,3,3,3h10v-2.828c0-1.626,1.187-3.014,2.702-3.158c0.862-0.073,1.683,0.19,2.315,0.766   C19.642,32.347,20,33.156,20,34v3h9.641c-0.356,0.731-0.67,1.485-0.912,2.269L25,40.224v7.553l3.729,0.955   c0.292,0.945,0.669,1.858,1.125,2.725l-1.96,3.309l5.34,5.341l3.31-1.961c0.866,0.457,1.779,0.834,2.724,1.126L40.224,63h7.553   l0.955-3.729c0.945-0.292,1.858-0.669,2.724-1.126l3.31,1.961l5.34-5.341l-1.96-3.309c0.457-0.866,0.833-1.779,1.125-2.725   L63,47.776z M20.363,30.3c-1.04-0.946-2.446-1.417-3.851-1.276C13.982,29.265,12,31.526,12,34.172V35H4c-0.551,0-1-0.448-1-1v-7h1   c1.406,0,2.754-0.597,3.701-1.638c0.945-1.04,1.411-2.443,1.276-3.85C8.735,18.982,6.474,17,3.828,17H3v-7c0-0.552,0.449-1,1-1h10   V6c0-0.844,0.358-1.653,0.983-2.221c0.633-0.575,1.452-0.842,2.315-0.766C18.813,3.158,20,4.546,20,6.172V9h10c0.551,0,1,0.448,1,1   v7h-0.828c-2.646,0-4.907,1.982-5.149,4.513c-0.134,1.406,0.331,2.81,1.276,3.85C27.246,26.403,28.594,27,30,27h1v3.13   l-3.105,3.105L28.94,35H22v-1C22,32.595,21.403,31.245,20.363,30.3z M57.655,47.08l-0.152,0.564   c-0.316,1.174-0.779,2.294-1.376,3.329l-0.292,0.507l1.758,2.968l-3.145,3.146l-2.968-1.759l-0.506,0.292   c-1.036,0.597-2.157,1.06-3.331,1.376l-0.564,0.152L46.224,61h-4.447l-0.856-3.345l-0.564-0.152   c-1.174-0.316-2.294-0.779-3.331-1.376l-0.506-0.292l-2.968,1.759l-3.145-3.146l1.758-2.968l-0.292-0.507   c-0.597-1.035-1.06-2.155-1.376-3.329l-0.152-0.564L27,46.224v-4.447l3.345-0.856l0.152-0.564c0.316-1.174,0.779-2.294,1.376-3.329   l0.292-0.507l-1.758-2.968l3.145-3.146l2.968,1.759l0.506-0.292c1.036-0.597,2.157-1.06,3.331-1.376l0.564-0.152L41.776,27h4.447   l0.856,3.345l0.564,0.152c1.174,0.316,2.294,0.779,3.331,1.376l0.506,0.292l2.968-1.759l3.145,3.146l-1.758,2.968l0.292,0.507   c0.597,1.035,1.06,2.155,1.376,3.329l0.152,0.564L61,41.776v4.447L57.655,47.08z" />

          <path d="M44,36c-4.411,0-8,3.589-8,8s3.589,8,8,8c1.74,0,3.4-0.557,4.8-1.61l-1.202-1.598C46.547,49.582,45.303,50,44,50   c-3.309,0-6-2.691-6-6s2.691-6,6-6s6,2.691,6,6c0,1.303-0.417,2.547-1.208,3.599l1.599,1.201C51.443,47.399,52,45.74,52,44   C52,39.589,48.411,36,44,36z" />

          <path d="M44,32c-6.617,0-12,5.383-12,12s5.383,12,12,12s12-5.383,12-12S50.617,32,44,32z M44,54c-5.514,0-10-4.486-10-10   s4.486-10,10-10s10,4.486,10,10S49.514,54,44,54z" />

          <rect height="2" width="2" x="52" y="7" fill="#FFAB00" />

          <rect height="2" width="2" x="52" y="11" fill="#FFAB00" />

          <rect height="2" width="2" x="54" y="9" fill="#FFAB00" />

          <rect height="2" width="2" x="50" y="9" fill="#FFAB00" />

          <rect height="2" width="2" x="42" y="15" fill="#FFAB00" />

          <rect height="2" width="2" x="42" y="19" fill="#FFAB00" />

          <rect height="2" width="2" x="44" y="17" fill="#FFAB00" />

          <rect height="2" width="2" x="40" y="17" fill="#FFAB00" />

          <rect height="2" width="2" x="56" y="19" fill="#FFAB00" />

          <rect height="2" width="2" x="56" y="23" fill="#FFAB00" />

          <rect height="2" width="2" x="58" y="21" fill="#FFAB00" />

          <rect height="2" width="2" x="54" y="21" fill="#FFAB00" />

          <rect height="2" width="2" x="37" y="3" fill="#FFAB00" />

          <rect height="2" width="2" x="37" y="7" fill="#FFAB00" />

          <rect height="2" width="2" x="39" y="5" fill="#FFAB00" />

          <rect height="2" width="2" x="35" y="5" fill="#FFAB00" />

          <rect height="2" width="2" x="18" y="47" fill="#FFAB00" />

          <rect height="2" width="2" x="18" y="51" fill="#FFAB00" />

          <rect height="2" width="2" x="20" y="49" fill="#FFAB00" />

          <rect height="2" width="2" x="16" y="49" fill="#FFAB00" />

          <rect height="2" width="2" x="8" y="41" fill="#FFAB00" />

          <rect height="2" width="2" x="8" y="45" fill="#FFAB00" />

          <rect height="2" width="2" x="10" y="43" fill="#FFAB00" />

          <rect height="2" width="2" x="6" y="43" fill="#FFAB00" />
        </g>
      </svg>
    ),

    title: "Processing",
    cardColor: colors["yellow"][100],
    borderColor: colors["yellow"][400],
    iconColor: colors["yellow"][1000],
    counter: 0,
  },

  {
    logo: (
      // <svg
      //   width="56"
      //   height="56"
      //   viewBox="0 0 56 56"
      //   fill="none"
      //   xmlns="http://www.w3.org/2000/svg"
      // >
      //   <path
      //     fill-rule="evenodd"
      //     clip-rule="evenodd"
      //     d="M41.75 12H13.25C12.005 12 11 13.005 11 14.25V41.25C11 42.495 12.005 43.5 13.25 43.5H41.75C42.995 43.5 44 42.495 44 41.25V14.25C44 13.005 42.995 12 41.75 12ZM26 37.5C26 38.325 25.325 39 24.5 39H20C19.175 39 18.5 38.325 18.5 37.5V27C18.5 26.175 19.175 25.5 20 25.5H24.5C25.325 25.5 26 26.175 26 27V37.5ZM36.5 34.5C36.5 35.325 35.825 36 35 36H30.5C29.675 36 29 35.325 29 34.5V27C29 26.175 29.675 25.5 30.5 25.5H35C35.825 25.5 36.5 26.175 36.5 27V34.5ZM38 21C38 21.825 37.325 22.5 36.5 22.5H18.5C17.675 22.5 17 21.825 17 21V18C17 17.175 17.675 16.5 18.5 16.5H36.5C37.325 16.5 38 17.175 38 18V21Z"
      //     fill="#FFAB00"
      //   />
      // </svg>
      //       <svg fill="#000000" height="800px" width="800px" version="1.1" id="XMLID_103_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      // 	 viewBox="0 0 24 24" xml:space="preserve">
      // <g id="in-progress">
      // 	<g>
      // 		<path d="M23,24H1v-2h2.4c-1.6-5,1.6-7,3.7-8.4C8,13,8.9,12.5,8.9,12S8,10.9,7.1,10.4C5,9,1.8,7.1,3.4,2H1V0h22v2h-2.4
      // 			c1.6,5-1.6,7-3.7,8.4c-1,0.5-1.9,1.1-1.9,1.6s0.9,1.1,1.8,1.6c2.1,1.4,5.3,3.4,3.7,8.4H23V24z M5.6,22h12.8c1.6-4-0.5-5.3-2.6-6.7
      // 			C14.4,14.5,13,13.6,13,12c0-1.6,1.4-2.5,2.8-3.3C17.9,7.3,20,6,18.4,2H5.6C4,6,6.1,7.3,8.2,8.7C9.6,9.5,11,10.4,11,12
      // 			c0,1.6-1.4,2.5-2.8,3.3C6.1,16.7,4,18,5.6,22z"/>
      // 	</g>
      // 	<g>
      // 		<path d="M16.8,23H7c-0.3-1.5,0.2-2.4,2.3-4.3c0.8-0.7,1.8-1.5,2.7-2.8c1,1.2,2,2.1,2.7,2.8C16.8,20.7,17.3,21,16.8,23z"/>
      // 	</g>
      // 	<g>
      // 		<path d="M9.4,6c-0.7,1.3-0.7,1.3,0.9,2.1c0.5,0.2,1.1,0.5,1.6,0.9c0.5-0.4,1.2-0.7,1.6-0.9c1.7-0.8,1.7-0.8,1-2.1"/>
      // 	</g>
      // </g>
      // </svg>

      <svg fill="#ffffff" height="800px" width="800px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
<g id="input-to-process">
	<path d="M23,13c0-1.304-0.837-2.403-2-2.816V7.858c1.721-0.447,3-2,3-3.858c0-2.206-1.794-4-4-4s-4,1.794-4,4
		c0,1.858,1.279,3.411,3,3.858v2.326c-1.163,0.413-2,1.512-2,2.816s0.837,2.403,2,2.816v2.367c-1.163,0.413-2,1.512-2,2.816
		c0,1.657,1.343,3,3,3s3-1.343,3-3c0-1.304-0.837-2.403-2-2.816v-2.367C22.163,15.403,23,14.304,23,13z M18,4c0-1.103,0.897-2,2-2
		s2,0.897,2,2s-0.897,2-2,2S18,5.103,18,4z"/>
	<path d="M15.842,4.228L10.886,1.5l0.837,2.887C10.185,5.007,8,6.92,8,11H6V9H0v6h6v-2h2v6H6v-2H0v6h6v-2h2v3h2V11
		c0-3.123,1.506-4.278,2.287-4.667l0.827,2.851L15.842,4.228z M4,13H2v-2h2V13z M4,21H2v-2h2V21z"/>
</g>
</svg>
    ),

    title: "In Progress",
    cardColor: colors["orange"][100],
    borderColor: colors["orange"][400],
    iconColor: colors["orange"][1000],
    counter: 0,
  },
  {
    logo: (
      // <svg
      //   width="56"
      //   height="56"
      //   viewBox="0 0 56 56"
      //   fill="none"
      //   xmlns="http://www.w3.org/2000/svg"
      // >
      //   <path
      //     d="M44.25 11H11.25C10.005 11 9 12.005 9 13.25V37.25C9 38.495 10.005 39.5 11.25 39.5H30.24C30.405 39.5 30.57 39.56 30.705 39.65L38.1 45.185C38.355 45.395 38.685 45.5 39 45.5C39.225 45.5 39.45 45.455 39.675 45.35C40.185 45.095 40.5 44.57 40.5 44V39.5H44.25C45.495 39.5 46.5 38.495 46.5 37.25V13.25C46.5 12.005 45.495 11 44.25 11ZM34.365 30.17C34.275 30.305 32.055 33.5 27.75 33.5C23.445 33.5 21.225 30.305 21.135 30.17C20.895 29.825 20.985 29.36 21.33 29.135C21.465 29.045 21.6 29 21.75 29C21.99 29 22.23 29.12 22.365 29.33C22.395 29.36 24.225 32 27.75 32C31.245 32 33.06 29.435 33.135 29.33C33.375 28.985 33.84 28.91 34.17 29.135C34.515 29.36 34.605 29.825 34.365 30.17Z"
      //     fill="#2ba9bc"
      //   />
      // </svg>
      <svg
        width="800px"
        height="800px"
        viewBox="0 0 512 512"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
      >
        <title>success</title>
        <g
          id="Page-1"
          stroke="none"
          stroke-width="1"
          fill="none"
          fill-rule="evenodd"
        >
          <g
            id="add-copy"
            fill="#000000"
            transform="translate(42.666667, 42.666667)"
          >
            <path
              d="M213.333333,3.55271368e-14 C95.51296,3.55271368e-14 3.55271368e-14,95.51296 3.55271368e-14,213.333333 C3.55271368e-14,331.153707 95.51296,426.666667 213.333333,426.666667 C331.153707,426.666667 426.666667,331.153707 426.666667,213.333333 C426.666667,95.51296 331.153707,3.55271368e-14 213.333333,3.55271368e-14 Z M213.333333,384 C119.227947,384 42.6666667,307.43872 42.6666667,213.333333 C42.6666667,119.227947 119.227947,42.6666667 213.333333,42.6666667 C307.43872,42.6666667 384,119.227947 384,213.333333 C384,307.43872 307.438933,384 213.333333,384 Z M293.669333,137.114453 L323.835947,167.281067 L192,299.66912 L112.916693,220.585813 L143.083307,190.4192 L192,239.335893 L293.669333,137.114453 Z"
              id="Shape"
            ></path>
          </g>
        </g>
      </svg>
    ),

    title: "Success",
    cardColor: colors["greenA"][100],
    borderColor: colors["greenA"][400],
    iconColor: colors["greenA"][1000],
    counter: 0,
  },
  {
    logo: (
      // <svg
      //   width="56"
      //   height="56"
      //   viewBox="0 0 56 56"
      //   fill="none"
      //   xmlns="http://www.w3.org/2000/svg"
      // >
      //   <path
      //     d="M46.5 14.75V42.5C46.5 44.15 45.15 45.5 43.5 45.5H40.5V18.5H42.75C44.82 18.5 46.5 16.82 46.5 14.75ZM15.75 32C14.505 32 13.5 33.005 13.5 34.25C13.5 35.495 14.505 36.5 15.75 36.5C16.995 36.5 18 35.495 18 34.25C18 33.005 16.995 32 15.75 32ZM42 17H39V42.5H11.25C10.005 42.5 9 41.495 9 40.25V13.25C9 12.005 10.005 11 11.25 11H42C43.65 11 45 12.35 45 14C45 15.65 43.65 17 42 17ZM19.5 34.25C19.5 32.18 17.82 30.5 15.75 30.5C13.68 30.5 12 32.18 12 34.25C12 36.32 13.68 38 15.75 38C17.82 38 19.5 36.32 19.5 34.25ZM19.5 22.565L21.225 24.29C21.36 24.425 21.555 24.5 21.75 24.5C21.945 24.5 22.14 24.425 22.275 24.275C22.575 23.975 22.575 23.51 22.275 23.21L20.565 21.5L22.29 19.775C22.59 19.475 22.59 19.01 22.29 18.71C21.99 18.41 21.525 18.41 21.225 18.71L19.5 20.435L17.775 18.725C17.475 18.425 17.01 18.425 16.71 18.725C16.41 19.025 16.41 19.49 16.71 19.79L18.435 21.5L16.725 23.225C16.425 23.525 16.425 23.99 16.725 24.29C16.86 24.425 17.055 24.5 17.25 24.5C17.445 24.5 17.64 24.425 17.775 24.275L19.5 22.565ZM34.275 20.225L31.275 17.225C30.975 16.925 30.51 16.925 30.21 17.225L27.21 20.225C27.075 20.36 27 20.555 27 20.75C27 20.945 27.075 21.14 27.225 21.275C27.525 21.575 27.99 21.575 28.29 21.275L30 19.565V26.75C30 30.47 26.97 33.5 23.25 33.5H21.75C21.33 33.5 21 33.83 21 34.25C21 34.67 21.33 35 21.75 35H23.25C27.795 35 31.5 31.295 31.5 26.75V19.565L33.225 21.29C33.525 21.59 33.99 21.59 34.29 21.29C34.59 20.99 34.575 20.51 34.275 20.225Z"
      //     fill="#FF6F00"
      //   />
      // </svg>
      <svg
        fill="#000000"
        width="800px"
        height="800px"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M520.741 163.801a10.234 10.234 0 00-3.406-3.406c-4.827-2.946-11.129-1.421-14.075 3.406L80.258 856.874a10.236 10.236 0 00-1.499 5.335c0 5.655 4.585 10.24 10.24 10.24h846.004c1.882 0 3.728-.519 5.335-1.499 4.827-2.946 6.352-9.248 3.406-14.075L520.742 163.802zm43.703-26.674L987.446 830.2c17.678 28.964 8.528 66.774-20.436 84.452a61.445 61.445 0 01-32.008 8.996H88.998c-33.932 0-61.44-27.508-61.44-61.44a61.445 61.445 0 018.996-32.008l423.002-693.073c17.678-28.964 55.488-38.113 84.452-20.436a61.438 61.438 0 0120.436 20.436zM512 778.24c22.622 0 40.96-18.338 40.96-40.96s-18.338-40.96-40.96-40.96-40.96 18.338-40.96 40.96 18.338 40.96 40.96 40.96zm0-440.32c-22.622 0-40.96 18.338-40.96 40.96v225.28c0 22.622 18.338 40.96 40.96 40.96s40.96-18.338 40.96-40.96V378.88c0-22.622-18.338-40.96-40.96-40.96z" />
      </svg>
    ),

    title: "Failed",
    cardColor: colors["red"][100],
    borderColor: colors["red"][400],
    iconColor: colors["red"][1000],
    counter: 0,
  },

  // {
  //   logo: (
  //     <svg
  //       width="56"
  //       height="56"
  //       viewBox="0 0 56 56"
  //       fill="none"
  //       xmlns="http://www.w3.org/2000/svg"
  //     >
  //       <path
  //         d="M47.5873 13.25V34.25C47.5873 35.495 46.5532 36.5 45.2721 36.5H37.5546C36.2735 36.5 35.2394 35.495 35.2394 34.25V27.425C35.4863 27.47 35.7487 27.5 36.0111 27.5C38.1412 27.5 39.8699 25.82 39.8699 23.75C39.8699 21.68 38.1412 20 36.0111 20C35.7487 20 35.4863 20.03 35.2394 20.075V13.25C35.2394 12.005 36.2735 11 37.5546 11H45.2721C46.5532 11 47.5873 12.005 47.5873 13.25ZM16.7175 31.25C16.7175 29.18 18.4462 27.5 20.5762 27.5C20.8386 27.5 21.101 27.53 21.3479 27.575V20.75C21.3479 19.505 20.3138 18.5 19.0327 18.5H11.3152C10.0341 18.5 9 19.505 9 20.75V41.75C9 42.995 10.0341 44 11.3152 44H19.0327C20.3138 44 21.3479 42.995 21.3479 41.75V34.925C21.101 34.97 20.8386 35 20.5762 35C18.4462 35 16.7175 33.32 16.7175 31.25ZM36.0111 26C37.2922 26 38.3264 24.995 38.3264 23.75C38.3264 22.505 37.2922 21.5 36.0111 21.5C35.0079 21.5 34.1589 22.13 33.8348 23H29.0654C28.2165 23 27.5219 23.675 27.5219 24.5V30.5H22.7525C22.4284 29.63 21.5795 29 20.5762 29C19.2951 29 18.261 30.005 18.261 31.25C18.261 32.495 19.2951 33.5 20.5762 33.5C21.5795 33.5 22.4284 32.87 22.7525 32H27.5219C28.3708 32 29.0654 31.325 29.0654 30.5V24.5H33.8348C34.1589 25.37 35.0079 26 36.0111 26Z"
  //         fill="#A200F2"
  //       />
  //     </svg>
  //   ),

  //   title: "Product Design Team",
  //   cardColor: colors["purpleA"][100],
  //   borderColor: colors["purpleA"][200],
  //   iconColor: colors["purpleA"][1000],
  //   counter: 853
  // },
];

const ease = "cubic-bezier(0.2, 0, 0.38, 0.9)";

export default {
  avatar,
  colors,
  cards1,
  ease,
};
