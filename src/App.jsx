import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { getStore } from './store';

// project import
import router from 'routes';
import ThemeCustomization from 'themes';
import { SnackbarProvider } from 'notistack';
import ScrollTop from 'components/ScrollTop';
import { brand } from 'themes/theme/brand';

export default function App(initialState = {}) {
  const store = getStore(initialState);

  return (
    <ThemeCustomization>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: brand.primary,
            fontFamily: `'Open Sans', sans-serif`,
          }
        }}
      >
        <SnackbarProvider>
          <ScrollTop>
            <Provider store={store}>
              <RouterProvider router={router} />
            </Provider>
          </ScrollTop>
        </SnackbarProvider>
      </ConfigProvider>
    </ThemeCustomization>
  );
}
