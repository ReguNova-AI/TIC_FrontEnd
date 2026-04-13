import { useEffect, useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { getStore } from "./store";

// project import
import router from "routes";
import ThemeCustomization from "themes";
import ScrollTop from "components/ScrollTop";
import { rehydrateAuth } from "store/actions";

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //
const AppWithAuth = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(rehydrateAuth());
  }, [dispatch]);

  return <RouterProvider router={router} />;
};

export default function App(initialState = {}) {
  const store = useMemo(() => getStore(initialState), []);

  return (
    <Provider store={store}>
      <ThemeCustomization>
        <ScrollTop>
          <AppWithAuth />
        </ScrollTop>
      </ThemeCustomization>
    </Provider>
  );
}
