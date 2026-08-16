import { useEffect, useMemo, useState, type CSSProperties } from "react";

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
  book?: "何切300" | "何切301";
  tags?: string[];
};

const whatCutQuestions: WhatCutQuestion[] = [
  {
    id: 1, round: "东一局", seat: "西家", turn: 8, doraIndicator: "Pin2",
    tiles: ["Man3", "Man4", "Man5", "Man6", "Man7", "Pin2", "Pin3", "Pin8", "Pin8", "Sou5", "Sou7", "Sou7", "Sou9", "Pin1"],
    answer: "Sou9", questionPage: 5, answerPage: 8,
    explanation: "书中推荐切九索。索子几种切法的进张枚数相同，因此优先留下更容易做成平和的两个坎张结构。",
  },
  {
    id: 2, round: "东一局", seat: "西家", turn: 8, doraIndicator: "Pin2",
    tiles: ["Man3", "Man4", "Man5", "Man6", "Man7", "Pin2", "Pin3", "Pin8", "Pin8", "Sou5", "Sou7", "Sou7", "Sou9", "Pin4"],
    answer: "Sou9", questionPage: 5, answerPage: 8,
    explanation: "书中推荐切九索。先确定断幺路线，既保留更有利的打点，也为需要提速时留下鸣牌回避手的空间。",
  },
  {
    id: 3, round: "东一局", seat: "西家", turn: 8, doraIndicator: "Pin2",
    tiles: ["Man3", "Man4", "Man5", "Man6", "Man7", "Pin2", "Pin3", "Pin8", "Pin8", "Sou5", "Sou7", "Sou7", "Sou9", "Sou7"],
    answer: "Sou5", questionPage: 5, answerPage: 8,
    explanation: "书中推荐切五索。切五索与切九索的进张数相同；保留九索一侧能多接赤五索，也能在摸六索时转成平和形。",
  },
  {
    id: 4, round: "东一局", seat: "东家", turn: 6, doraIndicator: "Sou5-Dora",
    tiles: ["Man6", "Man7", "Man8", "Man8", "Man8", "Man9", "Pin4", "Pin5-Dora", "Pin5", "Pin6", "Pin8", "Sou2", "Sou2", "Pin8"],
    answer: "Pin5", questionPage: 6, answerPage: 9,
    explanation: "书中推荐切五筒。固定筒子两面，能做出更容易平和的形状；万子一侧同时保留五、七、八万三种有效牌。",
  },
  {
    id: 5, round: "东一局", seat: "东家", turn: 6, doraIndicator: "Sou5-Dora",
    tiles: ["Man6", "Man7", "Man8", "Man8", "Man8", "Man9", "Pin4", "Pin5-Dora", "Pin5", "Pin6", "Pin8", "Ton", "Ton", "Pin8"],
    answer: "Man9", questionPage: 6, answerPage: 9,
    explanation: "书中推荐切九万。双东的两翻价值很高，保留对子后无论如何鸣牌都更容易拿到役；与切五筒相比也只少一枚有效牌。",
  },
  {
    id: 6, round: "东一局", seat: "西家", turn: 6, doraIndicator: "Man1",
    tiles: ["Man3", "Man3", "Pin2", "Pin2", "Pin3", "Pin5-Dora", "Pin6", "Pin6", "Pin8", "Pin8", "Pin8", "Sou4", "Sou5-Dora", "Sou3"],
    answer: "Pin2", questionPage: 6, answerPage: 9,
    explanation: "书中推荐切二筒。切八筒虽然更容易做出一杯口，但高目的一杯口不值得牺牲五枚有效牌，单纯扩张进张更重要。",
  },
  {
    id: 7, round: "东一局", seat: "东家", turn: 7, doraIndicator: "Man6",
    tiles: ["Man6", "Man7", "Pin3", "Pin4", "Pin5", "Pin5-Dora", "Pin6", "Pin7", "Pin7", "Pin7", "Sou2", "Sou2", "Sou4", "Pin5"],
    answer: "Sou4", questionPage: 7, answerPage: 10,
    explanation: "书中推荐切四索。先抽出完成的567筒，就能看出剩余筒子是三面张并带补强牌；固定索子雀头后，进张与最终形都更好。",
  },
  {
    id: 8, round: "东一局", seat: "东家", turn: 7, doraIndicator: "Man6",
    tiles: ["Man6", "Man7", "Pin3", "Pin4", "Pin5-Dora", "Pin5", "Pin6", "Pin7", "Pin7", "Pin7", "Sou2", "Sou2", "Sou4", "Pin2"],
    answer: "Pin5", questionPage: 7, answerPage: 10,
    explanation: "书中推荐切五筒。两个雀头候选中，过早拆索子的进张损失太大；切五筒能保留索子当前形状，进张更多，也不容易丢掉断幺。",
  },
  {
    id: 9, round: "东一局", seat: "西家", turn: 6, doraIndicator: "Pin1",
    tiles: ["Man1", "Man1", "Man2", "Pin2", "Pin2", "Pin3", "Pin5-Dora", "Pin6", "Pin6", "Pin8", "Pin8", "Pin8", "Sou5-Dora", "Sou3"],
    answer: "Man2", questionPage: 7, answerPage: 11,
    explanation: "书中推荐切二万。宝牌三筒构成两向听牌姿；切二万能在维持三雀头变化的同时自然转为食断，整体效率优于让复杂筒子形一直不动。",
  },
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
  {
    id: 19, round: "东一局", seat: "东家", turn: 8, doraIndicator: "Shaa",
    tiles: ["Man3", "Man4", "Man5-Dora", "Man6", "Man8", "Man8", "Pin5-Dora", "Pin6", "Pin6", "Pin7", "Sou4", "Sou5-Dora", "Sou6", "Sou6"],
    answer: "Sou6", questionPage: 19, answerPage: 23,
    explanation: "把八万视作雀头后，3456万是四连形，5667筒是中膨形，4566索是亚两面。三组复合形都能做出至少两组面子，迷茫时优先拆掉最难同时做出两面的亚两面。",
  },
  {
    id: 20, round: "东一局", seat: "东家", turn: 7, doraIndicator: "Shaa",
    tiles: ["Man3", "Man4", "Man4", "Man5-Dora", "Pin2", "Pin2", "Pin3", "Pin5-Dora", "Pin6", "Pin8", "Sou5-Dora", "Sou6", "Sou7", "Haku"],
    answer: "Pin8", questionPage: 19, answerPage: 23,
    explanation: "保留容易断开的万子中膨形时，应比较筒子与索子两侧的四连形。筒子一侧没有雀头干涉、进张更宽；即使最终都形成三面听，筒子还包含平和，因此切八筒更有利。",
  },
  {
    id: 21, round: "东一局", seat: "东家", turn: 7, doraIndicator: "Shaa",
    tiles: ["Man3", "Man4", "Man4", "Man5-Dora", "Pin2", "Pin2", "Pin3", "Pin5-Dora", "Pin6", "Pin8", "Sou2", "Sou3", "Sou4", "Sou5-Dora"],
    answer: "Sou2", questionPage: 19, answerPage: 24,
    explanation: "345 三色很容易看漏。固定索子的 345 顺子，继续等待万子中膨形的靠张与筒子的 3、4 筒变化，能同时保留进张和打点。",
  },
  {
    id: 22, round: "东一局", seat: "西家", turn: 7, doraIndicator: "Shaa",
    tiles: ["Man3", "Man4", "Man5-Dora", "Man5", "Man9", "Man9", "Man9", "Pin5-Dora", "Pin5", "Pin6", "Sou5-Dora", "Sou6", "Sou7", "Haku"],
    answer: "Man5", questionPage: 20, answerPage: 24,
    explanation: "四连形有四种牌能做出两面，同时还有两种牌能形成雀头；556 筒也兼具雀头与面子变化。两边都很强时，拆掉亚两面，切五万最平衡。",
  },
  {
    id: 23, round: "东一局", seat: "西家", turn: 7, doraIndicator: "Shaa",
    tiles: ["Man4", "Man4", "Man7", "Man8", "Man9", "Pin5-Dora", "Pin6", "Pin7", "Pin8", "Sou2", "Sou5-Dora", "Sou6", "Sou6", "Man5-Dora"],
    answer: "Sou6", questionPage: 20, answerPage: 24,
    explanation: "序盘为了完全利用三枚赤牌而拆四万，会明显损失进张。综合最终形、和率与期望值，先切六索固定其余复合形最为均衡。",
  },
  {
    id: 24, round: "东一局", seat: "西家", turn: 7, doraIndicator: "Shaa",
    tiles: ["Man3", "Man4", "Man4", "Man5-Dora", "Man6", "Man7", "Pin2", "Pin4", "Pin5-Dora", "Pin6", "Sou3", "Sou5-Dora", "Sou6", "Sou2"],
    answer: "Sou6", questionPage: 20, answerPage: 25,
    explanation: "切三万的进张最多，但和率与 36 筒、36 索相比并没有明显优势。固定雀头并保留更有三色潜力的一侧后，切六索的综合期待值最高。",
  },
  {
    id: 25, round: "东一局", seat: "东家", turn: 7, doraIndicator: "Shaa",
    tiles: ["Man5-Dora", "Man6", "Man7", "Man8", "Pin3", "Pin4", "Pin5-Dora", "Pin6", "Sou6", "Haku", "Haku", "Sou5-Dora", "Sou5", "Sou5"],
    answer: "Haku", questionPage: 21, answerPage: 25,
    explanation: "切白的进张最多，也更容易形成平和。靠边的一杯口即使做成，最终形与和率也不理想；除非局面必须追求打点，否则不要为了它牺牲宽广进张。",
  },
  {
    id: 26, round: "东一局", seat: "东家", turn: 7, doraIndicator: "Shaa",
    tiles: ["Man5-Dora", "Man6", "Man7", "Man8", "Pin1", "Pin2", "Pin3", "Pin4", "Sou6", "Sou5-Dora", "Sou5", "Haku", "Haku", "Haku"],
    answer: "Pin1", questionPage: 21, answerPage: 25,
    explanation: "靠边的 1234 筒虽然看似四连形，实际功能与单独浮牌四筒相近；摸二筒也只会形成边张三筒。切一筒能保留更有效的进张。",
  },
  {
    id: 27, round: "东一局", seat: "东家", turn: 7, doraIndicator: "Shaa",
    tiles: ["Man5-Dora", "Man6", "Man7", "Man8", "Pin2", "Pin3", "Pin4", "Pin5-Dora", "Sou5-Dora", "Sou6", "Sou6", "Sou7", "Sou7", "Sou7"],
    answer: "Man8", questionPage: 21, answerPage: 26,
    explanation: "566777 索可以拆成两面，或两面加雀头；切五万、八万、二筒、五筒的听牌率差异很小。保留五万后，摸六七筒还有 567 三色，因此切八万。",
  },
  {
    id: 28, round: "东一局", seat: "西家", turn: 7, doraIndicator: "Shaa", book: "何切301", tags: ["牌效率", "复合形"],
    tiles: ["Man6", "Man7", "Man8", "Pin2", "Pin3", "Pin4", "Pin4", "Sou2", "Sou3", "Sou4", "Sou5-Dora", "Sou6", "Sou7", "Pei"],
    answer: "Sou2", questionPage: 22, answerPage: 26,
    explanation: "固定三索作雀头，进张与期待值最大；最高形是摸三筒形成断幺、平和、一杯口。按结构拆解，二索和五索可看作同筋浮牌，没有必要同时保留。",
  },
  {
    id: 29, round: "东一局", seat: "西家", turn: 7, doraIndicator: "Shaa", book: "何切301", tags: ["牌效率", "亚两面"],
    tiles: ["Man7", "Man8", "Man9", "Pin1", "Pin1", "Pin2", "Pin3", "Sou2", "Sou3", "Sou4", "Sou5-Dora", "Sou6", "Sou7", "Pei"],
    answer: "Pin1", questionPage: 22, answerPage: 26,
    explanation: "1123 筒是靠边亚两面，进一、四筒虽能形成面子加雀头，却也容易留下坎张或边张的一杯口，降低期待值。书中先切一筒，优先回避愚形听牌。",
  },
  {
    id: 30, round: "东一局", seat: "西家", turn: 7, doraIndicator: "Shaa", book: "何切301", tags: ["牌效率", "听牌形"],
    tiles: ["Man7", "Man8", "Man9", "Pin1", "Pin1", "Pin2", "Pin3", "Sou2", "Sou3", "Sou5-Dora", "Sou6", "Sou7", "Sou7", "Pei"],
    answer: "Pin1", questionPage: 22, answerPage: 27,
    explanation: "切二索是四、六、九索进张的两面两坎形，却没有独立雀头；切一筒的进张数最多。与进张多但容易留下亚两面的选择相比，应优先纯粹的两面听牌。",
  },
  {
    id: 31, round: "东一局", seat: "东家", turn: 5, doraIndicator: "Shaa", book: "何切301", tags: ["打点", "三色"],
    tiles: ["Man5", "Man6", "Man7", "Man8", "Pin2", "Pin2", "Pin4", "Pin5", "Pin6", "Pin7", "Sou6", "Sou7", "Sou7", "Sou7"],
    answer: "Man8", questionPage: 30, answerPage: 33,
    explanation: "包含三色的形状期待值最大。注意到摸三筒时能形成断幺、平和、三色，就能确定切八万。",
  },
  {
    id: 32, round: "东一局", seat: "东家", turn: 5, doraIndicator: "Shaa", book: "何切301", tags: ["牌效率", "复合形"],
    tiles: ["Man5", "Man6", "Man7", "Man8", "Pin2", "Pin2", "Pin4", "Pin5", "Pin6", "Pin7", "Sou7", "Sou7", "Sou7", "Pei"],
    answer: "Pei", questionPage: 30, answerPage: 33,
    explanation: "暗刻旁边不容易做面子。活用两个四连形追求多面听；八万对三色也没有帮助，因此书中先切北。",
  },
  {
    id: 33, round: "东一局", seat: "东家", turn: 5, doraIndicator: "Shaa", book: "何切301", tags: ["打点", "三色", "复合形"],
    tiles: ["Man4", "Man5", "Man6", "Man7", "Pin3", "Pin3", "Pin4", "Pin6", "Pin7", "Pin8", "Sou6", "Pei", "Pei", "Pei"],
    answer: "Pin8", questionPage: 30, answerPage: 33,
    explanation: "单看进张数切六索最多，但留下六索有断幺、三色与靠红五索等好处。固定三筒雀头、追求靠张听牌，所以书中切八筒。",
  },
  {
    id: 34, round: "东一局", seat: "东家", turn: 8, doraIndicator: "Man1", book: "何切301", tags: ["听牌形", "和率"],
    tiles: ["Man7", "Man7", "Man9", "Man9", "Pin2", "Pin3", "Pin4", "Pin5", "Sou2", "Sou3", "Sou4", "Chun", "Chun", "Pin4"],
    answer: "Man7", questionPage: 31, answerPage: 34,
    explanation: "从 7799 万中切一张，变成三枚结构。若最终听中对碰，为了更容易和出，应留下更靠边的对子，因此书中切七万。",
  },
  {
    id: 35, round: "东一局", seat: "东家", turn: 8, doraIndicator: "Man1", book: "何切301", tags: ["听牌形", "完全一向听"],
    tiles: ["Man7", "Man7", "Man9", "Man9", "Pin2", "Pin3", "Pin4", "Pin5", "Sou2", "Sou3", "Sou4", "Sou7", "Sou7", "Pin4"],
    answer: "Man9", questionPage: 31, answerPage: 34,
    explanation: "目标是做成向内侧靠的完全一向听。切九万固定内侧对子；即使之后摸一筒会失去断幺，整体听牌形仍更优。",
  },
  {
    id: 36, round: "东一局", seat: "东家", turn: 8, doraIndicator: "Man1", book: "何切301", tags: ["打点", "听牌形", "巡目判断"],
    tiles: ["Man7", "Man7", "Man9", "Man9", "Pin2", "Pin3", "Pin4", "Pin5", "Pin6", "Sou2", "Sou3", "Sou4", "Sou5-Dora", "Pin4"],
    answer: "Sou5-Dora", questionPage: 31, answerPage: 34,
    explanation: "第八巡的亲家不应放过摸八万直接听牌的机会：立直后有一杯口与赤牌的 7700 点，即使是剩三张的坎张也值得；还保留摸六万转完全一向听的变化，因此书中切赤五索。",
  },
  {
    id: 37, round: "东一局", seat: "东家", turn: 6, doraIndicator: "Sou1", book: "何切301", tags: ["打点", "复合形", "四暗刻"],
    tiles: ["Pin4", "Pin5", "Pin5", "Pin5", "Pin6", "Sou2", "Sou3", "Sou4", "Sou4", "Sou4", "Sou7", "Sou8", "Sou8", "Pin4"],
    answer: "Pin5", questionPage: 32, answerPage: 35,
    explanation: "虽然能看到四暗刻，但不能为此切六筒或七索固定对子。当前已经有亲家满贯级打点，切五筒既保留二杯口方向，也没有明显损失四暗刻变化；切八索的进张只多一枚，却更容易丢失手役。",
  },
  {
    id: 38, round: "东一局", seat: "东家", turn: 7, doraIndicator: "Man9", book: "何切301", tags: ["牌效率", "七对子", "复合形"],
    tiles: ["Man3", "Man4", "Man5", "Man6", "Pin3", "Pin3", "Pin4", "Pin4", "Pin6", "Pin8", "Pin8", "Sou2", "Sou2", "Man5-Dora"],
    answer: "Pin8", questionPage: 32, answerPage: 35,
    explanation: "一边保留面子手，一边维持七对子一向听，失张只有七筒。摸二筒或五筒时可以放弃七对子，拆八筒或二索对子，转向断幺、平和、一杯口，因此书中先切八筒。",
  },
  {
    id: 39, round: "东一局", seat: "东家", turn: 7, doraIndicator: "Man9", book: "何切301", tags: ["牌效率", "听牌形", "即立判断"],
    tiles: ["Man3", "Man4", "Man6", "Man7", "Pin3", "Pin4", "Pin5", "Pin6", "Pin6", "Pin8", "Pin8", "Sou2", "Sou2", "Man5-Dora"],
    answer: "Pin6", questionPage: 32, answerPage: 36,
    explanation: "万子一侧的有效进张很多，比起追求完全一向听变化，直接听牌的概率更高。书中据此反推万子进张后的听牌形，选择切六筒。",
  },
  {
    id: 40, round: "东一局", seat: "西家", turn: 8, doraIndicator: "Sou5", book: "何切301", tags: ["牌效率", "和率", "听牌形"],
    tiles: ["Man2", "Man3", "Man4", "Man5", "Pin2", "Pin3", "Pin3", "Pin5", "Sou2", "Sou3", "Sou4", "Sou8", "Sou8", "Sou8"],
    answer: "Pin5", questionPage: 36, answerPage: 39,
    explanation: "切二筒虽然听牌概率最高，但其中愚形听牌较多，和牌率与期待值不如切五筒。二五万成对时可以形成两面听，即使最差的进张是一筒，也仍是两面加单骑的听牌形。",
  },
  {
    id: 41, round: "东一局", seat: "西家", turn: 8, doraIndicator: "Sou5", book: "何切301", tags: ["牌效率", "中膨形", "固定雀头"],
    tiles: ["Man3", "Man4", "Man4", "Man5", "Pin2", "Pin3", "Pin3", "Pin5", "Sou2", "Sou3", "Sou4", "Sou8", "Sou8", "Sou8"],
    answer: "Pin2", questionPage: 36, answerPage: 39,
    explanation: "中膨形与固定雀头的组合很好。即使切五筒，最终听一四筒的可能性也很低，不如切二筒固定雀头，同时保留摸六筒形成两面听牌的机会。",
  },
  {
    id: 42, round: "东一局", seat: "东家", turn: 7, doraIndicator: "Man3", book: "何切301", tags: ["鸣牌判断", "打点", "牌效率"],
    tiles: ["Man4", "Man5-Dora", "Man6", "Pin2", "Pin3", "Pin3", "Sou2", "Sou2", "Sou3", "Sou3", "Sou3", "Sou4", "Sou5", "Sou5-Dora"],
    answer: "Sou5", questionPage: 36, answerPage: 40,
    explanation: "切三筒和切五索的有效牌枚数相同；切三筒的门清期待值更高，但摸入赤五索后已经确定满贯，应重视鸣牌效率。保留三筒、二三索的碰牌以及四筒、六索的吃牌路线，所以切普通五索。",
  },
  {
    id: 43, round: "东一局", seat: "东家", turn: 6, doraIndicator: "Pin6", book: "何切301", tags: ["宝牌处理", "押引", "四暗刻"],
    tiles: ["Pin3", "Pin4", "Pin5", "Pin5", "Pin7", "Sou3", "Sou3", "Sou4", "Sou4", "Sou4", "Sou5", "Sou6", "Sou6", "Pin5-Dora"],
    answer: "Pin7", questionPage: 37, answerPage: 40,
    explanation: "宝牌七筒看似应当保留，但宝牌指示牌六筒是进张瓶颈，吃进六筒也未必达到满贯；索子门清听牌时最终仍会切掉七筒，而且手牌还有四暗刻变化。书中认为切宝牌七筒最均衡、期待值最高。",
  },
  {
    id: 44, round: "东一局", seat: "东家", turn: 6, doraIndicator: "Pin6", book: "何切301", tags: ["宝牌处理", "听牌形", "一杯口"],
    tiles: ["Pin3", "Pin4", "Pin5", "Pin5", "Pin7", "Sou2", "Sou2", "Sou4", "Sou4", "Sou4", "Sou5", "Sou6", "Sou6", "Pin5-Dora"],
    answer: "Pin7", questionPage: 37, answerPage: 40,
    explanation: "保留宝牌七筒只有摸六筒时能直接听牌，其他进张最后仍要舍弃它。摸六筒与摸五索做成一杯口的概率相同，而六索成为暗刻后的听牌形更好，因此书中仍切宝牌七筒。",
  },
  {
    id: 45, round: "东一局", seat: "东家", turn: 6, doraIndicator: "Sou5", book: "何切301", tags: ["打点", "宝牌利用", "鸣牌判断"],
    tiles: ["Man5-Dora", "Man5", "Man5", "Man6", "Pin2", "Pin2", "Pin3", "Pin5-Dora", "Pin7", "Sou6", "Sou8", "Sou8", "Sou8", "Pin4"],
    answer: "Man6", questionPage: 37, answerPage: 41,
    explanation: "保留万子一侧虽然可能形成三面听，却会在之后舍弃宝牌六索。切六万可以完整利用六索，即使鸣牌也能做成断幺、宝牌三的满贯；书中认为这种确定高打点的路线值得追求。",
  },
  {
    id: 46, round: "东一局", seat: "西家", turn: 7, doraIndicator: "Man1", book: "何切301", tags: ["牌效率", "二杯口", "固定雀头"],
    tiles: ["Man5", "Man5", "Man6", "Man7", "Pin2", "Pin2", "Pin3", "Pin3", "Sou5", "Sou6", "Sou6", "Sou7", "Sou7", "Pin4"],
    answer: "Man5", questionPage: 38, answerPage: 41,
    explanation: "固定五万雀头虽然可以追求断幺、平和、二杯口，但与切五万相比有效牌枚数差距太大，尤其摸一筒后形状会明显受损。书中选择切五万，以最大进张数为优先。",
  },
  {
    id: 47, round: "东一局", seat: "西家", turn: 7, doraIndicator: "Sou2", book: "何切301", tags: ["牌效率", "复合形", "断幺"],
    tiles: ["Man1", "Man3", "Man5-Dora", "Man6", "Man7", "Pin2", "Pin3", "Pin4", "Pin6", "Pin7", "Sou4", "Sou5", "Sou6", "Man6"],
    answer: "Man1", questionPage: 38, answerPage: 41,
    explanation: "切六万的进张最多，但会失去雀头，后续处理困难。切一万比切七万留下的两坎形更兼顾打点与广度，之后摸三、四、六万都能形成断幺、平和听牌，因此书中切一万。",
  },
  {
    id: 48, round: "东一局", seat: "西家", turn: 7, doraIndicator: "Sou2", book: "何切301", tags: ["固定雀头", "断幺", "一杯口"],
    tiles: ["Man5-Dora", "Man6", "Man7", "Pin2", "Pin3", "Pin4", "Pin6", "Pin6", "Pin7", "Sou2", "Sou5", "Sou6", "Sou6", "Man6"],
    answer: "Pin7", questionPage: 38, answerPage: 42,
    explanation: "固定雀头后更容易做成断幺或一杯口。虽然常见原则是拆亚两面，但这手牌最强的部分是万子的中膨形；切七筒固定雀头，能最大限度利用该形状的期待值。",
  },
  {
    id: 49, round: "东一局", seat: "西家", turn: 7, doraIndicator: "Sou8", book: "何切301", tags: ["打点", "赤牌利用", "听牌形"],
    tiles: ["Man5-Dora", "Man6", "Man7", "Man8", "Man9", "Pin3", "Pin4", "Pin6", "Pin6", "Pin6", "Pin7", "Sou2", "Sou3", "Sou4"],
    answer: "Man9", questionPage: 43, answerPage: 47,
    explanation: "切七筒的有效牌最多，但最差的六万进张会迫使舍弃赤五万，只剩立直。切九万可以确定断幺并必定用上赤五万，足以弥补有效牌枚数差距；摸五筒时还能形成四面听。",
  },
  {
    id: 50, round: "东一局", seat: "西家", turn: 4, doraIndicator: "Sou3", book: "何切301", tags: ["鸣牌判断", "断幺", "对子处理"],
    tiles: ["Man4", "Man5", "Man6", "Man6", "Man8", "Pin4", "Pin4", "Pin6", "Sou3", "Sou4", "Sou5", "Sou9", "Sou9", "Man3"],
    answer: "Sou9", questionPage: 43, answerPage: 47,
    explanation: "顺着现有搭子直线前进仍然没有役。手里已有三个对子，拆掉九索对子对速度影响不大，却能确定断幺并保留鸣牌机会，所以书中切九索。",
  },
  {
    id: 51, round: "东一局", seat: "西家", turn: 4, doraIndicator: "Sou3", book: "何切301", tags: ["役牌", "三色", "对子处理"],
    tiles: ["Man4", "Man5", "Man6", "Man6", "Man8", "Pin4", "Pin4", "Pin6", "Sou3", "Sou4", "Sou5", "Ton", "Ton", "Man3"],
    answer: "Man8", questionPage: 43, answerPage: 47,
    explanation: "东是役牌，应以碰出或保留对碰立直为前提维持三组对子。切八万后，后续进张仍有 345 或 456 三色的变化。",
  },
  {
    id: 52, round: "东一局", seat: "西家", turn: 7, doraIndicator: "Sou1", book: "何切301", tags: ["牌效率", "听牌形", "三面张"],
    tiles: ["Man5", "Man7", "Man7", "Pin2", "Pin3", "Pin4", "Pin6", "Pin7", "Sou3", "Sou4", "Sou5", "Sou7", "Sou7", "Man4"],
    answer: "Sou7", questionPage: 44, answerPage: 48,
    explanation: "先切一张七索，下一巡若摸到六索，就可以把索子部分扩展成三面张。书中因此先拆七索对子。",
  },
  {
    id: 53, round: "东一局", seat: "西家", turn: 7, doraIndicator: "Sou1", book: "何切301", tags: ["牌效率", "对子处理", "宝牌"],
    tiles: ["Man5", "Man7", "Man7", "Pin2", "Pin3", "Pin4", "Sou2", "Sou3", "Sou6", "Sou7", "Sou8", "Sou8", "Sou8", "Man4"],
    answer: "Man7", questionPage: 44, answerPage: 48,
    explanation: "即时看，拆七万或八索对子都是 16 枚进张；但未完成搭子再成对时会拉开差距。拆八索只增加二索和七万四枚，拆七万则增加宝牌二索及五、八索共七枚，因此应保留连续的索子并切七万。",
  },
  {
    id: 54, round: "东一局", seat: "西家", turn: 7, doraIndicator: "Sou1", book: "何切301", tags: ["宝牌", "摸切", "鸣牌判断"],
    tiles: ["Man5", "Man7", "Man7", "Pin2", "Pin3", "Pin4", "Pin6", "Pin7", "Sou2", "Sou3", "Sou4", "Sou7", "Sou7", "Sou2"],
    answer: "Sou2", questionPage: 44, answerPage: 49,
    explanation: "能够同时使用两张宝牌二索的形状很有限，强行保留后也不容易通过鸣牌做成满贯。书中认为无需勉强，直接摸切二索。",
  },
];

function whatCutBook(question: WhatCutQuestion) {
  return question.book ?? "何切301";
}

function whatCutTags(question: WhatCutQuestion) {
  if (question.tags) return question.tags;
  if (question.id <= 9) return ["牌效率"];
  if (question.id <= 18) return ["复合形"];
  return ["复合形", "打点"];
}

const whatCutTagOptions = Array.from(new Set(whatCutQuestions.flatMap(whatCutTags)));

const tileGroups = {
  "万子": Array.from({ length: 9 }, (_, index) => ({ name: `Man${index + 1}`, label: `${index + 1}万` })),
  "筒子": Array.from({ length: 9 }, (_, index) => ({ name: `Pin${index + 1}`, label: `${index + 1}筒` })),
  "索子": Array.from({ length: 9 }, (_, index) => ({ name: `Sou${index + 1}`, label: `${index + 1}索` })),
  "字牌": [
    { name: "Ton", label: "东" }, { name: "Nan", label: "南" }, { name: "Shaa", label: "西" }, { name: "Pei", label: "北" },
    { name: "Haku", label: "白" }, { name: "Hatsu", label: "发" }, { name: "Chun", label: "中" },
  ],
};

type ResourceTopic = "tiles" | "rules" | "yaku" | "scoring";

const resourceTopics: Array<{ key: ResourceTopic; label: string; english: string; count: string }> = [
  { key: "tiles", label: "牌面", english: "TILES", count: "34 + 赤牌" },
  { key: "rules", label: "规则介绍", english: "RULES", count: "基础与细则" },
  { key: "yaku", label: "役种", english: "YAKU", count: "46 条图例" },
  { key: "scoring", label: "算点", english: "SCORING", count: "亲家 / 子家表" },
];

const ruleOverviewEntries = [
  ["01", "牌局目标", "常规和牌由四组面子与一组雀头组成；七对子、国士无双是特殊牌型。仅凑成牌型还不够，至少需要一个役。"],
  ["02", "牌与座次", "使用万、筒、索各 1—9 与七种字牌，共 34 种、每种四张，合计 136 张。场风与自风会决定风牌刻子的役牌价值。"],
  ["03", "摸牌与舍牌", "通常从庄家开始，每巡摸一张、舍一张，直到有人和牌或牌山耗尽。吃、碰后直接舍牌；开杠后先补一张岭上牌再舍牌。"],
  ["04", "吃、碰与杠", "吃只能取上家舍牌，碰与大明杠可取任一家舍牌。吃、碰和明杠会失去门清；暗杠通常仍按门清处理。"],
  ["05", "立直与和牌", "门清听牌时可支付 1000 点立直。自摸由三家共同支付，荣和由放铳者支付；振听状态只能自摸。"],
  ["06", "流局与连庄", "荒牌流局时通常结算合计 3000 点听牌料。庄家和牌时连庄；流局时是否以庄家听牌决定连庄，应以采用规则为准。"],
  ["07", "半庄与终局", "常见半庄包括东场与南场，庄家轮转至南四局。击飞、西入、供托归属及终局条件会随平台和赛事而变。"],
  ["08", "采用规则", "赤牌、切上满贯、双响、头跳、途中流局等并非处处相同。实战前应先确认平台或赛事的完整规则。"],
];

const ruleEntries = [
  { title: "振听", tag: "和牌限制", summary: "自己的舍牌中只要包含当前全部和牌张中的任意一种，就不能荣和其中任何一张；自摸仍然有效。", detail: "未立直见逃会进入同巡振听，通常在完成自己的下一次摸打后解除；立直后见逃则持续至该局结束。" },
  { title: "无役与宝牌", tag: "和牌条件", summary: "宝牌、赤宝牌与里宝牌只增加翻数，本身不能充当役。", detail: "先确认至少一个役，再计算宝牌数量。" },
  { title: "鸣牌优先级", tag: "副露", summary: "同一张牌出现冲突宣言时，和牌通常优先于副露；吃、碰、杠之间的优先顺序还要看采用规则。", detail: "M.LEAGUE 采用和牌 ＞ 碰、杠 ＞ 吃；多家和牌则采用头跳。其他平台可能按发声时机或允许多家荣和。" },
  { title: "立直条件", tag: "立直", summary: "必须保持门清并已听牌，横置宣言牌并供托 1000 点；点数下限和剩余摸牌数会随规则变化。", detail: "立直后原则上只能摸切；是否允许暗杠，要同时满足采用规则对听牌形与面子构成不变的要求。" },
  { title: "杠与新宝牌", tag: "杠", summary: "开杠后补摸岭上牌，并按采用规则翻开杠宝牌指示；一局最多成立四个杠。", detail: "加杠可能被抢杠；暗杠能否被国士无双抢杠并非统一规则，M.LEAGUE 不允许抢暗杠。" },
  { title: "途中流局", tag: "流局", summary: "九种九牌、四风连打、四家立直、四杠散了等可能提前流局。", detail: "具体采用哪些途中流局，以对局规则为准。" },
  { title: "荒牌流局", tag: "流局", summary: "牌山摸尽无人和牌，通常由未听牌者向听牌者支付合计 3000 点。", detail: "流局满贯、庄家是否听牌连庄等需同时查看赛事规则。" },
  { title: "包牌", tag: "责任支付", summary: "使他人完成大三元、大四喜等最后一组关键副露时，部分规则会要求出牌者承担责任支付。", detail: "适用役种与支付方式并不统一；M.LEAGUE 还对四杠子采用包牌。" },
  { title: "头跳与多家和", tag: "荣和", summary: "头跳只承认离放铳者最近的和牌者；双响、三响规则则允许多人和牌。", detail: "M.LEAGUE 采用头跳，其他平台可能不同。" },
  { title: "食替", tag: "打牌限制", summary: "吃牌后不能立即打出与吃入牌完全相同，或构成同一组替代关系的牌。", detail: "筋食替的具体范围因规则而异。" },
];

const yakuCards = [
  ["立直", "リーチ", "1翻", "门清", "宣言听牌并支付 1000 点"], ["一发", "イッパツ", "1翻", "门清", "立直后无鸣牌打断的一巡内和牌"],
  ["门前清自摸和", "メンゼンツモ", "1翻", "门清", "门清状态下自摸"], ["断幺九", "タンヤオ", "1翻", "可副露", "全手仅由二至八数牌组成；副露成立须采用食断规则"],
  ["平和", "ピンフ", "1翻", "门清", "全顺子、非役牌雀头、两面听"], ["一杯口", "イーペーコー", "1翻", "门清", "同色同数字的两组顺子"],
  ["役牌·自风", "ヤクハイ・ジカゼ", "1翻", "可副露", "与自己座次相同风牌的刻子或杠子"],
  ["役牌·场风", "ヤクハイ・バカゼ", "1翻", "可副露", "与当前场风相同风牌的刻子或杠子"],
  ["役牌·三元牌", "ヤクハイ・サンゲンパイ", "1翻", "可副露", "白、发、中任意一种的刻子或杠子"],
  ["岭上开花", "リンシャン", "1翻", "可副露", "开杠后补摸岭上牌并自摸和牌"],
  ["抢杠", "チャンカン", "1翻", "可副露", "他家加杠牌正好是自己的和牌"], ["海底摸月", "ハイテイ", "1翻", "可副露", "牌山最后一张自摸"],
  ["河底捞鱼", "ホウテイ", "1翻", "可副露", "最后一张舍牌荣和"], ["双立直", "ダブルリーチ", "2翻", "门清", "第一巡且无人鸣牌时立直"],
  ["七对子", "チートイツ", "2翻", "门清", "七组不同对子"], ["对对和", "トイトイ", "2翻", "可副露", "四组刻子或杠子"],
  ["三暗刻", "サンアンコウ", "2翻", "可副露", "三组暗刻或暗杠"], ["三色同顺", "サンショク", "2翻 / 1翻", "可副露", "三种花色同数字顺子"],
  ["一气通贯", "イッツー", "2翻 / 1翻", "可副露", "同色 123、456、789"], ["混全带幺九", "チャンタ", "2翻 / 1翻", "可副露", "每组都含幺九牌且至少一组顺子"],
  ["三色同刻", "サンショクドウコウ", "2翻", "可副露", "三种花色同数字刻子"], ["三杠子", "サンカンツ", "2翻", "可副露", "一人完成三组杠子"],
  ["小三元", "ショウサンゲン", "2翻", "可副露", "三元牌两刻一对；两组役牌会另外各计一翻"], ["混老头", "ホンロウトウ", "2翻", "可副露", "全手仅由老头牌与字牌组成"],
  ["混一色", "ホンイツ", "3翻 / 2翻", "可副露", "一种数牌加字牌"], ["纯全带幺九", "ジュンチャン", "3翻 / 2翻", "可副露", "每组均含数牌一或九"],
  ["二杯口", "リャンペーコー", "3翻", "门清", "两组一杯口"], ["清一色", "チンイツ", "6翻 / 5翻", "可副露", "全手仅一种数牌"],
  ["国士无双", "コクシムソウ", "役满", "门清", "十三种幺九牌各一张，并以其中一种组成对子"], ["四暗刻", "スーアンコウ", "役满", "门清", "四组暗刻或暗杠；双碰听荣和通常不能成立"],
  ["大三元", "ダイサンゲン", "役满", "可副露", "白发中各成刻子或杠子"], ["小四喜", "ショウスーシー", "役满", "可副露", "三组风牌刻子加一对风牌"],
  ["大四喜", "ダイスーシー", "役满", "可副露", "四种风牌全部成刻子"], ["字一色", "ツーイーソー", "役满", "可副露", "全手仅由字牌组成"],
  ["绿一色", "リューイーソー", "役满", "可副露", "全手仅由绿色牌组成"], ["清老头", "チンロウトウ", "役满", "可副露", "全手仅由一九数牌组成"],
  ["九莲宝灯", "チューレン", "役满", "门清", "门清同色 1112345678999，再加任意一张同色数牌"], ["四杠子", "スーカンツ", "役满", "可副露", "一人完成四组杠子"],
  ["天和", "テンホウ", "役满", "门清", "庄家起手十四张牌即已和牌"], ["地和", "チーホウ", "役满", "门清", "闲家第一次自摸即和，且此前无人鸣牌"],
  ["国士无双十三面", "コクシムソウ13メン", "双倍役满（采用时）", "门清", "十三种幺九牌各一张，听其中任意一种组成对子"],
  ["四暗刻单骑", "スーアンコウタンキ", "双倍役满（采用时）", "门清", "四组暗刻已经完成，以单骑等待雀头"],
  ["纯正九莲宝灯", "ジュンセイチューレン", "双倍役满（采用时）", "门清", "1112345678999 的九面听；是否双倍以采用规则为准"],
  ["大四喜（双倍）", "ダイスーシー", "双倍役满（采用时）", "可副露", "部分规则将大四喜计作双倍役满"],
  ["流局满贯", "ナガシマンガン", "满贯", "特殊", "采用该规则时，荒牌流局且舍牌全为幺九、未被他家鸣取可计满贯"], ["宝牌", "ドラ", "加翻", "非役", "宝牌、赤宝牌和里宝牌只加翻，不提供役"],
];

const yakuExamples: Record<string, string[]> = {
  "立直": ["Man2", "Man3", "Man4", "Pin3", "Pin4", "Pin5", "Sou4", "Sou5", "Sou6", "Man6", "Man7", "Man8", "Haku", "Haku"],
  "一发": ["Man4", "Man5", "Man6", "Pin2", "Pin3", "Pin4", "Sou6", "Sou7", "Sou8", "Pin6", "Pin7", "Pin8", "Nan", "Nan"],
  "门前清自摸和": ["Man3", "Man4", "Man5", "Pin5", "Pin5", "Pin5", "Sou2", "Sou3", "Sou4", "Man7", "Man8", "Man9", "Shaa", "Shaa"],
  "断幺九": ["Man2", "Man3", "Man4", "Pin2", "Pin3", "Pin4", "Sou3", "Sou4", "Sou5", "Sou6", "Sou7", "Sou8", "Pin5", "Pin5"],
  "平和": ["Man2", "Man3", "Man4", "Pin3", "Pin4", "Pin5", "Sou3", "Sou4", "Sou5", "Sou6", "Sou7", "Sou8", "Pin2", "Pin2"],
  "一杯口": ["Man2", "Man3", "Man4", "Man2", "Man3", "Man4", "Pin3", "Pin4", "Pin5", "Sou6", "Sou7", "Sou8", "Pin5", "Pin5"],
  "役牌·自风": ["Nan", "Nan", "Nan", "Man2", "Man3", "Man4", "Pin3", "Pin4", "Pin5", "Sou6", "Sou7", "Sou8", "Ton", "Ton"],
  "役牌·场风": ["Ton", "Ton", "Ton", "Man2", "Man3", "Man4", "Pin3", "Pin4", "Pin5", "Sou6", "Sou7", "Sou8", "Nan", "Nan"],
  "役牌·三元牌": ["Haku", "Haku", "Haku", "Man2", "Man3", "Man4", "Pin3", "Pin4", "Pin5", "Sou6", "Sou7", "Sou8", "Ton", "Ton"],
  "岭上开花": ["Man9", "Man9", "Man9", "Man9", "Pin2", "Pin3", "Pin4", "Sou4", "Sou5", "Sou6", "Man2", "Man3", "Man4", "Haku", "Haku"],
  "抢杠": ["Man3", "Man4", "Man5", "Pin4", "Pin5", "Pin6", "Sou2", "Sou3", "Sou4", "Man7", "Man8", "Man9", "Chun", "Chun"],
  "海底摸月": ["Man1", "Man2", "Man3", "Pin6", "Pin7", "Pin8", "Sou3", "Sou4", "Sou5", "Man4", "Man5", "Man6", "Pei", "Pei"],
  "河底捞鱼": ["Man7", "Man8", "Man9", "Pin1", "Pin2", "Pin3", "Sou4", "Sou5", "Sou6", "Pin4", "Pin5", "Pin6", "Hatsu", "Hatsu"],
  "双立直": ["Man2", "Man3", "Man4", "Pin5", "Pin6", "Pin7", "Sou1", "Sou2", "Sou3", "Man7", "Man8", "Man9", "Haku", "Haku"],
  "七对子": ["Man2", "Man2", "Man3", "Man3", "Pin4", "Pin4", "Pin5", "Pin5", "Sou6", "Sou6", "Ton", "Ton", "Haku", "Haku"],
  "对对和": ["Man2", "Man2", "Man2", "Pin5", "Pin5", "Pin5", "Sou7", "Sou7", "Sou7", "Haku", "Haku", "Haku", "Ton", "Ton"],
  "三暗刻": ["Man2", "Man2", "Man2", "Pin5", "Pin5", "Pin5", "Sou7", "Sou7", "Sou7", "Man3", "Man4", "Man5", "Ton", "Ton"],
  "三色同顺": ["Man3", "Man4", "Man5", "Pin3", "Pin4", "Pin5", "Sou3", "Sou4", "Sou5", "Man6", "Man7", "Man8", "Ton", "Ton"],
  "一气通贯": ["Man1", "Man2", "Man3", "Man4", "Man5", "Man6", "Man7", "Man8", "Man9", "Pin3", "Pin4", "Pin5", "Ton", "Ton"],
  "混全带幺九": ["Man1", "Man2", "Man3", "Pin7", "Pin8", "Pin9", "Sou1", "Sou1", "Sou1", "Haku", "Haku", "Haku", "Ton", "Ton"],
  "三色同刻": ["Man5", "Man5", "Man5", "Pin5", "Pin5", "Pin5", "Sou5", "Sou5", "Sou5", "Haku", "Haku", "Haku", "Ton", "Ton"],
  "三杠子": ["Man1", "Man1", "Man1", "Man1", "Pin5", "Pin5", "Pin5", "Pin5", "Sou7", "Sou7", "Sou7", "Sou7", "Man2", "Man3", "Man4", "Ton", "Ton"],
  "小三元": ["Haku", "Haku", "Haku", "Hatsu", "Hatsu", "Hatsu", "Chun", "Chun", "Man1", "Man2", "Man3", "Pin7", "Pin8", "Pin9"],
  "混老头": ["Man1", "Man1", "Man1", "Man9", "Man9", "Man9", "Pin1", "Pin1", "Pin1", "Haku", "Haku", "Haku", "Ton", "Ton"],
  "混一色": ["Man1", "Man2", "Man3", "Man4", "Man5", "Man6", "Man7", "Man8", "Man9", "Ton", "Ton", "Ton", "Haku", "Haku"],
  "纯全带幺九": ["Man1", "Man2", "Man3", "Man7", "Man8", "Man9", "Pin1", "Pin2", "Pin3", "Sou7", "Sou8", "Sou9", "Pin9", "Pin9"],
  "二杯口": ["Man1", "Man2", "Man3", "Man1", "Man2", "Man3", "Pin7", "Pin8", "Pin9", "Pin7", "Pin8", "Pin9", "Sou5", "Sou5"],
  "清一色": ["Man1", "Man2", "Man3", "Man3", "Man4", "Man5", "Man5", "Man6", "Man7", "Man7", "Man8", "Man9", "Man5", "Man5"],
  "国士无双": ["Man1", "Man1", "Man9", "Pin1", "Pin9", "Sou1", "Sou9", "Ton", "Nan", "Shaa", "Pei", "Haku", "Hatsu", "Chun"],
  "四暗刻": ["Man1", "Man1", "Man1", "Man9", "Man9", "Man9", "Pin2", "Pin2", "Pin2", "Sou8", "Sou8", "Sou8", "Ton", "Ton"],
  "大三元": ["Haku", "Haku", "Haku", "Hatsu", "Hatsu", "Hatsu", "Chun", "Chun", "Chun", "Man1", "Man2", "Man3", "Ton", "Ton"],
  "小四喜": ["Ton", "Ton", "Ton", "Nan", "Nan", "Nan", "Shaa", "Shaa", "Shaa", "Pei", "Pei", "Man1", "Man2", "Man3"],
  "大四喜": ["Ton", "Ton", "Ton", "Nan", "Nan", "Nan", "Shaa", "Shaa", "Shaa", "Pei", "Pei", "Pei", "Haku", "Haku"],
  "字一色": ["Ton", "Ton", "Ton", "Nan", "Nan", "Nan", "Shaa", "Shaa", "Shaa", "Haku", "Haku", "Haku", "Pei", "Pei"],
  "绿一色": ["Sou2", "Sou2", "Sou2", "Sou3", "Sou3", "Sou3", "Sou4", "Sou4", "Sou4", "Sou6", "Sou6", "Sou6", "Sou8", "Sou8"],
  "清老头": ["Man1", "Man1", "Man1", "Man9", "Man9", "Man9", "Pin1", "Pin1", "Pin1", "Pin9", "Pin9", "Pin9", "Sou1", "Sou1"],
  "九莲宝灯": ["Man1", "Man1", "Man1", "Man1", "Man2", "Man3", "Man4", "Man5", "Man6", "Man7", "Man8", "Man9", "Man9", "Man9"],
  "四杠子": ["Man1", "Man1", "Man1", "Man1", "Pin2", "Pin2", "Pin2", "Pin2", "Sou3", "Sou3", "Sou3", "Sou3", "Haku", "Haku", "Haku", "Haku", "Ton", "Ton"],
  "天和": ["Man1", "Man2", "Man3", "Man4", "Man5", "Man6", "Pin2", "Pin3", "Pin4", "Sou6", "Sou7", "Sou8", "Chun", "Chun"],
  "地和": ["Man3", "Man4", "Man5", "Pin6", "Pin7", "Pin8", "Sou2", "Sou3", "Sou4", "Pin2", "Pin2", "Pin2", "Nan", "Nan"],
  "国士无双十三面": ["Man1", "Man9", "Pin1", "Pin9", "Sou1", "Sou9", "Ton", "Nan", "Shaa", "Pei", "Haku", "Hatsu", "Chun", "Pin9"],
  "四暗刻单骑": ["Man2", "Man2", "Man2", "Man8", "Man8", "Man8", "Pin3", "Pin3", "Pin3", "Sou7", "Sou7", "Sou7", "Haku", "Haku"],
  "纯正九莲宝灯": ["Man1", "Man1", "Man1", "Man2", "Man3", "Man4", "Man5", "Man6", "Man7", "Man8", "Man9", "Man9", "Man9", "Man5"],
  "大四喜（双倍）": ["Nan", "Nan", "Nan", "Shaa", "Shaa", "Shaa", "Pei", "Pei", "Pei", "Ton", "Ton", "Ton", "Chun", "Chun"],
  "流局满贯": ["Man1", "Man9", "Pin1", "Pin9", "Sou1", "Sou9", "Ton", "Nan", "Shaa", "Pei", "Haku", "Hatsu", "Chun"],
  "宝牌": ["Man2", "Man3", "Man4", "Pin4", "Pin5-Dora", "Pin6", "Sou3", "Sou4", "Sou5-Dora", "Sou6", "Sou7", "Sou8", "Man5-Dora", "Man5"],
};

function yakuExample(name: string) {
  return yakuExamples[name] ?? [];
}

const yakuWinningTileIndexes: Record<string, number> = {
  "立直": 11, "一发": 8, "门前清自摸和": 4, "断幺九": 11, "平和": 8, "一杯口": 5,
  "役牌·自风": 2, "役牌·场风": 2, "役牌·三元牌": 2, "岭上开花": 12, "抢杠": 11,
  "海底摸月": 8, "河底捞鱼": 5, "双立直": 8, "七对子": 13, "对对和": 13, "三暗刻": 11,
  "三色同顺": 8, "一气通贯": 8, "混全带幺九": 5, "三色同刻": 13, "三杠子": 14,
  "小三元": 5, "混老头": 13, "混一色": 8, "纯全带幺九": 11, "二杯口": 11, "清一色": 11,
  "国士无双": 13, "四暗刻": 11, "大三元": 8, "小四喜": 13, "大四喜": 11, "字一色": 13,
  "绿一色": 13, "清老头": 13, "九莲宝灯": 6, "四杠子": 17, "天和": 11, "地和": 8,
  "国士无双十三面": 13, "四暗刻单骑": 13, "纯正九莲宝灯": 13, "大四喜（双倍）": 11,
  "流局满贯": -1, "宝牌": 11,
};

const yakuExampleCaptions: Record<string, string> = {
  "立直": "横置牌为立直后的和了牌",
  "一发": "横置牌为立直一巡内的和了牌",
  "门前清自摸和": "横置牌为门清自摸牌",
  "岭上开花": "横置牌为岭上补摸牌",
  "抢杠": "横置牌为他家加杠时被抢的牌",
  "海底摸月": "横置牌为牌山最后一张自摸牌",
  "河底捞鱼": "横置牌为本局最后一张舍牌",
  "双立直": "横置牌为双立直后的和了牌",
  "国士无双": "横置牌补齐缺少的一种幺九牌",
  "四暗刻": "横置牌为自摸完成暗刻",
  "九莲宝灯": "横置牌完成非九面听的九莲宝灯",
  "四杠子": "横置牌组成四杠后的雀头",
  "天和": "横置牌标示庄家起手和牌的完成张",
  "地和": "横置牌为闲家第一次自摸牌",
  "国士无双十三面": "横置牌为十三面听中的一张",
  "四暗刻单骑": "横置牌组成单骑等待的雀头",
  "纯正九莲宝灯": "横置牌为纯正九莲九面听中的一张",
  "大四喜（双倍）": "横置牌完成第四组风牌刻子",
  "流局满贯": "舍牌示例 · 不含和了牌",
  "宝牌": "横置牌为和了牌 · 赤牌为宝牌",
};

function yakuExampleCaption(name: string) {
  return yakuExampleCaptions[name] ?? "横置牌为和了牌";
}

const yakuGroupPatterns: Record<string, number[]> = {
  "七对子": [2, 2, 2, 2, 2, 2, 2],
  "国士无双": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  "国士无双十三面": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  "小三元": [3, 3, 2, 3, 3],
  "小四喜": [3, 3, 3, 2, 3],
  "岭上开花": [4, 3, 3, 3, 2],
  "九莲宝灯": [4, 6, 3, 1],
  "纯正九莲宝灯": [3, 7, 3, 1],
  "三杠子": [4, 4, 4, 3, 2],
  "四杠子": [4, 4, 4, 4, 2],
  "流局满贯": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
};

function splitYakuExample(name: string, tiles: string[]) {
  const pattern = yakuGroupPatterns[name] ?? [3, 3, 3, 3, 2];
  let cursor = 0;
  return pattern.map((size) => {
    const startIndex = cursor;
    const group = tiles.slice(cursor, cursor + size).map((tile, index) => ({ tile, index: startIndex + index }));
    cursor += size;
    return group;
  }).filter((group) => group.length > 0);
}

const yakuGroups = [
  { label: "一翻役", note: "基础役种 · 先确认门清条件", includes: (han: string) => han === "1翻" },
  { label: "二翻役", note: "复合役种 · 三种役存在食下", includes: (han: string) => han.startsWith("2翻") },
  { label: "三翻与六翻役", note: "混一色、纯全带幺九、二杯口与清一色", includes: (han: string) => han.startsWith("3翻") || han.startsWith("6翻") },
  { label: "役满", note: "通常役满与规则可选的双倍役满", includes: (han: string) => han.includes("役满") },
  { label: "特殊结算与加翻牌", note: "不是普通役种", includes: (han: string) => han === "满贯" || han === "加翻" },
];

function yakuRestriction(name: string, han: string, closed: string) {
  if (closed === "门清") return "门清限定";
  if (closed === "特殊" || closed === "非役") return closed;
  if (name === "断幺九") return "食断规则 · 副露1翻";
  if (han.includes("/")) return `副露可 · 食下${han.split("/")[1].trim()}`;
  return "副露可 · 不食下";
}

const fuMeldRows = [
  ["明刻", "2符", "4符"], ["暗刻", "4符", "8符"], ["明杠", "8符", "16符"], ["暗杠", "16符", "32符"],
];

const fuDetailGroups = [
  { title: "和牌方式", items: [["门清荣和", "+10符"], ["自摸", "+2符"], ["副露荣和", "+0符"]] },
  { title: "雀头", items: [["三元牌", "+2符"], ["场风牌", "+2符"], ["自风牌", "+2符"]] },
  { title: "听牌形", items: [["单骑", "+2符"], ["坎张", "+2符"], ["边张", "+2符"], ["两面 / 双碰", "+0符"]] },
];

type ScoreCell = { ron: string; tsumo: string; kiriage?: boolean };
type ScoreRow = { han: string; cells: ScoreCell[]; mangan?: ScoreCell };

const scoreCell = (ron: string, tsumo: string, kiriage = false): ScoreCell => ({ ron, tsumo, kiriage });

const scoreFuHeaders = [
  ["20符", "平和自摸"], ["25符", "七对子"], ["30符", ""], ["40符", ""], ["50符", ""], ["60符", ""],
  ["70符", ""], ["80符", ""], ["90符", ""], ["100符", ""], ["110符", ""],
];

const scoringTables: Array<{ title: string; english: string; note: string; all: boolean; rows: ScoreRow[]; limits: Array<[string, string, string, string]> }> = [
  {
    title: "子家点数表", english: "NON-DEALER", note: "上：荣和｜下：自摸（子家 / 亲家）", all: false,
    rows: [
      { han: "1翻", cells: [scoreCell("—", "—"), scoreCell("—", "—"), scoreCell("1000", "300 / 500"), scoreCell("1300", "400 / 700"), scoreCell("1600", "400 / 800"), scoreCell("2000", "500 / 1000"), scoreCell("2300", "600 / 1200"), scoreCell("2600", "700 / 1300"), scoreCell("2900", "800 / 1500"), scoreCell("3200", "800 / 1600"), scoreCell("3600", "—")] },
      { han: "2翻", cells: [scoreCell("—", "400 / 700"), scoreCell("1600", "—"), scoreCell("2000", "500 / 1000"), scoreCell("2600", "700 / 1300"), scoreCell("3200", "800 / 1600"), scoreCell("3900", "1000 / 2000"), scoreCell("4500", "1200 / 2300"), scoreCell("5200", "1300 / 2600"), scoreCell("5800", "1500 / 2900"), scoreCell("6400", "1600 / 3200"), scoreCell("7100", "1800 / 3600")] },
      { han: "3翻", cells: [scoreCell("—", "700 / 1300"), scoreCell("3200", "800 / 1600"), scoreCell("3900", "1000 / 2000"), scoreCell("5200", "1300 / 2600"), scoreCell("6400", "1600 / 3200"), scoreCell("7700", "2000 / 3900", true)], mangan: scoreCell("8000", "2000 / 4000") },
      { han: "4翻", cells: [scoreCell("—", "1300 / 2600"), scoreCell("6400", "1600 / 3200"), scoreCell("7700", "2000 / 3900", true)], mangan: scoreCell("8000", "2000 / 4000") },
    ],
    limits: [["5翻", "满贯", "8000", "2000 / 4000"], ["6—7翻", "跳满", "12000", "3000 / 6000"], ["8—10翻", "倍满", "16000", "4000 / 8000"], ["11—12翻", "三倍满", "24000", "6000 / 12000"], ["13翻以上", "累计役满 / 役满", "32000", "8000 / 16000"]],
  },
  {
    title: "亲家点数表", english: "DEALER", note: "上：荣和｜下：自摸（每家支付）", all: true,
    rows: [
      { han: "1翻", cells: [scoreCell("—", "—"), scoreCell("—", "—"), scoreCell("1500", "500"), scoreCell("2000", "700"), scoreCell("2400", "800"), scoreCell("2900", "1000"), scoreCell("3400", "1200"), scoreCell("3900", "1300"), scoreCell("4400", "1500"), scoreCell("4800", "1600"), scoreCell("5300", "—")] },
      { han: "2翻", cells: [scoreCell("—", "700"), scoreCell("2400", "—"), scoreCell("2900", "1000"), scoreCell("3900", "1300"), scoreCell("4800", "1600"), scoreCell("5800", "2000"), scoreCell("6800", "2300"), scoreCell("7700", "2600"), scoreCell("8700", "2900"), scoreCell("9600", "3200"), scoreCell("10600", "3600")] },
      { han: "3翻", cells: [scoreCell("—", "1300"), scoreCell("4800", "1600"), scoreCell("5800", "2000"), scoreCell("7700", "2600"), scoreCell("9600", "3200"), scoreCell("11600", "3900", true)], mangan: scoreCell("12000", "4000") },
      { han: "4翻", cells: [scoreCell("—", "2600"), scoreCell("9600", "3200"), scoreCell("11600", "3900", true)], mangan: scoreCell("12000", "4000") },
    ],
    limits: [["5翻", "满贯", "12000", "4000"], ["6—7翻", "跳满", "18000", "6000"], ["8—10翻", "倍满", "24000", "8000"], ["11—12翻", "三倍满", "36000", "12000"], ["13翻以上", "累计役满 / 役满", "48000", "16000"]],
  },
];

const mleagueTeams = [
  { slug: "jets", short: "JETS", name: "EARTH JETS", accent: "#276b60", players: ["石井一馬", "三浦智博", "逢川恵夢", "HIRO柴田"] },
  { slug: "drivens", short: "DRIVENS", name: "赤坂ドリブンズ", accent: "#b89b2d", players: ["園田賢", "鈴木たろう", "浅見真紀", "渡辺太"] },
  { slug: "furinkazan", short: "風林火山", name: "EX風林火山", accent: "#b12924", players: ["二階堂亜樹", "勝又健志", "永井孝典", "内川幸太郎"] },
  { slug: "sakuraknights", short: "SAKURA", name: "KADOKAWAサクラナイツ", accent: "#d8789b", players: ["岡田紗佳", "堀慎吾", "阿久津翔太", "尻無濱航"] },
  { slug: "fightclub", short: "KONAMI", name: "KONAMI麻雀格闘倶楽部", accent: "#8e171d", players: ["佐々木寿人", "高宮まり", "伊達朱里紗", "滝沢和典"] },
  { slug: "abemas", short: "ABEMAS", name: "CyberAgent ABEMAS", accent: "#e0c32d", players: ["多井隆晴", "白鳥翔", "松本吉弘", "日向藍子"] },
  { slug: "phoenix", short: "PHOENIX", name: "セガサミーフェニックス", accent: "#e4772e", players: ["茅森早香", "醍醐大", "竹内元太", "佐野ひなこ"] },
  { slug: "raiden", short: "雷電", name: "TEAM RAIDEN / 雷電", accent: "#282d31", players: ["萩原聖人", "瀬戸熊直樹", "黒沢咲", "本田朋広"] },
  { slug: "beast", short: "BEAST", name: "BEAST X", accent: "#2c497c", players: ["鈴木大介", "中田花奈", "下石戟", "東城りお"] },
  { slug: "pirates", short: "PIRATES", name: "U-NEXT Pirates", accent: "#167f87", players: ["瑞原明奈", "鈴木優", "仲林圭", "朝倉康心"] },
];

const regularStandings = [
  ["EX風林火山", "697.3"], ["KONAMI麻雀格闘倶楽部", "691.4"], ["BEAST X", "689.7"],
  ["赤坂ドリブンズ", "246.6"], ["セガサミーフェニックス", "124.2"], ["TEAM RAIDEN / 雷電", "-213.7"],
  ["CyberAgent ABEMAS", "-245.9"], ["U-NEXT Pirates", "-622.4"], ["KADOKAWAサクラナイツ", "-626.7"], ["EARTH JETS", "-740.5"],
];

const semifinalStandings = [
  ["EX風林火山", "446.6"], ["BEAST X", "376.7"], ["KONAMI麻雀格闘倶楽部", "240.7"],
  ["TEAM RAIDEN / 雷電", "152.4"], ["セガサミーフェニックス", "21.3"], ["赤坂ドリブンズ", "-119.8"],
];

const matchArchive = [
  {
    date: "09.15", week: "周一", label: "常规赛 DAY 01",
    games: [
      { number: "第 1 回战", players: ["園田賢", "鈴木優", "石井一馬", "下石戟"], winner: "園田賢", point: "+54.9pt", gameId: "L001_S022_0001_01A" },
      { number: "第 2 回战", players: ["仲林圭", "東城りお", "鈴木たろう", "三浦智博"], winner: "仲林圭", point: "+66.4pt", gameId: "L001_S022_0001_02A" },
    ],
  },
  {
    date: "09.16", week: "周二", label: "常规赛 DAY 02",
    games: [
      { number: "第 1 回战", players: ["阿久津翔太", "佐々木寿人", "二階堂亜樹", "松本吉弘"], winner: "阿久津翔太", point: "+76.0pt", gameId: "L001_S022_0002_01A" },
      { number: "第 2 回战", players: ["白鳥翔", "岡田紗佳", "伊達朱里紗", "内川幸太郎"], winner: "白鳥翔", point: "+55.9pt", gameId: "L001_S022_0002_02A" },
    ],
  },
];

const augustEvents = [
  {
    date: "08.07", tag: "M TOURNAMENT", title: "M Tournament 2026 决赛",
    description: "八月有杯赛决赛与官方公开观赛活动，但不属于 M.LEAGUE 常规赛。",
    href: "https://m-league.jp/news202607101400/",
  },
  {
    date: "08.24", tag: "OFF-SEASON EVENT", title: "M.LEAGUE 儿童麻将节 2026",
    description: "19 名 M 联盟选手参加的休赛期麻将大会、麻将教室与交流活动。",
    href: "https://m-league.jp/news202607091500/",
  },
];

const mleagueHaifuArchive = [
  {
    id: "L001_S022_0001_01A", date: "2025.09.15", game: "第 1 回战", winner: "園田賢", winningTeam: "赤坂ドリブンズ", point: "+54.9pt",
    results: [["1", "園田賢", "赤坂ドリブンズ", "+54.9"], ["2", "鈴木優", "U-NEXT Pirates", "+9.8"], ["3", "石井一馬", "EARTH JETS", "-15.9"], ["4", "下石戟", "BEAST X", "-48.8"]],
  },
  {
    id: "L001_S022_0001_02A", date: "2025.09.15", game: "第 2 回战", winner: "仲林圭", winningTeam: "U-NEXT Pirates", point: "+66.4pt",
    results: [["1", "仲林圭", "U-NEXT Pirates", "+66.4"], ["2", "東城りお", "BEAST X", "+6.1"], ["3", "鈴木たろう", "赤坂ドリブンズ", "-17.5"], ["4", "三浦智博", "EARTH JETS", "-55.0"]],
  },
  {
    id: "L001_S022_0002_01A", date: "2025.09.16", game: "第 1 回战", winner: "阿久津翔太", winningTeam: "KADOKAWAサクラナイツ", point: "+76.0pt",
    results: [["1", "阿久津翔太", "KADOKAWAサクラナイツ", "+76.0"], ["2", "佐々木寿人", "KONAMI麻雀格闘倶楽部", "+6.2"], ["3", "二階堂亜樹", "EX風林火山", "-23.8"], ["4", "松本吉弘", "CyberAgent ABEMAS", "-58.4"]],
  },
  {
    id: "L001_S022_0002_02A", date: "2025.09.16", game: "第 2 回战", winner: "白鳥翔", winningTeam: "CyberAgent ABEMAS", point: "+55.9pt",
    results: [["1", "白鳥翔", "CyberAgent ABEMAS", "+55.9"], ["2", "岡田紗佳", "KADOKAWAサクラナイツ", "+11.7"], ["3", "伊達朱里紗", "KONAMI麻雀格闘倶楽部", "-17.1"], ["4", "内川幸太郎", "EX風林火山", "-50.5"]],
  },
  {
    id: "L001_S022_0003_01A", date: "2025.09.18", game: "第 1 回战", winner: "萩原聖人", winningTeam: "TEAM RAIDEN / 雷電", point: "+58.5pt",
    results: [["1", "萩原聖人", "TEAM RAIDEN / 雷電", "+58.5"], ["2", "瑞原明奈", "U-NEXT Pirates", "+5.8"], ["3", "東城りお", "BEAST X", "-15.9"], ["4", "醍醐大", "セガサミーフェニックス", "-48.4"]],
  },
  {
    id: "L001_S022_0004_01A", date: "2025.09.19", game: "第 1 回战", winner: "永井孝典", winningTeam: "EX風林火山", point: "+62.8pt",
    results: [["1", "永井孝典", "EX風林火山", "+62.8"], ["2", "逢川恵夢", "EARTH JETS", "+3.7"], ["3", "瀬戸熊直樹", "TEAM RAIDEN / 雷電", "-16.8"], ["4", "多井隆晴", "CyberAgent ABEMAS", "-49.7"]],
  },
  {
    id: "L001_S022_0004_02A", date: "2025.09.19", game: "第 2 回战", winner: "内川幸太郎", winningTeam: "EX風林火山", point: "+64.2pt",
    results: [["1", "内川幸太郎", "EX風林火山", "+64.2"], ["2", "白鳥翔", "CyberAgent ABEMAS", "+14.0"], ["3", "黒沢咲", "TEAM RAIDEN / 雷電", "-10.8"], ["4", "HIRO柴田", "EARTH JETS", "-67.4"]],
  },
  {
    id: "L001_S022_0005_01A", date: "2025.09.22", game: "第 1 回战", winner: "瑞原明奈", winningTeam: "U-NEXT Pirates", point: "+54.6pt",
    results: [["1", "瑞原明奈", "U-NEXT Pirates", "+54.6"], ["2", "佐々木寿人", "KONAMI麻雀格闘倶楽部", "+14.1"], ["3", "日向藍子", "CyberAgent ABEMAS", "-16.7"], ["4", "茅森早香", "セガサミーフェニックス", "-52.0"]],
  },
  {
    id: "L001_S022_0005_02A", date: "2025.09.22", game: "第 2 回战", winner: "白鳥翔", winningTeam: "CyberAgent ABEMAS", point: "+56.5pt",
    results: [["1", "白鳥翔", "CyberAgent ABEMAS", "+56.5"], ["2", "高宮まり", "KONAMI麻雀格闘倶楽部", "+8.6"], ["3", "鈴木優", "U-NEXT Pirates", "-21.3"], ["4", "竹内元太", "セガサミーフェニックス", "-43.8"]],
  },
];

const tenhouHaifuArchive = [
  {
    id: "TM12-FINAL-01", date: "2025.11.19", game: "决胜战 第 1 节", winner: "gousi", winningTeam: "日本プロ麻雀連盟", point: "+81.9pt",
    results: [["1", "gousi", "日本プロ麻雀連盟", "+81.9"], ["2", "下石戟", "日本プロ麻雀協会", "+19.3"], ["3", "鈴木優", "最高位戦日本プロ麻雀協会", "-11.2"], ["4", "じょにおん！！", "天凤位预选", "-90.0"]],
    replayUrl: "https://tenhou.net/0/?log=2025111920gm-0009-10011-d6e60374",
  },
  {
    id: "TM12-FINAL-02", date: "2025.11.19", game: "决胜战 第 2 节", winner: "下石戟", winningTeam: "日本プロ麻雀協会", point: "+70.2pt",
    results: [["1", "下石戟", "日本プロ麻雀協会", "+70.2"], ["2", "鈴木優", "最高位戦日本プロ麻雀協会", "+36.2"], ["3", "じょにおん！！", "天凤位预选", "-5.3"], ["4", "gousi", "日本プロ麻雀連盟", "-101.1"]],
    replayUrl: "https://tenhou.net/0/?log=2025111920gm-0009-10011-865e467d",
  },
  {
    id: "TM12-FINAL-03", date: "2025.11.19", game: "决胜战 第 3 节", winner: "じょにおん！！", winningTeam: "天凤位预选", point: "+70.9pt",
    results: [["1", "じょにおん！！", "天凤位预选", "+70.9"], ["2", "gousi", "日本プロ麻雀連盟", "+22.2"], ["3", "下石戟", "日本プロ麻雀協会", "-1.5"], ["4", "鈴木優", "最高位戦日本プロ麻雀協会", "-91.6"]],
    replayUrl: "https://tenhou.net/0/?log=2025111921gm-0009-10011-e54c86b1",
  },
  {
    id: "TM12-FINAL-04", date: "2025.11.19", game: "决胜战 第 4 节", winner: "鈴木優", winningTeam: "最高位戦日本プロ麻雀協会", point: "+68.4pt",
    results: [["1", "鈴木優", "最高位戦日本プロ麻雀協会", "+68.4"], ["2", "じょにおん！！", "天凤位预选", "+25.6"], ["3", "gousi", "日本プロ麻雀連盟", "+3.0"], ["4", "下石戟", "日本プロ麻雀協会", "-97.0"]],
    replayUrl: "https://tenhou.net/0/?log=2025111921gm-0009-10011-73bb5074",
  },
  {
    id: "TM12-STAGE8-01", date: "2025.10.08", game: "第 8 节 A 桌 · 第 1 战", winner: "いばらぎ", winningTeam: "日本プロ麻雀協会", point: "+53.0pt",
    results: [["1", "いばらぎ", "日本プロ麻雀協会", "+53.0"], ["2", "ウルトラ立直", "天凤位预选", "+22.5"], ["3", "木原浩一", "日本プロ麻雀協会", "-0.7"], ["4", "小林剛", "麻将連合", "-74.8"]],
    replayUrl: "https://tenhou.net/0/?log=2025100820gm-0009-10011-97010eef",
  },
  {
    id: "TM12-STAGE8-02", date: "2025.10.08", game: "第 8 节 A 桌 · 第 2 战", winner: "鈴木優", winningTeam: "最高位戦日本プロ麻雀協会", point: "+71.1pt",
    results: [["1", "鈴木優", "最高位戦日本プロ麻雀協会", "+71.1"], ["2", "いばらぎ", "日本プロ麻雀協会", "+28.0"], ["3", "ウルトラ立直", "天凤位预选", "+1.0"], ["4", "おかもと", "最高位戦日本プロ麻雀協会", "-100.1"]],
    replayUrl: "https://tenhou.net/0/?log=2025100820gm-0009-10011-e9a481f0",
  },
  {
    id: "TM12-STAGE8-03", date: "2025.10.08", game: "第 8 节 A 桌 · 第 3 战", winner: "タケオしゃん", winningTeam: "天凤位预选", point: "+76.8pt",
    results: [["1", "タケオしゃん", "天凤位预选", "+76.8"], ["2", "堀慎吾", "日本プロ麻雀協会", "+19.8"], ["3", "いばらぎ", "日本プロ麻雀協会", "-2.5"], ["4", "鈴木優", "最高位戦日本プロ麻雀協会", "-94.1"]],
    replayUrl: "https://tenhou.net/0/?log=2025100821gm-0009-10011-f8d01b73",
  },
  {
    id: "TM12-STAGE8-04", date: "2025.10.08", game: "第 8 节 B 桌 · 第 1 战", winner: "堀慎吾", winningTeam: "日本プロ麻雀協会", point: "+64.8pt",
    results: [["1", "堀慎吾", "日本プロ麻雀協会", "+64.8"], ["2", "下石戟", "日本プロ麻雀協会", "+22.9"], ["3", "gousi", "日本プロ麻雀連盟", "-4.3"], ["4", "おかもと", "最高位戦日本プロ麻雀協会", "-83.4"]],
    replayUrl: "https://tenhou.net/0/?log=2025100820gm-0009-10011-d3f9e83d",
  },
  {
    id: "TM12-STAGE7-01", date: "2025.09.24", game: "第 7 节 A 桌 · 第 1 战", winner: "じょにおん！！", winningTeam: "天凤位预选", point: "+70.9pt",
    results: [["1", "じょにおん！！", "天凤位预选", "+70.9"], ["2", "gousi", "日本プロ麻雀連盟", "+23.4"], ["3", "いばらぎ", "日本プロ麻雀協会", "-6.0"], ["4", "木原浩一", "日本プロ麻雀協会", "-88.3"]],
    replayUrl: "https://tenhou.net/0/?log=2025092420gm-0009-10011-9e79e1cf",
  },
  {
    id: "TM12-STAGE7-02", date: "2025.09.24", game: "第 7 节 A 桌 · 第 2 战", winner: "鈴木優", winningTeam: "最高位戦日本プロ麻雀協会", point: "+93.3pt",
    results: [["1", "鈴木優", "最高位戦日本プロ麻雀協会", "+93.3"], ["2", "いばらぎ", "日本プロ麻雀協会", "+22.4"], ["3", "下石戟", "日本プロ麻雀協会", "+1.2"], ["4", "yoteru", "天凤位预选", "-116.9"]],
    replayUrl: "https://tenhou.net/0/?log=2025092420gm-0009-10011-cea67063",
  },
  {
    id: "TM12-STAGE7-03", date: "2025.09.24", game: "第 7 节 A 桌 · 第 3 战", winner: "堀慎吾", winningTeam: "日本プロ麻雀協会", point: "+60.0pt",
    results: [["1", "堀慎吾", "日本プロ麻雀協会", "+60.0"], ["2", "下石戟", "日本プロ麻雀協会", "+18.1"], ["3", "いばらぎ", "日本プロ麻雀協会", "-3.1"], ["4", "おかもと", "最高位戦日本プロ麻雀協会", "-75.0"]],
    replayUrl: "https://tenhou.net/0/?log=2025092421gm-0009-10011-512fabfd",
  },
  {
    id: "TM12-STAGE7-04", date: "2025.09.24", game: "第 7 节 A 桌 · 第 4 战", winner: "小林剛", winningTeam: "麻将連合", point: "+69.8pt",
    results: [["1", "小林剛", "麻将連合", "+69.8"], ["2", "いばらぎ", "日本プロ麻雀協会", "+23.0"], ["3", "堀慎吾", "日本プロ麻雀協会", "-9.3"], ["4", "じょにおん！！", "天凤位预选", "-83.5"]],
    replayUrl: "https://tenhou.net/0/?log=2025092422gm-0009-10011-21fc682b",
  },
  {
    id: "TM12-STAGE1-01", date: "2025.04.23", game: "第 1 节 A 桌 · 第 1 战", winner: "ウルトラ立直", winningTeam: "天凤位预选", point: "+65.4pt",
    results: [["1", "ウルトラ立直", "天凤位预选", "+65.4"], ["2", "小林剛", "麻将連合", "+19.3"], ["3", "鈴木優", "最高位戦日本プロ麻雀協会", "-7.1"], ["4", "堀慎吾", "日本プロ麻雀協会", "-77.6"]],
    replayUrl: "https://tenhou.net/0/?log=2025042320gm-0009-10011-6a1bf5ae",
  },
  {
    id: "TM12-STAGE1-02", date: "2025.04.23", game: "第 1 节 A 桌 · 第 2 战", winner: "ウルトラ立直", winningTeam: "天凤位预选", point: "+62.0pt",
    results: [["1", "ウルトラ立直", "天凤位预选", "+62.0"], ["2", "堀慎吾", "日本プロ麻雀協会", "+24.0"], ["3", "小林剛", "麻将連合", "+3.3"], ["4", "鈴木優", "最高位戦日本プロ麻雀協会", "-89.3"]],
    replayUrl: "https://tenhou.net/0/?log=2025042320gm-0009-10011-fcded76f",
  },
  {
    id: "TM12-STAGE1-03", date: "2025.04.23", game: "第 1 节 A 桌 · 第 3 战", winner: "ウルトラ立直", winningTeam: "天凤位预选", point: "+66.5pt",
    results: [["1", "ウルトラ立直", "天凤位预选", "+66.5"], ["2", "堀慎吾", "日本プロ麻雀協会", "+24.5"], ["3", "鈴木優", "最高位戦日本プロ麻雀協会", "-4.9"], ["4", "小林剛", "麻将連合", "-86.1"]],
    replayUrl: "https://tenhou.net/0/?log=2025042321gm-0009-10011-355fcdc6",
  },
  {
    id: "TM12-STAGE1-04", date: "2025.04.23", game: "第 1 节 A 桌 · 第 4 战", winner: "小林剛", winningTeam: "麻将連合", point: "+67.2pt",
    results: [["1", "小林剛", "麻将連合", "+67.2"], ["2", "ウルトラ立直", "天凤位预选", "+30.2"], ["3", "堀慎吾", "日本プロ麻雀協会", "-4.6"], ["4", "鈴木優", "最高位戦日本プロ麻雀協会", "-92.8"]],
    replayUrl: "https://tenhou.net/0/?log=2025042322gm-0009-10011-b3cf4173",
  },
  {
    id: "TM12-STAGE1-05", date: "2025.04.23", game: "第 1 节 B 桌 · 第 1 战", winner: "おかもと", winningTeam: "最高位戦日本プロ麻雀協会", point: "+62.0pt",
    results: [["1", "おかもと", "最高位戦日本プロ麻雀協会", "+62.0"], ["2", "下石戟", "日本プロ麻雀協会", "+30.9"], ["3", "太くないお", "天凤位预选/最高位戦日本プロ麻雀協会", "+7.5"], ["4", "今井瑛介", "日本プロ麻雀協会", "-100.4"]],
    replayUrl: "https://tenhou.net/0/?log=2025042320gm-0009-10011-6c1abed0",
  },
  {
    id: "TM12-STAGE1-06", date: "2025.04.23", game: "第 1 节 B 桌 · 第 2 战", winner: "下石戟", winningTeam: "日本プロ麻雀協会", point: "+96.8pt",
    results: [["1", "下石戟", "日本プロ麻雀協会", "+96.8"], ["2", "太くないお", "天凤位预选/最高位戦日本プロ麻雀協会", "+20.3"], ["3", "おかもと", "最高位戦日本プロ麻雀協会", "-20.6"], ["4", "今井瑛介", "日本プロ麻雀協会", "-96.5"]],
    replayUrl: "https://tenhou.net/0/?log=2025042320gm-0009-10011-ee358a1d",
  },
  {
    id: "TM12-STAGE1-07", date: "2025.04.23", game: "第 1 节 B 桌 · 第 3 战", winner: "今井瑛介", winningTeam: "日本プロ麻雀協会", point: "+61.4pt",
    results: [["1", "今井瑛介", "日本プロ麻雀協会", "+61.4"], ["2", "おかもと", "最高位戦日本プロ麻雀協会", "+25.3"], ["3", "下石戟", "日本プロ麻雀協会", "+5.3"], ["4", "太くないお", "天凤位预选/最高位戦日本プロ麻雀協会", "-92.0"]],
    replayUrl: "https://tenhou.net/0/?log=2025042322gm-0009-10011-264ef4ff",
  },
  {
    id: "TM12-STAGE1-08", date: "2025.04.23", game: "第 1 节 B 桌 · 第 4 战", winner: "下石戟", winningTeam: "日本プロ麻雀協会", point: "+62.5pt",
    results: [["1", "下石戟", "日本プロ麻雀協会", "+62.5"], ["2", "今井瑛介", "日本プロ麻雀協会", "+20.0"], ["3", "おかもと", "最高位戦日本プロ麻雀協会", "-1.3"], ["4", "太くないお", "天凤位预选/最高位戦日本プロ麻雀協会", "-81.2"]],
    replayUrl: "https://tenhou.net/0/?log=2025042322gm-0009-10011-70386db9",
  },
].map((entry) => ({
  ...entry,
  source: "天凤名人战",
  event: "第12期 天凤名人战",
  stage: entry.id.includes("FINAL") ? "决胜战" : `第 ${entry.id.match(/STAGE(\d+)/)?.[1]} 节`,
  sourceUrl: "https://tenhou.net/cs/2025/04tm/",
  replayNote: "官方赛事页公开的天凤牌谱，可在逐巡查看器中复盘。",
}));

const haifuArchive = [
  ...mleagueHaifuArchive.map((entry) => ({
    ...entry,
    source: "M.LEAGUE",
    event: "2025–26 常规赛",
    stage: "常规赛",
    replayUrl: "",
    sourceUrl: "https://m-league.jp/games/?mlm=9&mly=2025",
    replayNote: "公开复盘为第三方按比赛数据重制的天凤格式牌谱；官网查看器需要 M.LEAGUE Supporter 登录。",
  })),
  ...tenhouHaifuArchive,
];

const haifuTeams = Array.from(new Set(haifuArchive.flatMap((entry) => entry.results.map((result) => result[2]))));
const haifuSources = Array.from(new Set(haifuArchive.map((entry) => entry.source)));
const haifuYears = Array.from(new Set(haifuArchive.map((entry) => entry.date.slice(0, 4))));
const haifuStages = Array.from(new Set(haifuArchive.map((entry) => entry.stage)));

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
type MLeagueTab = "matches" | "ranking" | "teams";

function publicReplayUrl(entry: (typeof haifuArchive)[number]) {
  if (entry.replayUrl) return entry.replayUrl;
  const match = entry.id.match(/_(\d{2})([AB])$/);
  const date = entry.date.split(".").slice(1).join("-");
  return `https://m-league.konoui.dev/seasons/2025-26/regular/${date}/${match?.[2] ?? "A"}-${Number(match?.[1] ?? 1)}/`;
}

function pageFromHash(hash: string): PageKey {
  const page = hash.replace("#", "") as PageKey;
  return ["resources", "whatcut", "scoring", "mleague", "archive"].includes(page) ? page : "home";
}

export default function Home() {
  const [page, setPage] = useState<PageKey>(() => pageFromHash(typeof window === "undefined" ? "" : window.location.hash));
  const [whatCutIndex, setWhatCutIndex] = useState(0);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [spoilers, setSpoilers] = useState(false);
  const [mleagueTab, setMleagueTab] = useState<MLeagueTab>("matches");
  const [selectedTeam, setSelectedTeam] = useState(0);
  const [resourceTopic, setResourceTopic] = useState<ResourceTopic>("tiles");
  const [tileGroup, setTileGroup] = useState<keyof typeof tileGroups>("万子");
  const [scoreQuestion, setScoreQuestion] = useState<ScoreQuestion>(createScoreQuestion);
  const [scoreInputs, setScoreInputs] = useState(["", ""]);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [archiveQuery, setArchiveQuery] = useState("");
  const [archiveTeam, setArchiveTeam] = useState("全部队伍");
  const [archiveSource, setArchiveSource] = useState("全部来源");
  const [archiveYear, setArchiveYear] = useState("全部年份");
  const [archiveStage, setArchiveStage] = useState("全部阶段");
  const [whatCutTag, setWhatCutTag] = useState("全部主题");
  const [activeHaifuId, setActiveHaifuId] = useState(haifuArchive[0].id);

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

  const filteredHaifu = useMemo(() => {
    const keyword = archiveQuery.trim().toLowerCase();
    return haifuArchive.filter((entry) => {
      const matchesTeam = archiveTeam === "全部队伍" || entry.results.some((result) => result[2] === archiveTeam);
      const matchesSource = archiveSource === "全部来源" || entry.source === archiveSource;
      const matchesYear = archiveYear === "全部年份" || entry.date.startsWith(archiveYear);
      const matchesStage = archiveStage === "全部阶段" || entry.stage === archiveStage;
      const searchable = `${entry.id}${entry.date}${entry.game}${entry.event}${entry.source}${entry.winner}${entry.winningTeam}${entry.results.flat().join("")}`.toLowerCase();
      return matchesTeam && matchesSource && matchesYear && matchesStage && (!keyword || searchable.includes(keyword));
    });
  }, [archiveQuery, archiveSource, archiveStage, archiveTeam, archiveYear]);

  const activeHaifu = filteredHaifu.find((entry) => entry.id === activeHaifuId) ?? filteredHaifu[0] ?? haifuArchive[0];

  const whatCutQuestion = whatCutQuestions[whatCutIndex];
  const filteredWhatCutIndexes = useMemo(() => whatCutQuestions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => whatCutTag === "全部主题" || whatCutTags(question).includes(whatCutTag)), [whatCutTag]);
  const whatCutPosition = Math.max(0, filteredWhatCutIndexes.findIndex(({ index }) => index === whatCutIndex));
  const answerIsBest = selectedTile !== null && whatCutQuestion.tiles[selectedTile] === whatCutQuestion.answer;
  const parsedScoreInputs = scoreInputs.map((value) => Number(value.replace(/[^\d]/g, "")));
  const scoreIsCorrect = scoreSubmitted && scoreQuestion.answers.every((answer, index) => parsedScoreInputs[index] === answer);

  const nextWhatCut = () => {
    const next = filteredWhatCutIndexes[(whatCutPosition + 1) % filteredWhatCutIndexes.length];
    setWhatCutIndex(next.index);
    setSelectedTile(null);
  };

  const randomWhatCut = () => {
    if (filteredWhatCutIndexes.length < 2) return;
    const offset = 1 + Math.floor(Math.random() * (filteredWhatCutIndexes.length - 1));
    setWhatCutIndex(filteredWhatCutIndexes[(whatCutPosition + offset) % filteredWhatCutIndexes.length].index);
    setSelectedTile(null);
  };

  const changeWhatCutTag = (tag: string) => {
    setWhatCutTag(tag);
    const first = whatCutQuestions.findIndex((question) => tag === "全部主题" || whatCutTags(question).includes(tag));
    if (first >= 0) setWhatCutIndex(first);
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
            <div><strong>{yakuCards.length}</strong><span>条役种索引</span></div>
            <div><strong>{whatCutQuestions.length}</strong><span>道书籍何切</span></div>
            <div><strong>{haifuArchive.length}</strong><span>场牌谱复盘</span></div>
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

      <section className="quick-start page-section">
        <div className="section-heading compact-heading">
          <div>
            <p className="section-kicker">QUICK ACCESS / 快捷入口</p>
            <h2>从问题出发，直接进入。</h2>
          </div>
          <p>面向已有对局经验的玩家，减少引导，保留足够深度。</p>
        </div>
        <div className="quick-grid">
          <a className="quick-card" href="#resources">
            <div className="quick-number">01</div>
            <div className="quick-content">
              <span>牌面、流程、役种、规则</span>
              <h3>打开主题资料库</h3>
              <p>按主题速查，不从首页堆叠长篇知识内容。</p>
            </div>
            <span className="round-arrow">↗</span>
          </a>
          <a className="quick-card quick-featured" href="#whatcut">
            <div className="quick-number">02</div>
            <div className="quick-icon"><TileFace name="Pei" label="北" /></div>
            <div className="quick-content">
              <span>书籍题库 · Q001—Q{String(whatCutQuestions.length).padStart(3, "0")}</span>
              <h3>直接练习书中的<br />经典何切题</h3>
              <p>按原题牌姿作答，再查看书中推荐切牌与解析。</p>
            </div>
            <span className="round-arrow">↗</span>
          </a>
          <a className="quick-card" href="#scoring">
            <div className="quick-number">03</div>
            <div className="quick-content">
              <span>翻数、符数与点数</span>
              <h3>算点图解与练习</h3>
              <p>查亲家、子家点数表，并用自动出题练习。</p>
            </div>
            <span className="round-arrow">↗</span>
          </a>
          <a className="quick-card" href="#mleague">
            <div className="quick-number">04</div>
            <div className="quick-content">
              <span>今晚有比赛吗？</span>
              <h3>查看 M.LEAGUE</h3>
              <p>赛程、队伍、选手与关键牌谱。</p>
            </div>
            <span className="round-arrow">↗</span>
          </a>
          <a className="quick-card" href="#archive">
            <div className="quick-number">05</div>
            <div className="quick-content">
              <span>检索比赛 · 逐巡复盘</span>
              <h3>进入牌谱档案</h3>
              <p>按选手、赛事与来源找到公开逐巡复盘。</p>
            </div>
            <span className="round-arrow">↗</span>
          </a>
        </div>
      </section>
      </>}

      {page === "resources" && <>
      <section className="resource-library page-section" aria-label="立直麻将资料库">
        <nav className="resource-tabs" aria-label="资料主题">
          {resourceTopics.map((topic, index) => <button
            key={topic.key}
            className={resourceTopic === topic.key ? "active" : ""}
            aria-current={resourceTopic === topic.key ? "page" : undefined}
            onClick={() => setResourceTopic(topic.key)}
          >
            <i>{String(index + 1).padStart(2, "0")}</i>
            <span><small>{topic.english}</small><strong>{topic.label}</strong></span>
            <em>{topic.count}</em>
          </button>)}
        </nav>

        {resourceTopic === "tiles" && <article className="resource-panel tile-resource" id="tile-guide">
          <div className="resource-panel-head"><span>TILES / 牌面</span><strong>数牌 27 种 · 字牌 7 种 · 赤五 3 种</strong></div>
          <div className="tile-guide-head">
            <h2>牌面速查</h2>
            <div className="tile-tabs" role="tablist" aria-label="牌面分类">
              {(Object.keys(tileGroups) as Array<keyof typeof tileGroups>).map((group) => <button
                key={group} role="tab" aria-selected={tileGroup === group}
                className={tileGroup === group ? "active" : ""} onClick={() => setTileGroup(group)}
              >{group}</button>)}
            </div>
          </div>
          <div className="tile-guide-row">
            {tileGroups[tileGroup].map((tile) => <div className="guide-tile" key={tile.name}>
              <TileFace name={tile.name} label={tile.label} /><span>{tile.label}</span>
            </div>)}
          </div>
          <div className="red-five-note">
            <span>赤五 / AKA DORA</span>
            {["Man5-Dora", "Pin5-Dora", "Sou5-Dora"].map((tile) => <div key={tile}><TileFace name={tile} label={tileLabel(tile)} /><strong>{tileLabel(tile)}</strong></div>)}
            <p>赤五通常各一张，作为一枚宝牌计算；具体数量以平台或赛事规则为准。</p>
          </div>
          <p className="asset-credit">牌面采用 FluffyStuff 公共领域日麻牌图</p>
        </article>}

        {resourceTopic === "yaku" && <article className="resource-panel">
          <div className="resource-panel-head"><span>YAKU / 役种辞典</span><strong>{yakuCards.length} 条 · 按翻数分类 · 每役含牌型图例</strong></div>
          <div className="yaku-reference-intro">
            <div><span>MENZEN ONLY</span><strong>门清限定</strong><p>立直、平和、一杯口、七对子、二杯口等必须保持门清。</p></div>
            <div><span>OPEN HAND</span><strong>副露仍成立</strong><p>断幺九、役牌、对对和与多数役满副露后仍可成立。</p></div>
            <div><span>KUINARI</span><strong>食下役</strong><p>三色同顺、一气通贯、混全带幺九、纯全带幺九、混一色与清一色副露后少一翻。</p></div>
            <div><span>RULE VARIANTS</span><strong>规则差异</strong><p>双倍役满、累计役满和流局满贯并非处处采用；古役、地方役不列入通行役种表。</p></div>
          </div>
          {yakuGroups.map((group) => <section className="yaku-group" key={group.label}>
            <div className="yaku-group-head"><div><span>{group.note}</span><h2>{group.label}</h2></div><strong>{yakuCards.filter(([, , han]) => group.includes(han)).length} 条</strong></div>
            <div className="yaku-directory">
              {yakuCards.filter(([, , han]) => group.includes(han)).map(([name, kana, han, closed, summary]) => <div className={han.includes("役满") ? "yakuman" : ""} key={name}>
                <div className="yaku-card-meta"><span>{yakuRestriction(name, han, closed)}</span><strong>{han}</strong></div>
                <h3>{name}</h3><small>{kana}</small><p>{summary}</p>
                <div className={`yaku-example-hand ${yakuExample(name).length > 14 ? "dense" : ""}`} aria-label={`${name}牌型图例`}>
                  {splitYakuExample(name, yakuExample(name)).map((group, groupIndex) => <span className="yaku-tile-group" key={`${name}-group-${groupIndex}`}>
                    {group.map(({ tile, index }) => <span
                      className={`yaku-tile ${index === yakuWinningTileIndexes[name] ? "winning" : ""}`}
                      key={`${name}-${index}-${tile}`}
                      title={index === yakuWinningTileIndexes[name] ? `${tileLabel(tile)} · 和了牌` : tileLabel(tile)}
                    ><TileFace name={tile} label={index === yakuWinningTileIndexes[name] ? `${tileLabel(tile)}，和了牌` : tileLabel(tile)} /></span>)}
                  </span>)}
                </div>
                <em>{yakuExampleCaption(name)}</em>
              </div>)}
            </div>
          </section>)}
        </article>}

        {resourceTopic === "rules" && <article className="resource-panel">
          <div className="resource-panel-head"><span>RULES / 规则介绍</span><strong>从成牌目标到终局 · 以常见立直麻将规则为基准</strong></div>
          <div className="flow-directory rule-overview">
            {ruleOverviewEntries.map(([index, title, description]) => <div key={index}><b>{index}</b><h3>{title}</h3><p>{description}</p></div>)}
          </div>
          <div className="rules-subhead"><span>RULE DETAILS</span><h2>容易影响实战判断的规则细则</h2><p>不同赛事、雀庄和线上平台可能采用不同细则，以下内容用于快速建立检查清单。</p></div>
          <div className="rules-directory">
            {ruleEntries.map((rule, index) => <details key={rule.title} open={index < 2}>
              <summary><i>{String(index + 1).padStart(2, "0")}</i><span><small>{rule.tag}</small><strong>{rule.title}</strong></span><b>＋</b></summary>
              <div><p>{rule.summary}</p><small>{rule.detail}</small></div>
            </details>)}
          </div>
        </article>}

        {resourceTopic === "scoring" && <article className="resource-panel">
          <div className="resource-panel-head"><span>SCORING / 算点速查</span><strong>默认不采用切上满贯</strong></div>
          <p className="scoring-table-note">横向选择符数，纵向选择翻数；格内上方为荣和点数，下方为自摸支付。20 符仅用于平和自摸，25 符固定用于七对子。累计役满是否采用仍以对局规则为准。资料结构参考<a href="https://zh.wikibooks.org/zh-hans/日本麻將/點數計算規則" target="_blank" rel="noreferrer">日本麻将点数计算规则 ↗</a>。</p>
          <div className="score-table-grid">
            {scoringTables.map((table) => <section className="score-table-card" key={table.title}>
              <header><div><span>{table.english}</span><h2>{table.title}</h2></div><p>{table.note}</p></header>
              <div className="score-table-scroll"><table className="score-matrix">
                <thead><tr><th>翻数</th>{scoreFuHeaders.map(([fu, note]) => <th key={fu}><strong>{fu}</strong>{note && <small>{note}</small>}</th>)}</tr></thead>
                <tbody>
                  {table.rows.map((row) => <tr key={`${table.title}-${row.han}`}><th>{row.han}</th>{row.cells.map((cell, index) => <td className={cell.kiriage ? "kiriage-candidate" : ""} key={`${row.han}-${index}`}>
                    <span className="score-cell"><strong>{cell.ron}</strong><small>自摸 {cell.tsumo}{table.all && cell.tsumo !== "—" ? " all" : ""}</small></span>
                  </td>)}{row.mangan && <td className="matrix-limit-cell" colSpan={scoreFuHeaders.length - row.cells.length}>
                    <span><b>满贯</b><strong>{row.mangan.ron}</strong><small>自摸 {row.mangan.tsumo}{table.all ? " all" : ""}</small></span>
                  </td>}</tr>)}
                  {table.limits.map(([han, name, ron, tsumo]) => <tr className="matrix-limit-row" key={`${table.title}-${han}`}><th>{han}</th><td colSpan={scoreFuHeaders.length}>
                    <span><b>{name}</b><strong>{ron}</strong><small>自摸 {tsumo}{table.all ? " all" : ""}</small></span>
                  </td></tr>)}
                </tbody>
              </table></div>
            </section>)}
          </div>
          <section className="fu-guide">
            <header className="fu-guide-head"><div><span>FU REFERENCE / 符数速查</span><h2>先从 20 符开始，逐项相加后进位。</h2></div><p>除七对子固定 25 符外，合计符数向上进位到 10 的倍数。下表采用通行规则；连风雀头是否计 2 符或 4 符需确认对局规则。</p></header>
            <div className="fu-foundation">
              <div><span>BASE</span><strong>底符 20</strong><small>所有普通和牌从 20 符起算</small></div>
              <div><span>ROUND UP</span><strong>十位进位</strong><small>例如 32 符按 40 符结算</small></div>
              <div><span>CHIITOI</span><strong>七对子 25</strong><small>固定 25 符，不再追加其他符</small></div>
            </div>
            <div className="fu-reference-grid">
              <div className="fu-meld-card">
                <div className="fu-card-title"><span>SETS / 面子</span><strong>刻子与杠子的符</strong></div>
                <table><thead><tr><th>面子</th><th>中张牌</th><th>幺九牌 / 字牌</th></tr></thead><tbody>
                  {fuMeldRows.map(([name, simple, terminal]) => <tr key={name}><th>{name}</th><td>{simple}</td><td>{terminal}</td></tr>)}
                </tbody></table>
                <p>顺子不计符。双碰荣和时，荣和牌完成的刻子按明刻计算。</p>
              </div>
              <div className="fu-detail-list">
                {fuDetailGroups.map((group) => <section key={group.title}><h3>{group.title}</h3>{group.items.map(([name, fu]) => <div key={name}><span>{name}</span><strong>{fu}</strong></div>)}</section>)}
              </div>
            </div>
            <div className="fu-special-cases">
              <div><strong>平和自摸</strong><span>固定 20 符</span><p>自摸的 2 符不另加。</p></div>
              <div><strong>副露平和形荣和</strong><span>固定 30 符</span><p>俗称“食平形”，没有其他加符时按 30 符。</p></div>
              <div><strong>连风雀头</strong><span>通常 4 符</span><p>场风与自风重合时通常分别加 2 符，少数规则只计 2 符。</p></div>
              <div><strong>宝牌</strong><span>不计符</span><p>宝牌只增加翻数，而且本身不能提供役。</p></div>
            </div>
          </section>
          <aside className="kiriage-note">
            <div><span>OPTIONAL RULE</span><h2>切上满贯如何处理？</h2><p>上方两张表默认不切上，因此黄色格保留 7700 / 11600。若采用切上满贯，只改动以下两种牌值。</p></div>
            <div className="kiriage-change"><strong>子家 · 30符4翻 / 60符3翻</strong><span>7700（自摸 2000 / 3900）</span><b>→ 8000（自摸 2000 / 4000）</b></div>
            <div className="kiriage-change"><strong>亲家 · 30符4翻 / 60符3翻</strong><span>11600（自摸 3900 all）</span><b>→ 12000（自摸 4000 all）</b></div>
          </aside>
          <a className="resource-practice-link" href="#scoring">进入自动算点练习 <span>→</span></a>
        </article>}
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
              <div className="question-tools">
                <label><span>主题</span><select value={whatCutTag} onChange={(event) => changeWhatCutTag(event.target.value)}><option>全部主题</option>{whatCutTagOptions.map((tag) => <option key={tag}>{tag}</option>)}</select></label>
                <button onClick={randomWhatCut}>随机一题 ↻</button>
                <div className="participant-count"><strong>{whatCutPosition + 1} / {filteredWhatCutIndexes.length}</strong><span>当前筛选</span></div>
              </div>
            </div>

            <div className="question-index-strip" aria-label="何切题目索引">
              {filteredWhatCutIndexes.map(({ question, index }) => <button
                key={question.id}
                className={whatCutIndex === index ? "active" : ""}
                aria-label={`打开第 ${question.id} 题`}
                aria-current={whatCutIndex === index ? "true" : undefined}
                onClick={() => { setWhatCutIndex(index); setSelectedTile(null); }}
              >{String(question.id).padStart(3, "0")}</button>)}
            </div>

            <div className="round-context">
              <span className="wind-badge">{whatCutQuestion.seat.slice(0, 1)}</span>
              <div>
                <strong>{whatCutQuestion.round} · {whatCutQuestion.turn}巡目 · {whatCutQuestion.seat}</strong>
                <small className="dora-line">宝牌指示牌 <TileFace name={whatCutQuestion.doraIndicator} label={tileLabel(whatCutQuestion.doraIndicator)} /></small>
                <span className="whatcut-tags">{whatCutTags(whatCutQuestion).map((tag) => <i key={tag}>{tag}</i>)}</span>
              </div>
              <div className="points"><span>《{whatCutBook(whatCutQuestion)}》</span><span>题面 PDF {whatCutQuestion.questionPage} 页</span></div>
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
                <div className="answer-comparison">
                  <div className="answer-verdict">
                    <span>{answerIsBest ? "与书中一致" : "你的选择"}</span>
                    <strong>切 <TileFace name={whatCutQuestion.tiles[selectedTile]} label={tileLabel(whatCutQuestion.tiles[selectedTile])} /> {tileLabel(whatCutQuestion.tiles[selectedTile])}</strong>
                  </div>
                  {!answerIsBest && <div className="answer-verdict book-answer">
                    <span>书中答案</span>
                    <strong>切 <TileFace name={whatCutQuestion.answer} label={tileLabel(whatCutQuestion.answer)} /> {tileLabel(whatCutQuestion.answer)}</strong>
                  </div>}
                </div>
                <p>{whatCutQuestion.explanation}</p>
                <div className="answer-actions">
                  <button onClick={() => setSelectedTile(null)}>重新选择</button>
                  <button onClick={nextWhatCut}>下一题 →</button>
                </div>
              </div>
            )}
            <div className="book-source-note">来源：《{whatCutBook(whatCutQuestion)}》Q{String(whatCutQuestion.id).padStart(3, "0")} · 解答 PDF {whatCutQuestion.answerPage} 页 · 牌面已两次核对并重绘</div>
          </div>

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
            <div className="season-block"><small>SELECTED SEASON</small><strong>2025—26</strong><span>OFFICIAL SEASON ARCHIVE</span></div>
          </div>

          <div className="schedule-card">
            <div className="schedule-toolbar">
              <div className="schedule-tabs">
                <button className={mleagueTab === "matches" ? "active" : ""} onClick={() => setMleagueTab("matches")}>赛程与牌谱</button>
                <button className={mleagueTab === "ranking" ? "active" : ""} onClick={() => setMleagueTab("ranking")}>赛季排名</button>
                <button className={mleagueTab === "teams" ? "active" : ""} onClick={() => setMleagueTab("teams")}>队伍与选手</button>
              </div>
              {mleagueTab === "matches" && <label className="spoiler-toggle">
                  <span>隐藏赛果</span>
                  <input type="checkbox" checked={!spoilers} onChange={() => setSpoilers(!spoilers)} />
                  <i />
                </label>}
            </div>
            {mleagueTab === "matches" && <div className="match-archive-list">
              <div className="offseason-board">
                <div className="offseason-copy">
                  <span>AUGUST 2026 / 休赛期</span>
                  <strong>八月没有 M.LEAGUE 常规赛</strong>
                  <p>2026–27 赛季开幕日与常规赛日程尚待官方公布；本月仍有 M Tournament 决赛和联盟线下活动。</p>
                  <a href="https://m-league.jp/news202606021500/" target="_blank" rel="noreferrer">查看新赛季官方说明 ↗</a>
                </div>
                <div className="august-events">
                  {augustEvents.map((event) => <a href={event.href} target="_blank" rel="noreferrer" key={event.date}>
                    <b>{event.date}</b><span>{event.tag}</span><strong>{event.title}</strong><p>{event.description}</p><i>↗</i>
                  </a>)}
                </div>
              </div>
              <div className="archive-divider"><span>2025–26 SEASON ARCHIVE</span><strong>已结束赛季牌谱</strong></div>
              {matchArchive.map((match) => (
                <article className="match-day" key={match.date}>
                  <div className="match-day-head">
                    <div className="match-date"><strong>{match.date}</strong><span>{match.week}</span></div>
                    <div><small>{match.label}</small><strong>两场半庄</strong></div>
                  </div>
                  <div className="match-games">
                    {match.games.map((game) => <div className="match-game" key={game.gameId}>
                      <span className="game-number">{game.number}</span>
                      <div className="lineup" aria-label={game.players.join("、")}>
                        {game.players.map((player) => <span key={player}>{player}</span>)}
                      </div>
                      <div className={`game-result ${spoilers ? "revealed" : ""}`}>
                        <small>{spoilers ? "1 位" : "赛果隐藏"}</small>
                        <strong>{spoilers ? `${game.winner} ${game.point}` : game.gameId}</strong>
                      </div>
                    </div>)}
                  </div>
                </article>
              ))}
            </div>}

            {mleagueTab === "ranking" && <div className="standings-wrap">
              <div className="standings-block">
                <div className="standings-heading"><span>REGULAR SEASON</span><strong>常规赛最终排名</strong></div>
                <ol>{regularStandings.map(([team, point], index) => <li key={team}><b>{String(index + 1).padStart(2, "0")}</b><span>{team}</span><strong className={point.startsWith("-") ? "negative" : ""}>{point} pt</strong></li>)}</ol>
              </div>
              <div className="standings-block semifinal">
                <div className="standings-heading"><span>SEMIFINAL SERIES</span><strong>半决赛排名</strong></div>
                <ol>{semifinalStandings.map(([team, point], index) => <li key={team}><b>{String(index + 1).padStart(2, "0")}</b><span>{team}</span><strong className={point.startsWith("-") ? "negative" : ""}>{point} pt</strong></li>)}</ol>
              </div>
            </div>}

            {mleagueTab === "teams" && <div className="teams-browser">
              <div className="team-selector" aria-label="选择队伍">
                {mleagueTeams.map((team, index) => <button className={selectedTeam === index ? "active" : ""} onClick={() => setSelectedTeam(index)} key={team.slug} style={{ "--team-accent": team.accent } as CSSProperties}>
                  <i>{String(index + 1).padStart(2, "0")}</i><span>{team.short}</span>
                </button>)}
              </div>
              <article className="roster-card" style={{ "--team-accent": mleagueTeams[selectedTeam].accent } as CSSProperties}>
                <div className="roster-title"><span>TEAM {String(selectedTeam + 1).padStart(2, "0")}</span><h3>{mleagueTeams[selectedTeam].name}</h3><p>2025–26 赛季官方登记选手</p></div>
                <div className="player-grid">
                  {mleagueTeams[selectedTeam].players.map((player, index) => <div key={player}><span>{String(index + 1).padStart(2, "0")}</span><strong>{player}</strong><small>M.LEAGUER</small></div>)}
                </div>
                <a href={`https://m-league.jp/teams/${mleagueTeams[selectedTeam].slug}`} target="_blank" rel="noreferrer">打开官方队伍页 ↗</a>
              </article>
            </div>}

            <div className="schedule-footer"><span>官方资料快照 · 更新于 2026.08.09</span><a href="https://m-league.jp/games" target="_blank" rel="noreferrer">查看官方日程、结果与牌谱 <b>↗</b></a></div>
          </div>
        </div>
      </section>}

      {page === "archive" && <section className="haifu-library page-section" id="archive">
        <div className="archive-library-head">
          <div>
            <p className="section-kicker">HAIFU ARCHIVE / 牌谱档案</p>
            <h2>先找到那场比赛，<br />再回到决定胜负的一巡。</h2>
            <p>收录职业联赛与公开赛事的高质量牌谱、完整顺位和得点，可按选手、赛事来源、日期或牌谱 ID 检索，并直接进入逐巡复盘。</p>
          </div>
          <div className="archive-stats">
            <div><strong>{haifuArchive.length}</strong><span>已收录半庄</span></div>
            <div><strong>{haifuSources.length}</strong><span>公开牌谱来源</span></div>
            <div><strong>{haifuTeams.length}</strong><span>队伍与所属</span></div>
          </div>
        </div>

        <div className="archive-controls">
          <label className="archive-search">
            <span>SEARCH / 搜索</span>
            <input value={archiveQuery} onChange={(event) => setArchiveQuery(event.target.value)} placeholder="输入选手、日期或牌谱 ID" />
          </label>
          <label className="archive-team-filter">
            <span>TEAM / 队伍与所属</span>
            <select value={archiveTeam} onChange={(event) => setArchiveTeam(event.target.value)}>
              <option>全部队伍</option>
              {haifuTeams.map((team) => <option key={team}>{team}</option>)}
            </select>
          </label>
          <label className="archive-source-filter">
            <span>SOURCE / 来源</span>
            <select value={archiveSource} onChange={(event) => setArchiveSource(event.target.value)}>
              <option>全部来源</option>
              {haifuSources.map((source) => <option key={source}>{source}</option>)}
            </select>
          </label>
          <label className="archive-year-filter">
            <span>YEAR / 年份</span>
            <select value={archiveYear} onChange={(event) => setArchiveYear(event.target.value)}>
              <option>全部年份</option>
              {haifuYears.map((year) => <option key={year}>{year}</option>)}
            </select>
          </label>
          <label className="archive-stage-filter">
            <span>STAGE / 阶段</span>
            <select value={archiveStage} onChange={(event) => setArchiveStage(event.target.value)}>
              <option>全部阶段</option>
              {haifuStages.map((stage) => <option key={stage}>{stage}</option>)}
            </select>
          </label>
          <div className="archive-result-count"><strong>{filteredHaifu.length}</strong><span>条结果</span></div>
        </div>

        <div className="archive-workspace">
          <div className="haifu-result-list" aria-label="牌谱检索结果">
            {filteredHaifu.map((entry) => <button className={activeHaifu.id === entry.id ? "active" : ""} onClick={() => setActiveHaifuId(entry.id)} key={entry.id}>
              <span className="haifu-date">{entry.date.replace("2025.", "")}</span>
              <span className="haifu-summary"><small>{entry.source} · {entry.game}</small><strong>{entry.winner}</strong><em>{entry.event} · {entry.winningTeam}</em></span>
              <b>{entry.point}</b><i>→</i>
            </button>)}
            {filteredHaifu.length === 0 && <div className="haifu-empty"><strong>没有匹配的牌谱</strong><span>试试选手全名、队伍名或清空筛选条件。</span></div>}
          </div>

          <article className="haifu-detail">
            <div className="haifu-detail-top"><span>{activeHaifu.source} / GAME ID</span><code>{activeHaifu.id}</code></div>
            <div className="haifu-winner">
              <div><span>TOP PLAYER / 一位</span><h3>{activeHaifu.winner}</h3><p>{activeHaifu.winningTeam}</p></div>
              <strong>{activeHaifu.point}</strong>
            </div>
            <div className="haifu-ranking">
              <div className="haifu-ranking-head"><span>顺位</span><span>选手 / 队伍</span><span>得点</span></div>
              {activeHaifu.results.map(([rank, player, team, point]) => <div className={rank === "1" ? "winner" : ""} key={`${activeHaifu.id}-${player}`}>
                <b>{rank}</b><span><strong>{player}</strong><small>{team}</small></span><em className={point.startsWith("-") ? "negative" : ""}>{point} pt</em>
              </div>)}
            </div>
            <div className="haifu-meta"><span>{activeHaifu.date}</span><span>{activeHaifu.event} · {activeHaifu.game}</span></div>
            <div className="haifu-actions">
              <a className="replay-primary" href={publicReplayUrl(activeHaifu)} target="_blank" rel="noreferrer">打开公开逐巡复盘 ↗</a>
              <a href={activeHaifu.sourceUrl} target="_blank" rel="noreferrer">查看赛事来源 ↗</a>
              <p>{activeHaifu.replayNote}</p>
            </div>
          </article>
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
        <p className="footer-note">资料持续整理 · 牌谱连接至赛事公开档案与复盘来源</p>
      </footer>
    </main>
  );
}
