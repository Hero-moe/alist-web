import { Center, Progress, ProgressIndicator } from "@hope-ui/solid";
import { Route, Routes, useIsRouting } from "solid-app-router";
import { Component, lazy, Match, onCleanup, Switch } from "solid-js";
import { Portal } from "solid-js/web";
import { useRouter } from "~/hooks";
import { globalStyles } from "./theme";
import { bus } from "~/utils";
import { err, State, state, initSettings } from "~/store";
import { FullScreenLoading } from "~/components";
import { MustUser } from "./MustUser";
import "./index.css";
import { useI18n } from "@solid-primitives/i18n";
import { initialLang, langMap } from "./i18n";

const Index = lazy(() => import("~/pages/index"));
const Manage = lazy(() => import("~/pages/manage"));
const Login = lazy(() => import("~/pages/login"));
const Test = lazy(() => import("~/pages/test"));

const App: Component = () => {
  globalStyles();
  const [, { add }] = useI18n();
  const isRouting = useIsRouting();
  const { to } = useRouter();
  const onTo = (path: string) => {
    to(path);
  };
  bus.on("to", onTo);
  onCleanup(() => {
    bus.off("to", onTo);
  });
  const init = async () => {
    initSettings();
    add(initialLang, (await langMap[initialLang]()).default);
  };
  init();
  return (
    <>
      <Portal>
        <Progress
          indeterminate
          size="xs"
          position="fixed"
          top="0"
          left="0"
          right="0"
          zIndex="$banner"
          d={isRouting() ? "block" : "none"}
        >
          <ProgressIndicator />
        </Progress>
      </Portal>
      <Switch
        fallback={
          <Routes>
            <Route path="/@test" component={Test} />
            <Route path="/@login" component={Login} />
            <Route
              path="/@manage/*"
              element={
                <MustUser>
                  <Manage />
                </MustUser>
              }
            />
            <Route
              path="*"
              element={
                <MustUser>
                  <Index />
                </MustUser>
              }
            />
          </Routes>
        }
      >
        <Match when={state() === State.FetchingSettingsError}>
          <Center h="$full">Failed fetching settings: {err}</Center>
        </Match>
        <Match
          when={[
            State.FetchingInitialLanguage,
            State.FetchingSettings,
          ].includes(state())}
        >
          <FullScreenLoading />
        </Match>
      </Switch>
    </>
  );
};

export default App;
