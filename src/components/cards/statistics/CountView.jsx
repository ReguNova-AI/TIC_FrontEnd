import React, { useState } from "react";
import { animated } from "react-spring";
import styled from "styled-components";
import CardGrid from "./CardGrid";
import content from "./content";

const StyledPage = styled(animated.main)`
  .section__header {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }
`;

// const ease = BezierEasing(0.2, 0, 0.38, 0.9);

const CountView = () => {
  return (
    <StyledPage  className="page">
      <div
        className="page__scrollable-content"
        onScroll={(e) => handleScroll(e)}
      >
        <div className="page__body">
          <section className="padding-h40">
            <CardGrid
              cards={[...content.cards1]}
              easeSpeed={0.15}
              easeFunction={content.ease}
              avatar={content.avatar}
            />
          </section>
        </div>
      </div>
    </StyledPage>
  );
};

export default CountView;
