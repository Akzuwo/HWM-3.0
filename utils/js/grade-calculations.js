export const MIN_GRADE = 1;
export const MAX_GRADE = 6;

export function normalizeNumber(rawValue) {
  if (rawValue === null || rawValue === undefined) {
    return NaN;
  }
  const normalized = String(rawValue).trim().replace(/\s+/g, '').replace(/,/g, '.');
  if (!normalized) {
    return NaN;
  }
  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? NaN : parsed;
}

export function isValidGradeValue(value) {
  return Number.isFinite(value) && value >= MIN_GRADE && value <= MAX_GRADE;
}

export function isPositiveWeight(value) {
  return Number.isFinite(value) && value > 0;
}

export function roundToHalf(value) {
  if (!Number.isFinite(value)) {
    return null;
  }
  return Math.round(value * 2) / 2;
}

export function calculateSubjectAverage(subject) {
  const grades = Array.isArray(subject?.grades) ? subject.grades : [];
  const validGrades = grades.filter((grade) => {
    const value = Number(grade?.value);
    const weight = Number(grade?.weight);
    return isValidGradeValue(value) && isPositiveWeight(weight);
  });
  if (!validGrades.length) {
    return null;
  }
  const totalWeight = validGrades.reduce((sum, grade) => sum + Number(grade.weight), 0);
  if (!isPositiveWeight(totalWeight)) {
    return null;
  }
  const weightedSum = validGrades.reduce((sum, grade) => sum + Number(grade.value) * Number(grade.weight), 0);
  return weightedSum / totalWeight;
}

export function calculateDeficitPoints(roundedAverage) {
  if (!Number.isFinite(roundedAverage)) {
    return 0;
  }
  return Math.max(0, 4.0 - roundedAverage);
}

export function getSubjectSummary(subject) {
  const exactAverage = calculateSubjectAverage(subject);
  const roundedAverage = exactAverage === null ? null : roundToHalf(exactAverage);
  return {
    id: subject?.id,
    name: subject?.name || '',
    shortName: subject?.shortName || '',
    gradeCount: Array.isArray(subject?.grades) ? subject.grades.length : 0,
    exactAverage,
    roundedAverage,
    deficitPoints: roundedAverage === null ? 0 : calculateDeficitPoints(roundedAverage),
  };
}

export function getSubjectsWithAverages(subjects) {
  return (Array.isArray(subjects) ? subjects : [])
    .map(getSubjectSummary)
    .filter((summary) => summary.exactAverage !== null);
}

export function calculateOverallExactAverage(subjects) {
  const summaries = getSubjectsWithAverages(subjects);
  if (!summaries.length) {
    return null;
  }
  return summaries.reduce((sum, item) => sum + item.exactAverage, 0) / summaries.length;
}

export function calculateOverallRoundedAverage(subjects) {
  const summaries = getSubjectsWithAverages(subjects);
  if (!summaries.length) {
    return null;
  }
  return summaries.reduce((sum, item) => sum + item.roundedAverage, 0) / summaries.length;
}

export function calculateTotalDeficitPoints(subjects) {
  return getSubjectsWithAverages(subjects).reduce((sum, item) => sum + item.deficitPoints, 0);
}

export function createOverallSummary(subjects) {
  const summaries = getSubjectsWithAverages(subjects);
  return {
    subjectsWithGrades: summaries.length,
    exactAverage: calculateOverallExactAverage(subjects),
    roundedAverage: calculateOverallRoundedAverage(subjects),
    deficitPoints: calculateTotalDeficitPoints(subjects),
  };
}
