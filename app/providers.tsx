"use client";

import React, { memo, useMemo, Suspense } from "react";
import { AutoThemeProvider } from "@devtools-ds/themes";
import { QueryParamProvider as ContextProvider } from "use-query-params";
import { Analytics } from "@vercel/analytics/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const QueryParamProviderComponent = (props: { children?: React.ReactNode }) => {
  const { children, ...rest } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const location = useMemo(() => {
    // Use a consistent location object for both server and client initial render
    return {
      search: searchParams?.toString() ? `?${searchParams.toString()}` : "",
    } as Location;
  }, [searchParams]);

  const history = useMemo(
    () => ({
      push: ({ search }: Location) => {
        const newUrl = `${pathname}${search}`;
        router.push(newUrl, { scroll: false });
      },
      replace: ({ search }: Location) => {
        const newUrl = `${pathname}${search}`;
        router.replace(newUrl, { scroll: false });
      },
      location,
    }),
    [pathname, router, location]
  );

  return (
    <ContextProvider {...rest} history={history} location={location}>
      {children}
    </ContextProvider>
  );
};

const QueryParamProvider = memo(QueryParamProviderComponent);

function ProvidersInner({ children }: { children: React.ReactNode }) {
  return (
    <QueryParamProvider>
      <AutoThemeProvider theme="firefox" autoStyle>
        {children}
        <Analytics />
      </AutoThemeProvider>
    </QueryParamProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <AutoThemeProvider theme="firefox" autoStyle>
        {children}
        <Analytics />
      </AutoThemeProvider>
    }>
      <ProvidersInner>{children}</ProvidersInner>
    </Suspense>
  );
}