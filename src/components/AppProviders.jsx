import { ConfigProvider } from "antd";
import { SnackbarProvider } from "notistack";
import { brand } from "themes/theme/brand";
import { AIAssessmentProvider } from "../contexts/AIAssessmentContext";
import { DataQueryProvider } from "../contexts/DataQueryContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
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
            <DataQueryProvider>{children}</DataQueryProvider>
          </AIAssessmentProvider>
        </SnackbarProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
