import { useApp } from '../../state/AppContext';

export default function NavBar() {
  const { state, dispatch } = useApp();
  const showEdit = state.view !== 'onboarding';

  function handleEditConfig() {
    dispatch({ type: 'RESET_AGENTS' });
    dispatch({ type: 'SET_VIEW', payload: 'onboarding' });
  }

  return (
    <nav className="bg-white border-b border-warm-200 px-4 sm:px-6 py-3 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-terracotta-500 tracking-tight">
        Trippy
      </h1>
      {showEdit && (
        <button
          onClick={handleEditConfig}
          className="text-sm font-medium text-terracotta-600 hover:text-terracotta-700 border border-terracotta-300 rounded-lg px-3 py-1.5 hover:bg-terracotta-50 transition-colors cursor-pointer"
        >
          Edit Trip Configuration
        </button>
      )}
    </nav>
  );
}
