import { router, usePage } from "@inertiajs/react";
import {
  renderQueryString,
  unstable_createAdapterProvider as createAdapterProvider,
  type unstable_AdapterInterface as AdapterInterface,
  type unstable_AdapterOptions as AdapterOptions,
  type unstable_UpdateUrlFunction as UpdateUrlFunction,
} from "nuqs/adapters/custom";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useOptimistic,
  type ReactNode,
} from "react";

const getOrigin = () =>
  typeof window === "undefined" ? "http://localhost" : window.location.origin;

const PartialPropsContext = createContext<readonly string[] | undefined>(undefined);

function useNuqsInertiaAdapter(): AdapterInterface {
  const currentUrl = usePage().url;
  const only = useContext(PartialPropsContext);
  const canonicalSearchParams = useMemo(
    () => new URL(currentUrl, getOrigin()).searchParams,
    [currentUrl],
  );
  const [searchParams, setOptimisticSearchParams] = useOptimistic(
    canonicalSearchParams,
    (_current, next: URLSearchParams) => new URLSearchParams(next),
  );

  const updateUrl: UpdateUrlFunction = useCallback(
    (search: URLSearchParams, options: AdapterOptions) => {
      const url = new URL(window.location.href);
      url.search = renderQueryString(search);
      setOptimisticSearchParams(url.searchParams);

      if (options.shallow === false) {
        return new Promise<void>((resolve) => {
          router.visit(url, {
            only: only ? [...only] : undefined,
            replace: options.history === "replace",
            preserveScroll: !options.scroll,
            preserveState: true,
            onFinish: () => resolve(),
          });
        });
      }

      const method = options.history === "replace" ? "replace" : "push";
      router[method]({
        url: url.pathname + url.search + url.hash,
        clearHistory: false,
        encryptHistory: false,
        preserveScroll: !options.scroll,
        preserveState: true,
      });
    },
    [only, setOptimisticSearchParams],
  );

  return { searchParams, updateUrl };
}

const AdapterProvider = createAdapterProvider(useNuqsInertiaAdapter);

type Props = {
  children: ReactNode;
  only?: readonly string[];
};

export function NuqsInertiaAdapter({ children, only }: Props) {
  return (
    <PartialPropsContext.Provider value={only}>
      <AdapterProvider>{children}</AdapterProvider>
    </PartialPropsContext.Provider>
  );
}
