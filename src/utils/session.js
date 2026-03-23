export function persistSession(state) {
  try {
    sessionStorage.setItem('trippy_profile', JSON.stringify(state.userProfile));
    sessionStorage.setItem('trippy_trip', JSON.stringify(state.currentTrip));
  } catch (e) {
    // sessionStorage unavailable — continue without persistence
  }
}

export function restoreSession() {
  try {
    const profile = sessionStorage.getItem('trippy_profile');
    const trip = sessionStorage.getItem('trippy_trip');
    return {
      userProfile: profile ? JSON.parse(profile) : null,
      currentTrip: trip ? JSON.parse(trip) : null,
    };
  } catch (e) {
    return { userProfile: null, currentTrip: null };
  }
}
