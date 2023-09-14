import React, { Dispatch, createContext, useContext, useReducer } from 'react';

import { TransactionCache } from '../../../utils/TransactionCache';
import type { Action } from '../reducers/GlobalStateReducer';

export type GlobalState = {
  walletAddress?: string;
  rpcUrl?: string;
  txCache: TransactionCache;
};

const initialState: GlobalState = {
  walletAddress: undefined,
  txCache: new TransactionCache(),
};

const GlobalStateContext = createContext<[GlobalState, Dispatch<Action>]>([
  initialState,
  () => initialState,
]);

export const useGlobalState = (): [GlobalState, Dispatch<Action>] =>
  useContext(GlobalStateContext);

type StateProviderProps = {
  reducer: React.Reducer<GlobalState, Action>;
  children: React.ReactNode;
};

/** Create provider to wrap app in */
export default function GlobalStateProvider({
  reducer,
  children,
}: StateProviderProps): JSX.Element {
  const [state, dispatchGlobalState] = useReducer(reducer, initialState);
  return (
    <GlobalStateContext.Provider value={[state, dispatchGlobalState]}>
      {children}
    </GlobalStateContext.Provider>
  );
}
