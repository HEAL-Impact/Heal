const configuredMinutes = Number(process.env.NEXT_PUBLIC_TAVUS_SESSION_MINUTES || 5);

// Use the same duration for the app timer and the Tavus conversation request.
export const TIME_LIMIT =
  (Number.isFinite(configuredMinutes) && configuredMinutes >= 2 && configuredMinutes <= 60
    ? configuredMinutes
    : 5) * 60;
