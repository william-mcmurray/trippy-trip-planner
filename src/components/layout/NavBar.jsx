import { useApp } from '../../state/AppContext';
import AlpacaLogo from '../AlpacaLogo';

export default function NavBar() {
  const { state, dispatch } = useApp();
  const showEdit = state.view !== 'onboarding';

  function handleEditConfig() {
    dispatch({ type: 'RESET_AGENTS' });
    dispatch({ type: 'SET_VIEW', payload: 'onboarding' });
  }

  return (
    <nav className="bg-warm-50 border-b border-warm-200 px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlpacaLogo className="w-8 h-8" />
        <h1 className="text-2xl font-bold text-sage-500 tracking-tight">
          Alpaca
        </h1>
      </div>
      {showEdit && (
        <button
          onClick={handleEditConfig}
          className="text-sm font-medium text-sage-600 hover:text-sage-700 border border-sage-300 rounded-lg px-3 py-1.5 hover:bg-sage-50 transition-colors cursor-pointer"
        >
          Edit Trip Configuration
        </button>
      )}
    </nav>
  );
}
