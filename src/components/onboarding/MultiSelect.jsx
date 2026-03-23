export default function MultiSelect({ options, selected, onChange, columns = 2 }) {
  function toggle(option) {
    if (option === 'None') {
      // Selecting "None" clears all others
      onChange(selected.includes('None') ? [] : ['None']);
      return;
    }
    // Selecting any other option removes "None"
    const withoutNone = selected.filter((s) => s !== 'None');
    if (withoutNone.includes(option)) {
      onChange(withoutNone.filter((s) => s !== option));
    } else {
      onChange([...withoutNone, option]);
    }
  }

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer text-left ${
              isSelected
                ? 'bg-sage-500 text-white border-sage-500'
                : 'bg-warm-50 text-warm-700 border-warm-200 hover:border-sage-300'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
