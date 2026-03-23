import { createContext, useContext, useReducer, useEffect } from 'react';
import { reducer, createInitialState } from './reducer.js';
import { persistSession } from '../utils/session.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);

  useEffect(() => {
    persistSession(state);
  }, [state.userProfile, state.currentTrip]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
