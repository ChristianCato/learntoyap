import { useState, useEffect, useRef } from "react";

// ─── THEME ───────────────────────────────────────────────────────────────────
const LIGHT = {
  bg: "#F7F7F5", surface: "#FFFFFF", surfaceAlt: "#F0EFEB",
  border: "#E5E3DC", borderStrong: "#CDCBC2",
  text: "#1A1A18", textSub: "#6B6B63", textMuted: "#AEADA6",
  timerTrack: "#E5E3DC", shadow: "0 2px 12px rgba(0,0,0,0.07)",
  shadowMd: "0 4px 24px rgba(0,0,0,0.10)", cardHover: "#FAFAF8",
};
const DARK = {
  bg: "#0E0E12", surface: "#16161C", surfaceAlt: "#111118",
  border: "#222230", borderStrong: "#333344",
  text: "#F0EDE8", textSub: "#888880", textMuted: "#44443C",
  timerTrack: "#1A1A26", shadow: "0 2px 12px rgba(0,0,0,0.3)",
  shadowMd: "0 4px 24px rgba(0,0,0,0.4)", cardHover: "#1A1A22",
};

// ─── DATA ────────────────────────────────────────────────────────────────────
const NICHES = [
  { id: "all",             label: "🎲 Any",              color: "#888"    },
  { id: "finance",         label: "💰 Finance",           color: "#E8A020" },
  { id: "fitness",         label: "💪 Fitness",           color: "#16A34A" },
  { id: "mindset",         label: "🧠 Mindset",           color: "#7C3AED" },
  { id: "hottakes",        label: "🔥 Hot Takes",         color: "#DC2626" },
  { id: "career",          label: "🚀 Career",            color: "#0284C7" },
  { id: "relationships",   label: "❤️ Relationships",     color: "#DB2777" },
  { id: "content",         label: "📱 Content",           color: "#EA580C" },
  { id: "life",            label: "🌱 Life",              color: "#15803D" },
  { id: "tech",            label: "💻 Tech",              color: "#0369A1" },
  { id: "entrepreneurship",label: "⚡ Entrepreneurship",  color: "#EA580C" },
  { id: "dating",          label: "💘 Dating",            color: "#BE185D" },
  { id: "society",         label: "🌍 Society",           color: "#15803D" },
  { id: "marketing",       label: "📣 Marketing",         color: "#C2410C" },
  { id: "storytime",       label: "🎭 Storytime",         color: "#8B5CF6" },
];

const DIFFICULTIES = [
  { id: "random", label: "🎲 Random", color: "#888"    },
  { id: "easy",   label: "Easy",      color: "#16A34A" },
  { id: "medium", label: "Medium",    color: "#D97706" },
  { id: "hard",   label: "Hard",      color: "#DC2626" },
];

const TOPIC_LENGTHS = [
  { id: "all",    label: "Any length",  desc: null },
  { id: "short",  label: "Short",       desc: "One word or phrase — think fast" },
  { id: "medium", label: "Medium",      desc: "A sentence — some context" },
  { id: "long",   label: "Long",        desc: "Full prompt — something to dig into" },
];

// Topic types for variety — user-selectable
const TYPE_OPTIONS = [
  { id: "all",         label: "🎲 Any type",        color: "#888"    },
  { id: "story",       label: "📖 Story",            color: "#0284C7" },
  { id: "debate",      label: "⚔️ Debate",           color: "#DC2626" },
  { id: "explain",     label: "🧠 Explain",          color: "#7C3AED" },
  { id: "changemymind",label: "🔄 Change My Mind",   color: "#D97706" },
  { id: "hottake",     label: "🔥 Hot Take",         color: "#EA580C" },
  { id: "list",        label: "📋 List",             color: "#16A34A" },
];

const TYPE_LABELS = {
  story:        { label: "📖 Story",          desc: "Tell it" },
  debate:       { label: "⚔️ Debate",         desc: "Argue it" },
  explain:      { label: "🧠 Explain",        desc: "Break it down" },
  changemymind: { label: "🔄 Change My Mind", desc: "Convince me" },
  hottake:      { label: "🔥 Hot Take",       desc: "Say it" },
  list:         { label: "📋 List",           desc: "Break it down" },
};

// Each topic: [text, type]
// Length is computed dynamically: short=1-5 words, medium=6-12, long=13+

const getTopicLength = (text) => {
  const words = text.trim().split(/\s+/).length;
  if (words <= 5)  return "short";
  if (words <= 12) return "medium";
  return "long";
};

const getAllTopics = (niche, difficulty, typeFilter, lengthFilter, resolvedDiffOverride) => {
  const DIFF_IDS = ["easy", "medium", "hard"];
  const resolvedDiff = resolvedDiffOverride
    || (difficulty === "random"
      ? DIFF_IDS[Math.floor(Math.random() * DIFF_IDS.length)]
      : difficulty);

  let pool = [];
  if (niche === "all") {
    Object.values(TOPICS).forEach(n => {
      const src = resolvedDiff === "all"
        ? Object.values(n).flat()
        : (n[resolvedDiff] || []);
      pool.push(...src);
    });
  } else {
    const n = TOPICS[niche];
    if (!n) return [];
    pool = resolvedDiff === "all" ? Object.values(n).flat() : (n[resolvedDiff] || []);
  }

  if (typeFilter && typeFilter !== "all") {
    pool = pool.filter(([, type]) => type === typeFilter);
  }
  if (lengthFilter && lengthFilter !== "all") {
    pool = pool.filter(([text]) => getTopicLength(text) === lengthFilter);
  }
  return pool;
};

const countTopicsFiltered = (niche, difficulty, typeFilter, lengthFilter) => {
  // For "random" difficulty, count across all difficulties
  if (difficulty === "random") {
    return getAllTopics(niche, "all", typeFilter, lengthFilter, "all").length;
  }
  return getAllTopics(niche, difficulty, typeFilter, lengthFilter).length;
};

const TOPICS = {
  finance: {
    easy: [
      ["Tell me about the first time you genuinely worried about money. What happened?", "story"],
      ["One money habit. Life before vs after. 60 seconds.", "story"],
      ["Explain compound interest to me like I'm 16 and think saving is boring.", "explain"],
      ["What's something you bought that felt expensive but was actually worth every penny?", "story"],
      ["Change my mind: a budget is more important than your income.", "changemymind"],
    ],
    medium: [
      ["Most people on decent salaries still don't build wealth. Why?", "debate"],
      ["Asset vs liability — most people get this backwards. Set the record straight.", "explain"],
      ["Is buying a house always the smart move or are we just told it is?", "debate"],
      ["The one money conversation nobody's having that they should be.", "hottake"],
      ["Break down 3 reasons people stay broke even when they earn enough.", "list"],
    ],
    hard: [
      ["Hot take: saving money is actually overrated. Defend it on camera.", "hottake"],
      ["The financial advice most people follow is quietly keeping them poor. Go.", "hottake"],
      ["Smart people make terrible money decisions constantly. Why?", "debate"],
      ["Change my mind: financial literacy should be mandatory in schools.", "changemymind"],
      ["The whole concept of financial freedom is being sold to you. Unpack it.", "hottake"],
    ],
  },
  fitness: {
    easy: [
      ["Walk me through your morning. What's actually in your routine and why?", "story"],
      ["One workout or movement that changed something for you. Tell the story.", "story"],
      ["Most underrated form of exercise that nobody talks about. Make your case.", "debate"],
      ["Before and after — not body, but mindset. What changed when you got consistent?", "story"],
      ["Explain what progressive overload is to someone who thinks gym = just lifting heavy.", "explain"],
    ],
    medium: [
      ["Why do people quit the gym 6 weeks in, every time? Get specific.", "explain"],
      ["Change my mind: motivation is completely overrated for fitness.", "changemymind"],
      ["'Healthy' looks different to everyone — and most people's definition is wrong.", "hottake"],
      ["3 things the fitness industry tells you that are either wrong or deliberately confusing.", "list"],
      ["Rest days aren't optional — and here's why most people treat them like they are.", "debate"],
    ],
    hard: [
      ["Hustle culture is physically destroying people and we're clapping for it. Go.", "hottake"],
      ["Hot take: cardio is mostly a waste of time for people who want to change their body. Defend it.", "hottake"],
      ["Fitness advice is everywhere and most of it is making people worse. Explain why.", "debate"],
      ["Change my mind: the gym isn't the best place to get fit.", "changemymind"],
      ["The wellness industry profits from keeping you confused. Make the case.", "hottake"],
    ],
  },
  mindset: {
    easy: [
      ["One belief you held for years that you've completely dropped. What changed?", "story"],
      ["What does discipline actually look like in your day-to-day? Get specific.", "explain"],
      ["Something you do that most people think is weird but you know it works.", "story"],
      ["Tell me about a moment that made you see yourself differently.", "story"],
      ["Explain the difference between discipline and motivation to someone who thinks they're the same thing.", "explain"],
    ],
    medium: [
      ["Confidence — is it built or born? Pick a side and argue it.", "debate"],
      ["Why do people self-sabotage hardest when they're closest to what they want?", "explain"],
      ["'Growth mindset' is a concept most people understand but almost nobody actually practises. Unpack it.", "debate"],
      ["3 mindset shifts that genuinely changed how you operate.", "list"],
      ["Change my mind: therapy isn't for everyone and that's fine.", "changemymind"],
    ],
    hard: [
      ["Therapy culture has made some people more fragile, not less. Argue for or against.", "debate"],
      ["'Be yourself' is lazy advice. Most people's authentic self needs work. Go.", "hottake"],
      ["Intelligent people stay stuck longer than average people. Why?", "explain"],
      ["Change my mind: comfort is the enemy disguised as self-care.", "changemymind"],
      ["Most people aren't held back by circumstances — they're held back by identity. Unpack it.", "hottake"],
    ],
  },
  hottakes: {
    easy: [
      ["One opinion you hold that your circle would push back on hard. Say it.", "hottake"],
      ["Something everyone seems to love right now that you think is massively overrated.", "hottake"],
      ["A rule you were taught growing up that you now think is completely wrong.", "debate"],
      ["The piece of advice you hear constantly that you think does more harm than good.", "hottake"],
      ["Change my mind: being liked is more useful than being respected early in your career.", "changemymind"],
    ],
    medium: [
      ["Work-life balance isn't real for people who actually want to build something. Unpack it.", "debate"],
      ["Most online advice makes people feel productive while keeping them stuck. Make the case.", "hottake"],
      ["'Follow your passion' is bad advice most of the time. Argue it.", "debate"],
      ["3 things people say are important that genuinely aren't.", "list"],
      ["Change my mind: hustle culture gets too much hate.", "changemymind"],
    ],
    hard: [
      ["Authenticity is a performance. Everyone's doing it. Argue it on camera.", "hottake"],
      ["Most people don't want to change. They want to feel like they're changing. Defend this.", "hottake"],
      ["Networking is mostly a waste of time unless you're already someone worth knowing. Make the case.", "debate"],
      ["Change my mind: being average is a completely valid life choice.", "changemymind"],
      ["The self-improvement industry is selling you a problem so it can sell you the solution. Go.", "hottake"],
    ],
  },
  career: {
    easy: [
      ["The best career advice you ever got. Who said it and why did it land?", "story"],
      ["A professional failure that quietly set you up for something better.", "story"],
      ["One skill you wish you'd started building 2 years earlier than you did.", "explain"],
      ["Walk me through the moment you knew you were in the wrong job.", "story"],
      ["Explain what personal branding means to someone who thinks it's cringe.", "explain"],
    ],
    medium: [
      ["Talent gets you in the room. What actually keeps you there?", "explain"],
      ["Is the traditional career ladder dead, or just broken for certain people?", "debate"],
      ["What makes someone genuinely irreplaceable at work — and why most people aren't?", "explain"],
      ["3 unwritten career rules nobody tells you until it's too late.", "list"],
      ["Change my mind: job hopping is smarter than loyalty right now.", "changemymind"],
    ],
    hard: [
      ["Playing it safe in your career is the riskiest thing you can actually do. Go.", "hottake"],
      ["Most people optimise for salary when they should be optimising for learning. Make the case.", "debate"],
      ["Your employer does not care about your career. And once you accept that, everything changes.", "hottake"],
      ["Change my mind: a degree is still worth it in 2025.", "changemymind"],
      ["The biggest career mistakes people make aren't visible until 5 years later. Name them.", "list"],
    ],
  },
  relationships: {
    easy: [
      ["What actually makes a great friendship — and why is it so rare as you get older?", "explain"],
      ["Tell me about someone who genuinely changed the way you see the world.", "story"],
      ["A relationship green flag that nobody ever seems to talk about.", "hottake"],
      ["What's one thing you wish you'd known about relationships in your early 20s?", "story"],
      ["Explain emotional intelligence to someone who thinks it's just 'being nice.'", "explain"],
    ],
    medium: [
      ["Why do people keep staying in situations that are clearly wrong for them?", "explain"],
      ["Is radical honesty in relationships always the right move? Debate it.", "debate"],
      ["Change my mind: you can't have a healthy relationship without individual therapy.", "changemymind"],
      ["3 things people confuse with love that actually aren't.", "list"],
      ["The difference between someone who communicates and someone who just talks.", "explain"],
    ],
    hard: [
      ["Most people are genuinely terrible at communication and have no idea. Go.", "hottake"],
      ["Loneliness is an epidemic — but more connection isn't the answer. Argue it.", "debate"],
      ["People confuse being liked with being respected constantly. Why?", "explain"],
      ["Change my mind: situationships exist because one person always wants more.", "changemymind"],
      ["The idea of a soulmate is one of the most quietly damaging things people believe. Make the case.", "hottake"],
    ],
  },
  content: {
    easy: [
      ["What actually made you start posting? The real reason, not the clean version.", "story"],
      ["The biggest thing people get wrong about being a content creator.", "explain"],
      ["Tell me about a video or post that surprised you — flopped or blew up unexpectedly.", "story"],
      ["What's the difference between a creator and someone who just posts?", "explain"],
      ["One thing you've learned about speaking on camera that nobody told you.", "story"],
    ],
    medium: [
      ["Why do most creators plateau after their first bit of traction?", "explain"],
      ["Is posting consistently more important than posting quality content? Argue it.", "debate"],
      ["3 things that are killing creators' growth that they don't realise.", "list"],
      ["Change my mind: going viral is mostly luck, not skill.", "changemymind"],
      ["The gap between someone with 1k followers and someone with 100k — what is it really?", "explain"],
    ],
    hard: [
      ["Authenticity on social media is mostly a performance. Unpack it on camera.", "hottake"],
      ["The algorithm doesn't reward good content. It rewards content that keeps people addicted. Go.", "hottake"],
      ["Most creators are building an audience but not a business. Why is that actually dangerous?", "debate"],
      ["Change my mind: personal brand is just ego with a strategy.", "changemymind"],
      ["The creator economy has a dark side nobody's talking about. Name it.", "hottake"],
    ],
  },
  life: {
    easy: [
      ["One small habit. Disproportionate impact. What is it and why does it work?", "explain"],
      ["A specific moment — not a period, a moment — that shifted how you see yourself.", "story"],
      ["Walk me through what a genuinely good day looks like for you right now.", "story"],
      ["Something you said no to that ended up being the best decision you made.", "story"],
      ["Explain what 'living intentionally' actually means without sounding like a life coach.", "explain"],
    ],
    medium: [
      ["Why do most people end up living someone else's version of a good life?", "explain"],
      ["What does building a genuinely good life actually mean in practice?", "debate"],
      ["Is balance something you achieve or something you're constantly chasing?", "debate"],
      ["3 things that look like progress but are actually avoidance.", "list"],
      ["Change my mind: your 20s are for figuring it out, not building.", "changemymind"],
    ],
    hard: [
      ["Most people in their 20s are sleepwalking. Make the case without being preachy.", "hottake"],
      ["Chasing happiness as a goal is the fastest way to feel empty. Argue it.", "debate"],
      ["People who have everything still feel nothing. Why?", "explain"],
      ["Change my mind: comfort is not the enemy of growth.", "changemymind"],
      ["The version of success most people are chasing was designed by someone else. Go.", "hottake"],
    ],
  },
  tech: {
    easy: [
      ["One app or tool that changed how you actually work. What is it and why?", "story"],
      ["Explain what AI is to someone who thinks it's just ChatGPT writing their emails.", "explain"],
      ["The most overhyped piece of tech right now. Make your case.", "hottake"],
      ["Tell me about the last time technology genuinely surprised you.", "story"],
      ["What's one thing about the internet you think most people take completely for granted?", "explain"],
    ],
    medium: [
      ["Is social media making us smarter as a species or dumber? Pick a side.", "debate"],
      ["Will AI take jobs or create them? Where do you actually stand?", "debate"],
      ["Most people use technology without understanding it and that's becoming a problem. Go.", "hottake"],
      ["3 ways tech is quietly changing human behaviour that we don't talk about enough.", "list"],
      ["Change my mind: screen time limits are actually a privilege.", "changemymind"],
    ],
    hard: [
      ["Big tech companies are more powerful than most governments right now. Unpack it.", "hottake"],
      ["The attention economy is the most dangerous infrastructure ever built. Make the case.", "debate"],
      ["Privacy is already gone and most people's response is a shrug. Why?", "explain"],
      ["Change my mind: AI will make creativity less valuable, not more.", "changemymind"],
      ["We built tools to save us time and now they own our time. Go.", "hottake"],
    ],
  },
  storytime: {
    easy: [
      ["Tell me about a moment that was genuinely embarrassing at the time but funny now.", "story"],
      ["The most unexpected thing that's ever happened to you. Set the scene.", "story"],
      ["Tell me about a time you were completely wrong about someone.", "story"],
      ["A decision that seemed small at the time but changed everything.", "story"],
      ["Tell me about the best advice you ever ignored — and what happened.", "story"],
    ],
    medium: [
      ["Tell me about a time you had to start completely from scratch. What happened?", "story"],
      ["The most awkward conversation you've ever had to have. Walk me through it.", "story"],
      ["A moment where you realised you'd been looking at something completely wrong.", "story"],
      ["Tell me about a time you took a risk that most people told you not to take.", "story"],
      ["The version of you from 5 years ago would be surprised by what exactly?", "story"],
    ],
    hard: [
      ["Tell me about a moment where you genuinely didn't know if you'd make it through. Be honest.", "story"],
      ["The thing you had to unlearn that was hardest to let go of. Tell the story.", "story"],
      ["A conversation that changed the trajectory of your life. What was said?", "story"],
      ["Tell me about a time you were the villain in your own story — and what you did next.", "story"],
      ["The moment you realised the path you were on wasn't actually yours. What happened after?", "story"],
    ],
  },
  entrepreneurship: {
    easy: [
      ["The biggest myth about starting a business that needs to die.", "hottake"],
      ["A failure that taught you more than any win. What happened?", "story"],
      ["What would you tell someone who keeps saying they'll start 'when the time is right'?", "explain"],
      ["The moment you knew you wanted to build something for yourself.", "story"],
      ["Explain what cash flow actually means to someone who thinks profit = success.", "explain"],
    ],
    medium: [
      ["Why do most businesses actually fail in the first two years? Get specific.", "explain"],
      ["Is passion a valid reason to start a business or is it a trap?", "debate"],
      ["What separates people who build things from people who just have ideas?", "explain"],
      ["3 things entrepreneurs pretend don't matter that actually kill businesses.", "list"],
      ["Change my mind: you need funding to build something real.", "changemymind"],
    ],
    hard: [
      ["Entrepreneurship is being romanticised in a way that's actively hurting people. Go.", "hottake"],
      ["Most people who call themselves entrepreneurs are just self-employed with a logo. Unpack it.", "hottake"],
      ["The real reason people never start isn't time or money. It's fear with a good excuse. Argue it.", "debate"],
      ["Change my mind: building in public is more performance than strategy.", "changemymind"],
      ["The startup culture obsession with 'disruption' is mostly cosplay. Make the case.", "hottake"],
    ],
  },
  dating: {
    easy: [
      ["A green flag in a relationship that people never seem to mention. What is it?", "explain"],
      ["The lesson your last situationship taught you. Be honest.", "story"],
      ["The worst dating advice people actually follow. Name it and dismantle it.", "hottake"],
      ["What does a genuinely healthy dynamic look like in practice?", "explain"],
      ["Tell me about a moment in a relationship that taught you something about yourself.", "story"],
    ],
    medium: [
      ["Why do people keep choosing the wrong person even when they know better?", "explain"],
      ["Is modern dating actually broken or are people just less patient than before?", "debate"],
      ["What does emotional availability actually look like — not the definition, the behaviour?", "explain"],
      ["3 things people call 'standards' that are actually just avoidance.", "list"],
      ["Change my mind: attachment styles are an excuse not to do the work.", "changemymind"],
    ],
    hard: [
      ["Dating apps have made people objectively worse at forming real connections. Make the case.", "hottake"],
      ["Most people date for validation, not connection — and they don't even know it. Go.", "hottake"],
      ["The idea of a soulmate is romantically appealing and practically harmful. Argue it.", "debate"],
      ["Change my mind: you have to love yourself before you can love someone else.", "changemymind"],
      ["Modern dating has gamified attraction in a way that's rewiring how people relate to each other. Unpack it.", "hottake"],
    ],
  },
  society: {
    easy: [
      ["Something society completely normalises that you think is actually pretty strange.", "hottake"],
      ["A social rule that nobody questions but probably should be.", "debate"],
      ["What does success look like in your world vs what we're told it should look like?", "explain"],
      ["One thing you were taught growing up that society told you was normal — and isn't.", "story"],
      ["Explain 'privilege' in a way that doesn't make people defensive.", "explain"],
    ],
    medium: [
      ["Why do people conform publicly to things they privately disagree with?", "explain"],
      ["Is cancel culture doing more harm than good on balance? Argue it.", "debate"],
      ["Name a systemic problem that constantly gets blamed on individual choices.", "explain"],
      ["3 things society rewards that it probably shouldn't.", "list"],
      ["Change my mind: social media has made people more politically engaged, not less informed.", "changemymind"],
    ],
    hard: [
      ["The education system is built for a world that no longer exists. Go.", "hottake"],
      ["Most people's opinions aren't actually theirs — they're absorbed from their environment. Argue it.", "debate"],
      ["We've confused comfort with progress and it's making everything worse. Unpack it.", "hottake"],
      ["Change my mind: meritocracy is a myth that benefits the people already at the top.", "changemymind"],
      ["The middle class is a story told to stop people asking the right questions. Make the case.", "hottake"],
    ],
  },
  marketing: {
    easy: [
      ["The most overused marketing phrase right now — name it and roast it.", "hottake"],
      ["Tell me about the last thing you bought because of good marketing. What actually got you?", "story"],
      ["What's the actual difference between good marketing and manipulation?", "explain"],
      ["One brand doing marketing brilliantly right now and why.", "explain"],
      ["Explain what a 'hook' is to someone who thinks marketing is just making things look nice.", "explain"],
    ],
    medium: [
      ["Why do most brands sound exactly the same? What's causing it?", "explain"],
      ["Is personal branding just self-promotion with a better name? Debate it.", "debate"],
      ["What actually makes content worth sharing? Be specific.", "explain"],
      ["3 marketing 'rules' that are just outdated and people are still following.", "list"],
      ["Change my mind: going viral is the worst metric to optimise for.", "changemymind"],
    ],
    hard: [
      ["Most marketing is just noise dressed up as insight. Make the case.", "hottake"],
      ["Virality and actual business value are almost completely unrelated. Argue it.", "debate"],
      ["The brands winning right now aren't marketing — they're performing. And there's a difference. Unpack it.", "hottake"],
      ["Change my mind: influencer marketing is more effective than traditional advertising.", "changemymind"],
      ["Authenticity in marketing is the new script. Nobody's actually being real. Go.", "hottake"],
    ],
  },
};

// ─── SOUND ───────────────────────────────────────────────────────────────────
function useSound() {
  const ctx = useRef(null);
  const ci  = useRef(null);
  const getCtx = () => { if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)(); return ctx.current; };
  const playTick = () => { try { const ac = getCtx(), o = ac.createOscillator(), g = ac.createGain(); o.type = "sine"; o.frequency.value = 700; g.gain.setValueAtTime(0, ac.currentTime); g.gain.linearRampToValueAtTime(0.07, ac.currentTime + 0.005); g.gain.linearRampToValueAtTime(0, ac.currentTime + 0.04); o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.05); } catch(e){} };
  const playWin  = () => { try { const ac = getCtx(); [0,0.15,0.3].forEach((d,i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = "sine"; o.frequency.value = [880,1100,1320][i]; g.gain.setValueAtTime(0, ac.currentTime+d); g.gain.linearRampToValueAtTime(0.09, ac.currentTime+d+0.06); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime+d+0.6); o.connect(g); g.connect(ac.destination); o.start(ac.currentTime+d); o.stop(ac.currentTime+d+0.65); }); } catch(e){} };
  const startTicks = ms => { ci.current = setInterval(playTick, ms); };
  const stopTicks  = ()  => clearInterval(ci.current);
  return { playWin, startTicks, stopTicks };
}

// ─── FRAMEWORK CARD ──────────────────────────────────────────────────────────
function FrameworkCard({ fw, selected, onClick, T }) {
  return (
    <div onClick={onClick} style={{ background: selected ? `${fw.color}0D` : T.surface, border: `1px solid ${selected ? fw.color : T.border}`, borderRadius: 14, padding: "16px 18px", cursor: "pointer", transition: "all 0.2s", boxShadow: T.shadow }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, background: `${fw.color}15`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{fw.icon}</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: selected ? fw.color : T.text }}>{fw.name}</p>
          <p style={{ fontSize: 11, color: T.textMuted, marginTop: 1 }}>{fw.tagline}</p>
        </div>
        <span style={{ color: T.textMuted, fontSize: 16, transform: selected ? "rotate(90deg)" : "none", transition: "transform 0.2s", display: "block" }}>›</span>
      </div>
      {selected && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
          {fw.steps.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, background: `${fw.color}08`, borderRadius: 9, padding: "9px 12px" }}>
              <span style={{ color: fw.color, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>0{i+1}</span>
              <p style={{ fontSize: 12, color: T.textSub, lineHeight: 1.5 }}>{s}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CELEBRATION OVERLAY ─────────────────────────────────────────────────────
function CelebrationOverlay({ onDismiss, T }) {
  const msgs = ["Rep done. 🔥", "That's a take. 💪", "Good yap. 🎙️", "One more? 👀", "Growth. 📈"];
  const msg  = msgs[Math.floor(Math.random() * msgs.length)];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, animation: "fade-in 0.2s ease" }} onClick={onDismiss}>
      <div style={{ background: T.surface, borderRadius: 24, padding: "40px 48px", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.25)", animation: "pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
        <p style={{ fontSize: 28, fontWeight: 800, color: T.text, marginBottom: 6 }}>{msg}</p>
        <p style={{ fontSize: 14, color: T.textSub, marginBottom: 24 }}>Tap anywhere to continue</p>
        <button onClick={onDismiss} style={{ background: T.text, color: T.bg, border: "none", borderRadius: 100, padding: "12px 32px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Next Rep →</button>
      </div>
    </div>
  );
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────────
function Onboarding({ onDismiss, T }) {
  const steps = [
    { icon: "🎲", title: "Pick your niche", desc: "Finance, fitness, hot takes — choose what you want to practice." },
    { icon: "🎬", title: "Hit record", desc: "Spin the topic. Set up behind your tripod or phone camera." },
    { icon: "⏱️", title: "Prep then yap", desc: "30s prep timer to think. 60s to deliver. One take." },
    { icon: "🔁", title: "Rep it", desc: "Do it again. Structure gets automatic with reps." },
  ];
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20, padding: "24px", marginBottom: 24, boxShadow: T.shadowMd, animation: "slide-up 0.3s ease", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <p style={{ fontWeight: 800, fontSize: 16, color: T.text, marginBottom: 2 }}>Welcome to learntoyap.com 👋</p>
          <p style={{ fontSize: 12, color: T.textSub }}>Built by a creator, for creators. Here's how it works:</p>
        </div>
        <button onClick={onDismiss} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: T.textMuted, padding: 4, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ background: T.surfaceAlt, borderRadius: 12, padding: "14px" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <p style={{ fontWeight: 700, fontSize: 13, color: T.text, marginBottom: 3 }}>{s.title}</p>
            <p style={{ fontSize: 11, color: T.textSub, lineHeight: 1.5 }}>{s.desc}</p>
          </div>
        ))}
      </div>
      <button onClick={onDismiss} style={{ width: "100%", marginTop: 16, background: T.text, color: T.bg, border: "none", borderRadius: 12, padding: "12px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
        Let's go →
      </button>
    </div>
  );
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark]               = useState(false);
  const T                             = dark ? DARK : LIGHT;

  const [niche, setNiche]             = useState("all");
  const [difficulty, setDifficulty]   = useState("random");
  const [typeFilter, setTypeFilter]   = useState("all");
  const [lengthFilter, setLengthFilter] = useState("all");
  const [topic, setTopic]             = useState(null);
  const [topicType, setTopicType]     = useState(null);
  const [spinning, setSpinning]       = useState(false);
  const [shuffleText, setShuffleText] = useState("");
  const [activeTab, setActiveTab]     = useState("spin");
  const [selectedFw, setSelectedFw]   = useState(null);
  const [view, setView]               = useState("spin");
  const [recordPulse, setRecordPulse] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [sessionTopics, setSessionTopics]     = useState(new Set());
  const [lastCombo, setLastCombo]             = useState(null);
  const [repsToday, setRepsToday]             = useState(0);
  const [focusMode, setFocusMode]             = useState(false);

  // Timer
  const [timerMode, setTimerMode]     = useState("record");
  const [timeLeft, setTimeLeft]       = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone]     = useState(false);
  const timerRef   = useRef(null);
  const shuffleRef = useRef(null);
  const TIMER_DURATIONS = { prep: 60, record: 60 };

  const { playWin, startTicks, stopTicks } = useSound();

  const nicheObj = NICHES.find(n => n.id === niche) || NICHES[0];
  const diffObj  = DIFFICULTIES.find(d => d.id === difficulty) || DIFFICULTIES[0];
  const topicCount = countTopicsFiltered(niche, difficulty, typeFilter, lengthFilter);

  // ── TIMER ──
  const resetTimer = (dur) => { clearInterval(timerRef.current); setTimeLeft(dur !== undefined ? dur : TIMER_DURATIONS[timerMode]); setTimerRunning(false); setTimerDone(false); };
  const startTimer = () => { setTimerRunning(true); setTimerDone(false); };
  const adjustTime = (d) => { if (timerDone) setTimerDone(false); setTimeLeft(t => Math.max(10, t + d)); };
  const switchTimerMode = (mode) => { clearInterval(timerRef.current); setTimerMode(mode); setTimeLeft(TIMER_DURATIONS[mode]); setTimerRunning(false); setTimerDone(false); };

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); setTimerRunning(false); setTimerDone(true); setShowCelebration(true); setRepsToday(r => r + 1); playWin(); return 0; }
          return t - 1;
        });
      }, 1000);
    } else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [timerRunning]);

  const timerDuration = TIMER_DURATIONS[timerMode];
  const timerProgress = Math.min(100, ((timerDuration - Math.min(timeLeft, timerDuration)) / timerDuration) * 100);
  const r = 80; const circ = 2 * Math.PI * r;
  const accentColor = timerMode === "prep" ? "#7C3AED" : "#DC2626";

  // ── SPIN ──
  const placeholders = ["Finance...", "Mindset...", "Hot Take...", "Career...", "Fitness...", "Marketing...", "Content...", "Society..."];

  const spin = () => {
    if (spinning) return;
    // Try filtered pool first, fallback to unfiltered if empty
    let pool = getAllTopics(niche, difficulty, typeFilter, lengthFilter);
    if (!pool.length) pool = getAllTopics(niche, difficulty, "all", "all");
    if (!pool.length) return;
    // Filter out already-seen topics this session
    const unseen = pool.filter(([t]) => !sessionTopics.has(t));
    const finalPool = unseen.length > 0 ? unseen : pool; // fallback if all seen

    setSpinning(true); setTopic(null); setTopicType(null); setView("spin"); setRecordPulse(false);
    resetTimer(TIMER_DURATIONS[timerMode]);
    startTicks(90);

    let i = 0, elapsed = 0, interval = 90;
    const shuffle = () => {
      setShuffleText(placeholders[i % placeholders.length]);
      i++; elapsed += interval;
      if (elapsed === 1100) { stopTicks(); startTicks(200); interval = 200; }
      if (elapsed === 1800) { stopTicks(); startTicks(380); interval = 380; }
      if (elapsed < 2400) { shuffleRef.current = setTimeout(shuffle, interval); }
      else {
        stopTicks();
        const [picked, type] = finalPool[Math.floor(Math.random() * finalPool.length)];
        setTopic(picked); setTopicType(type);
        setShuffleText(""); setSpinning(false); setRecordPulse(true);
        setSessionTopics(prev => new Set([...prev, picked]));
        setLastCombo({ niche, difficulty, nicheLabel: nicheObj.label, diffLabel: diffObj.label });
        playWin();
        setTimeout(() => setRecordPulse(false), 3000);
      }
    };
    shuffle();
  };

  const goToTimer = () => { if (!topic) return; setView("timer"); };
  const goToTopic = () => setView("spin");

  const typeInfo = topicType ? TYPE_LABELS[topicType] : null;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", transition: "background 0.3s, color 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
        @keyframes slide-up  { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fade-in   { from { opacity:0 } to { opacity:1 } }
        @keyframes pop-in    { 0% { opacity:0; transform:scale(0.88) } 100% { opacity:1; transform:scale(1) } }
        @keyframes rec-pulse { 0%,100% { box-shadow:0 0 0 0 rgba(220,38,38,0.4) } 60% { box-shadow:0 0 0 22px rgba(220,38,38,0) } }
        @keyframes rec-idle  { 0%,100% { box-shadow:0 0 14px rgba(220,38,38,0.2) } 50% { box-shadow:0 0 30px rgba(220,38,38,0.45) } }
        @keyframes spin-ring { to { transform:rotate(360deg) } }
        @keyframes timer-in  { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }
        @keyframes collapse  { from { opacity:1; max-height:600px } to { opacity:0; max-height:0 } }
        @keyframes expand    { from { opacity:0; max-height:0 } to { opacity:1; max-height:600px } }
        .controls-wrap { overflow: hidden; transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease; }
        .controls-wrap.hidden { max-height: 0 !important; opacity: 0; pointer-events: none; }
        .controls-wrap.visible { max-height: 600px; opacity: 1; }
        .niche-pill { border-radius:100px; padding:6px 13px; font-size:12px; font-weight:500; cursor:pointer; transition:all 0.15s; white-space:nowrap; border:1px solid transparent; font-family:inherit; }
        .tab-btn    { background:none; border:none; font-size:13px; font-weight:600; padding:10px 0; cursor:pointer; border-bottom:2px solid transparent; transition:all 0.2s; font-family:inherit; }
        .adj-btn    { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:18px; transition:all 0.15s; background:transparent; font-family:inherit; line-height:1; }
        .diff-btn   { padding:7px 18px; border-radius:100px; cursor:pointer; font-size:12px; font-weight:600; font-family:inherit; transition:all 0.15s; }
      `}</style>

      {showCelebration && <CelebrationOverlay T={T} onDismiss={() => setShowCelebration(false)} />}

      {/* HEADER */}
      <header style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: focusMode ? "none" : "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: dark ? "rgba(14,14,18,0.97)" : "rgba(247,247,245,0.97)", backdropFilter: "blur(16px)", zIndex: 100, transition: "background 0.3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: T.text, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🎙</div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.3px", lineHeight: 1, color: T.text }}>learntoyap.com</p>
            <p style={{ fontSize: 9, color: T.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 1 }}>for creators</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {repsToday > 0 && (
            <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 100, padding: "4px 10px", fontSize: 11, color: T.textSub, fontWeight: 600 }}>
              🎙 {repsToday} rep{repsToday !== 1 ? "s" : ""} today
            </div>
          )}
          <button onClick={() => setShowOnboarding(v => !v)} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 100, padding: "4px 10px", fontSize: 11, color: T.textSub, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            {showOnboarding ? "Hide guide" : "How it works"}
          </button>
          <button onClick={() => setDark(d => !d)} style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${T.border}`, background: T.surface, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "20px 16px" }}>

        {/* ONBOARDING */}
        {showOnboarding && <Onboarding T={T} onDismiss={() => setShowOnboarding(false)} />}

        {/* TABS */}
        {!focusMode && (
        <div style={{ display: "flex", gap: 24, borderBottom: `1px solid ${T.border}`, marginBottom: 24 }}>
          {[["spin", "🎬 Spin & Yap"], ["timer", "⏱️ Timer"], ["frameworks", "🧱 Frameworks"]].map(([id, label]) => (
            <button key={id} className="tab-btn" onClick={() => { setActiveTab(id); if (id === "timer") setView("timer"); if (id === "spin") setView("spin"); }} style={{ color: activeTab === id ? T.text : T.textMuted, borderBottomColor: activeTab === id ? T.text : "transparent" }}>{label}</button>
          ))}
        </div>
        )}

        {/* ══ SPIN TAB ══ */}
        {(activeTab === "spin" || activeTab === "timer") && (
          <div style={{ animation: "fade-in 0.25s ease" }}>

            {view === "spin" && activeTab === "spin" && (
              <>
                {/* Collapsible controls */}
                <div className={`controls-wrap ${focusMode ? "hidden" : "visible"}`}>
                  {/* Niche */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase" }}>Niche</p>
                      <p style={{ fontSize: 10, color: T.textMuted }}>{topicCount} topic{topicCount !== 1 ? "s" : ""} available</p>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {NICHES.map(n => (
                        <button key={n.id} className="niche-pill" onClick={() => setNiche(n.id)} style={{ borderColor: niche === n.id ? n.color : T.border, color: niche === n.id ? n.color : T.textSub, background: niche === n.id ? `${n.color}12` : T.surface, boxShadow: T.shadow }}>{n.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 8 }}>Difficulty</p>
                    <div style={{ display: "flex", gap: 7 }}>
                      {DIFFICULTIES.map(d => (
                        <button key={d.id} className="diff-btn" onClick={() => setDifficulty(d.id)} style={{ border: `1px solid ${difficulty === d.id ? d.color : T.border}`, background: difficulty === d.id ? `${d.color}15` : T.surface, color: difficulty === d.id ? d.color : T.textSub, boxShadow: T.shadow }}>{d.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Type filter */}
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 8 }}>Topic Type</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {TYPE_OPTIONS.map(t => (
                        <button key={t.id} className="niche-pill" onClick={() => setTypeFilter(t.id)} style={{ borderColor: typeFilter === t.id ? t.color : T.border, color: typeFilter === t.id ? t.color : T.textSub, background: typeFilter === t.id ? `${t.color}12` : T.surface, boxShadow: T.shadow }}>{t.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Length filter */}
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 8 }}>Prompt Length</p>
                    <div style={{ display: "flex", gap: 7 }}>
                      {TOPIC_LENGTHS.map(l => (
                        <button key={l.id} onClick={() => setLengthFilter(l.id)} style={{ padding: "7px 14px", borderRadius: 100, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit", border: `1px solid ${lengthFilter === l.id ? "#0284C7" : T.border}`, background: lengthFilter === l.id ? "#0284C715" : T.surface, color: lengthFilter === l.id ? "#0284C7" : T.textSub, transition: "all 0.15s", boxShadow: T.shadow }}>{l.label}</button>
                      ))}
                    </div>
                    {lengthFilter !== "all" && (
                      <p style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>{TOPIC_LENGTHS.find(l => l.id === lengthFilter)?.desc}</p>
                    )}
                  </div>

                  {/* Last combo reminder */}
                  {lastCombo && (
                    <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 14px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p style={{ fontSize: 11, color: T.textSub }}>Last great combo: <strong style={{ color: T.text }}>{lastCombo.nicheLabel} · {lastCombo.diffLabel}</strong></p>
                      <button onClick={() => { setNiche(lastCombo.niche); setDifficulty(lastCombo.difficulty); }} style={{ fontSize: 11, color: T.textSub, background: "none", border: `1px solid ${T.border}`, borderRadius: 100, padding: "3px 10px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Use again</button>
                    </div>
                  )}

                  {/* Session progress */}
                  {sessionTopics.size > 0 && (
                    <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 14px", marginBottom: 12 }}>
                      <p style={{ fontSize: 11, color: T.textSub }}>✅ <strong style={{ color: T.text }}>{sessionTopics.size}</strong> topic{sessionTopics.size !== 1 ? "s" : ""} done this session · avoiding repeats</p>
                    </div>
                  )}

                  {/* Focus mode toggle — sits at bottom of controls */}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                    <button onClick={() => setFocusMode(true)} style={{ background: T.surfaceAlt, color: T.textSub, border: `1px solid ${T.border}`, borderRadius: 100, padding: "5px 14px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s" }}>
                      ↑ Focus mode
                    </button>
                  </div>
                </div>

                {/* FOCUS MODE — fullscreen centred layout */}
                {focusMode ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 80px)", gap: 0, marginTop: -20 }}>
                    {/* Big watermark */}
                    <p style={{ fontSize: 22, fontWeight: 800, color: T.textMuted, letterSpacing: "-0.5px", marginBottom: 24 }}>learntoyap.com</p>

                    {/* Big topic box */}
                    <div style={{ width: "100%", minHeight: 240, background: spinning ? T.surfaceAlt : T.surface, border: `1.5px solid ${spinning ? T.border : topic ? T.text : T.border}`, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", padding: "44px 36px", position: "relative", overflow: "hidden", transition: "all 0.35s ease", boxShadow: topic && !spinning ? T.shadowMd : T.shadow, marginBottom: 28 }}>
                      {!spinning && !topic && (
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 44, marginBottom: 10 }}>🎬</div>
                          <p style={{ color: T.textMuted, fontSize: 16, fontWeight: 500 }}>Hit record. Get your topic.</p>
                        </div>
                      )}
                      {spinning && <p style={{ fontSize: 24, fontWeight: 600, color: T.textMuted, textAlign: "center" }}>{shuffleText}</p>}
                      {topic && !spinning && (
                        <div style={{ textAlign: "center", width: "100%" }}>
                          {typeInfo && (
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 100, padding: "4px 12px", marginBottom: 16 }}>
                              <span style={{ fontSize: 12 }}>{typeInfo.label}</span>
                              <span style={{ fontSize: 11, color: T.textMuted }}>— {typeInfo.desc}</span>
                            </div>
                          )}
                          <p style={{ fontSize: 24, fontWeight: 700, color: T.text, lineHeight: 1.4, letterSpacing: "-0.3px", animation: "pop-in 0.3s cubic-bezier(0.34,1.56,0.64,1)", marginBottom: 20 }}>{topic}</p>
                          <button onClick={goToTimer} style={{ background: T.text, color: T.bg, border: "none", borderRadius: 100, padding: "10px 26px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Start Timer →</button>
                        </div>
                      )}
                    </div>

                    {/* Record button — bigger in focus mode */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 32 }}>
                      <div onClick={!spinning ? spin : undefined} style={{ width: 96, height: 96, borderRadius: "50%", background: "radial-gradient(circle at 36% 36%, #FF5555, #CC0000)", cursor: spinning ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.12s", animation: recordPulse ? "rec-pulse 0.9s ease-out 3" : spinning ? "none" : "rec-idle 3s infinite", transform: spinning ? "scale(0.9)" : "scale(1)", position: "relative" }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.25)", border: "2px solid rgba(255,255,255,0.2)" }} />
                        {spinning && <div style={{ position: "absolute", inset: -5, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "rgba(255,120,120,0.7)", animation: "spin-ring 0.75s linear infinite" }} />}
                      </div>
                      <p style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{spinning ? "Spinning..." : topic ? "Spin Again" : "Record"}</p>
                    </div>

                    {/* Exit focus mode */}
                    <button onClick={() => setFocusMode(false)} style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 100, padding: "6px 18px", fontSize: 11, fontWeight: 600, color: T.textMuted, cursor: "pointer", fontFamily: "inherit" }}>
                      ↓ Show settings
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Normal topic display */}
                    <div style={{ width: "100%", minHeight: 180, background: spinning ? T.surfaceAlt : T.surface, border: `1.5px solid ${spinning ? T.border : topic ? T.text : T.border}`, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 28px", position: "relative", overflow: "hidden", transition: "all 0.35s ease", boxShadow: topic && !spinning ? T.shadowMd : T.shadow }}>
                      {!spinning && !topic && (
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 36, marginBottom: 8 }}>🎬</div>
                          <p style={{ color: T.textMuted, fontSize: 14, fontWeight: 500 }}>Hit record. Get your topic.</p>
                        </div>
                      )}
                      {spinning && <p style={{ fontSize: 20, fontWeight: 600, color: T.textMuted, textAlign: "center" }}>{shuffleText}</p>}
                      {topic && !spinning && (
                        <div style={{ textAlign: "center", width: "100%" }}>
                          {typeInfo && (
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 100, padding: "4px 12px", marginBottom: 14 }}>
                              <span style={{ fontSize: 11 }}>{typeInfo.label}</span>
                              <span style={{ fontSize: 10, color: T.textMuted }}>— {typeInfo.desc}</span>
                            </div>
                          )}
                          <p style={{ fontSize: 20, fontWeight: 700, color: T.text, lineHeight: 1.4, letterSpacing: "-0.2px", animation: "pop-in 0.3s cubic-bezier(0.34,1.56,0.64,1)", marginBottom: 16 }}>{topic}</p>
                          <button onClick={goToTimer} style={{ background: T.text, color: T.bg, border: "none", borderRadius: 100, padding: "9px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Start Timer →</button>
                        </div>
                      )}
                    </div>

                    {/* Normal watermark */}
                    <div style={{ textAlign: "center", marginTop: 10, opacity: 0.35 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: T.textSub, letterSpacing: "-0.2px" }}>learntoyap.com</p>
                    </div>

                    {/* Normal record button */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 16 }}>
                      <div onClick={!spinning ? spin : undefined} style={{ width: 76, height: 76, borderRadius: "50%", background: "radial-gradient(circle at 36% 36%, #FF5555, #CC0000)", cursor: spinning ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.12s", animation: recordPulse ? "rec-pulse 0.9s ease-out 3" : spinning ? "none" : "rec-idle 3s infinite", transform: spinning ? "scale(0.9)" : "scale(1)", position: "relative" }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(0,0,0,0.25)", border: "2px solid rgba(255,255,255,0.2)" }} />
                        {spinning && <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "rgba(255,120,120,0.7)", animation: "spin-ring 0.75s linear infinite" }} />}
                      </div>
                      <p style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{spinning ? "Spinning..." : topic ? "Spin Again" : "Record"}</p>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── TIMER VIEW ── */}
            {(view === "timer" || activeTab === "timer") && (
              <div style={{ animation: "timer-in 0.3s cubic-bezier(0.34,1.2,0.64,1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 80px)", gap: 20, marginTop: -20 }}>
                {topic && (
                <div onClick={goToTopic} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 100, padding: "9px 18px", cursor: "pointer", maxWidth: "100%", boxShadow: T.shadow }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: T.textSub, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 360 }}>← {topic}</p>
                </div>
                )}

                {/* learntoyap watermark */}
                <p style={{ fontSize: 20, fontWeight: 800, color: T.textMuted, letterSpacing: "-0.4px" }}>learntoyap.com</p>

                {/* Mode toggle */}
                <div style={{ display: "flex", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 100, padding: 4, gap: 4 }}>
                  {[["prep","⚡ Prep","60s"],["record","🔴 Record","60s"]].map(([mode,label,dur]) => (
                    <button key={mode} onClick={() => switchTimerMode(mode)} style={{ padding: "7px 18px", borderRadius: 100, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12, background: timerMode === mode ? (mode === "prep" ? "#7C3AED" : "#DC2626") : "transparent", color: timerMode === mode ? "#fff" : T.textSub, transition: "all 0.2s" }}>{label} <span style={{ opacity: 0.5, fontSize: 10 }}>{dur}</span></button>
                  ))}
                </div>

                {/* Ring */}
                <div style={{ position: "relative", width: 210, height: 210 }}>
                  <svg width="210" height="210" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="105" cy="105" r={r} fill="none" stroke={T.timerTrack} strokeWidth="7" />
                    <circle cx="105" cy="105" r={r} fill="none" stroke={timerDone ? "#16A34A" : timerRunning ? accentColor : T.borderStrong} strokeWidth="7" strokeDasharray={circ} strokeDashoffset={circ - (circ * timerProgress) / 100} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.95s linear, stroke 0.3s" }} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <span style={{ fontSize: timerDone ? 44 : 58, fontWeight: 800, color: timerDone ? "#16A34A" : T.text, lineHeight: 1, letterSpacing: "-2px" }}>{timerDone ? "✓" : timeLeft}</span>
                    <span style={{ fontSize: 12, color: T.textMuted, marginTop: 4, fontWeight: 500 }}>{timerDone ? "Time's up" : timerMode === "prep" ? "prep" : "seconds"}</span>
                  </div>
                </div>

                {/* ± 30s */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <button className="adj-btn" onClick={() => adjustTime(-30)} style={{ borderColor: T.border, border: `1px solid ${T.border}`, color: T.textSub }}>−</button>
                  <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 500 }}>± 30s</span>
                  <button className="adj-btn" onClick={() => adjustTime(30)} style={{ borderColor: T.border, border: `1px solid ${T.border}`, color: T.textSub }}>+</button>
                </div>

                {/* Controls */}
                <div style={{ display: "flex", gap: 10 }}>
                  {!timerRunning && !timerDone && <button onClick={startTimer} style={{ background: accentColor, color: "#fff", border: "none", borderRadius: 100, padding: "13px 48px", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 20px ${accentColor}40` }}>START</button>}
                  {timerRunning && <button onClick={() => resetTimer()} style={{ background: "transparent", color: T.textSub, border: `1px solid ${T.border}`, borderRadius: 100, padding: "11px 28px", fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>Reset</button>}
                  {timerDone && (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => { resetTimer(); setTimeout(startTimer, 40); }} style={{ background: accentColor, color: "#fff", border: "none", borderRadius: 100, padding: "12px 32px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Go Again</button>
                      <button onClick={() => { resetTimer(TIMER_DURATIONS[timerMode]); setView("spin"); setTopic(null); setTopicType(null); }} style={{ background: "transparent", color: T.textSub, border: `1px solid ${T.border}`, borderRadius: 100, padding: "11px 22px", fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>New Topic</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ FRAMEWORKS TAB ══ */}
        {activeTab === "frameworks" && (
          <div style={{ animation: "fade-in 0.25s ease" }}>
            <p style={{ fontSize: 14, color: T.textSub, marginBottom: 4, lineHeight: 1.7 }}>Learn a framework. Practice it on a spin.</p>
            <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 20 }}>Reach for structure automatically — not from memory.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
              {[{ id: "prep", name: "PREP", tagline: "The all-rounder", steps: ["Point — say your conclusion first", "Reason — why is this true?", "Example — prove it with a specific story or stat", "Point — land back on it with more weight"], color: "#7C3AED", icon: "🧱" }, { id: "321", name: "3-2-1", tagline: "Lists that land", steps: ["3 things / steps / reasons", "2 ways to apply it", "1 thing to remember"], color: "#0284C7", icon: "📊" }, { id: "hook-story-lesson", name: "Hook → Story → Lesson", tagline: "The creator staple", steps: ["Hook — drop them into the moment", "Story — tell it with specific messy details", "Lesson — what does it mean for them?"], color: "#EA580C", icon: "📖" }, { id: "ppf", name: "Past → Present → Future", tagline: "The journey arc", steps: ["Past — where you were", "Present — where you are now", "Future — where this is going"], color: "#16A34A", icon: "⏳" }, { id: "pas", name: "Problem → Agitate → Solve", tagline: "Tension then release", steps: ["Problem — name what's wrong", "Agitate — make them feel it", "Solve — give them the out"], color: "#DC2626", icon: "⚡" }, { id: "eli5", name: "ELI5", tagline: "Clarity wins", steps: ["State the complex thing simply", "Use one analogy a 10-year-old would get", "Apply it to their life in one sentence"], color: "#D97706", icon: "🧒" }].map(fw => (
                <FrameworkCard key={fw.id} fw={fw} T={T} selected={selectedFw?.id === fw.id} onClick={() => setSelectedFw(selectedFw?.id === fw.id ? null : fw)} />
              ))}
            </div>
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: "22px", boxShadow: T.shadow }}>
              <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: T.text }}>🎣 Hook Rules</p>
              {[["Start mid-story","Drop into the moment. No context, no setup."],["Lead with the claim","Say the controversial thing first. Earn the explanation."],["Specific numbers only","'3 years' hits harder than 'a long time.'"],["Cut your first sentence","Whatever you planned to open with — delete it."],["Onscreen text: no filler","Cut pronouns, articles, conjunctions. Less words, more punch."]].map(([t,d],i,arr) => (
                <div key={i} style={{ display: "flex", gap: 14, paddingBottom: i < arr.length-1 ? 14 : 0, marginBottom: i < arr.length-1 ? 14 : 0, borderBottom: i < arr.length-1 ? `1px solid ${T.border}` : "none" }}>
                  <span style={{ color: "#D97706", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>0{i+1}</span>
                  <div><p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, color: T.text }}>{t}</p><p style={{ fontSize: 12, color: T.textSub, lineHeight: 1.6 }}>{d}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: `1px solid ${T.border}`, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: T.textMuted }}>Made by a creator, for creators · <a href="https://learntoyap.com" style={{ color: T.textSub, textDecoration: "none", fontWeight: 600 }}>learntoyap.com</a></p>
        </div>
      </div>
    </div>
  );
}
