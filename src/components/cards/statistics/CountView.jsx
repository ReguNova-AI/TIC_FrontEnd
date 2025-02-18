import React, { useEffect, useState } from "react";
import { animated } from "react-spring";
import styled from "styled-components";
import CardGrid from "./CardGrid";
import content from "./content";
import { ProjectApiService } from "services/api/ProjectAPIService";
import { API_ERROR_MESSAGE, API_SUCCESS_MESSAGE } from "shared/constants";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const StyledPage = styled(animated.main)`
  .section__header {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }
`;

const CountView = ({data}) => {
  
  const [updatedCards, setUpdatedCards] = useState([]);// Now using state for updated cards
  const [snackData, setSnackData] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const titleToKeyMap = {
    "Total Projects": "total_projects_count",
    "Draft": "draft_count",
    "In Progress": "in_progress_count",
    "Success": "success_count",
    "Failed": "failed_count",
    "Processing" : "processing_count",
  };

  useEffect(() => {
    // fetchData();
     // Update the cards with the new counts from API response
     const updatedCards = updateCardCounts([...content.cards1], data);
     setUpdatedCards(updatedCards); // Update the state with new card data
  }, [data]);

  // Function to update the card counts before passing them to CardGrid
  const updateCardCounts = (cards, apiResponse) => {
    return cards.map((card) => {
      const key = titleToKeyMap[card.title]; // Get the corresponding API key
      if (key && apiResponse[key] !== undefined) {
        card.counter = parseInt(apiResponse[key], 10); // Update the counter with the API response value
      }
      return card;
    });
  };


  return (
    <StyledPage className="page">
      <div className="page__scrollable-content" onScroll={(e) => handleScroll(e)}>
        <div className="page__body">
          <section className="padding-h40">
            <CardGrid
              cards={updatedCards}
              easeSpeed={0.15}
              easeFunction={content.ease}
              avatar={content.avatar}
              data={data}
            />
          </section>
        </div>
      </div>

      {/* Snackbar for showing error messages */}
      <Snackbar
      style={{top:"80px"}}
        open={snackData.show}
        autoHideDuration={6000}
        onClose={() => setSnackData({ ...snackData, show: false })}
      >
        <Alert severity={snackData.type}>{snackData.message}</Alert>
      </Snackbar>
    </StyledPage>
  );
};

export default CountView;
