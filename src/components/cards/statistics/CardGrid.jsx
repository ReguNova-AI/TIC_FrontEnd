import React from "react";
import Box from "@mui/material/Box";
import Card from "./Card";

// Replaced: import styled from 'styled-components'
// StyledCardGrid was a single styled.div with one CSS rule.
// Equivalent MUI Box sx prop below.

const CardGrid = ({
  wide = false,
  cards,
  easeSpeed,
  easeFunction,
  avatar,
  data,
  ...props
}) => {
  const gridClasses = wide ? "grid grid--wide" : "grid";

  return (
    <Box
      className={gridClasses}
      sx={{
        position: "relative",
        display: "grid",
        gap: "3%",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        margin: "16px 0",
      }}
      {...props}
    >
      {cards.map((card, index) => (
        <Card
          key={index}
          wide={wide}
          {...card}
          easeSpeed={easeSpeed}
          easeFunction={easeFunction}
          data={data}
        />
      ))}
    </Box>
  );
};

export default CardGrid;
