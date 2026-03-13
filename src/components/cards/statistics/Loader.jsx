import React from "react";
import content from "./content";

// Replaced: styled-components
// The spinner uses @keyframes animations. Since MUI sx doesn't support
// @keyframes for arbitrary component animations, we inject a <style> tag
// once at module level and use plain inline styles on the span/divs.
// This is zero-dependency and matches the original animation exactly.

const STYLES = `
  .dd-loader {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
    margin: -12px;
    opacity: 0;
  }
  .dd-loader--visible {
    animation: dd-fade-in 0.3s 0.15s var(--ease) forwards,
               dd-spin 0.75s steps(8, end) infinite;
  }
  @keyframes dd-fade-in {
    to { opacity: 1; }
  }
  .dd-loader div {
    position: absolute;
    top: 48px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  .dd-loader div:nth-child(1) {
    left: 10px;
    animation: dd-ellipsis1 0.6s infinite;
  }
  .dd-loader div:nth-child(2) {
    left: 10px;
    animation: dd-ellipsis2 0.6s infinite;
  }
  .dd-loader div:nth-child(3) {
    left: 34px;
    animation: dd-ellipsis2 0.6s infinite;
  }
  .dd-loader div:nth-child(4) {
    left: 58px;
    animation: dd-ellipsis3 0.6s infinite;
  }
  @keyframes dd-ellipsis1 {
    0%   { transform: scale(0); }
    100% { transform: scale(1); }
  }
  @keyframes dd-ellipsis3 {
    0%   { transform: scale(1); }
    100% { transform: scale(0); }
  }
  @keyframes dd-ellipsis2 {
    0%   { transform: translate(0, 0); }
    100% { transform: translate(24px, 0); }
  }
`;

// Inject styles once into the document head
if (
  typeof document !== "undefined" &&
  !document.getElementById("dd-loader-styles")
) {
  const el = document.createElement("style");
  el.id = "dd-loader-styles";
  el.textContent = STYLES;
  document.head.appendChild(el);
}

const Loader = ({ color, size, className }) => {
  const ease = content.ease;
  const dotStyle = {
    background: color,
    transition: `background 0.15s ${ease}`,
  };

  return (
    <span
      className={`dd-loader dd-loader--visible${className ? ` ${className}` : ""}`}
      style={{ "--ease": ease }}
    >
      <div style={dotStyle} />
      <div style={dotStyle} />
      <div style={dotStyle} />
      <div style={dotStyle} />
    </span>
  );
};

export default Loader;
