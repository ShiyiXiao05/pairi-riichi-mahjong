import { useMemo, useState } from "react";

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

const handTiles = [
  { name: "Man2", label: "二万" },
  { name: "Man3", label: "三万" },
  { name: "Man4", label: "四万" },
  { name: "Man5-Dora", label: "赤五万" },
  { name: "Man6", label: "六万" },
  { name: "Man7", label: "七万" },
  { name: "Pin2", label: "二筒" },
  { name: "Pin3", label: "三筒" },
  { name: "Pin4", label: "四筒" },
  { name: "Sou3", label: "三索" },
  { name: "Sou4", label: "四索" },
  { name: "Sou5", label: "五索" },
  { name: "Sou6", label: "六索" },
  { name: "Pei", label: "北" },
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
  { index: "01", title: "牌面速查", subtitle: "TILES", count: "34 种基础牌 · 3 种赤牌", description: "万、筒、索、字牌与常用牌姿标记。", href: "#tile-guide" },
  { index: "02", title: "对局流程", subtitle: "FLOW", count: "18 个关键节点", description: "从配牌、摸切到连庄与终局的完整流程。", href: "#knowledge" },
  { index: "03", title: "役种辞典", subtitle: "YAKU", count: "36 种常见役", description: "成立条件、门清限制、复合关系与牌例。", href: "#yaku" },
  { index: "04", title: "规则查阅", subtitle: "RULES", count: "52 条规则索引", description: "振听、鸣牌、流局、包牌与常见规则差异。", href: "#knowledge" },
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
  correct: string;
  options: string[];
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
      explanation: `${base.name ? `${base.name}基本点 ${base.points.toLocaleString()}` : `基本点 ${base.points.toLocaleString()}`}，${dealer ? "亲家" : "子家"}荣和倍率 ${dealer ? 6 : 4}，最终为 ${payment.toLocaleString()} 点。`,
    };
  }

  if (dealer) {
    const each = roundUp100(base.points * 2);
    return {
      display: `${each.toLocaleString()} ALL`,
      explanation: `${base.name ? base.name : `基本点 ${base.points.toLocaleString()}`}，亲家自摸由三家各支付 ${each.toLocaleString()} 点。`,
    };
  }

  const child = roundUp100(base.points);
  const parent = roundUp100(base.points * 2);
  return {
    display: `${child.toLocaleString()} / ${parent.toLocaleString()}`,
    explanation: `${base.name ? base.name : `基本点 ${base.points.toLocaleString()}`}，子家自摸：子家各付 ${child.toLocaleString()}，亲家支付 ${parent.toLocaleString()} 点。`,
  };
}

function shuffled<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function validFu(han: number) {
  if (han === 1) return [30, 40, 50, 60, 70, 80, 90, 100, 110];
  if (han <= 4) return [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110];
  return [30, 40];
}

function createScoreQuestion(): ScoreQuestion {
  const hanPool = [1, 2, 2, 3, 3, 3, 4, 4, 5, 6, 7, 8, 10, 11, 12, 13];
  const han = hanPool[Math.floor(Math.random() * hanPool.length)];
  const fuPool = validFu(han);
  const fu = fuPool[Math.floor(Math.random() * fuPool.length)];
  const dealer = Math.random() < 0.28;
  const winType: WinType = Math.random() < 0.5 ? "ron" : "tsumo";
  const result = calculateScore(han, fu, dealer, winType);
  const choices = new Set([result.display]);

  let attempts = 0;
  while (choices.size < 4 && attempts < 80) {
    attempts += 1;
    const alternateHan = hanPool[Math.floor(Math.random() * hanPool.length)];
    const alternateFuPool = validFu(alternateHan);
    const alternateFu = alternateFuPool[Math.floor(Math.random() * alternateFuPool.length)];
    choices.add(calculateScore(alternateHan, alternateFu, dealer, winType).display);
  }

  // Every win type has more than four distinct payments, but keep a deterministic
  // fallback so an unlucky random sequence can never stall question generation.
  for (const alternateHan of [1, 2, 3, 4, 5, 6, 8, 11, 13]) {
    for (const alternateFu of validFu(alternateHan)) {
      if (choices.size >= 4) break;
      choices.add(calculateScore(alternateHan, alternateFu, dealer, winType).display);
    }
    if (choices.size >= 4) break;
  }

  return {
    id: Math.floor(10000 + Math.random() * 90000),
    han,
    fu,
    dealer,
    winType,
    correct: result.display,
    options: shuffled([...choices]),
    explanation: result.explanation,
  };
}

export default function Home() {
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [spoilers, setSpoilers] = useState(false);
  const [search, setSearch] = useState("");
  const [tileGroup, setTileGroup] = useState<keyof typeof tileGroups>("万子");
  const [scoreQuestion, setScoreQuestion] = useState<ScoreQuestion>(createScoreQuestion);
  const [scoreAnswer, setScoreAnswer] = useState<string | null>(null);

  const searchResults = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return [];
    return searchItems.filter((item) =>
      `${item.title}${item.type}${item.detail}`.toLowerCase().includes(keyword),
    );
  }, [search]);

  const answerIsBest = selectedTile === 13;

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="牌理首页">
          <span className="brand-mark"><i>一</i></span>
          <span className="brand-copy">
            <strong>牌理</strong>
            <small>PAIRI · 立直麻将资料馆</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="主导航">
          <a href="#knowledge">资料库</a>
          <a href="#yaku">役种辞典</a>
          <a href="#practice">训练场</a>
          <a href="#scoring">算点</a>
          <a href="#mleague">赛事</a>
          <a href="#archive">牌谱库</a>
        </nav>

        <div className="header-actions">
          <button className="icon-button" aria-label="我的收藏">☆</button>
          <a className="header-cta" href="#practice">开始训练</a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow"><span /> 立直麻将 · 知识与实战</p>
          <h1>从第一巡开始，<br /><em>读懂一局日麻。</em></h1>
          <p className="hero-description">
            查规则、练何切、复核算点，也重新观看每一场职业对局。给已经坐上牌桌的玩家，一张更深的地图。
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#practice">进入训练场 <span>→</span></a>
            <a className="text-link" href="#practice">今日一何切 <span>↘</span></a>
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
          <a className="quick-card quick-featured" href="#practice">
            <div className="quick-number">01</div>
            <div className="quick-icon"><TileFace name="Pei" label="北" /></div>
            <div className="quick-content">
              <span>今日局面 · #042</span>
              <h3>比较进张、打点<br />与风险的何切</h3>
              <p>提交选择后查看票型分布与编辑分析。</p>
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

      <section className="practice-section" id="practice">
        <div className="practice-inner page-section">
          <div className="what-cut-panel">
            <div className="panel-topline">
              <div>
                <p className="section-kicker light">DAILY QUESTION · #042</p>
                <h2>今日一何切</h2>
              </div>
              <div className="participant-count"><strong>1,842</strong><span>人已作答</span></div>
            </div>

            <div className="round-context">
              <span className="wind-badge">南</span>
              <div><strong>南二局 · 8巡目 · 西家</strong><small className="dora-line">持点 29,000 · 宝牌 <TileFace name="Pin4" label="四筒" /></small></div>
              <div className="points"><span>一位 36,200</span><span>四位 14,800</span></div>
            </div>

            <p className="question-copy">这手牌你会切哪一张？点击牌面提交选择。</p>
            <div className="tile-row" role="group" aria-label="选择要切出的牌">
              {handTiles.map((tile, index) => (
                <button
                  key={`${tile.label}-${index}`}
                  className={`mahjong-tile ${selectedTile === index ? "selected" : ""} ${index === 13 ? "drawn" : ""}`}
                  onClick={() => setSelectedTile(index)}
                  aria-label={`切${tile.label}`}
                  aria-pressed={selectedTile === index}
                >
                  <TileFace name={tile.name} label={tile.label} />
                </button>
              ))}
            </div>

            {selectedTile === null ? (
              <div className="answer-placeholder">
                <span>思考提示</span>
                比较向听数、有效进张与手牌打点，再做选择。
              </div>
            ) : (
              <div className={`answer-card ${answerIsBest ? "best" : "alternative"}`} aria-live="polite">
                <div className="answer-verdict">
                  <span>{answerIsBest ? "编辑推荐" : "另一种选择"}</span>
                  <strong>切 <TileFace name={handTiles[selectedTile].name} label={handTiles[selectedTile].label} /> {handTiles[selectedTile].label}</strong>
                </div>
                <div className="vote-bar"><i style={{ width: answerIsBest ? "62%" : "18%" }} /></div>
                <p>{answerIsBest
                  ? "北是唯一的孤张字牌，切出后保留四组完整顺子搭子与六索延展，牌效率最稳定。"
                  : "这个选择会拆开已有搭子。若没有特殊的防守或打点理由，保留数牌结构会更自然。"}</p>
                <button onClick={() => setSelectedTile(null)}>重新选择</button>
              </div>
            )}
          </div>

        </div>
      </section>

      <section className="yaku-section page-section" id="yaku">
        <div className="section-heading">
          <div>
            <p className="section-kicker">YAKU LIBRARY / 役种辞典</p>
            <h2>不是背下来，<br />是看懂它如何成立。</h2>
          </div>
          <div className="section-aside-copy">
            <p>按翻数、门清限制与结构筛选，每个役种都有牌例、误区和对应练习。</p>
            <a href="#yaku">浏览全部 36 种役 <span>→</span></a>
          </div>
        </div>
        <div className="yaku-grid">
          {yakuCards.map((yaku, index) => (
            <a className="yaku-card" href="#yaku" key={yaku.name}>
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
      </section>

      <section className="scoring-section" id="scoring">
        <div className="page-section">
          <div className="scoring-heading">
            <div>
              <p className="section-kicker light">SCORING LAB / 算点实验室</p>
              <h2>把算点拆成一张<br />可以反复使用的图。</h2>
            </div>
            <p>先判断役与翻，再计算符和基本点，最后根据庄闲及和牌方式得出支付点数。</p>
          </div>

          <div className="score-flow" aria-label="日麻算点流程图">
            <div className="flow-node"><span>STEP 01</span><strong>确认役种</strong><small>必须至少有一役</small></div>
            <i>→</i>
            <div className="flow-node"><span>STEP 02</span><strong>合计翻数</strong><small>役 + 宝牌 + 赤牌</small></div>
            <i>→</i>
            <div className="flow-node accent"><span>STEP 03</span><strong>计算符数</strong><small>底符、面子、雀头、听牌</small></div>
            <i>→</i>
            <div className="flow-node"><span>STEP 04</span><strong>求基本点</strong><small>符 × 2<sup>2+翻</sup></small></div>
            <i>→</i>
            <div className="flow-node"><span>STEP 05</span><strong>庄闲与和法</strong><small>荣和 / 自摸 / 取整</small></div>
          </div>

          <div className="scoring-workbench">
            <article className="worked-example">
              <div className="score-card-head"><span>CALCULATION MAP</span><strong>3翻 30符 · 子家荣和</strong></div>
              <div className="score-hand">
                {["Man2", "Man3", "Man4", "Pin3", "Pin4", "Pin5-Dora", "Sou4", "Sou5", "Sou6", "Pin6", "Pin7", "Pin8", "Haku", "Haku"].map((tile, index) => (
                  <TileFace key={`${tile}-${index}`} name={tile} label={tile} />
                ))}
              </div>
              <div className="formula-steps">
                <div><small>翻数</small><strong>立直 1 + 平和 1 + 赤 1</strong><b>3翻</b></div>
                <div><small>符数</small><strong>副底20 + 门清荣和10</strong><b>30符</b></div>
                <div><small>基本点</small><strong>30 × 2<sup>2+3</sup></strong><b>960</b></div>
                <div className="total"><small>子家荣和</small><strong>960 × 4 = 3,840 · 百位进位</strong><b>3,900点</b></div>
              </div>
            </article>

            <aside className="score-practice">
              <div className="practice-badge">AUTO PRACTICE · #{scoreQuestion.id}</div>
              <h3>这次和牌是多少点？</h3>
              <p>{scoreQuestion.dealer ? "亲家" : "子家"} · {scoreQuestion.han}翻{scoreQuestion.fu}符 · {scoreQuestion.winType === "ron" ? "荣和" : "自摸"}</p>
              <div className="score-options">
                {scoreQuestion.options.map((option) => (
                  <button
                    key={option}
                    className={scoreAnswer === option ? (option === scoreQuestion.correct ? "correct" : "wrong") : ""}
                    onClick={() => setScoreAnswer(option)}
                    aria-pressed={scoreAnswer === option}
                  >{option}</button>
                ))}
              </div>
              {scoreAnswer === null ? (
                <div className="score-hint">题目会自动覆盖庄闲、荣和、自摸、不同翻符和满贯以上。</div>
              ) : (
                <div className={`score-feedback ${scoreAnswer === scoreQuestion.correct ? "correct" : "wrong"}`} aria-live="polite">
                  <strong>{scoreAnswer === scoreQuestion.correct ? `正确 · ${scoreQuestion.correct}` : `正确答案 · ${scoreQuestion.correct}`}</strong>
                  <p>{scoreQuestion.explanation}</p>
                  <button onClick={() => { setScoreQuestion(createScoreQuestion()); setScoreAnswer(null); }}>生成下一题</button>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      <section className="mleague-section" id="mleague">
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
      </section>

      <section className="archive-section page-section" id="archive">
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
      </section>

      <footer>
        <div className="footer-brand">
          <span className="brand-mark"><i>一</i></span>
          <div><strong>牌理 PAIRI</strong><p>立直麻将知识与实战资料馆</p></div>
        </div>
        <div className="footer-links">
          <a href="#knowledge">资料库</a><a href="#practice">何切</a><a href="#scoring">算点</a><a href="#mleague">赛事</a><a href="#archive">牌谱</a>
        </div>
        <p className="footer-note">原型版本 · 内容与赛程数据仅供设计演示</p>
      </footer>
    </main>
  );
}
