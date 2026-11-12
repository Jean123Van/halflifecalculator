// scripts/test-calculator.js
import { solveHalfLife, formatValue } from '../src/utils/calculator.js';

console.log('--- Testing Half-Life Calculator Math ---');

// Test 1: More than two fields empty (3 empty)
const t1 = solveHalfLife({ n0Str: '100', ntStr: '', tStr: '', thStr: '' });
console.log('Test 1 (3 empty):', t1.success === false && t1.emptyCount === 3 ? 'PASS' : 'FAIL', t1.error);

// Test 2: More than two fields empty (4 empty)
const t2 = solveHalfLife({ n0Str: '', ntStr: '', tStr: '', thStr: '' });
console.log('Test 2 (4 empty):', t2.success === false && t2.emptyCount === 4 ? 'PASS' : 'FAIL', t2.error);

// Test 3: Solve for Nt (Remaining) with Carbon-14: N0=100, t=5730, th=5730 (1 half-life -> should be 50)
const t3 = solveHalfLife({ n0Str: '100', ntStr: '', tStr: '5730', thStr: '5730', tUnit: 'yr', thUnit: 'yr' });
console.log('Test 3 (Solve Nt):', t3.success && t3.solvedValue === 50 ? 'PASS' : 'FAIL', 'Nt =', t3.solvedValue);

// Test 4: Solve for N0 (Initial): Nt=25, t=11460, th=5730 (2 half-lives -> should be 100)
const t4 = solveHalfLife({ n0Str: '', ntStr: '25', tStr: '11460', thStr: '5730', tUnit: 'yr', thUnit: 'yr' });
console.log('Test 4 (Solve N0):', t4.success && Math.round(t4.solvedValue) === 100 ? 'PASS' : 'FAIL', 'N0 =', t4.solvedValue);

// Test 5: Solve for t (Elapsed Time): N0=100, Nt=12.5, th=5730 (3 half-lives -> 3 * 5730 = 17190)
const t5 = solveHalfLife({ n0Str: '100', ntStr: '12.5', tStr: '', thStr: '5730', tUnit: 'yr', thUnit: 'yr' });
console.log('Test 5 (Solve t):', t5.success && Math.round(t5.solvedValue) === 17190 ? 'PASS' : 'FAIL', 't =', t5.solvedValue);

// Test 6: Solve for th (Half-life): N0=100, Nt=50, t=24, tUnit='h', thUnit='h' -> should be 24
const t6 = solveHalfLife({ n0Str: '100', ntStr: '50', tStr: '24', thStr: '', tUnit: 'h', thUnit: 'h' });
console.log('Test 6 (Solve th):', t6.success && Math.round(t6.solvedValue) === 24 ? 'PASS' : 'FAIL', 'th =', t6.solvedValue);

// Test 7: Unit conversion: t in days (365.25 d), th in years (1 yr), N0=100 -> Nt=50
const t7 = solveHalfLife({ n0Str: '100', ntStr: '', tStr: '365.25', thStr: '1', tUnit: 'd', thUnit: 'yr' });
console.log('Test 7 (Units convert):', t7.success && Math.round(t7.solvedValue) === 50 ? 'PASS' : 'FAIL', 'Nt =', t7.solvedValue);

// Test 8: 2 fields empty (Nt and N0 empty, t and th known)
const t8 = solveHalfLife({ n0Str: '', ntStr: '', tStr: '2', thStr: '1', tUnit: 'h', thUnit: 'h' });
console.log('Test 8 (2 empty - t & th known):', t8.success && t8.type === 'partial_ratio' && t8.details.percentRemaining === 25 ? 'PASS' : 'FAIL', t8.summary);

console.log('--- All math tests executed ---');
