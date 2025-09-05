// server/src/services/nutrition.calc.js
export function nutrientsFromGrams(n100, grams) {
  const factor = grams / 100;
  return {
    calories: +(n100.calories * factor).toFixed(2),
    protein:  +(n100.protein  * factor).toFixed(2),
    carbs:    +(n100.carbs    * factor).toFixed(2),
    fat:      +(n100.fat      * factor).toFixed(2),
    fiber:    +(n100.fiber    * factor).toFixed(2),
  };
}

// Normalize to start-of-day (Asia/Kolkata) to avoid TZ bugs
export function startEndOfLocalDay(dateStrOrDate, tzOffsetMinutes = 330 /* +05:30 */) {
  const d = new Date(dateStrOrDate);
  const utc = d.getTime();
  const local = utc + tzOffsetMinutes * 60 * 1000;

  const startLocal = new Date(Math.floor(local / 86400000) * 86400000);
  const endLocal = new Date(startLocal.getTime() + 86400000);

  // convert back to UTC
  const startUTC = new Date(startLocal.getTime() - tzOffsetMinutes * 60 * 1000);
  const endUTC   = new Date(endLocal.getTime() - tzOffsetMinutes * 60 * 1000);

  return { startUTC, endUTC };
}
