export type Axis = 'EI' | 'SN' | 'TF' | 'JP';

export type DistortionType =
  | 'all_or_nothing'      // 白黒思考 (0か100かの思考)
  | 'overgeneralization'  // 過度の一般化
  | 'mental_filter'       // 心のフィルター (ネガティブな側面に執着)
  | 'should_statements'   // 「〜すべき」思考
  | 'catastrophizing'     // 破局化思考 (最悪の事態を想定)
  | 'mind_reading'        // 心の読みすぎ (相手の考えを否定的に推測)
  | 'personalization';    // 個人化 (何でも自分のせいにする)

export type QuestionCategory = 'MBTI' | 'FATIGUE' | 'DISTORTION';

export interface Question {
  id: number;
  text: string;
  category: QuestionCategory;
  axis?: Axis;
  direction?: 'positive' | 'negative'; // positive: 軸の最初の文字寄り (E, S, T, J)
  distortionType?: DistortionType;
}

// 100問の設問データ
export const questions: Question[] = [
  // --- MBTI 4軸設問 (Q1 - Q60) ---
  // E (外向) vs I (内向) : Q1 - Q15
  { id: 1, text: "週末や休日は、人と会って過ごすことでエネルギーが回復する。", category: "MBTI", axis: "EI", direction: "positive" },
  { id: 2, text: "初対面の人ばかりの集まりでも、緊張せず自然に会話を楽しめる。", category: "MBTI", axis: "EI", direction: "positive" },
  { id: 3, text: "一人の時間を長く過ごすと、孤独感よりも充実感や安心感を覚える。", category: "MBTI", axis: "EI", direction: "negative" },
  { id: 4, text: "大勢でワイワイ盛り上がる場所より、静かなカフェや自宅が好きだ。", category: "MBTI", axis: "EI", direction: "negative" },
  { id: 5, text: "自分の考えや感情を、言葉にして他人に伝えるのが得意なほうだ。", category: "MBTI", axis: "EI", direction: "positive" },
  { id: 6, text: "考える前にまず口に出して話しながら思考を整理することが多い。", category: "MBTI", axis: "EI", direction: "positive" },
  { id: 7, text: "じっくり一人で熟考してからでないと、自分の意見を口にしにくい。", category: "MBTI", axis: "EI", direction: "negative" },
  { id: 8, text: "広い交友関係を持つことよりも、少数の深い信頼関係を重視する。", category: "MBTI", axis: "EI", direction: "negative" },
  { id: 9, text: "注目の中心になったり、グループの先頭に立ったりすることに抵抗がない。", category: "MBTI", axis: "EI", direction: "positive" },
  { id: 10, text: "長時間の会話やミーティングの後は、強い精神的疲労を感じる。", category: "MBTI", axis: "EI", direction: "negative" },
  { id: 11, text: "新しい環境やコミュニティに飛び込むことにワクワクする。", category: "MBTI", axis: "EI", direction: "positive" },
  { id: 12, text: "休日誰とも連絡を取らずに没頭できる趣味がある。", category: "MBTI", axis: "EI", direction: "negative" },
  { id: 13, text: "周囲の雑音や人の気配があっても、自分のペースを乱されにくい。", category: "MBTI", axis: "EI", direction: "positive" },
  { id: 14, text: "感情を表に出すより、心の中に留めておくことのほうが多い。", category: "MBTI", axis: "EI", direction: "negative" },
  { id: 15, text: "活気のある賑やかな環境のほうが意欲が湧いてくる。", category: "MBTI", axis: "EI", direction: "positive" },

  // S (感覚) vs N (直観) : Q16 - Q30
  { id: 16, text: "抽象的な理論や未来の可能性よりも、目の前にある具体的な事実を重視する。", category: "MBTI", axis: "SN", direction: "positive" },
  { id: 17, text: "物事を進める時は、過去の実績やこれまでの手順に従うのが安心だ。", category: "MBTI", axis: "SN", direction: "positive" },
  { id: 18, text: "「もし〜だったら」と空想したり、物事の背後にある意味を探求するのが好きだ。", category: "MBTI", axis: "SN", direction: "negative" },
  { id: 19, text: "直感やひらめきを信じて行動することがよくある。", category: "MBTI", axis: "SN", direction: "negative" },
  { id: 20, text: "五感（視覚・聴覚・触覚など）で感じられるリアルな体験に敏感だ。", category: "MBTI", axis: "SN", direction: "positive" },
  { id: 21, text: "細部の正確さやマニュアルの確認を疎かにしない。", category: "MBTI", axis: "SN", direction: "positive" },
  { id: 22, text: "全体の構想やビジョンを描くことのほうが、細部の詰めより得意だ。", category: "MBTI", axis: "SN", direction: "negative" },
  { id: 23, text: "比喩や隠喩を使った表現に惹かれやすく、言葉の行間を読むのが得意だ。", category: "MBTI", axis: "SN", direction: "negative" },
  { id: 24, text: "現実的で地に足のついたアドバイスをするほうだ。", category: "MBTI", axis: "SN", direction: "positive" },
  { id: 25, text: "ルーティンワークや定型業務をこなすことに苦痛を感じにくい。", category: "MBTI", axis: "SN", direction: "positive" },
  { id: 26, text: "前例のない全く新しいアイデアを生み出すことに情熱を感じる。", category: "MBTI", axis: "SN", direction: "negative" },
  { id: 27, text: "話の結論や本質を素早く察知し、先回りして考えることが多い。", category: "MBTI", axis: "SN", direction: "negative" },
  { id: 28, text: "曖昧な指示よりも、具体的で明確な指示を好む。", category: "MBTI", axis: "SN", direction: "positive" },
  { id: 29, text: "未来の社会の変化や哲学的な問いについて考えるのが好きだ。", category: "MBTI", axis: "SN", direction: "negative" },
  { id: 30, text: "今この瞬間をしっかりと楽しむことができる。", category: "MBTI", axis: "SN", direction: "positive" },

  // T (思考) vs F (感情) : Q31 - Q45
  { id: 31, text: "重要な判断を下す時は、感情よりも論理や合理性を最優先する。", category: "MBTI", axis: "TF", direction: "positive" },
  { id: 32, text: "他人の感情に流されず、客観的で公平な視点を保てる。", category: "MBTI", axis: "TF", direction: "positive" },
  { id: 33, text: "誰かが落ち込んでいると、その人の気持ちに共感して自分も胸が痛む。", category: "MBTI", axis: "TF", direction: "negative" },
  { id: 34, text: "対立を避けて、場の調和や人間関係の心地よさを大切にする。", category: "MBTI", axis: "TF", direction: "negative" },
  { id: 35, text: "正論を言うことが、相手のためになると考えることが多い。", category: "MBTI", axis: "TF", direction: "positive" },
  { id: 36, text: "効率や成果を上げることに対して強いやりがいを感じる。", category: "MBTI", axis: "TF", direction: "positive" },
  { id: 37, text: "相手の言葉の内容だけでなく、その背景にある気持ちに寄り添いたい。", category: "MBTI", axis: "TF", direction: "negative" },
  { id: 38, text: "他人に厳しいフィードバックを伝えるのは心が痛んで苦手だ。", category: "MBTI", axis: "TF", direction: "negative" },
  { id: 39, text: "議論やディベートで論理的に矛盾を指摘することが苦にならない。", category: "MBTI", axis: "TF", direction: "positive" },
  { id: 40, text: "人のモチベーションや温かい感謝の言葉に深く動かされる。", category: "MBTI", axis: "TF", direction: "negative" },
  { id: 41, text: "問題が起きた時、まず原因分析と解決策の立案に頭が働く。", category: "MBTI", axis: "TF", direction: "positive" },
  { id: 42, text: "人との関わりにおいて「誠実さ」や「思いやり」を最も重んじる。", category: "MBTI", axis: "TF", direction: "negative" },
  { id: 43, text: "物事を冷静・ドライに見つめる傾向がある。", category: "MBTI", axis: "TF", direction: "positive" },
  { id: 44, text: "映画や本、他人のエピソードに感情移入して涙ぐむことが多い。", category: "MBTI", axis: "TF", direction: "negative" },
  { id: 45, text: "情に流されずルールを守ることが組織にとって一番大切だと思う。", category: "MBTI", axis: "TF", direction: "positive" },

  // J (判断) vs P (知覚) : Q46 - Q60
  { id: 46, text: "旅行やプロジェクトは、事前に綿密なスケジュールを立てて臨みたい。", category: "MBTI", axis: "JP", direction: "positive" },
  { id: 47, text: "締め切りよりもずっと前にタスクを終わらせておくと心が落ち着く。", category: "MBTI", axis: "JP", direction: "positive" },
  { id: 48, text: "計画通りに進めるよりも、その場の流れや気分で柔軟に行動したい。", category: "MBTI", axis: "JP", direction: "negative" },
  { id: 49, text: "締め切り直前のプレッシャーがあったほうが集中力を発揮できる。", category: "MBTI", axis: "JP", direction: "negative" },
  { id: 50, text: "身の回りの整理整頓やToDoリストの管理が得意だ。", category: "MBTI", axis: "JP", direction: "positive" },
  { id: 51, text: "予定が急に変更になると、ストレスを感じやすい。", category: "MBTI", axis: "JP", direction: "positive" },
  { id: 52, text: "物事の選択肢を最後までオープンにしておき、縛られたくない。", category: "MBTI", axis: "JP", direction: "negative" },
  { id: 53, text: "衝動買いや思いつきの小旅行などを楽しむタイプだ。", category: "MBTI", axis: "JP", direction: "negative" },
  { id: 54, text: "白黒はっきり決着をつけて、次の段階へ進みたい。", category: "MBTI", axis: "JP", direction: "positive" },
  { id: 55, text: "予想外のアクシデントが起きても、臨機応変に対応できる。", category: "MBTI", axis: "JP", direction: "negative" },
  { id: 56, text: "規則や約束事をしっかり守ることにプライドを持っている。", category: "MBTI", axis: "JP", direction: "positive" },
  { id: 57, text: "仕事や作業をするとき、同時並行でいろいろなことに手をつけがちだ。", category: "MBTI", axis: "JP", direction: "negative" },
  { id: 58, text: "一日の始まりに今日の予定を把握していないと落ち着かない。", category: "MBTI", axis: "JP", direction: "positive" },
  { id: 59, text: "ルールに厳格に縛られると息苦しさを感じる。", category: "MBTI", axis: "JP", direction: "negative" },
  { id: 60, text: "物事を完了させたときのチェックマークを付ける瞬間が快感だ。", category: "MBTI", axis: "JP", direction: "positive" },

  // --- メンタル疲弊度設問 (Q61 - Q75) ---
  { id: 61, text: "朝起きた瞬間から体が重く、十分な休養感が得られていない。", category: "FATIGUE" },
  { id: 62, text: "普段なら気にならないような些細なことでイライラしてしまう。", category: "FATIGUE" },
  { id: 63, text: "趣味や好きなことに対しても、以前ほど意欲や楽しさを感じられない。", category: "FATIGUE" },
  { id: 64, text: "集中力が続かず、物忘れや凡ミスが増えたように感じる。", category: "FATIGUE" },
  { id: 65, text: "人からの連絡やメッセージに返信するのが億劫で放置してしまう。", category: "FATIGUE" },
  { id: 66, text: "頭痛、肩こり、胃の不快感など身体的なサインが頻繁に出ている。", category: "FATIGUE" },
  { id: 67, text: "夜ベッドに入っても仕事や明日の心配事が頭から離れず眠りが浅い。", category: "FATIGUE" },
  { id: 68, text: "「早くこの場から逃げ出したい」「どこか遠くへ行きたい」と思うことがある。", category: "FATIGUE" },
  { id: 69, text: "感情の浮き沈みが激しく、急に涙が出そうになることがある。", category: "FATIGUE" },
  { id: 70, text: "食欲が著しく落ちた、またはストレスで過食気味になっている。", category: "FATIGUE" },
  { id: 71, text: "休みの日に横になっていても、頭が休まっていない感覚がある。", category: "FATIGUE" },
  { id: 72, text: "誰かに相談することさえエネルギーを使いすぎて諦めてしまう。", category: "FATIGUE" },
  { id: 73, text: "自分を責める言葉（「自分はダメだ」等）が頻繁に頭に浮かぶ。", category: "FATIGUE" },
  { id: 74, text: "人と会話するときに作り笑顔を保つのが非常に辛い。", category: "FATIGUE" },
  { id: 75, text: "将来に対して前向きな見通しを持つことが難しくなっている。", category: "FATIGUE" },

  // --- 認知の歪み設問 (Q76 - Q100) ---
  // 白黒思考 (All-or-Nothing) : Q76 - Q79
  { id: 76, text: "物事は「完全な成功」でなければ「完全な失敗」だと感じてしまう。", category: "DISTORTION", distortionType: "all_or_nothing" },
  { id: 77, text: "少しでもミスをすると、これまでの努力がすべて無駄になったように思う。", category: "DISTORTION", distortionType: "all_or_nothing" },
  { id: 78, text: "人に対して「味方か敵か」「良い人か悪い人か」と極端に二分しがちだ。", category: "DISTORTION", distortionType: "all_or_nothing" },
  { id: 79, text: "中途半端にやるくらいなら、最初から手を出さない方がマシだと思う。", category: "DISTORTION", distortionType: "all_or_nothing" },

  // 「〜すべき」思考 (Should Statements) : Q80 - Q84
  { id: 80, text: "「常に人に親切でなければならない」「弱音を吐いてはならない」と強く意識する。", category: "DISTORTION", distortionType: "should_statements" },
  { id: 81, text: "他人が自分の期待する常識的な行動をとらないと、強い苛立ちを覚える。", category: "DISTORTION", distortionType: "should_statements" },
  { id: 82, text: "予定通りに行動できない自分に対して強い罪悪感を抱く。", category: "DISTORTION", distortionType: "should_statements" },
  { id: 83, text: "「もっと努力しなければならない」と常に自分にプレッシャーをかけている。", category: "DISTORTION", distortionType: "should_statements" },
  { id: 84, text: "社会人や大人として「こうあるべき」という理想像に縛られ息苦しい。", category: "DISTORTION", distortionType: "should_statements" },

  // 過度の一般化 (Overgeneralization) : Q85 - Q88
  { id: 85, text: "一度うまくいかないと「次もどうせ失敗するに決まっている」と思う。", category: "DISTORTION", distortionType: "overgeneralization" },
  { id: 86, text: "「いつも私は損をする」「誰も私を理解してくれない」と感じることがある。", category: "DISTORTION", distortionType: "overgeneralization" },
  { id: 87, text: "一人の人から批判されただけで、全員から嫌われているように錯覚する。", category: "DISTORTION", distortionType: "overgeneralization" },
  { id: 88, text: "過去の苦い経験が、これからの未来にもそのまま繰り返される気がする。", category: "DISTORTION", distortionType: "overgeneralization" },

  // 心のフィルター (Mental Filter) : Q89 - Q92
  { id: 89, text: "たくさんの褒め言葉をもらっても、たった一つの否定的な意見が頭から離れない。", category: "DISTORTION", distortionType: "mental_filter" },
  { id: 90, text: "一日を振り返るとき、うまくいったことより失敗したことばかり思い出す。", category: "DISTORTION", distortionType: "mental_filter" },
  { id: 91, text: "良い出来事があっても「ただの偶然」「運が良かっただけ」と割り引いてしまう。", category: "DISTORTION", distortionType: "mental_filter" },
  { id: 92, text: "自分の短所や欠点ばかりが目につき、長所を素直に認められない。", category: "DISTORTION", distortionType: "mental_filter" },

  // 破局化思考 (Catastrophizing) : Q93 - Q96
  { id: 93, text: "小さなミスや問題が起きると、取り返しのつかない最悪の事態を想像してしまう。", category: "DISTORTION", distortionType: "catastrophizing" },
  { id: 94, text: "体調が少し悪いだけで、重篤な病気ではないかと過度に不安になる。", category: "DISTORTION", distortionType: "catastrophizing" },
  { id: 95, text: "未来の不確定なことに対して「絶対に悪い結果になる」と決めつけて怯える。", category: "DISTORTION", distortionType: "catastrophizing" },
  { id: 96, text: "心配事が起きると、パニックに近い恐怖感を感じることがある。", category: "DISTORTION", distortionType: "catastrophizing" },

  // 心の読みすぎ / 個人化 : Q97 - Q100
  { id: 97, text: "相手のちょっとした表情の曇りを見て「自分のせいで怒っている」と推測する。", category: "DISTORTION", distortionType: "mind_reading" },
  { id: 98, text: "返信が遅いと「嫌われたのではないか」「無視されているのではないか」と不安になる。", category: "DISTORTION", distortionType: "mind_reading" },
  { id: 99, text: "周囲の人の不機嫌やトラブルは、自分の配慮が足りないせいだと自分を責める。", category: "DISTORTION", distortionType: "personalization" },
  { id: 100, text: "自分が直接関与していないミスでも「自分の責任かもしれない」と感じてしまう。", category: "DISTORTION", distortionType: "personalization" },
];
