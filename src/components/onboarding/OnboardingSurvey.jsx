import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import { sanitiseUserInput } from '../../utils/sanitise';
import {
  AGE_RANGES,
  TRAVEL_STYLES,
  PACE_OPTIONS,
  INTERESTS,
  DIETARY_REQUIREMENTS,
  BUDGET_TIERS,
} from '../../utils/constants';
import { getTripDays, validateDateRange } from '../../utils/dateUtils';
import StepIndicator from './StepIndicator';
import MultiSelect from './MultiSelect';
import DateRangePicker from './DateRangePicker';

const TOTAL_STEPS = 6;

export default function OnboardingSurvey() {
  const { state, dispatch } = useApp();
  const existing = state.userProfile;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: existing?.name || '',
    ageRange: existing?.ageRange || '',
    travelStyle: existing?.travelStyle || '',
    pace: existing?.pace || '',
    interests: existing?.interests || [],
    dietary: existing?.dietary || [],
    startDate: existing?.startDate || '',
    endDate: existing?.endDate || '',
    budgetTier: existing?.budgetTier ?? null,
    groupType: existing?.groupType || 'solo',
    groupSize: existing?.groupSize || 2,
  });
  const [errors, setErrors] = useState({});

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validateStep() {
    const newErrors = {};
    if (step === 1) {
      if (!form.name.trim()) newErrors.name = 'Please enter your name';
      if (!form.ageRange) newErrors.ageRange = 'Please select an age range';
    }
    if (step === 2) {
      if (!form.travelStyle) newErrors.travelStyle = 'Please select a travel style';
      if (!form.pace) newErrors.pace = 'Please select a pace';
    }
    if (step === 3) {
      if (form.interests.length === 0) newErrors.interests = 'Please select at least one interest';
    }
    if (step === 5) {
      const result = validateDateRange(form.startDate, form.endDate);
      if (!result.valid) newErrors.dates = result.error;
    }
    if (step === 6) {
      if (form.budgetTier === null) newErrors.budget = 'Please select a budget tier';
      if (form.groupType === 'group' && (!form.groupSize || form.groupSize < 2))
        newErrors.groupSize = 'Group size must be at least 2';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (!validateStep()) return;
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  function handleSubmit() {
    if (!validateStep()) return;
    const tripDays = getTripDays(form.startDate, form.endDate);
    const selectedBudget = BUDGET_TIERS[form.budgetTier];

    const profile = {
      name: sanitiseUserInput(form.name, 100),
      ageRange: form.ageRange,
      travelStyle: form.travelStyle,
      pace: form.pace,
      interests: form.interests,
      dietary: form.dietary.length === 0 ? ['None'] : form.dietary,
      startDate: form.startDate,
      endDate: form.endDate,
      dailyBudget: selectedBudget.midpoint,
      budgetLabel: selectedBudget.label,
      budgetTier: form.budgetTier,
      totalBudget: selectedBudget.midpoint * tripDays,
      tripDays,
      groupType: form.groupType,
      groupSize: form.groupType === 'solo' ? 1 : form.groupSize,
    };

    dispatch({ type: 'SET_PROFILE', payload: profile });
  }

  const tripDays = getTripDays(form.startDate, form.endDate);
  const selectedBudget = form.budgetTier !== null ? BUDGET_TIERS[form.budgetTier] : null;

  return (
    <div className="min-h-screen bg-warm-50 flex items-start justify-center pt-12 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-terracotta-500 mb-2">Welcome to Trippy</h1>
          <p className="text-warm-500">Let's get to know you so we can plan the perfect trip.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-warm-100 p-6">
          <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />

          {/* Step 1: Name + Age */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-warm-800">About You</h2>
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  maxLength={100}
                  placeholder="What should we call you?"
                  className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-terracotta-300"
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">Age Range</label>
                <div className="grid grid-cols-3 gap-2">
                  {AGE_RANGES.map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => update('ageRange', range)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                        form.ageRange === range
                          ? 'bg-terracotta-500 text-white border-terracotta-500'
                          : 'bg-white text-warm-700 border-warm-200 hover:border-terracotta-300'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
                {errors.ageRange && <p className="text-sm text-red-600 mt-1">{errors.ageRange}</p>}
              </div>
            </div>
          )}

          {/* Step 2: Travel Style + Pace */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-warm-800">Travel Style</h2>
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-2">How do you like to travel?</label>
                <div className="space-y-2">
                  {TRAVEL_STYLES.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => update('travelStyle', style)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                        form.travelStyle === style
                          ? 'bg-terracotta-500 text-white border-terracotta-500'
                          : 'bg-white text-warm-700 border-warm-200 hover:border-terracotta-300'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
                {errors.travelStyle && <p className="text-sm text-red-600 mt-1">{errors.travelStyle}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-2">What pace do you prefer?</label>
                <div className="space-y-2">
                  {PACE_OPTIONS.map((pace) => (
                    <button
                      key={pace}
                      type="button"
                      onClick={() => update('pace', pace)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                        form.pace === pace
                          ? 'bg-terracotta-500 text-white border-terracotta-500'
                          : 'bg-white text-warm-700 border-warm-200 hover:border-terracotta-300'
                      }`}
                    >
                      {pace}
                    </button>
                  ))}
                </div>
                {errors.pace && <p className="text-sm text-red-600 mt-1">{errors.pace}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-warm-800">Your Interests</h2>
              <p className="text-sm text-warm-500">Select all that excite you.</p>
              <MultiSelect
                options={INTERESTS}
                selected={form.interests}
                onChange={(val) => update('interests', val)}
              />
              {errors.interests && <p className="text-sm text-red-600 mt-1">{errors.interests}</p>}
            </div>
          )}

          {/* Step 4: Dietary */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-warm-800">Dietary Requirements</h2>
              <p className="text-sm text-warm-500">Select any that apply, or choose None.</p>
              <MultiSelect
                options={DIETARY_REQUIREMENTS}
                selected={form.dietary}
                onChange={(val) => update('dietary', val)}
              />
            </div>
          )}

          {/* Step 5: Dates */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-warm-800">Trip Dates</h2>
              <DateRangePicker
                startDate={form.startDate}
                endDate={form.endDate}
                onChange={({ startDate, endDate }) => {
                  update('startDate', startDate);
                  setForm((prev) => ({ ...prev, endDate }));
                  setErrors((prev) => ({ ...prev, dates: undefined }));
                }}
                errors={errors}
              />
            </div>
          )}

          {/* Step 6: Budget + Group */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-warm-800">Budget</h2>
                <p className="text-sm text-warm-500">Select your daily budget per person.</p>
                <div className="space-y-2">
                  {BUDGET_TIERS.map((tier, idx) => (
                    <button
                      key={tier.label}
                      type="button"
                      onClick={() => update('budgetTier', idx)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium border transition-colors cursor-pointer flex justify-between items-center ${
                        form.budgetTier === idx
                          ? 'bg-terracotta-500 text-white border-terracotta-500'
                          : 'bg-white text-warm-700 border-warm-200 hover:border-terracotta-300'
                      }`}
                    >
                      <span>{tier.label}</span>
                      <span className="opacity-70">${tier.midpoint}/day</span>
                    </button>
                  ))}
                </div>
                {errors.budget && <p className="text-sm text-red-600 mt-1">{errors.budget}</p>}

                {selectedBudget && tripDays > 0 && (
                  <div className="bg-terracotta-50 rounded-lg px-4 py-3">
                    <p className="text-sm text-terracotta-700">
                      Estimated total: <span className="font-semibold">${(selectedBudget.midpoint * tripDays).toLocaleString()}</span>
                      <span className="text-terracotta-500 ml-1">
                        (${selectedBudget.midpoint} × {tripDays} days)
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-warm-800">Travelling with others?</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => update('groupType', 'solo')}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                      form.groupType === 'solo'
                        ? 'bg-terracotta-500 text-white border-terracotta-500'
                        : 'bg-white text-warm-700 border-warm-200 hover:border-terracotta-300'
                    }`}
                  >
                    Solo
                  </button>
                  <button
                    type="button"
                    onClick={() => update('groupType', 'group')}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                      form.groupType === 'group'
                        ? 'bg-terracotta-500 text-white border-terracotta-500'
                        : 'bg-white text-warm-700 border-warm-200 hover:border-terracotta-300'
                    }`}
                  >
                    Group
                  </button>
                </div>
                {form.groupType === 'group' && (
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-1">Group Size</label>
                    <input
                      type="number"
                      min={2}
                      max={20}
                      value={form.groupSize}
                      onChange={(e) => update('groupSize', parseInt(e.target.value) || 2)}
                      className="w-24 border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-terracotta-300"
                    />
                    {errors.groupSize && <p className="text-sm text-red-600 mt-1">{errors.groupSize}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={handleBack}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                step === 1
                  ? 'invisible'
                  : 'text-warm-600 border border-warm-200 hover:bg-warm-100'
              }`}
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="bg-terracotta-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-terracotta-600 transition-colors cursor-pointer"
            >
              {step === TOTAL_STEPS ? 'Start Planning' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
