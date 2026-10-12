import { Question, Axis, DistortionType } from './questions';
import {
  PERSONALITY_TYPES,
  DISTORTION_INFOS,
  FATIGUE_LEVEL_INFOS,
  PersonalityTypeInfo,
  DistortionInfo,
  FatigueLevelInfo,
} from './analytics';

export type Answers = Record<number, number>;

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
  type: DistortionType;
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

  // 2. 疲弊度の集計 (Q61〜Q75)
  let fatigueScore = 0;
  let fatigueCount = 0;

  // 3. 認知の歪みの集計 (Q76〜Q100)
  const distortionScores: Record<DistortionType, { sum: number; count: number }> = {
    all_or_nothing: { sum: 0, count: 0 },
    should_statements: { sum: 0, count: 0 },
    overgeneralization: { sum: 0, count: 0 },
    mental_filter: { sum: 0, count: 0 },
    catastrophizing: { sum: 0, count: 0 },
    mind_reading: { sum: 0, count: 0 },
    personalization: { sum: 0, count: 0 },
  };

  // 質問ごとにスコアを加算
  for (const q of questions) {
    const rawVal = answers[q.id] ?? 3; // 1〜5スケール、未回答は3（中立）
    const val = Math.min(5, Math.max(1, rawVal));

    if (q.category === 'MBTI' && q.axis) {
      const ax = axisCounts[q.axis];
      ax.count++;
      if (q.direction === 'positive') {
        // positive側（E, S, T, J）寄り
        ax.pos += val;
        ax.neg += (6 - val);
      } else {
        // negative側（I, N, F, P）寄り
        ax.neg += val;
        ax.pos += (6 - val);
      }
    } else if (q.category === 'FATIGUE') {
      fatigueScore += val;
      fatigueCount++;
    } else if (q.category === 'DISTORTION' && q.distortionType) {
      const dist = distortionScores[q.distortionType];
      if (dist) {
        dist.sum += val;
        dist.count++;
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
  const maxFatigue = (fatigueCount || 15) * 5;
  const minFatigue = (fatigueCount || 15) * 1;
  const fatiguePercentage = Math.round(
    ((fatigueScore - minFatigue) / (maxFatigue - minFatigue || 1)) * 100
  );

  let fatigueLevel: 1 | 2 | 3 | 4 | 5 = 1;
  if (fatigueScore >= 64) fatigueLevel = 5;
  else if (fatigueScore >= 52) fatigueLevel = 4;
  else if (fatigueScore >= 40) fatigueLevel = 3;
  else if (fatigueScore >= 28) fatigueLevel = 2;
  else fatigueLevel = 1;

  const fatigueInfo: FatigueLevelInfo = FATIGUE_LEVEL_INFOS[fatigueLevel];
  const fatigue: FatigueResult = {
    level: fatigueLevel,
    score: fatigueScore,
    maxScore: maxFatigue,
    percentage: fatiguePercentage,
    status: fatigueInfo.statusLabel,
    title: fatigueInfo.title,
    message: fatigueInfo.message,
    careAdvice: fatigueInfo.careAdvice,
  };

  // --- 認知の歪み (DISTORTION) 判定 ---
  const distortions: DistortionScoreItem[] = Object.keys(distortionScores).map(
    (key) => {
      const typeKey = key as DistortionType;
      const dData = distortionScores[typeKey];
      const maxSc = (dData.count || 1) * 5;
      const minSc = (dData.count || 1) * 1;
      const pct = Math.round(
        ((dData.sum - minSc) / (maxSc - minSc || 1)) * 100
      );
      const meta = DISTORTION_INFOS[typeKey];

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
    }
  );

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
