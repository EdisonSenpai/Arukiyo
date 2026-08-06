import {
  createContext,
  type ReactNode,
  useContext,
} from "react";

import {
  type ExplorationSessionState,
  useExplorationSession as useExplorationSessionEngine,
} from "@/hooks/useExplorationSession";

const ExplorationSessionContext =
  createContext<ExplorationSessionState | null>(null);

export function ExplorationSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const exploration = useExplorationSessionEngine();

  return (
    <ExplorationSessionContext.Provider
      value={exploration}
    >
      {children}
    </ExplorationSessionContext.Provider>
  );
}

export function useExplorationSession():
  ExplorationSessionState {
  const context = useContext(
    ExplorationSessionContext,
  );

  if (!context) {
    throw new Error(
      "useExplorationSession must be used inside ExplorationSessionProvider.",
    );
  }

  return context;
}
