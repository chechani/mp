import React from 'react';
import {NetworkStatusProvider} from './NetworkStatusProvider';

// Wraps all providers into a single component
export function AppContextProviders({children}) {
  return <NetworkStatusProvider>{children}</NetworkStatusProvider>;
}
