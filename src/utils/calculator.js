// src/utils/calculator.js

// Conversion multipliers to seconds for time units
export const TIME_UNITS = [
  { label: 'Seconds (s)', value: 's', multiplier: 1 },
  { label: 'Minutes (min)', value: 'min', multiplier: 60 },
  { label: 'Hours (h)', value: 'h', multiplier: 3600 },
  { label: 'Days (d)', value: 'd', multiplier: 86400 },
  { label: 'Years (yr)', value: 'yr', multiplier: 31557600 }, // 365.25 days
];

export const QUANTITY_UNITS = [
  { label: 'Grams (g)', value: 'g' },
  { label: 'Milligrams (mg)', value: 'mg' },
  { label: 'Micrograms (µg)', value: 'µg' },
  { label: 'Kilograms (kg)', value: 'kg' },
  { label: 'Percent (%)', value: '%' },
  { label: 'Moles (mol)', value: 'mol' },
  { label: 'Atoms / Nuclei', value: 'atoms' },
  { label: 'Counts / Bq', value: 'Bq' },
];

export const PRESET_ISOTOPES = [
  { name: 'Carbon-14 (¹⁴C)', halfLife: '5730', unit: 'yr', desc: 'Radiocarbon dating' },
  { name: 'Iodine-131 (¹³¹I)', halfLife: '8.02', unit: 'd', desc: 'Thyroid medicine' },
  { name: 'Technetium-99m (⁹⁹ᵐTc)', halfLife: '6.01', unit: 'h', desc: 'Medical imaging' },
  { name: 'Cesium-137 (¹³⁷Cs)', halfLife: '30.17', unit: 'yr', desc: 'Nuclear fission tracer' },
  { name: 'Cobalt-60 (⁶⁰Co)', halfLife: '5.27', unit: 'yr', desc: 'Industrial radiography' },
  { name: 'Radon-222 (²²²Rn)', halfLife: '3.82', unit: 'd', desc: 'Environmental noble gas' },
  { name: 'Uranium-238 (²³⁸U)', halfLife: '4468000000', unit: 'yr', desc: 'Geological dating' },
];

/**
 * Format a number cleanly:
 * Use scientific notation if very large or very small, otherwise up to 6 decimal places.
 */
export function formatValue(num) {
  if (num === null || num === undefined || isNaN(num)) return '';
  if (num === 0) return '0';
  const abs = Math.abs(num);
  if (abs >= 1e9 || (abs < 1e-4 && abs > 0)) {
    return num.toExponential(4);
  }
  // Trim trailing zeroes for clean reading
  const fixed = num.toFixed(6);
  return parseFloat(fixed).toString();
}

/**
 * Helper to convert a time value from one unit to another
 */
export function convertTime(val, fromUnit, toUnit) {
  const from = TIME_UNITS.find((u) => u.value === fromUnit)?.multiplier || 1;
  const to = TIME_UNITS.find((u) => u.value === toUnit)?.multiplier || 1;
  return (val * from) / to;
}

/**
 * Solves the half-life equation: N(t) = N0 * (1/2)^(t / t_half)
 *
 * Parameters passed in:
 * - n0Str: Initial Quantity (N₀)
 * - ntStr: Remaining Quantity (Nₜ)
 * - tStr: Elapsed Time (t)
 * - tUnit: Time unit ('s', 'min', 'h', 'd', 'yr')
 * - thStr: Half-Life (t₁/₂)
 * - thUnit: Half-life unit ('s', 'min', 'h', 'd', 'yr')
 * - quantityUnit: string ('g', 'mg', '%', etc.)
 */
export function solveHalfLife({
  n0Str,
  ntStr,
  tStr,
  tUnit = 'yr',
  thStr,
  thUnit = 'yr',
  quantityUnit = 'g',
}) {
  const hasN0 = n0Str.trim() !== '';
  const hasNt = ntStr.trim() !== '';
  const hasT = tStr.trim() !== '';
  const hasTh = thStr.trim() !== '';

  const emptyFields = [];
  if (!hasN0) emptyFields.push('n0');
  if (!hasNt) emptyFields.push('nt');
  if (!hasT) emptyFields.push('t');
  if (!hasTh) emptyFields.push('th');

  const emptyCount = emptyFields.length;

  // RULE 1: If more than two fields are left empty, show an error.
  if (emptyCount > 2) {
    return {
      success: false,
      error: `Error: ${emptyCount} fields are left empty! More than two fields are empty. Please fill in at least 2 or 3 parameters so the half-life equation can be solved.`,
      emptyCount,
      emptyFields,
    };
  }

  // Parse numbers
  const n0 = hasN0 ? parseFloat(n0Str) : null;
  const nt = hasNt ? parseFloat(ntStr) : null;
  const t = hasT ? parseFloat(tStr) : null;
  const th = hasTh ? parseFloat(thStr) : null;

  // Validate non-negative numbers
  if (hasN0 && (isNaN(n0) || n0 <= 0)) {
    return { success: false, error: 'Initial Quantity (N₀) must be a positive number greater than 0.' };
  }
  if (hasNt && (isNaN(nt) || nt <= 0)) {
    return { success: false, error: 'Remaining Quantity (Nₜ) must be a positive number greater than 0.' };
  }
  if (hasT && (isNaN(t) || t < 0)) {
    return { success: false, error: 'Elapsed Time (t) must be 0 or a positive number.' };
  }
  if (hasTh && (isNaN(th) || th <= 0)) {
    return { success: false, error: 'Half-Life (t₁/₂) must be a positive number greater than 0.' };
  }

  // Convert time units to common base (seconds) for accurate equation solving
  const tMultiplier = TIME_UNITS.find((u) => u.value === tUnit)?.multiplier || 1;
  const thMultiplier = TIME_UNITS.find((u) => u.value === thUnit)?.multiplier || 1;

  // CASE: EXACTLY TWO FIELDS EMPTY
  if (emptyCount === 2) {
    // Sub-case A: N0 and Nt are empty (both time values t and t_half are provided)
    if (!hasN0 && !hasNt) {
      const tInSeconds = t * tMultiplier;
      const thInSeconds = th * thMultiplier;
      const elapsedHalfLives = tInSeconds / thInSeconds;
      const fractionRemaining = Math.pow(0.5, elapsedHalfLives);
      const percentRemaining = fractionRemaining * 100;
      const percentDecayed = 100 - percentRemaining;

      const lambdaPerSec = Math.LN2 / thInSeconds;
      const lambdaInThUnit = Math.LN2 / th;

      return {
        success: true,
        type: 'partial_ratio',
        emptyCount: 2,
        solvedField: 'ratio',
        summary: `Solved Percentage & Half-Life Cycles: ${formatValue(percentRemaining)}% remaining`,
        steps: [
          `Elapsed Half-Lives: n = t / t₁/₂ = ${formatValue(tInSeconds)} s / ${formatValue(thInSeconds)} s = ${formatValue(elapsedHalfLives)} cycles`,
          `Fraction Remaining: Nₜ / N₀ = (1/2)ⁿ = (0.5)^${formatValue(elapsedHalfLives)} = ${formatValue(fractionRemaining)}`,
          `Percentage Remaining: ${formatValue(percentRemaining)}%`,
          `Percentage Decayed: ${formatValue(percentDecayed)}%`,
        ],
        details: {
          percentRemaining,
          percentDecayed,
          fractionRemaining,
          elapsedHalfLives,
          decayConstant: lambdaInThUnit,
          decayConstantUnit: `1/${thUnit}`,
        },
      };
    }

    // Sub-case B: t and th are empty (both quantity values N0 and Nt are provided)
    if (!hasT && !hasTh) {
      if (nt > n0) {
        return {
          success: false,
          error: 'Remaining Quantity (Nₜ) cannot be greater than Initial Quantity (N₀) for radioactive decay.',
        };
      }
      const elapsedHalfLives = Math.log(n0 / nt) / Math.LN2;
      const fractionRemaining = nt / n0;
      const percentRemaining = fractionRemaining * 100;
      const percentDecayed = 100 - percentRemaining;

      return {
        success: true,
        type: 'partial_cycles',
        emptyCount: 2,
        solvedField: 'cycles',
        summary: `Solved Half-Life Cycles: ${formatValue(elapsedHalfLives)} half-lives elapsed`,
        steps: [
          `Fraction Remaining: Nₜ / N₀ = ${formatValue(nt)} / ${formatValue(n0)} = ${formatValue(fractionRemaining)} (${formatValue(percentRemaining)}%)`,
          `Elapsed Half-Lives: n = ln(N₀ / Nₜ) / ln(2) = ln(${formatValue(n0 / nt)}) / 0.69315 = ${formatValue(elapsedHalfLives)} half-lives`,
          `Decayed Quantity: ${formatValue(n0 - nt)} ${quantityUnit} (${formatValue(percentDecayed)}%)`,
        ],
        details: {
          percentRemaining,
          percentDecayed,
          fractionRemaining,
          elapsedHalfLives,
        },
      };
    }

    // Any other 2-empty combination cannot be solved without more info
    const names = {
      n0: 'Initial Quantity (N₀)',
      nt: 'Remaining Quantity (Nₜ)',
      t: 'Elapsed Time (t)',
      th: 'Half-Life (t₁/₂)',
    };
    const missing = emptyFields.map((f) => names[f]).join(' and ');
    return {
      success: false,
      error: `Notice: 2 fields are left empty (${missing}). To solve for specific absolute values, please provide at least 3 parameters (leave only 1 field empty).`,
      emptyCount: 2,
    };
  }

  // CASE: 0 FIELDS EMPTY (All filled - Verify Consistency)
  if (emptyCount === 0) {
    const tInSeconds = t * tMultiplier;
    const thInSeconds = th * thMultiplier;
    const expectedNt = n0 * Math.pow(0.5, tInSeconds / thInSeconds);
    const diff = Math.abs(nt - expectedNt);
    const relDiff = expectedNt > 0 ? (diff / expectedNt) * 100 : 0;
    const isConsistent = relDiff < 0.5; // Within 0.5% tolerance

    const elapsedHalfLives = tInSeconds / thInSeconds;
    const percentRemaining = (nt / n0) * 100;
    const lambdaInThUnit = Math.LN2 / th;

    return {
      success: true,
      type: 'verification',
      emptyCount: 0,
      isConsistent,
      summary: isConsistent
        ? '✓ All fields are consistent with the half-life equation!'
        : `⚠️ Discrepancy detected: With N₀=${n0}, t=${t}${tUnit}, t₁/₂=${th}${thUnit}, the expected Nₜ is ${formatValue(expectedNt)} ${quantityUnit} (provided: ${nt} ${quantityUnit}).`,
      steps: [
        `Expected Nₜ = N₀ × (0.5)^(t / t₁/₂) = ${formatValue(n0)} × (0.5)^(${formatValue(tInSeconds)} / ${formatValue(thInSeconds)}) = ${formatValue(expectedNt)} ${quantityUnit}`,
        `Actual Nₜ provided: ${formatValue(nt)} ${quantityUnit}`,
        `Difference: ${formatValue(diff)} ${quantityUnit} (${formatValue(relDiff)}% deviation)`,
      ],
      details: {
        percentRemaining,
        percentDecayed: 100 - percentRemaining,
        elapsedHalfLives,
        decayConstant: lambdaInThUnit,
        decayConstantUnit: `1/${thUnit}`,
      },
    };
  }

  // CASE: EXACTLY ONE FIELD EMPTY (emptyCount === 1) -> SOLVE FOR IT
  const target = emptyFields[0];
  let solvedValue = 0;
  let formula = '';
  let steps = [];
  let solvedName = '';
  let solvedUnit = '';

  const tInSeconds = hasT ? t * tMultiplier : null;
  const thInSeconds = hasTh ? th * thMultiplier : null;

  if (target === 'nt') {
    // Solve for Remaining Quantity: Nₜ = N₀ * (1/2)^(t / t₁/₂)
    const n = tInSeconds / thInSeconds;
    solvedValue = n0 * Math.pow(0.5, n);
    solvedName = 'Remaining Quantity (Nₜ)';
    solvedUnit = quantityUnit;
    formula = 'Nₜ = N₀ × (1/2)^(t / t₁/₂)';
    steps = [
      `1. Convert times to common base: t = ${formatValue(tInSeconds)} s, t₁/₂ = ${formatValue(thInSeconds)} s`,
      `2. Calculate elapsed half-lives: n = t / t₁/₂ = ${formatValue(n)} cycles`,
      `3. Apply decay factor: (1/2)^${formatValue(n)} = ${formatValue(Math.pow(0.5, n))}`,
      `4. Multiply by initial quantity: Nₜ = ${formatValue(n0)} × ${formatValue(Math.pow(0.5, n))} = ${formatValue(solvedValue)} ${quantityUnit}`,
    ];
  } else if (target === 'n0') {
    // Solve for Initial Quantity: N₀ = Nₜ / (1/2)^(t / t₁/₂) = Nₜ * 2^(t / t₁/₂)
    const n = tInSeconds / thInSeconds;
    solvedValue = nt * Math.pow(2, n);
    solvedName = 'Initial Quantity (N₀)';
    solvedUnit = quantityUnit;
    formula = 'N₀ = Nₜ × 2^(t / t₁/₂)';
    steps = [
      `1. Convert times to common base: t = ${formatValue(tInSeconds)} s, t₁/₂ = ${formatValue(thInSeconds)} s`,
      `2. Calculate elapsed half-lives: n = t / t₁/₂ = ${formatValue(n)} cycles`,
      `3. Multiply remaining quantity by 2ⁿ: N₀ = ${formatValue(nt)} × 2^(${formatValue(n)}) = ${formatValue(solvedValue)} ${quantityUnit}`,
    ];
  } else if (target === 't') {
    // Solve for Elapsed Time: t = t₁/₂ * ln(N₀ / Nₜ) / ln(2)
    if (nt > n0) {
      return {
        success: false,
        error: 'Remaining Quantity (Nₜ) cannot be greater than Initial Quantity (N₀) for radioactive decay.',
      };
    }
    const ratio = n0 / nt;
    const n = Math.log(ratio) / Math.LN2;
    const tSeconds = thInSeconds * n;
    // Convert tSeconds to user's selected tUnit
    solvedValue = tSeconds / tMultiplier;
    solvedName = 'Elapsed Time (t)';
    solvedUnit = tUnit;
    formula = 't = t₁/₂ × [ln(N₀ / Nₜ) / ln(2)]';
    steps = [
      `1. Calculate initial to remaining ratio: N₀ / Nₜ = ${formatValue(n0)} / ${formatValue(nt)} = ${formatValue(ratio)}`,
      `2. Calculate number of elapsed half-lives: n = ln(${formatValue(ratio)}) / ln(2) = ${formatValue(n)} cycles`,
      `3. Multiply by half-life: t = ${formatValue(th)} ${thUnit} × ${formatValue(n)}`,
      `4. In selected unit: t = ${formatValue(solvedValue)} ${tUnit}`,
    ];
  } else if (target === 'th') {
    // Solve for Half-Life: t₁/₂ = t * ln(2) / ln(N₀ / Nₜ)
    if (nt >= n0) {
      return {
        success: false,
        error: 'For decay to occur, Remaining Quantity (Nₜ) must be strictly less than Initial Quantity (N₀) when time t > 0.',
      };
    }
    if (t === 0) {
      return {
        success: false,
        error: 'Elapsed time (t) cannot be 0 when calculating half-life.',
      };
    }
    const ratio = n0 / nt;
    const n = Math.log(ratio) / Math.LN2;
    const thSeconds = tInSeconds / n;
    // Convert thSeconds to user's selected thUnit
    solvedValue = thSeconds / thMultiplier;
    solvedName = 'Half-Life (t₁/₂)';
    solvedUnit = thUnit;
    formula = 't₁/₂ = t × ln(2) / ln(N₀ / Nₜ)';
    steps = [
      `1. Calculate ratio: N₀ / Nₜ = ${formatValue(n0)} / ${formatValue(nt)} = ${formatValue(ratio)}`,
      `2. Calculate half-lives passed: n = ln(${formatValue(ratio)}) / ln(2) = ${formatValue(n)}`,
      `3. Divide elapsed time by n: t₁/₂ = ${formatValue(t)} ${tUnit} / ${formatValue(n)}`,
      `4. In selected unit: t₁/₂ = ${formatValue(solvedValue)} ${thUnit}`,
    ];
  }

  // Derive extra physics metrics
  const effectiveN0 = target === 'n0' ? solvedValue : n0;
  const effectiveNt = target === 'nt' ? solvedValue : nt;
  const effectiveT = target === 't' ? solvedValue : t;
  const effectiveTh = target === 'th' ? solvedValue : th;

  const effTSeconds = effectiveT * tMultiplier;
  const effThSeconds = effectiveTh * thMultiplier;
  const elapsedHalfLives = effThSeconds > 0 ? effTSeconds / effThSeconds : 0;
  const percentRemaining = effectiveN0 > 0 ? (effectiveNt / effectiveN0) * 100 : 0;
  const percentDecayed = Math.max(0, 100 - percentRemaining);

  const lambdaInThUnit = effectiveTh > 0 ? Math.LN2 / effectiveTh : 0;
  const meanLifetime = lambdaInThUnit > 0 ? 1 / lambdaInThUnit : 0;

  return {
    success: true,
    type: 'single_solved',
    emptyCount: 1,
    targetField: target,
    solvedName,
    solvedValue,
    solvedValueFormatted: formatValue(solvedValue),
    solvedUnit,
    formula,
    steps,
    summary: `${solvedName} = ${formatValue(solvedValue)} ${solvedUnit}`,
    details: {
      percentRemaining: Math.min(100, Math.max(0, percentRemaining)),
      percentDecayed: Math.min(100, Math.max(0, percentDecayed)),
      elapsedHalfLives,
      decayConstant: lambdaInThUnit,
      decayConstantUnit: `1/${thUnit}`,
      meanLifetime,
      meanLifetimeUnit: thUnit,
    },
  };
}
