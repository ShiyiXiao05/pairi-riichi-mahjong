import { useEffect, useMemo, useState } from "react";

type TileName = string;

function TileFace({ name, label, className = "" }: { name: TileName; label: string; className?: string }) {
  return (
    <img
      className={`tile-face ${className}`}
      src={`tiles/${name}.png?v=4`}
      alt={label}
      draggable={false}
    />
  );
}

const numberNames = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];

function tileLabel(name: string) {
  if (name.startsWith("Man")) return `${name.includes("Dora") ? "赤" : ""}${numberNames[Number(name.match(/\d/)?.[0]) - 1]}万`;
  if (name.startsWith("Pin")) return `${name.includes("Dora") ? "赤" : ""}${numberNames[Number(name.match(/\d/)?.[0]) - 1]}筒`;
  if (name.startsWith("Sou")) return `${name.includes("Dora") ? "赤" : ""}${numberNames[Number(name.match(/\d/)?.[0]) - 1]}索`;
  return ({ Ton: "东", Nan: "南", Shaa: "西", Pei: "北", Haku: "白", Hatsu: "发", Chun: "中" } as Record<string, string>)[name] ?? name;
}

type WhatCutQuestion = {
  id: number;
  round: string;
  seat: string;
  turn: number;
  doraIndicator: string;
  tiles: string[];
  answer: string;
  explanation: string;
  questionPage: number;
  answerPage: number;
};

const whatCutQuestions: WhatCutQuestion[] = [
  {
    id: 10, round: "东一局", seat: "东家", turn: 4, doraIndicator: "Shaa",
    tiles: ["Man2", "Man2", "Man3", "Man5-Dora", "Man6", "Man7", "Pin5", "Pin5", "Pin7", "Sou1", "Sou1", "Sou3", "Sou5-Dora", "Sou7"],
    answer: "Pin7", questionPage: 12, answerPage: 15,
    explanation: "书中推荐切七筒。与勉强追求567三色相比，保留完整一向听的进张更宽；切三万后即使先摸七索，最终也容易落入坎张。",
  },
  {
    id: 11, round: "东一局", seat: "东家", turn: 4, doraIndicator: "Shaa",
    tiles: ["Pin2", "Pin2", "Pin3", "Pin5", "Pin5", "Pin5", "Pin6", "Pin7", "Pin7", "Sou1", "Sou1", "Sou3", "Sou5-Dora", "Sou7"],
    answer: "Pin7", questionPage: 12, answerPage: 15,
    explanation: "书中推荐切七筒。先把已经完成的567筒抽出，剩余结构就会清楚许多；这是识别复合形时很实用的拆分方法。",
  },
  {
    id: 12, round: "东一局", seat: "东家", turn: 7, doraIndicator: "Pin7",
    tiles: ["Man5", "Man5", "Man6", "Pin1", "Pin3", "Pin3", "Pin4", "Pin5", "Pin6", "Pin7", "Pin8", "Sou2", "Sou2", "Pin3"],
    answer: "Man5", questionPage: 12, answerPage: 16,
    explanation: "书中推荐切五万。牌姿中有三个对子，需要拆掉其中一个；切五万的有效进张最广，也不应为了食断而过早切一筒。",
  },
  {
    id: 13, round: "东一局", seat: "东家", turn: 7, doraIndicator: "Hatsu",
    tiles: ["Man6", "Man6", "Pin1", "Pin2", "Pin3", "Pin3", "Pin3", "Pin4", "Sou1", "Sou1", "Sou3", "Chun", "Chun", "Chun"],
    answer: "Pin3", questionPage: 13, answerPage: 16,
    explanation: "书中推荐切三筒。三对形应固定一侧两面；筒子必要牌已经自占一张，因此保留没有损张的索子，虽然只多一枚，但碰听速度也会放大差距。",
  },
  {
    id: 14, round: "东一局", seat: "东家", turn: 7, doraIndicator: "Hatsu",
    tiles: ["Man6", "Man6", "Pin2", "Pin3", "Pin3", "Pin3", "Pin4", "Pin5", "Sou1", "Sou1", "Sou2", "Chun", "Chun", "Chun"],
    answer: "Sou2", questionPage: 13, answerPage: 16,
    explanation: "书中推荐切二索。筒子部分是14/36的四面进张，应完整保留；二索即使容易碰出，也无法弥补三枚有效牌的差距。",
  },
  {
    id: 15, round: "东一局", seat: "东家", turn: 7, doraIndicator: "Sou9",
    tiles: ["Man6", "Man6", "Pin2", "Pin3", "Pin3", "Pin3", "Pin4", "Pin5", "Sou1", "Sou1", "Sou2", "Sou8", "Sou8", "Sou8"],
    answer: "Pin2", questionPage: 13, answerPage: 17,
    explanation: "书中推荐切二筒。切二索或三筒的进张更多，却容易失去断幺和鸣牌能力；暗藏三张宝牌时，切二筒能保留除一索外的大部分断幺路线。",
  },
  {
    id: 16, round: "东一局", seat: "东家", turn: 5, doraIndicator: "Sou9",
    tiles: ["Man7", "Man7", "Man8", "Pin2", "Pin2", "Pin2", "Pin3", "Pin4", "Pin4", "Sou1", "Sou5-Dora", "Sou7", "Sou9", "Sou1"],
    answer: "Pin4", questionPage: 14, answerPage: 17,
    explanation: "书中推荐切四筒。切八万虽然保留一杯口机会，但对最终形要求苛刻；当前已经有打点，应优先选择最大进张并确保两面听牌。",
  },
  {
    id: 17, round: "东一局", seat: "东家", turn: 5, doraIndicator: "Sou9",
    tiles: ["Man7", "Man7", "Man8", "Pin2", "Pin2", "Pin2", "Pin3", "Pin4", "Pin4", "Sou1", "Sou5-Dora", "Sou7", "Sou9", "Sou3"],
    answer: "Man7", questionPage: 14, answerPage: 18,
    explanation: "书中推荐切七万，优先眼下的进张数。即使有一半概率失去断幺，最高形的门断平一杯口赤已经具备足够打点，序盘仍应优先做出好形门清立直。",
  },
  {
    id: 18, round: "东一局", seat: "东家", turn: 5, doraIndicator: "Sou9",
    tiles: ["Man3", "Man4", "Man5", "Pin2", "Pin3", "Pin3", "Pin4", "Pin4", "Pin4", "Sou5-Dora", "Sou7", "Sou7", "Sou9", "Man4"],
    answer: "Pin3", questionPage: 14, answerPage: 18,
    explanation: "书中推荐切三筒。两个中膨形的横向靠张都能形成两面，因此应固定雀头；切二筒也能固定，但在没有特殊条件时，切三筒更利于平和。",
  },
];

const tileGroups = {
  "万子": Array.from({ length: 9 }, (_, index) => ({ name: `Man${index + 1}`, label: `${index + 1}万` })),
  "筒子": Array.from({ length: 9 }, (_, index) => ({ name: `Pin${index + 1}`, label: `${index + 1}筒` })),
  "索子": Array.from({ length: 9 }, (_, index) => ({ name: `Sou${index + 1}`, label: `${index + 1}索` })),
  "字牌": [
    { name: "Ton", label: "东" }, { name: "Nan", label: "南" }, { name: "Shaa", label: "西" }, { name: "Pei", label: "北" },
    { name: "Haku", label: "白" }, { name: "Hatsu", label: "发" }, { name: "Chun", label: "中" },
  ],
};

const searchItems = [
  { title: "立直", type: "役种", detail: "门清限定 · 1翻" },
  { title: "平和", type: "役种", detail: "门清限定 · 1翻" },
  { title: "振听", type: "规则", detail: "入门课程 04" },
  { title: "满贯怎么算？", type: "算点", detail: "5翻或基本点达到2000" },
  { title: "牌效率：两面与嵌张", type: "课程", detail: "进阶课 · 8分钟" },
  { title: "南二局的押引选择", type: "何切", detail: "1842 人已作答" },
];

const knowledgeCards = [
  { index: "01", title: "牌面速查", subtitle: "TILES", count: "34 种基础牌 · 3 种赤牌", description: "万、筒、索、字牌与常用牌姿标记。", href: "#resources" },
  { index: "02", title: "对局流程", subtitle: "FLOW", count: "18 个关键节点", description: "从配牌、摸切到连庄与终局的完整流程。", href: "#resources" },
  { index: "03", title: "役种辞典", subtitle: "YAKU", count: "36 种常见役", description: "成立条件、门清限制、复合关系与牌例。", href: "#resources" },
  { index: "04", title: "规则查阅", subtitle: "RULES", count: "52 条规则索引", description: "振听、鸣牌、流局、包牌与常见规则差异。", href: "#resources" },
];

const yakuCards = [
  { name: "立直", kana: "リーチ", han: "1翻", level: "入门必学", tiles: ["Man1", "Man2", "Man3", "Pin2", "Pin3", "Pin4", "Sou1", "Sou2", "Sou3"] },
  { name: "断幺九", kana: "タンヤオ", han: "1翻", level: "高频役种", tiles: ["Man2", "Man3", "Man4", "Pin4", "Pin5-Dora", "Pin6", "Sou3", "Sou4", "Sou5"] },
  { name: "平和", kana: "ピンフ", han: "1翻", level: "容易混淆", tiles: ["Man5", "Man6", "Man7", "Pin3", "Pin4", "Pin5", "Sou2", "Sou3", "Sou4"] },
  { name: "一气通贯", kana: "イッツー", han: "2翻", level: "顺子系", tiles: ["Man1", "Man2", "Man3", "Man4", "Man5", "Man6", "Man7", "Man8", "Man9"] },
];

const schedule = [
  { date: "10.06", week: "周二", round: "常规赛 DAY 01", teams: ["赤坂", "风林火山", "樱花骑士", "ABEMAS"], time: "18:00" },
  { date: "10.08", week: "周四", round: "常规赛 DAY 02", teams: ["格斗俱乐部", "凤凰", "雷电", "海盗"], time: "18:00" },
  { date: "10.09", week: "周五", round: "常规赛 DAY 03", teams: ["BEAST", "赤坂", "樱花骑士", "雷电"], time: "18:00" },
];

type WinType = "ron" | "tsumo";

type ScoreQuestion = {
  id: number;
  han: number;
  fu: number;
  dealer: boolean;
  winType: WinType;
  round: string;
  seat: string;
  hand: string[];
  doraIndicators: string[];
  yaku: string;
  answers: number[];
  display: string;
  explanation: string;
};

const roundUp100 = (points: number) => Math.ceil(points / 100) * 100;

function basicPoints(han: number, fu: number) {
  if (han >= 13) return { points: 8000, name: "役满" };
  if (han >= 11) return { points: 6000, name: "三倍满" };
  if (han >= 8) return { points: 4000, name: "倍满" };
  if (han >= 6) return { points: 3000, name: "跳满" };
  const raw = fu * 2 ** (han + 2);
  if (han >= 5 || raw >= 2000) return { points: 2000, name: "满贯" };
  return { points: raw, name: null };
}

function calculateScore(han: number, fu: number, dealer: boolean, winType: WinType) {
  const base = basicPoints(han, fu);
  if (winType === "ron") {
    const payment = roundUp100(base.points * (dealer ? 6 : 4));
    return {
      display: `${payment.toLocaleString()} 点`,
      answers: [payment],
      explanation: `${base.name ? `${base.name}基本点 ${base.points.toLocaleString()}` : `基本点 ${base.points.toLocaleString()}`}，${dealer ? "亲家" : "子家"}荣和倍率 ${dealer ? 6 : 4}，最终为 ${payment.toLocaleString()} 点。`,
    };
  }

  if (dealer) {
    const each = roundUp100(base.points * 2);
    return {
      display: `${each.toLocaleString()} ALL`,
      answers: [each],
      explanation: `${base.name ? base.name : `基本点 ${base.points.toLocaleString()}`}，亲家自摸由三家各支付 ${each.toLocaleString()} 点。`,
    };
  }

  const child = roundUp100(base.points);
  const parent = roundUp100(base.points * 2);
  return {
    display: `${child.toLocaleString()} / ${parent.toLocaleString()}`,
    answers: [child, parent],
    explanation: `${base.name ? base.name : `基本点 ${base.points.toLocaleString()}`}，子家自摸：子家各付 ${child.toLocaleString()}，亲家支付 ${parent.toLocaleString()} 点。`,
  };
}

const scoreScenarios = [
  {
    han: 3, fu: 30, dealer: false, winType: "ron" as WinType,
    hand: ["Man2", "Man3", "Man4", "Pin3", "Pin4", "Pin5-Dora", "Sou4", "Sou5", "Sou6", "Pin6", "Pin7", "Pin8", "Sou2", "Sou2"],
    doraIndicators: ["Ton"], yaku: "立直・平和・赤宝牌",
  },
  {
    han: 2, fu: 30, dealer: false, winType: "tsumo" as WinType,
    hand: ["Man2", "Man2", "Man2", "Man3", "Man4", "Man5", "Pin4", "Pin5", "Pin6", "Sou6", "Sou7", "Sou8", "Pin5", "Pin5"],
    doraIndicators: ["Ton"], yaku: "门前清自摸和・断幺九",
  },
  {
    han: 3, fu: 40, dealer: false, winType: "ron" as WinType,
    hand: ["Man1", "Man1", "Man1", "Man2", "Man3", "Man4", "Sou4", "Sou5", "Sou6", "Pin7", "Pin8", "Pin9", "Pin5", "Pin5"],
    doraIndicators: ["Pin4"], yaku: "立直・宝牌2",
  },
  {
    han: 4, fu: 40, dealer: true, winType: "ron" as WinType,
    hand: ["Man1", "Man1", "Man1", "Man2", "Man3", "Man4", "Sou4", "Sou5", "Sou6", "Pin7", "Pin8", "Pin9", "Pin5-Dora", "Pin5"],
    doraIndicators: ["Pin4"], yaku: "立直・宝牌2・赤宝牌",
  },
  {
    han: 4, fu: 30, dealer: false, winType: "tsumo" as WinType,
    hand: ["Man2", "Man2", "Man2", "Man3", "Man4", "Man5", "Pin4", "Pin5", "Pin6", "Sou6", "Sou7", "Sou8", "Pin5", "Pin5"],
    doraIndicators: ["Pin4"], yaku: "门前清自摸和・断幺九・宝牌2",
  },
  {
    han: 5, fu: 30, dealer: false, winType: "ron" as WinType,
    hand: ["Man2", "Man3", "Man4", "Pin3", "Pin4", "Pin5-Dora", "Sou4", "Sou5", "Sou6", "Pin6", "Pin7", "Pin8", "Sou2", "Sou2"],
    doraIndicators: ["Ton"], yaku: "立直・一发・平和・断幺九・赤宝牌",
  },
  {
    han: 6, fu: 20, dealer: true, winType: "tsumo" as WinType,
    hand: ["Man2", "Man3", "Man4", "Pin3", "Pin4", "Pin5-Dora", "Sou4", "Sou5", "Sou6", "Pin6", "Pin7", "Pin8", "Sou2", "Sou2"],
    doraIndicators: ["Ton"], yaku: "立直・一发・门前清自摸和・平和・断幺九・赤宝牌",
  },
];

function createScoreQuestion(): ScoreQuestion {
  const scenario = scoreScenarios[Math.floor(Math.random() * scoreScenarios.length)];
  const result = calculateScore(scenario.han, scenario.fu, scenario.dealer, scenario.winType);
  const rounds = ["东一局", "东二局", "东三局", "南一局", "南二局"];
  const childSeats = ["南家", "西家", "北家"];

  return {
    id: Math.floor(10000 + Math.random() * 90000),
    ...scenario,
    round: rounds[Math.floor(Math.random() * rounds.length)],
    seat: scenario.dealer ? "东家" : childSeats[Math.floor(Math.random() * childSeats.length)],
    answers: result.answers,
    display: result.display,
    explanation: result.explanation,
  };
}

type PageKey = "home" | "resources" | "whatcut" | "scoring" | "mleague" | "archive";

function pageFromHash(hash: string): PageKey {
  const page = hash.replace("#", "") as PageKey;
  return ["resources", "whatcut", "scoring", "mleague", "archive"].includes(page) ? page : "home";
}

export default function Home() {
  const [page, setPage] = useState<PageKey>(() => pageFromHash(typeof window === "undefined" ? "" : window.location.hash));
  const [whatCutIndex, setWhatCutIndex] = useState(0);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [spoilers, setSpoilers] = useState(false);
  const [search, setSearch] = useState("");
  const [tileGroup, setTileGroup] = useState<keyof typeof tileGroups>("万子");
  const [scoreQuestion, setScoreQuestion] = useState<ScoreQuestion>(createScoreQuestion);
  const [scoreInputs, setScoreInputs] = useState(["", ""]);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  useEffect(() => {
    const updatePage = () => {
      setPage(pageFromHash(window.location.hash));
    };
    window.addEventListener("hashchange", updatePage);
    return () => window.removeEventListener("hashchange", updatePage);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [page]);

  const searchResults = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return [];
    return searchItems.filter((item) =>
      `${item.title}${item.type}${item.detail}`.toLowerCase().includes(keyword),
    );
  }, [search]);

  const whatCutQuestion = whatCutQuestions[whatCutIndex];
  const answerIsBest = selectedTile !== null && whatCutQuestion.tiles[selectedTile] === whatCutQuestion.answer;
  const parsedScoreInputs = scoreInputs.map((value) => Number(value.replace(/[^\d]/g, "")));
  const scoreIsCorrect = scoreSubmitted && scoreQuestion.answers.every((answer, index) => parsedScoreInputs[index] === answer);

  const nextWhatCut = () => {
    setWhatCutIndex((current) => (current + 1) % whatCutQuestions.length);
    setSelectedTile(null);
  };

  const nextScoreQuestion = () => {
    setScoreQuestion(createScoreQuestion());
    setScoreInputs(["", ""]);
    setScoreSubmitted(false);
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="牌理首页">
          <span className="brand-mark"><i>一</i></span>
          <span className="brand-copy">
            <strong>牌理</strong>
            <small>PAIRI · 立直麻将资料馆</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="主导航">
          <a className={page === "home" ? "active" : ""} href="#home">首页</a>
          <a className={page === "resources" ? "active" : ""} href="#resources">资料</a>
          <a className={page === "whatcut" ? "active" : ""} href="#whatcut">何切</a>
          <a className={page === "scoring" ? "active" : ""} href="#scoring">算点</a>
          <a className={page === "mleague" ? "active" : ""} href="#mleague">赛事</a>
          <a className={page === "archive" ? "active" : ""} href="#archive">牌谱库</a>
        </nav>

        <div className="header-actions">
          <button className="icon-button" aria-label="我的收藏">☆</button>
          <a className="header-cta" href="#whatcut">开始训练</a>
        </div>
      </header>

      {page === "home" && <>
      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow"><span /> 立直麻将 · 知识与实战</p>
          <h1>从第一巡开始，<br /><em>读懂一局日麻。</em></h1>
          <p className="hero-description">
            查规则、练何切、复核算点，也重新观看每一场职业对局。给已经坐上牌桌的玩家，一张更深的地图。
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#whatcut">进入训练场 <span>→</span></a>
            <a className="text-link" href="#resources">打开资料库 <span>↘</span></a>
          </div>
          <div className="hero-meta">
            <div><strong>142</strong><span>篇资料条目</span></div>
            <div><strong>186</strong><span>道实战练习</span></div>
            <div><strong>36</strong><span>种常见役种</span></div>
          </div>
        </div>

        <div className="hero-table" aria-label="日麻牌桌主题插图">
          <div className="table-ring">
            <span className="seat seat-east">东</span>
            <span className="seat seat-south">南</span>
            <span className="seat seat-west">西</span>
            <span className="seat seat-north">北</span>
            <div className="center-display">
              <small>東二局</small>
              <strong>02</strong>
              <span>一本场</span>
            </div>
            <div className="mini-hand top-hand">
              {Array.from({ length: 9 }, (_, index) => <TileFace key={index} name="Back" label="牌背" />)}
            </div>
            <div className="mini-hand bottom-hand">
              {["Man2", "Man3", "Man4", "Pin2", "Pin3", "Pin4", "Sou3", "Sou4", "Sou5"].map((name) => (
                <TileFace key={name} name={name} label={name} />
              ))}
            </div>
            <div className="discard-grid">
              {["Man1", "Shaa", "Chun", "Hatsu", "Haku", "Pei"].map((name) => (
                <TileFace key={name} name={name} label={name} />
              ))}
            </div>
          </div>
          <p className="table-caption"><span>LIVE STUDY</span> 每一巡，都有理由</p>
        </div>
      </section>

      <section className="search-band" aria-label="全站搜索">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索役种、规则、选手、牌谱或何切题目"
            aria-label="搜索日麻资料"
          />
          <kbd>⌘ K</kbd>
        </div>
        {search && (
          <div className="search-results">
            <div className="search-result-heading">搜索结果 · {searchResults.length}</div>
            {searchResults.length > 0 ? searchResults.map((item) => (
              <button key={item.title} className="search-result-item">
                <span className="result-type">{item.type}</span>
                <strong>{item.title}</strong>
                <small>{item.detail}</small>
                <span className="result-arrow">→</span>
              </button>
            )) : <p>暂时没有匹配内容，试试“立直”“振听”或“算点”。</p>}
          </div>
        )}
      </section>

      <section className="quick-start page-section">
        <div className="section-heading compact-heading">
          <div>
            <p className="section-kicker">QUICK ACCESS / 快捷入口</p>
            <h2>从问题出发，直接进入。</h2>
          </div>
          <p>面向已有对局经验的玩家，减少引导，保留足够深度。</p>
        </div>
        <div className="quick-grid">
          <a className="quick-card quick-featured" href="#whatcut">
            <div className="quick-number">01</div>
            <div className="quick-icon"><TileFace name="Pei" label="北" /></div>
            <div className="quick-content">
              <span>书籍题库 · Q010—Q018</span>
              <h3>直接练习书中的<br />经典何切题</h3>
              <p>按原题牌姿作答，再查看书中推荐切牌与解析。</p>
            </div>
            <span className="round-arrow">↗</span>
          </a>
          <a className="quick-card" href="#scoring">
            <div className="quick-number">02</div>
            <div className="quick-content">
              <span>翻数、符数与点数</span>
              <h3>算点图解与练习</h3>
              <p>从基本点公式走到庄闲、自摸与荣和。</p>
            </div>
            <span className="round-arrow">↗</span>
          </a>
          <a className="quick-card" href="#mleague">
            <div className="quick-number">03</div>
            <div className="quick-content">
              <span>今晚有比赛吗？</span>
              <h3>查看 M.LEAGUE</h3>
              <p>赛程、队伍、选手与关键牌谱。</p>
            </div>
            <span className="round-arrow">↗</span>
          </a>
        </div>
      </section>
      </>}

      {page === "resources" && <>
      <section className="page-intro page-section">
        <p className="section-kicker">REFERENCE LIBRARY / 资料库</p>
        <h1>规则、役种与牌面，<br />都在这里查。</h1>
        <p>资料内容从首页移出，按主题集中组织。首页只保留入口和站点概览。</p>
      </section>
      <section className="knowledge-section page-section" id="knowledge">
        <div className="section-heading">
          <div>
            <p className="section-kicker">KNOWLEDGE BASE / 基础资料库</p>
            <h2>需要的时候，<br />快速找到准确答案。</h2>
          </div>
          <div className="section-aside-copy">
            <p>基础内容不设线性课程，按主题、关键词与关联条目组织，既能速查，也能继续深入。</p>
          </div>
        </div>
        <div className="knowledge-grid">
          {knowledgeCards.map((item) => (
            <a className="knowledge-card" href={item.href} key={item.title}>
              <span className="knowledge-index">{item.index}</span>
              <small>{item.subtitle}</small>
              <h3>{item.title}</h3>
              <strong>{item.count}</strong>
              <p>{item.description}</p>
              <i>↗</i>
            </a>
          ))}
        </div>
      </section>

      <section className="tile-guide page-section" id="tile-guide" aria-label="日麻牌面速查">
        <div className="tile-guide-head">
          <div>
            <p className="section-kicker">TILE GUIDE / 牌面速查</p>
            <h2>先认识手里的每一张牌</h2>
          </div>
          <div className="tile-tabs" role="tablist" aria-label="牌面分类">
            {(Object.keys(tileGroups) as Array<keyof typeof tileGroups>).map((group) => (
              <button
                key={group}
                role="tab"
                aria-selected={tileGroup === group}
                className={tileGroup === group ? "active" : ""}
                onClick={() => setTileGroup(group)}
              >{group}</button>
            ))}
          </div>
        </div>
        <div className="tile-guide-row">
          {tileGroups[tileGroup].map((tile) => (
            <div className="guide-tile" key={tile.name}>
              <TileFace name={tile.name} label={tile.label} />
              <span>{tile.label}</span>
            </div>
          ))}
        </div>
        <p className="asset-credit">牌面采用 FluffyStuff 公共领域日麻牌图 · 包含赤五牌</p>
      </section>
      </>}

      {page === "whatcut" && <section className="practice-section" id="practice">
        <div className="practice-inner page-section">
          <div className="what-cut-panel">
            <div className="panel-topline">
              <div>
                <p className="section-kicker light">BOOK PRACTICE · Q{String(whatCutQuestion.id).padStart(3, "0")}</p>
                <h2>书籍何切题库</h2>
              </div>
              <div className="participant-count"><strong>{whatCutIndex + 1} / {whatCutQuestions.length}</strong><span>当前题目</span></div>
            </div>

            <div className="round-context">
              <span className="wind-badge">{whatCutQuestion.seat.slice(0, 1)}</span>
              <div>
                <strong>{whatCutQuestion.round} · {whatCutQuestion.turn}巡目 · {whatCutQuestion.seat}</strong>
                <small className="dora-line">宝牌指示牌 <TileFace name={whatCutQuestion.doraIndicator} label={tileLabel(whatCutQuestion.doraIndicator)} /></small>
              </div>
              <div className="points"><span>《何切301》</span><span>题面 PDF {whatCutQuestion.questionPage} 页</span></div>
            </div>

            <p className="question-copy">这手牌你会切哪一张？点击牌面提交选择。</p>
            <div className="tile-row" role="group" aria-label="选择要切出的牌">
              {whatCutQuestion.tiles.map((tile, index) => (
                <button
                  key={`${tile}-${index}`}
                  className={`mahjong-tile ${selectedTile === index ? "selected" : ""} ${index === whatCutQuestion.tiles.length - 1 ? "drawn" : ""}`}
                  onClick={() => setSelectedTile(index)}
                  aria-label={`切${tileLabel(tile)}`}
                  aria-pressed={selectedTile === index}
                >
                  <TileFace name={tile} label={tileLabel(tile)} />
                </button>
              ))}
            </div>

            {selectedTile === null ? (
              <div className="answer-placeholder">
                <span>思考提示</span>
                先抽出已经完成的面子，再比较各候选切牌的有效牌枚数、最终形和打点。
              </div>
            ) : (
              <div className={`answer-card ${answerIsBest ? "best" : "alternative"}`} aria-live="polite">
                <div className="answer-verdict">
                  <span>{answerIsBest ? "与书中答案一致" : "你的选择"}</span>
                  <strong>切 <TileFace name={whatCutQuestion.tiles[selectedTile]} label={tileLabel(whatCutQuestion.tiles[selectedTile])} /> {tileLabel(whatCutQuestion.tiles[selectedTile])}</strong>
                </div>
                <p>{answerIsBest ? whatCutQuestion.explanation : `书中推荐切${tileLabel(whatCutQuestion.answer)}。${whatCutQuestion.explanation}`}</p>
                <div className="answer-actions">
                  <button onClick={() => setSelectedTile(null)}>重新选择</button>
                  <button onClick={nextWhatCut}>下一题 →</button>
                </div>
              </div>
            )}
            <div className="book-source-note">来源：《何切301》Q{String(whatCutQuestion.id).padStart(3, "0")} · 解答 PDF {whatCutQuestion.answerPage} 页 · 牌面已重绘</div>
          </div>

        </div>
      </section>}

      {page === "resources" && <section className="yaku-section page-section" id="yaku">
        <div className="section-heading">
          <div>
            <p className="section-kicker">YAKU LIBRARY / 役种辞典</p>
            <h2>不是背下来，<br />是看懂它如何成立。</h2>
          </div>
          <div className="section-aside-copy">
            <p>按翻数、门清限制与结构筛选，每个役种都有牌例、误区和对应练习。</p>
            <a href="#resources">浏览全部 36 种役 <span>→</span></a>
          </div>
        </div>
        <div className="yaku-grid">
          {yakuCards.map((yaku, index) => (
            <a className="yaku-card" href="#resources" key={yaku.name}>
              <div className="yaku-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="yaku-top"><span>{yaku.level}</span><strong>{yaku.han}</strong></div>
              <h3>{yaku.name}</h3>
              <p>{yaku.kana}</p>
              <div className="yaku-tiles">
                {yaku.tiles.map((tile, tileIndex) => <TileFace key={`${tile}-${tileIndex}`} name={tile} label={tile} />)}
              </div>
              <div className="yaku-link">查看成立条件 <span>↗</span></div>
            </a>
          ))}
        </div>
      </section>}

      {page === "scoring" && <section className="scoring-section" id="scoring">
        <div className="page-section">
          <div className="scoring-heading">
            <div>
              <p className="section-kicker">SCORING PRACTICE / 算点练习</p>
              <h2>看清牌姿，<br />自己填出点数。</h2>
            </div>
            <p>参考练习站的作答流程：读取宝牌指示、和牌条件与完整牌姿，手动输入支付点数，提交后再核对翻符和计算过程。</p>
          </div>

          <div className="practice-steps" aria-label="算点练习流程">
            <div className="active"><span>01</span><strong>读取牌姿</strong><small>役种、宝牌、庄闲与和法</small></div>
            <div className={scoreSubmitted ? "done" : "active"}><span>02</span><strong>输入点数</strong><small>不提供选择题，直接填写</small></div>
            <div className={scoreSubmitted ? "active" : ""}><span>03</span><strong>核对解析</strong><small>翻符、基本点与支付方式</small></div>
          </div>

          <div className="score-lab">
            <article className="score-question-card">
              <div className="score-card-head">
                <span>AUTO PRACTICE · #{scoreQuestion.id}</span>
                <strong>{scoreQuestion.round} · {scoreQuestion.seat} · {scoreQuestion.winType === "ron" ? "荣和" : "自摸"}</strong>
              </div>
              <div className="dora-indicators">
                <span>宝牌指示牌</span>
                {scoreQuestion.doraIndicators.map((tile, index) => <TileFace key={`${tile}-${index}`} name={tile} label={tileLabel(tile)} />)}
              </div>
              <div className="score-hand large">
                {scoreQuestion.hand.map((tile, index) => (
                  <TileFace key={`${tile}-${index}`} name={tile} label={tileLabel(tile)} className={index === scoreQuestion.hand.length - 1 ? "winning-tile" : ""} />
                ))}
              </div>
              <div className="win-condition">
                <span>和了情况</span>
                <strong>{scoreQuestion.round} · {scoreQuestion.seat} · {scoreQuestion.winType === "ron" ? "荣和" : "自摸"}</strong>
                <small>{scoreQuestion.yaku}</small>
              </div>
            </article>

            <aside className="score-practice input-practice">
              <div className="practice-badge">INPUT ANSWER / 输入答案</div>
              <h3>这次和牌收取多少点？</h3>
              <p>{scoreQuestion.winType === "ron" ? "输入荣和点数" : scoreQuestion.dealer ? "输入每位子家支付的点数" : "依次输入子家、亲家支付的点数"}</p>
              <div className="score-inputs">
                <label>
                  <span>{scoreQuestion.winType === "ron" ? "荣和点数" : scoreQuestion.dealer ? "每家支付" : "子家支付"}</span>
                  <input inputMode="numeric" value={scoreInputs[0]} onChange={(event) => setScoreInputs([event.target.value, scoreInputs[1]])} placeholder="例如 3900" disabled={scoreSubmitted} />
                </label>
                {scoreQuestion.winType === "tsumo" && !scoreQuestion.dealer && <label>
                  <span>亲家支付</span>
                  <input inputMode="numeric" value={scoreInputs[1]} onChange={(event) => setScoreInputs([scoreInputs[0], event.target.value])} placeholder="例如 2000" disabled={scoreSubmitted} />
                </label>}
              </div>
              {!scoreSubmitted ? (
                <>
                  <button className="score-submit" disabled={!scoreInputs[0] || (scoreQuestion.answers.length === 2 && !scoreInputs[1])} onClick={() => setScoreSubmitted(true)}>确认答案</button>
                  <div className="score-hint">先自行计算翻数和符数。答案提交前不会显示提示或选项。</div>
                </>
              ) : (
                <div className={`score-feedback ${scoreIsCorrect ? "correct" : "wrong"}`} aria-live="polite">
                  <strong>{scoreIsCorrect ? `正确 · ${scoreQuestion.display}` : `正确答案 · ${scoreQuestion.display}`}</strong>
                  <p>{scoreQuestion.han}翻{scoreQuestion.fu}符。{scoreQuestion.explanation}</p>
                  <button onClick={nextScoreQuestion}>生成下一题 →</button>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>}

      {page === "mleague" && <section className="mleague-section" id="mleague">
        <div className="page-section mleague-inner">
          <div className="mleague-heading">
            <div>
              <p className="section-kicker light">PRO MAHJONG / 职业赛事</p>
              <h2>M.LEAGUE<br /><em>赛事档案</em></h2>
            </div>
            <div className="season-block"><small>SELECTED SEASON</small><strong>2026—27</strong><span>REGULAR SEASON</span></div>
          </div>

          <div className="schedule-card">
            <div className="schedule-toolbar">
              <div className="schedule-tabs"><button className="active">近期赛程</button><button>积分榜</button><button>选手</button></div>
              <label className="spoiler-toggle">
                <span>隐藏赛果</span>
                <input type="checkbox" checked={!spoilers} onChange={() => setSpoilers(!spoilers)} />
                <i />
              </label>
            </div>
            <div className="schedule-list">
              {schedule.map((match, index) => (
                <article className="match-row" key={match.date}>
                  <div className="match-date"><strong>{match.date}</strong><span>{match.week}</span></div>
                  <div className="match-info"><small>{match.round}</small><strong>{spoilers ? (index === 0 ? "海盗 +58.2" : "赛果待录入") : "四队两半庄 · 赛果隐藏"}</strong></div>
                  <div className="team-dots" aria-label={match.teams.join("、")}>
                    {match.teams.map((team, teamIndex) => <span key={team} className={`team team-${teamIndex + 1}`} title={team}>{team.slice(0, 1)}</span>)}
                  </div>
                  <div className="match-time"><small>START</small><strong>{match.time}</strong></div>
                  <a href="#archive" aria-label={`查看${match.date}比赛详情`}>→</a>
                </article>
              ))}
            </div>
            <div className="schedule-footer"><span>以上赛程为原型示例数据</span><a href="#mleague">打开完整赛历 <b>↗</b></a></div>
          </div>
        </div>
      </section>}

      {page === "archive" && <section className="archive-section page-section" id="archive">
        <div className="archive-copy">
          <p className="section-kicker">HAIFU ARCHIVE / 牌谱档案</p>
          <h2>不只看结果，<br />回到决定胜负的那一巡。</h2>
          <p>按选手、队伍、局数、役种和打点检索职业牌谱，把赛场上的选择变成自己的经验。</p>
          <a className="primary-button dark-button" href="#archive">探索牌谱库 <span>→</span></a>
        </div>
        <div className="archive-visual">
          <div className="archive-stamp"><span>ARCHIVE</span><strong>牌譜</strong><small>NO. 0186</small></div>
          <div className="round-log">
            <div><span>東</span><strong>25,000</strong><small>4m →</small></div>
            <div className="active"><span>南</span><strong>31,200</strong><small>立直</small></div>
            <div><span>西</span><strong>18,400</strong><small>9p →</small></div>
            <div><span>北</span><strong>25,400</strong><small>中 →</small></div>
          </div>
          <div className="archive-tiles">
            {["Man1", "Man2", "Man3", "Pin2", "Pin3", "Pin4", "Sou2", "Sou3", "Sou4", "Chun", "Chun"].map((tile, index) => (
              <TileFace key={`${tile}-${index}`} name={tile} label={tile} />
            ))}
          </div>
          <div className="archive-note"><span>KEY MOMENT / 11巡目</span><p>领先时是继续进攻，还是先处理危险牌？</p></div>
        </div>
      </section>}

      <footer>
        <div className="footer-brand">
          <span className="brand-mark"><i>一</i></span>
          <div><strong>牌理 PAIRI</strong><p>立直麻将知识与实战资料馆</p></div>
        </div>
        <div className="footer-links">
          <a href="#resources">资料库</a><a href="#whatcut">何切</a><a href="#scoring">算点</a><a href="#mleague">赛事</a><a href="#archive">牌谱</a>
        </div>
        <p className="footer-note">原型版本 · 内容与赛程数据仅供设计演示</p>
      </footer>
    </main>
  );
}
