import {
  PERSONALITY_TYPES,
  DISTORTION_INFOS,
  FATIGUE_LEVEL_INFOS,
  PersonalityTypeInfo,
  DistortionInfo,
  FatigueLevelInfo,
} from './analytics';

export type Letter = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
export type Axis = 'EI' | 'SN' | 'TF' | 'JP';

export type DistortionId =
  | 'all-or-nothing'
  | 'overgeneralization'
  | 'should'
  | 'mind-reading'
  | 'personalization'
  | 'mental_filter'
  | 'catastrophizing';

export type DistortionType =
  | DistortionId
  | 'all_or_nothing'
  | 'should_statements'
  | 'mind_reading'
  | 'mental_filter'
  | 'catastrophizing';

export type Dimension = Axis | 'fatigue' | DistortionId;

export interface Question {
  id?: number;
  text: string;
  dim: Dimension;
  pole?: Letter;
  block?: number;
  category?: 'MBTI' | 'FATIGUE' | 'DISTORTION';
  axis?: Axis;
  direction?: 'positive' | 'negative';
  distortionType?: DistortionType;
}

export type Answers = Record<number | string, number>;

export interface SingleAxisResult {
  scoreA: number; // E, S, T, J
  scoreB: number; // I, N, F, P
  labelA: string;
  labelB: string;
  primary: string;
  percentageA: number;
  percentageB: number;
  strength: number; // 主要側の比率 (50〜100)
}

export interface AxesResult {
  EI: SingleAxisResult;
  SN: SingleAxisResult;
  TF: SingleAxisResult;
  JP: SingleAxisResult;
}

export interface FatigueResult {
  level: 1 | 2 | 3 | 4 | 5;
  score: number;
  maxScore: number;
  percentage: number;
  status: string;
  title: string;
  message: string;
  careAdvice: string[];
}

export interface DistortionScoreItem {
  type: DistortionId;
  name: string;
  shortName: string;
  headline: string;
  score: number;
  maxScore: number;
  percentage: number;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
  catchphrase: string;
  reframingQuestion: string;
  actionTip: string;
}

export interface PersonalityResult {
  type: string;
  info: PersonalityTypeInfo;
  title: string;
  catchphrase: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  stressSignals: string[];
  growthAdvice: string;
  axes: AxesResult;
  fatigue: FatigueResult;
  distortions: DistortionScoreItem[];
  topDistortions: DistortionScoreItem[];
}

/**
 * ユーザーの100問回答データからMBTI 16タイプ、メンタル疲弊度、認知の歪みを総合判定する
 */
export function calculatePersonality(
  questions: Question[],
  answers: Answers
): PersonalityResult {
  // 1. MBTI 4軸の集計
  const axisCounts: Record<Axis, { pos: number; neg: number; count: number }> = {
    EI: { pos: 0, neg: 0, count: 0 },
    SN: { pos: 0, neg: 0, count: 0 },
    TF: { pos: 0, neg: 0, count: 0 },
    JP: { pos: 0, neg: 0, count: 0 },
  };

  // 2. 疲弊度の集計
  let fatigueScore = 0;
  let fatigueCount = 0;

  // 3. 認知の歪みの集計
  const distortionScores: Record<DistortionId, { sum: number; count: number }> = {
    'all-or-nothing': { sum: 0, count: 0 },
    'overgeneralization': { sum: 0, count: 0 },
    'should': { sum: 0, count: 0 },
    'mind-reading': { sum: 0, count: 0 },
    'personalization': { sum: 0, count: 0 },
    'mental_filter': { sum: 0, count: 0 },
    'catastrophizing': { sum: 0, count: 0 },
  };

  // 質問ごとにスコアを加算
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const rawVal =
      (q.id !== undefined ? answers[q.id] : undefined) ??
      answers[i + 1] ??
      answers[i] ??
      3; // 1〜5スケール、未回答は3（中立）
    const val = Math.min(5, Math.max(1, rawVal));

    // 新フォーマット (dim & pole)
    if (q.dim === 'EI' || q.dim === 'SN' || q.dim === 'TF' || q.dim === 'JP') {
      const axKey = q.dim as Axis;
      const ax = axisCounts[axKey];
      ax.count++;
      const positivePole = axKey[0] as Letter;
      if (q.pole === positivePole) {
        ax.pos += val;
        ax.neg += 6 - val;
      } else {
        ax.neg += val;
        ax.pos += 6 - val;
      }
    } else if (q.dim === 'fatigue') {
      fatigueScore += val;
      fatigueCount++;
    } else if (
      q.dim === 'all-or-nothing' ||
      q.dim === 'overgeneralization' ||
      q.dim === 'should' ||
      q.dim === 'mind-reading' ||
      q.dim === 'personalization' ||
      q.dim === 'mental_filter' ||
      q.dim === 'catastrophizing'
    ) {
      const dist = distortionScores[q.dim as DistortionId];
      if (dist) {
        dist.sum += val;
        dist.count++;
      }
    }
    // 旧フォーマット (category & axis / distortionType) のフォールバック
    else if (q.category === 'MBTI' && q.axis) {
      const ax = axisCounts[q.axis];
      ax.count++;
      if (q.direction === 'positive') {
        ax.pos += val;
        ax.neg += 6 - val;
      } else {
        ax.neg += val;
        ax.pos += 6 - val;
      }
    } else if (q.category === 'FATIGUE') {
      fatigueScore += val;
      fatigueCount++;
    } else if (q.category === 'DISTORTION' && q.distortionType) {
      const dKey = (
        q.distortionType === 'all_or_nothing'
          ? 'all-or-nothing'
          : q.distortionType === 'should_statements'
          ? 'should'
          : q.distortionType === 'mind_reading'
          ? 'mind-reading'
          : q.distortionType
      ) as DistortionId;
      if (distortionScores[dKey]) {
        distortionScores[dKey].sum += val;
        distortionScores[dKey].count++;
      }
    }
  }

  // --- MBTI 判定 ---
  const calcSingleAxis = (
    axisKey: Axis,
    labelA: string,
    labelB: string
  ): SingleAxisResult => {
    const data = axisCounts[axisKey];
    const total = data.pos + data.neg || 1;
    const percentageA = Math.round((data.pos / total) * 100);
    const percentageB = 100 - percentageA;
    const isA = data.pos >= data.neg;

    return {
      scoreA: data.pos,
      scoreB: data.neg,
      labelA,
      labelB,
      primary: isA ? labelA : labelB,
      percentageA,
      percentageB,
      strength: Math.max(percentageA, percentageB),
    };
  };

  const axes: AxesResult = {
    EI: calcSingleAxis('EI', 'E', 'I'),
    SN: calcSingleAxis('SN', 'S', 'N'),
    TF: calcSingleAxis('TF', 'T', 'F'),
    JP: calcSingleAxis('JP', 'J', 'P'),
  };

  const calculatedType = `${axes.EI.primary}${axes.SN.primary}${axes.TF.primary}${axes.JP.primary}`;
  const typeInfo = PERSONALITY_TYPES[calculatedType] || PERSONALITY_TYPES.INFP;

  // --- 疲弊度 (FATIGUE) 判定 ---
  const fCount = fatigueCount || 16;
  const maxFatigue = fCount * 5;
  const minFatigue = fCount * 1;
  const fatiguePercentage = Math.round(
    ((fatigueScore - minFatigue) / (maxFatigue - minFatigue || 1)) * 100
  );

  let fatigueLevel: 1 | 2 | 3 | 4 | 5 = 1;
  if (fatiguePercentage >= 80) fatigueLevel = 5;
  else if (fatiguePercentage >= 60) fatigueLevel = 4;
  else if (fatiguePercentage >= 40) fatigueLevel = 3;
  else if (fatiguePercentage >= 20) fatigueLevel = 2;
  else fatigueLevel = 1;

  const fatigueInfo: FatigueLevelInfo = FATIGUE_LEVEL_INFOS[fatigueLevel];
  const fatigue: FatigueResult = {
    level: fatigueLevel,
    score: fatigueScore,
    maxScore: maxFatigue,
    percentage: Math.min(100, Math.max(0, fatiguePercentage)),
    status: fatigueInfo.statusLabel,
    title: fatigueInfo.title,
    message: fatigueInfo.message,
    careAdvice: fatigueInfo.careAdvice,
  };

  // --- 認知の歪み (DISTORTION) 判定 (7パターン) ---
  const distortionKeys: DistortionId[] = [
    'all-or-nothing',
    'overgeneralization',
    'should',
    'mind-reading',
    'personalization',
    'mental_filter',
    'catastrophizing',
  ];

  // 質問に直接含まれていない項目の相関推定（カウントが0の場合）
  const baseAvg =
    (distortionScores['all-or-nothing'].sum +
      distortionScores['overgeneralization'].sum +
      distortionScores['should'].sum) /
      Math.max(
        1,
        distortionScores['all-or-nothing'].count +
          distortionScores['overgeneralization'].count +
          distortionScores['should'].count
      ) || 3;

  if (distortionScores['mental_filter'].count === 0) {
    const ovgAvg =
      distortionScores['overgeneralization'].count > 0
        ? distortionScores['overgeneralization'].sum /
          distortionScores['overgeneralization'].count
        : baseAvg;
    const estimatedVal = Math.round((ovgAvg * 0.7 + (fatiguePercentage / 25 + 1) * 0.3) * 4);
    distortionScores['mental_filter'] = { sum: estimatedVal, count: 4 };
  }

  if (distortionScores['catastrophizing'].count === 0) {
    const aonAvg =
      distortionScores['all-or-nothing'].count > 0
        ? distortionScores['all-or-nothing'].sum /
          distortionScores['all-or-nothing'].count
        : baseAvg;
    const estimatedVal = Math.round((aonAvg * 0.6 + baseAvg * 0.4) * 4);
    distortionScores['catastrophizing'] = { sum: estimatedVal, count: 4 };
  }

  const distortions: DistortionScoreItem[] = distortionKeys.map((typeKey) => {
    const dData = distortionScores[typeKey];
    const count = dData.count || 4;
    const maxSc = count * 5;
    const minSc = count * 1;
    const pct = Math.round(
      ((dData.sum - minSc) / (maxSc - minSc || 1)) * 100
    );
    const meta = DISTORTION_INFOS[typeKey] ?? {
      type: typeKey,
      name: typeKey,
      shortName: typeKey,
      headline: '',
      explanation: '',
      catchphrase: '',
      reframingQuestion: '',
      actionTip: '',
    };

    let severity: 'low' | 'medium' | 'high' = 'low';
    if (pct >= 66) severity = 'high';
    else if (pct >= 36) severity = 'medium';

    return {
      type: typeKey,
      name: meta.name,
      shortName: meta.shortName,
      headline: meta.headline,
      score: dData.sum,
      maxScore: maxSc,
      percentage: Math.min(100, Math.max(0, pct)),
      severity,
      explanation: meta.explanation,
      catchphrase: meta.catchphrase,
      reframingQuestion: meta.reframingQuestion,
      actionTip: meta.actionTip,
    };
  });

  // スコア順にソート（最も顕著な歪みをトップに）
  const sortedDistortions = [...distortions].sort(
    (a, b) => b.percentage - a.percentage
  );

  return {
    type: calculatedType,
    info: typeInfo,
    title: typeInfo.name,
    catchphrase: typeInfo.catchphrase,
    description: typeInfo.description,
    strengths: typeInfo.strengths,
    weaknesses: typeInfo.weaknesses,
    stressSignals: typeInfo.stressSignals,
    growthAdvice: typeInfo.growthAdvice,
    axes,
    fatigue,
    distortions,
    topDistortions: sortedDistortions,
  };
}
