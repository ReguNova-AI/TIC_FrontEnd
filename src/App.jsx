import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { getStore } from "./store";

// project import
import router from "routes";
import ThemeCustomization from "themes";
import { SnackbarProvider } from "notistack";
import ScrollTop from "components/ScrollTop";

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App(initialState = {}) {
  const store = getStore(initialState);
  return (
    <ThemeCustomization>
      <SnackbarProvider>
        <ScrollTop>
          <Provider store={store}>
            <RouterProvider router={router} />
          </Provider>
        </ScrollTop>
      </SnackbarProvider>
    </ThemeCustomization>
  );
}
