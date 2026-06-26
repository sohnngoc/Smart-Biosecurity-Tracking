export type InputType = 'score_1_5' | 'checklist_status';

export interface Criteria {
  id: string;
  weight: number;
  input_type: InputType;
  is_mandatory?: boolean;
}

export interface Answer {
  criteria_id: string;
  score?: number | null; // 1-5
  checklist_status?: string | null; // 'Đạt' | 'Chưa đạt' | 'Không đạt'
  is_na?: boolean;
}

export interface AnswerWithCriteria extends Answer {
  criteria: Criteria;
}

export function calculateCriterionScore(criteria: Criteria, answer: Answer): { excluded: boolean; convertedScore: number } {
  if (answer.is_na) {
    return { excluded: true, convertedScore: 0 };
  }

  let mappedScore = 0;

  if (criteria.input_type === 'score_1_5') {
    if (typeof answer.score === 'number' && answer.score >= 1 && answer.score <= 5) {
      mappedScore = answer.score;
    }
  } else if (criteria.input_type === 'checklist_status') {
    switch (answer.checklist_status) {
      case 'Đạt': mappedScore = 5; break;
      case 'Chưa đạt': mappedScore = 3; break;
      case 'Không đạt': mappedScore = 1; break;
    }
  }

  const convertedScore = (criteria.weight * mappedScore) / 5;
  
  return {
    excluded: false,
    convertedScore: Number(convertedScore.toFixed(2))
  };
}

export function calculateRiskLevel(scorePercent: number): string {
  if (scorePercent > 90) return 'An toàn';
  if (scorePercent >= 80) return 'Cần chú ý';
  if (scorePercent >= 70) return 'Rủi ro';
  return 'Rủi ro cao';
}

export function calculateFormScore(answers: AnswerWithCriteria[]): { totalWeight: number; totalConvertedScore: number; scorePercent: number; riskLevel: string } {
  let totalWeight = 0;
  let totalConvertedScore = 0;

  answers.forEach(ans => {
    const { excluded, convertedScore } = calculateCriterionScore(ans.criteria, ans);
    if (!excluded) {
      totalWeight += ans.criteria.weight;
      totalConvertedScore += convertedScore;
    }
  });

  let scorePercent = 0;
  let riskLevel = 'Chưa đánh giá';

  if (totalWeight > 0) {
    scorePercent = Number(((totalConvertedScore / totalWeight) * 100).toFixed(2));
    riskLevel = calculateRiskLevel(scorePercent);
  }

  return {
    totalWeight: Number(totalWeight.toFixed(2)),
    totalConvertedScore: Number(totalConvertedScore.toFixed(2)),
    scorePercent,
    riskLevel
  };
}

export function calculateOverallFarmAssessment(hwScore: number | null, swScore: number | null, clScore: number | null): { overallScore: number; overallRisk: string } {
  const scores: number[] = [];
  if (hwScore !== null && hwScore > 0) scores.push(hwScore);
  if (swScore !== null && swScore > 0) scores.push(swScore);
  if (clScore !== null && clScore > 0) scores.push(clScore);

  if (scores.length === 0) {
    return { overallScore: 0, overallRisk: 'Chưa đánh giá' };
  }

  const overallScore = Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
  return {
    overallScore,
    overallRisk: calculateRiskLevel(overallScore)
  };
}
