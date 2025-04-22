import { ErrorBoundary } from "components/pages/ErrorBoundary";
import Metadata from "components/pages/Metadata";
import StyledApp from "components/pages/StyledApp";
import { FileSystemProvider } from "contexts/fileSystem";
import { MenuProvider } from "contexts/menu";
import { ProcessProvider } from "contexts/process";
import { SessionProvider } from "contexts/session";
import { ThemeProvider } from "contexts/ThemeContext";
import { ViewportProvider } from "contexts/viewport";
import { VoiceCommandProvider } from "contexts/VoiceCommandContext";
import type { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps): React.ReactElement => (
  <VoiceCommandProvider>
    <ViewportProvider>
      <ProcessProvider>
        <FileSystemProvider>
          <SessionProvider>
            <ThemeProvider>
              <ErrorBoundary>
                <Metadata />
                <StyledApp>
                  <MenuProvider>
                    <Component {...pageProps} />
                  </MenuProvider>
                </StyledApp>
              </ErrorBoundary>
            </ThemeProvider>
          </SessionProvider>
        </FileSystemProvider>
      </ProcessProvider>
    </ViewportProvider>
  </VoiceCommandProvider>
);

export default App;
