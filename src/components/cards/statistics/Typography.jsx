import styled from "styled-components";

const Type = styled.p`
  padding: 0;
  margin: 0;
  -moz-osx-font-smoothing: grayscale !important;
  -webkit-font-smoothing: antialiased !important;
  font-family: 'Open Sans', sans-serif;
  /* also try: subpixel-antialiased, for non-retina */
  /* display: inline; */
  /* background-color: rgba(0, 0, 255, 0.25); */
`;

export const Type1 = styled(Type)`
  font-size: 20px;
  line-height: 24px;
  font-weight: 700;
`;

export const Type2 = styled(Type)`
  font-size: 16px;
  line-height: 24px;
  font-weight: 600;
`;

export const Type3 = styled(Type)`
  font-size: 14px;
  line-height: 24px;
  font-weight: 500;
`;

export const Type4 = styled(Type)`
  font-size: 13px;
  line-height: 16px;
  font-weight: 600;
`;

export const Type5 = styled(Type)`
  margin-bottom: revert!important;
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
`;
