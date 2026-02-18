import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { getStore } from "./store";

// project import
import router from "routes";
import ThemeCustomization from "themes";
import { SnackbarProvider } from "notistack";
import ScrollTop from "components/ScrollTop";
import { AIAssessmentProvider } from "./contexts/AIAssessmentContext";
import { DataQueryProvider } from "./contexts/DataQueryContext";
import { ConfigProvider } from "antd";

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App(initialState = {}) {
  const store = getStore(initialState);

  return (
    <ThemeCustomization>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: brand.primary,
            fontFamily: `'Open Sans', sans-serif`,
          },
        }}
      >
        <SnackbarProvider>
          <AIAssessmentProvider>
            <DataQueryProvider>
              <ScrollTop>
                <Provider store={store}>
                  <RouterProvider router={router} />
                </Provider>
              </ScrollTop>
            </DataQueryProvider>
          </AIAssessmentProvider>
        </SnackbarProvider>
      </ConfigProvider>
    </ThemeCustomization>
  );
}
