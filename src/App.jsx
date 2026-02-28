import { useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { getStore } from "./store";

// project import
import router from "routes";
import ThemeCustomization from "themes";
import ScrollTop from "components/ScrollTop";

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App(initialState = {}) {
  const store = useMemo(() => getStore(initialState), []);

  return (
    <ThemeCustomization>
      <ScrollTop>
        <Provider store={store}>
          <RouterProvider router={router} />
        </Provider>
      </ScrollTop>
    </ThemeCustomization>
  );
}
