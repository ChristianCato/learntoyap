import { useState, useEffect, useRef } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";

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
  { id: "tech",            label: "💻 Tech",              color: "#0369A1" },
  { id: "entrepreneurship",label: "⚡ Entrepreneurship",  color: "#EA580C" },
  { id: "dating",          label: "💘 Dating",            color: "#BE185D" },
  { id: "storytime",       label: "🎭 Storytime",         color: "#8B5CF6" },
];

const DIFFICULTIES = [
  { id: "random", label: "🎲 Random", color: "#888"    },
  { id: "short",  label: "Short",     color: "#0284C7" },
  { id: "medium", label: "Medium",    color: "#D97706" },
];


// Topic types for variety — user-selectable
const TYPE_OPTIONS = [
  { id: "all",         label: "🎲 Any type",        color: "#888"    },
  { id: "story",       label: "📖 Story",            color: "#0284C7" },
  { id: "debate",      label: "⚔️ Debate",           color: "#DC2626" },
  { id: "hottake",     label: "🔥 Hot Take",         color: "#EA580C" },
  { id: "changemymind",label: "🔄 Change My Mind",   color: "#D97706" },
  { id: "eli5",        label: "🧒 ELI5",             color: "#16A34A" },
  { id: "unpack",      label: "🧩 Unpack It",        color: "#7C3AED" },
];

const TYPE_LABELS = {
  story:        { label: "📖 Story",          desc: "Tell it" },
  debate:       { label: "⚔️ Debate",         desc: "Argue it" },
  hottake:      { label: "🔥 Hot Take",       desc: "Say it" },
  changemymind: { label: "🔄 Change My Mind", desc: "Convince me" },
  eli5:         { label: "🧒 ELI5",           desc: "Simplify it" },
  unpack:       { label: "🧩 Unpack It",      desc: "Break it down" },
};

// Each topic: [text, type]
// Length is computed dynamically: short=1-5 words, medium=6-12, long=13+


const getAllTopics = (niche, difficulty, typeFilter, _lengthFilter, resolvedDiffOverride) => {
  const DIFF_IDS = ["short", "medium"];
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
  return pool;
};

const countTopicsFiltered = (niche, difficulty, typeFilter) => {
  if (difficulty === "random") {
    return getAllTopics(niche, "all", typeFilter, null, "all").length;
  }
  return getAllTopics(niche, difficulty, typeFilter, null).length;
};

const TOPICS = {
  finance: {
    short: [
      ["Money guilt.", "story"],
      ["Broke era.", "story"],
      ["Impulse buy.", "story"],
      ["First pay cheque.", "story"],
      ["Financial trauma.", "story"],
      ["Overdraft.", "story"],
      ["Best investment.", "story"],
      ["Worst purchase.", "story"],
      ["Money and relationships.", "story"],
      ["Living paycheck to paycheck.", "story"],
      ["Rent or buy.", "debate"],
      ["Salary transparency.", "debate"],
      ["Saving in your 20s.", "debate"],
      ["Debt.", "debate"],
      ["Investing.", "debate"],
      ["Side hustle.", "debate"],
      ["Financial privilege.", "debate"],
      ["Cash or card.", "debate"],
      ["Pension.", "debate"],
      ["Inheritance.", "debate"],
      ["Crypto.", "debate"],
      ["Financial freedom.", "eli5"],
      ["Compound interest.", "eli5"],
      ["Budgeting.", "eli5"],
      ["Rich vs wealthy.", "eli5"],
      ["Passive income.", "eli5"],
      ["Lifestyle creep.", "eli5"],
      ["Generational wealth.", "eli5"],
      ["Money mindset.", "eli5"],
      ["Tax.", "eli5"],
      ["Net worth.", "eli5"],
      ["Emergency fund.", "eli5"],
      ["Negotiating salary.", "eli5"],
      ["Assets.", "eli5"],
      ["Side income.", "eli5"],
      ["Passive income.", "hottake"],
      ["Financial influencers.", "hottake"],
      ["FIRE movement.", "hottake"],
      ["Lottery mentality.", "hottake"],
      ["Money is everything.", "hottake"],
      ["Rich guilt.", "hottake"],
      ["Frugality culture.", "hottake"],
      ["Change my mind: most people are bad with money by design not by choice.", "changemymind"],
      ["Change my mind: talking about money should be normalised.", "changemymind"],
      ["Change my mind: renting is smarter than buying right now.", "changemymind"],
      ["Change my mind: a budget matters more than your income.", "changemymind"],
      ["Change my mind: financial literacy should be taught in school.", "changemymind"],
      ["3 money habits that actually work.", "unpack"],
      ["3 money myths people still believe.", "unpack"],
      ["3 signs someone is bad with money.", "unpack"],
    ],

    medium: [
      ["Most people on decent salaries still don't build wealth. Why?", "debate"],
      ["Asset vs liability — most people get this backwards.", "eli5"],
      ["Is buying a house always the smart move or are we just told it is?", "debate"],
      ["The money conversation nobody's having that they should be.", "hottake"],
      ["3 reasons people stay broke even when they earn enough.", "unpack"],
      ["Why a pay rise rarely makes people feel better about money long term.", "eli5"],
      ["Change my mind: index funds are boring but they're the smartest move most people can make.", "changemymind"],
      ["The real cost of a bad money mindset vs a bad income.", "debate"],
      ["Difference between someone who saves and someone who builds wealth.", "eli5"],
      ["Why do people spend more when stressed even when they know better?", "eli5"],
      ["3 money traps that feel smart but aren't.", "unpack"],
      ["Is debt always bad? Make a nuanced case.", "debate"],
      ["Why most people never negotiate their salary — and what it costs them.", "eli5"],
      ["The psychological reason people are terrible at investing.", "eli5"],
      ["Change my mind: your 20s are for spending not saving.", "changemymind"],
      ["What no one tells you about having more money.", "hottake"],
      ["Explain passive income to someone who thinks it means doing nothing.", "eli5"],
      ["Why is financial literacy still not taught in schools — really?", "debate"],
      ["The relationship between self-worth and net worth. Is it toxic?", "debate"],
      ["What separates people who build wealth from those who just earn?", "eli5"],
      ["3 financial decisions that seem small but compound into big problems.", "unpack"],
      ["Change my mind: FIRE movement is only achievable for the privileged.", "changemymind"],
      ["Why do people know they should save but still don't?", "eli5"],
      ["The hidden cost of lifestyle creep.", "eli5"],
    
      ["Saving money is actually overrated. Defend it.", "hottake"],
      ["The financial advice most people follow is quietly keeping them poor. Go.", "hottake"],
      ["Smart people make terrible money decisions constantly. Why?", "debate"],
      ["Change my mind: financial freedom is a myth sold by people who already have it.", "changemymind"],
      ["The whole concept of financial freedom is being sold to you. Unpack it.", "hottake"],
      ["The stock market is just gambling with better PR. Argue for or against.", "debate"],
      ["Most financial influencers make money teaching people to make money, not from doing it. Go.", "hottake"],
      ["Change my mind: the wealth gap is a feature of capitalism not a bug.", "changemymind"],
      ["Why do people who finally make money often lose it just as fast?", "eli5"],
      ["The middle class is being financially engineered out of existence. Make the case.", "hottake"],
      ["Frugality culture has made people small-minded about money. Argue it.", "debate"],
      ["Why is generational wealth talked about so little in mainstream finance advice?", "eli5"],
      ["The system isn't designed for most people to retire comfortably. Go.", "hottake"],
      ["Change my mind: crypto is the biggest wealth transfer of our generation.", "changemymind"],
      ["Most people's relationship with money was broken before they earned their first penny.", "eli5"],
      ["The real reason hustle culture keeps people poor despite the grind.", "hottake"],
      ["Financial stress doesn't just hurt wallets — it rewires brains.", "eli5"],
      ["Why do smart educated people make terrible investment decisions at scale?", "eli5"],
      ["The pension system is a promise most governments can't keep. Go.", "hottake"],
      ["Change my mind: being broke is more of a mindset problem than an income problem.", "changemymind"],
      ["Most wealth advice assumes you already have capital. Why is that a problem?", "eli5"],
      ["The financialisation of housing has broken society. Make the case.", "hottake"],
      ["Change my mind: most people are one financial emergency away from poverty regardless of salary.", "changemymind"],
      ["Does money change people — and is it always for the worse?", "debate"],
    
    ],
  },
  fitness: {
    short: [
      ["Rest day.", "story"],
      ["First gym session.", "story"],
      ["Fitness low point.", "story"],
      ["Before and after.", "story"],
      ["Injury.", "story"],
      ["Running.", "story"],
      ["Body image moment.", "story"],
      ["Fitness turning point.", "story"],
      ["Best workout.", "story"],
      ["Worst workout.", "story"],
      ["Plateau.", "story"],
      ["Cardio.", "debate"],
      ["Gym vs home.", "debate"],
      ["Weights vs cardio.", "debate"],
      ["Morning vs evening workouts.", "debate"],
      ["Sports vs gym.", "debate"],
      ["Rest days.", "debate"],
      ["Supplements.", "debate"],
      ["Fasting.", "debate"],
      ["Plant-based diet.", "debate"],
      ["Cold showers.", "debate"],
      ["Progressive overload.", "eli5"],
      ["Calorie deficit.", "eli5"],
      ["Muscle memory.", "eli5"],
      ["Recovery.", "eli5"],
      ["Mind-muscle connection.", "eli5"],
      ["Protein.", "eli5"],
      ["Metabolism.", "eli5"],
      ["Sleep and fitness.", "eli5"],
      ["Consistency over intensity.", "eli5"],
      ["Overtraining.", "eli5"],
      ["Body fat percentage.", "eli5"],
      ["Fitness influencers.", "hottake"],
      ["Six pack culture.", "hottake"],
      ["No days off mentality.", "hottake"],
      ["Gym culture.", "hottake"],
      ["Biohacking.", "hottake"],
      ["Wellness industry.", "hottake"],
      ["Fitness tracking apps.", "hottake"],
      ["Change my mind: walking is underrated.", "changemymind"],
      ["Change my mind: sleep matters more than any workout.", "changemymind"],
      ["Change my mind: you don't need a gym to get fit.", "changemymind"],
      ["Change my mind: most people overtrain.", "changemymind"],
      ["Change my mind: aesthetics are a valid reason to train.", "changemymind"],
      ["3 fitness myths that won't die.", "unpack"],
      ["3 most overrated exercises.", "unpack"],
      ["3 underrated recovery tools.", "unpack"],
      ["3 signs you're overtraining.", "unpack"],
    ],

    medium: [
      ["Why do most people quit the gym after 6 weeks?", "eli5"],
      ["Is motivation a myth? What actually keeps people consistent?", "debate"],
      ["What does healthy actually mean — and why is the common definition wrong?", "eli5"],
      ["3 things the fitness industry tells you that are wrong or deliberately confusing.", "unpack"],
      ["Rest days aren't optional — and here's why most people treat them like they are.", "debate"],
      ["Change my mind: aesthetics are a valid reason to train.", "changemymind"],
      ["Why do people who know exactly what to do still not do it?", "eli5"],
      ["Fitness as punishment vs fitness as performance.", "eli5"],
      ["3 reasons why most diets fail within a month.", "unpack"],
      ["Is there such a thing as the perfect workout routine?", "debate"],
      ["What no one tells you about getting consistent for a full year.", "eli5"],
      ["Change my mind: sleep is more important than any workout.", "changemymind"],
      ["Why is the all-or-nothing approach to fitness so destructive?", "eli5"],
      ["Protein — why does everyone obsess over it and who's actually right?", "eli5"],
      ["The relationship between mental health and physical training is underrated. Make the case.", "debate"],
      ["Why do people over-complicate fitness when the basics work?", "eli5"],
      ["3 fitness myths that won't die no matter how much science debunks them.", "unpack"],
      ["Change my mind: you can out-train a bad diet.", "changemymind"],
      ["The actual role of genetics in fitness outcomes.", "debate"],
      ["Why do most people train for looks but talk about health?", "eli5"],
      ["The psychology behind why people self-sabotage their fitness goals.", "eli5"],
      ["Change my mind: group fitness classes are more effective than solo training.", "changemymind"],
      ["What does sustainable fitness actually look like over a lifetime?", "eli5"],
      ["3 things people get completely wrong about losing body fat.", "unpack"],
    
      ["Hustle culture is destroying people's health and we're clapping for it. Go.", "hottake"],
      ["Cardio is mostly a waste of time for people who want to change their body. Defend it.", "hottake"],
      ["Fitness advice is everywhere and most of it is making people worse. Why?", "debate"],
      ["Change my mind: the gym isn't the best place to get fit.", "changemymind"],
      ["The wellness industry profits from keeping you confused. Make the case.", "hottake"],
      ["Body positivity and fitness culture are in direct conflict. Argue it.", "debate"],
      ["Most personal trainers are not qualified to give the advice they give. Go.", "hottake"],
      ["Change my mind: fitness culture has become a form of social status signalling.", "changemymind"],
      ["The supplement industry is built on manufactured insecurity. Unpack it.", "hottake"],
      ["Why do elite athletes have completely different advice to fitness influencers?", "eli5"],
      ["Biohacking culture is just optimisation anxiety with a better name. Go.", "hottake"],
      ["Change my mind: most people don't want to be fit — they want to feel like they're trying.", "changemymind"],
      ["The fitness to mental health pipeline is real and undersold. Make the case.", "debate"],
      ["Why does the body transformation industry disproportionately target insecurity?", "eli5"],
      ["Gym culture has a serious toxic masculinity problem. Argue for or against.", "debate"],
      ["The no days off mentality is an injury and burnout machine. Go.", "hottake"],
      ["Change my mind: structured sport is better for you than the gym.", "changemymind"],
      ["Why do people with the most fitness knowledge often look the worst?", "debate"],
      ["Fitness has been gamified in a way that makes it less effective for most people.", "hottake"],
      ["The real reason most fitness transformations don't last more than a year.", "eli5"],
      ["The fitness industry is allergic to simplicity because simple doesn't sell. Go.", "hottake"],
      ["Change my mind: most fitness transformations are just good lighting and better posture.", "changemymind"],
      ["Why does the same workout advice work for some people and destroy others?", "eli5"],
      ["Performance-enhancing drugs in fitness culture — where's the honest conversation?", "debate"],
    
    ],
  },
  mindset: {
    short: [
      ["Comfort zone moment.", "story"],
      ["Mindset shift.", "story"],
      ["Rock bottom.", "story"],
      ["Fear faced.", "story"],
      ["Belief dropped.", "story"],
      ["Journaling.", "story"],
      ["Therapy moment.", "story"],
      ["Limiting belief.", "story"],
      ["Identity crisis.", "story"],
      ["Breakthrough moment.", "story"],
      ["Ego check.", "story"],
      ["Confidence.", "debate"],
      ["Positive thinking.", "debate"],
      ["Therapy.", "debate"],
      ["Resilience.", "debate"],
      ["Nature vs nurture.", "debate"],
      ["Radical acceptance.", "debate"],
      ["Stoicism.", "debate"],
      ["Vulnerability.", "debate"],
      ["Mindfulness.", "debate"],
      ["Self-awareness.", "eli5"],
      ["Cognitive dissonance.", "eli5"],
      ["Imposter syndrome.", "eli5"],
      ["Growth mindset.", "eli5"],
      ["Identity.", "eli5"],
      ["Discipline.", "eli5"],
      ["Accountability.", "eli5"],
      ["Ego.", "eli5"],
      ["Shadow work.", "eli5"],
      ["Inner critic.", "eli5"],
      ["Emotional intelligence.", "eli5"],
      ["Self-sabotage.", "eli5"],
      ["Neuroplasticity.", "eli5"],
      ["Self-help industry.", "hottake"],
      ["Toxic positivity.", "hottake"],
      ["Hustle mindset.", "hottake"],
      ["Manifestation.", "hottake"],
      ["Morning routines.", "hottake"],
      ["Authenticity.", "hottake"],
      ["Change my mind: most people need less self-reflection not more.", "changemymind"],
      ["Change my mind: comfort zones are useful.", "changemymind"],
      ["Change my mind: therapy isn't for everyone.", "changemymind"],
      ["Change my mind: positive thinking can be harmful.", "changemymind"],
      ["Change my mind: discipline beats motivation every time.", "changemymind"],
      ["3 mindset shifts that actually work.", "unpack"],
      ["3 signs of a fixed mindset.", "unpack"],
      ["3 habits that rewire your thinking.", "unpack"],
    ],

    medium: [
      ["Is confidence built or born? Pick a side and argue it.", "debate"],
      ["Why do people self-sabotage hardest when they're closest to what they want?", "eli5"],
      ["Growth mindset is a concept most people understand but almost nobody practises.", "debate"],
      ["3 mindset shifts that genuinely changed how you operate.", "unpack"],
      ["Change my mind: therapy isn't for everyone and that's fine.", "changemymind"],
      ["Why do people with the most self-awareness sometimes make the worst decisions?", "eli5"],
      ["The difference between confidence and arrogance.", "eli5"],
      ["Change my mind: positive thinking is more harmful than helpful.", "changemymind"],
      ["Why do people know what they should do but consistently don't do it?", "eli5"],
      ["3 ways the way you talk to yourself is silently running your life.", "unpack"],
      ["Identity vs behaviour. Which one changes first?", "debate"],
      ["What does it actually mean to do the work on yourself?", "eli5"],
      ["Change my mind: resilience is taught not born.", "changemymind"],
      ["Why do people mistake being busy for being productive?", "eli5"],
      ["The problem with toxic positivity dressed up as mindset coaching.", "hottake"],
      ["The difference between accountability and self-criticism.", "eli5"],
      ["3 things people think are mindset problems that are actually environment problems.", "unpack"],
      ["Change my mind: you can think your way into a new set of actions.", "changemymind"],
      ["Why does doing hard things make easier things more manageable?", "eli5"],
      ["The link between physical discomfort and mental toughness. Is it real?", "debate"],
      ["Why does identity feel like the hardest thing to change?", "eli5"],
      ["Change my mind: most people's comfort zones are tiny and they don't know it.", "changemymind"],
      ["The difference between growth and just being busy with self-improvement.", "eli5"],
      ["3 mindset traps highly ambitious people fall into.", "unpack"],
    
      ["Therapy culture has made some people more fragile not less. Argue for or against.", "debate"],
      ["Be yourself is lazy advice. Most people's authentic self needs work. Go.", "hottake"],
      ["Intelligent people stay stuck longer than average people. Why?", "eli5"],
      ["Change my mind: comfort is the enemy disguised as self-care.", "changemymind"],
      ["Most people aren't held back by circumstances — they're held back by identity.", "hottake"],
      ["The self-improvement industry is selling you a problem so it can sell you the solution.", "hottake"],
      ["Change my mind: most people saying they're working on themselves are just procrastinating living.", "changemymind"],
      ["Radical responsibility is either the most freeing or most dangerous mindset.", "debate"],
      ["Why do the most self-aware people sometimes have the least self-control?", "eli5"],
      ["Ego is not the enemy — a lack of ego regulation is. Argue it.", "debate"],
      ["Change my mind: most self-help books give the feeling of progress without actual change.", "changemymind"],
      ["Why does identity change feel so threatening even when the current identity isn't working?", "eli5"],
      ["The thing nobody tells you about becoming a better version of yourself.", "hottake"],
      ["Mindset culture has created a generation who blame themselves for systemic failures.", "debate"],
      ["Change my mind: the inner child framework does more harm than good.", "changemymind"],
      ["Why do people with the best intentions for change end up exactly where they started?", "eli5"],
      ["Discipline without direction is just suffering with good PR.", "hottake"],
      ["The most dangerous belief a person can have about themselves.", "eli5"],
      ["Change my mind: most personalities are just unexamined trauma responses.", "changemymind"],
      ["Why do people stay loyal to a version of themselves that's clearly not working?", "eli5"],
      ["The shadow side of self-improvement — what it costs and who it leaves behind.", "debate"],
      ["Change my mind: most people need less self-reflection not more.", "changemymind"],
      ["Why does the desire to change often coexist with refusal to actually change?", "eli5"],
      ["The mindset industry is the only one where the customer failing is good for business.", "hottake"],
    
    ],
  },
  hottakes: {
    short: [
      ["Hustle culture.", "debate"],
      ["Work-life balance.", "debate"],
      ["Cancel culture.", "debate"],
      ["Remote work.", "debate"],
      ["Side hustles.", "debate"],
      ["Tipping culture.", "debate"],
      ["Dating apps.", "debate"],
      ["Therapy speak.", "debate"],
      ["Gen Z.", "debate"],
      ["Millennials.", "debate"],
      ["Social media detox.", "debate"],
      ["Morning routines.", "debate"],
      ["Quiet quitting.", "debate"],
      ["Authenticity online.", "hottake"],
      ["Unpopular opinion.", "hottake"],
      ["Overrated.", "hottake"],
      ["Underrated.", "hottake"],
      ["Influencer culture.", "hottake"],
      ["Red flags.", "hottake"],
      ["Self-help industry.", "hottake"],
      ["Productivity culture.", "hottake"],
      ["Networking.", "hottake"],
      ["LinkedIn culture.", "hottake"],
      ["Vulnerability online.", "hottake"],
      ["The algorithm.", "hottake"],
      ["Change my mind: hustle culture gets too much hate.", "changemymind"],
      ["Change my mind: social media has been a net positive.", "changemymind"],
      ["Change my mind: cancel culture serves a purpose.", "changemymind"],
      ["Change my mind: being average is a valid life choice.", "changemymind"],
      ["Change my mind: ambition is overrated.", "changemymind"],
      ["Change my mind: boundaries are just avoidance rebranded.", "changemymind"],
      ["Change my mind: most people's opinions aren't actually theirs.", "changemymind"],
      ["That time I was completely wrong.", "story"],
      ["Opinion that cost me.", "story"],
      ["View I changed.", "story"],
      ["3 things that are overrated right now.", "unpack"],
      ["3 things that are underrated.", "unpack"],
      ["3 opinions that will get you unfollowed.", "unpack"],
      ["3 lies society tells you.", "unpack"],
    ],

    medium: [
      ["Work-life balance isn't real for people who want to build something. Unpack it.", "debate"],
      ["Most online advice makes people feel productive while keeping them stuck.", "hottake"],
      ["Follow your passion is bad advice most of the time. Argue it.", "debate"],
      ["3 things people say are important that genuinely aren't.", "unpack"],
      ["Change my mind: hustle culture gets too much hate.", "changemymind"],
      ["The self-help industry has created a generation always in preparation mode.", "hottake"],
      ["Change my mind: most boundaries are just avoidance with a better name.", "changemymind"],
      ["Why do people give advice based on luck and call it strategy?", "eli5"],
      ["3 things considered success that are actually traps.", "unpack"],
      ["The influencer economy is built on manufacturing insecurity. Argue it.", "debate"],
      ["Change my mind: being average is an underrated life choice.", "changemymind"],
      ["Most people are addicted to being busy because stillness terrifies them.", "hottake"],
      ["The productivity obsession is making people less creative and more anxious.", "debate"],
      ["Change my mind: most people don't want to change their life — they want validation.", "changemymind"],
      ["Why is contrarianism so popular even when it's wrong?", "eli5"],
      ["The rise of authentic content is just a new form of performance.", "hottake"],
      ["3 commonly held beliefs that collapse under five seconds of scrutiny.", "unpack"],
      ["Change my mind: most opinions are just vibes with no foundation.", "changemymind"],
      ["Why do people confuse confidence with competence so often?", "eli5"],
      ["The happiness industry is making people miserable. Argue it.", "debate"],
      ["Most dangerous advice dominating self-improvement culture right now.", "hottake"],
      ["Change my mind: most podcasts are just validation with better audio quality.", "changemymind"],
      ["Why do people cling to beliefs even when evidence clearly contradicts them?", "eli5"],
      ["3 popular life philosophies that sound deep but don't hold up under scrutiny.", "unpack"],
    
      ["Authenticity is a performance. Everyone's doing it. Argue it.", "hottake"],
      ["Most people don't want to change. They want to feel like they're changing.", "hottake"],
      ["Networking is mostly a waste of time unless you're already someone worth knowing.", "debate"],
      ["Change my mind: being average is a completely valid life choice.", "changemymind"],
      ["The self-improvement industry sells you a problem so it can sell you the solution.", "hottake"],
      ["Cancel culture is just mob justice with better branding. Argue it.", "debate"],
      ["Change my mind: democracy is the worst system of government except for all the others.", "changemymind"],
      ["Most moral frameworks are just social conformity dressed up as ethics.", "hottake"],
      ["The attention economy is a civilisational threat nobody's treating seriously enough.", "hottake"],
      ["Change my mind: free speech absolutism does more harm than good.", "changemymind"],
      ["Why do people with the strongest opinions have done the least research?", "eli5"],
      ["Modern media has made nuance commercially unviable. Make the case.", "hottake"],
      ["Change my mind: most activism today is about identity not impact.", "changemymind"],
      ["The pursuit of happiness is one of the most self-destructive goals.", "debate"],
      ["Why do radical ideas almost always get softened into uselessness?", "eli5"],
      ["Change my mind: most people's values aren't actually their own.", "changemymind"],
      ["Meritocracy is a story that benefits the people already at the top.", "hottake"],
      ["The algorithm is replacing individual taste with collective mediocrity.", "hottake"],
      ["Change my mind: outrage is the most profitable emotion online for a reason.", "changemymind"],
      ["Why do smart people hold obviously stupid beliefs?", "eli5"],
      ["Most contrarians are just conformists to a different group. Argue it.", "debate"],
      ["Change my mind: most people's sense of humour is just cruelty with better timing.", "changemymind"],
      ["Things people are most certain about are usually what they've examined least.", "hottake"],
      ["Why does nuance always lose to certainty in public discourse?", "eli5"],
    
    ],
  },
  career: {
    short: [
      ["Dream job.", "debate"],
      ["Job hopping.", "debate"],
      ["Office politics.", "debate"],
      ["9 to 5.", "debate"],
      ["Remote vs office.", "debate"],
      ["Networking.", "debate"],
      ["LinkedIn.", "debate"],
      ["Career pivots.", "debate"],
      ["Redundancy.", "story"],
      ["First job.", "story"],
      ["Best boss.", "story"],
      ["Worst boss.", "story"],
      ["Promotion moment.", "story"],
      ["Career regret.", "story"],
      ["Burnout.", "story"],
      ["The Sunday fear.", "story"],
      ["Career pivot.", "story"],
      ["Imposter syndrome moment.", "story"],
      ["Quiet quitting.", "story"],
      ["Work ethic.", "eli5"],
      ["Personal brand.", "eli5"],
      ["Soft skills.", "eli5"],
      ["Imposter syndrome.", "eli5"],
      ["Career ladder.", "eli5"],
      ["The Sunday fear.", "eli5"],
      ["Burnout signs.", "eli5"],
      ["Performance review.", "eli5"],
      ["Salary negotiation.", "eli5"],
      ["Side projects.", "eli5"],
      ["Corporate ladder.", "hottake"],
      ["Industry secrets.", "hottake"],
      ["Career advice.", "hottake"],
      ["Most useless meetings.", "hottake"],
      ["Change my mind: job hopping is smarter than loyalty.", "changemymind"],
      ["Change my mind: a good manager matters more than salary.", "changemymind"],
      ["Change my mind: working hard is still the most reliable strategy.", "changemymind"],
      ["Change my mind: most middle managers add no value.", "changemymind"],
      ["Change my mind: company culture matters more than pay.", "changemymind"],
      ["3 unwritten career rules.", "unpack"],
      ["3 signs you've outgrown your job.", "unpack"],
      ["3 things that hurt your career silently.", "unpack"],
    ],

    medium: [
      ["Why does talent get you in the room but not keep you there?", "eli5"],
      ["Is the traditional career ladder dead — or just broken for certain people?", "debate"],
      ["What makes someone genuinely irreplaceable at work?", "eli5"],
      ["3 unwritten career rules nobody tells you until it's too late.", "unpack"],
      ["Change my mind: job hopping is smarter than loyalty right now.", "changemymind"],
      ["Confidence vs competence at work — which one comes first?", "debate"],
      ["Why do smart people get overlooked for promotion?", "eli5"],
      ["Change my mind: soft skills matter more than technical skills in most jobs.", "changemymind"],
      ["The real reason most people don't negotiate their salary.", "eli5"],
      ["The difference between being good at your job and being seen as good at your job.", "eli5"],
      ["3 ways people accidentally make themselves dispensable at work.", "unpack"],
      ["Change my mind: company culture matters more than compensation.", "changemymind"],
      ["Why do the most capable people often have the worst job satisfaction?", "eli5"],
      ["Professional network vs just being really good at what you do — which matters more?", "debate"],
      ["The hidden cost of staying in the wrong job too long.", "eli5"],
      ["Change my mind: remote work has made people worse at collaboration.", "changemymind"],
      ["Why do people confuse being busy at work with being effective?", "eli5"],
      ["3 things people think make them look professional that actually don't.", "unpack"],
      ["The career conversation most people never have with their manager.", "eli5"],
      ["Change my mind: ambition is a career asset not everyone can afford.", "changemymind"],
      ["Why do people get promoted for the wrong reasons?", "eli5"],
      ["Change my mind: most people stay in jobs they hate because of identity not money.", "changemymind"],
      ["The thing that actually differentiates people at the same level of competence.", "eli5"],
      ["3 signs you've outgrown your current role.", "unpack"],
    
      ["Playing it safe in your career is the riskiest thing you can actually do.", "hottake"],
      ["Most people optimise for salary when they should optimise for learning.", "debate"],
      ["Your employer does not care about your career. Once you accept that everything changes.", "hottake"],
      ["Change my mind: a degree is still worth it in 2025.", "changemymind"],
      ["The biggest career mistakes people make aren't visible until 5 years later.", "unpack"],
      ["The corporate world rewards conformity over competence. Argue it.", "hottake"],
      ["Change my mind: the 9-5 is an outdated model overdue for disruption.", "changemymind"],
      ["Why do the most ambitious people often end up the most unfulfilled?", "eli5"],
      ["Most career advice is written by people who got lucky and called it strategy.", "hottake"],
      ["Change my mind: your career is more defined by relationships than skills.", "changemymind"],
      ["The professional world punishes people who are honest about what they don't know.", "debate"],
      ["Why is loyalty in the workplace a liability more often than an asset?", "eli5"],
      ["Change my mind: the best career move most people could make is starting something on the side.", "changemymind"],
      ["The gap between what a job posting says and what the job actually is.", "eli5"],
      ["Most people outsource their career decisions to other people's expectations.", "hottake"],
      ["Change my mind: specialisation is a trap in a world that changes this fast.", "changemymind"],
      ["Why do people great at execution rarely become great leaders?", "eli5"],
      ["The workplace is the last socially acceptable place for power to go unchallenged.", "debate"],
      ["Change my mind: most middle managers add no value.", "changemymind"],
      ["Why does the hardest working person in the room rarely end up at the top?", "eli5"],
      ["Most performance reviews are rituals of managed disappointment.", "hottake"],
      ["Change my mind: remote work has been the biggest leveller in workplace history.", "changemymind"],
      ["Career advice that works for some people rarely works for others and nobody's honest about it.", "debate"],
      ["Why do companies say they value innovation but punish the people who try it?", "eli5"],
    
    ],
  },
  relationships: {
    short: [
      ["First love.", "story"],
      ["Friendship breakup.", "story"],
      ["Situationship.", "story"],
      ["Heartbreak.", "story"],
      ["The one that got away.", "story"],
      ["Relationship red flag I ignored.", "story"],
      ["Best friendship.", "story"],
      ["Growing apart.", "story"],
      ["Toxic relationship.", "story"],
      ["Unexpected connection.", "story"],
      ["Love bombing.", "story"],
      ["Long distance.", "debate"],
      ["Exes as friends.", "debate"],
      ["Love languages.", "debate"],
      ["Attachment styles.", "debate"],
      ["Jealousy.", "debate"],
      ["Commitment.", "debate"],
      ["Marriage.", "debate"],
      ["Open relationships.", "debate"],
      ["Ghosting.", "debate"],
      ["Trust.", "eli5"],
      ["Boundaries.", "eli5"],
      ["Communication.", "eli5"],
      ["Vulnerability.", "eli5"],
      ["Codependency.", "eli5"],
      ["Emotional availability.", "eli5"],
      ["Compatibility.", "eli5"],
      ["Chemistry.", "eli5"],
      ["Love languages.", "eli5"],
      ["Loneliness.", "eli5"],
      ["Situationships.", "hottake"],
      ["Dating apps.", "hottake"],
      ["The talking stage.", "hottake"],
      ["Change my mind: you can be friends with an ex.", "changemymind"],
      ["Change my mind: people don't change.", "changemymind"],
      ["Change my mind: you have to love yourself first.", "changemymind"],
      ["Change my mind: jealousy is always a red flag.", "changemymind"],
      ["Change my mind: most relationship problems are communication problems.", "changemymind"],
      ["3 green flags nobody talks about.", "unpack"],
      ["3 red flags people ignore.", "unpack"],
      ["3 things that silently destroy relationships.", "unpack"],
      ["3 signs of emotional unavailability.", "unpack"],
    ],

    medium: [
      ["Why do people keep staying in situations that are clearly wrong for them?", "eli5"],
      ["Is radical honesty in relationships always the right move?", "debate"],
      ["Change my mind: you can't have a healthy relationship without individual therapy.", "changemymind"],
      ["3 things people confuse with love that actually aren't.", "unpack"],
      ["The difference between someone who communicates and someone who just talks.", "eli5"],
      ["Why do people choose familiar pain over unfamiliar growth in relationships?", "eli5"],
      ["Change my mind: long distance relationships rarely work for a reason.", "changemymind"],
      ["Reciprocity in friendships — when does it stop being worth it?", "debate"],
      ["3 things that are relationship dealbreakers that people pretend aren't.", "unpack"],
      ["Why do people great at giving advice struggle with their own relationships?", "eli5"],
      ["Change my mind: friendship breakups are more painful than romantic ones.", "changemymind"],
      ["The actual difference between being alone and being lonely.", "eli5"],
      ["The relationship dynamic most people accept that they really shouldn't.", "hottake"],
      ["Change my mind: jealousy in relationships is always a red flag.", "changemymind"],
      ["Why does vulnerability feel so dangerous even in safe relationships?", "eli5"],
      ["3 ways people accidentally teach others how to treat them badly.", "unpack"],
      ["Change my mind: people's attachment styles are just excuses.", "changemymind"],
      ["What respect actually looks like in a relationship day to day.", "eli5"],
      ["The pattern most people repeat in relationships until they examine it.", "eli5"],
      ["Change my mind: you can love someone and still be completely wrong for each other.", "changemymind"],
      ["Why do people stay friends with people they've outgrown?", "eli5"],
      ["Change my mind: the talking stage is where most relationships actually fail.", "changemymind"],
      ["The thing nobody tells you about what maintaining a long-term relationship requires.", "eli5"],
      ["3 things people mistake for intimacy that aren't.", "unpack"],
    
      ["Most people are genuinely terrible at communication and have no idea. Go.", "hottake"],
      ["Loneliness is an epidemic — but more connection isn't the answer.", "debate"],
      ["People confuse being liked with being respected constantly. Why?", "eli5"],
      ["Change my mind: situationships exist because one person always wants more.", "changemymind"],
      ["The idea of a soulmate is one of the most quietly damaging things people believe.", "hottake"],
      ["Most people are in relationships to feel less afraid not to genuinely connect.", "hottake"],
      ["Change my mind: the nuclear family model is broken and overdue for replacement.", "changemymind"],
      ["Why do people mistake chemistry for compatibility?", "eli5"],
      ["The way people talk about their exes tells you everything about them.", "debate"],
      ["Change my mind: most people aren't looking for a partner — they're looking for a mirror.", "changemymind"],
      ["Emotional unavailability is the defining relationship problem of our generation.", "hottake"],
      ["Why do people repeat the same relationship mistakes with different people?", "eli5"],
      ["Change my mind: codependency is love that hasn't learned its limits yet.", "changemymind"],
      ["The friendship recession is real — and men are losing the most.", "debate"],
      ["Most relationship advice is written for people who've already done the work.", "eli5"],
      ["Change my mind: commitment phobia is always about fear never about freedom.", "changemymind"],
      ["People perform intimacy more than they practice it. Unpack it.", "hottake"],
      ["Why is accountability in relationships treated as an attack?", "eli5"],
      ["Change my mind: the idea of the one is statistically and emotionally irresponsible.", "changemymind"],
      ["Childhood attachment and adult relationship patterns. Is it destiny?", "debate"],
      ["Most people use relationships as a substitute for doing the actual work on themselves.", "hottake"],
      ["Change my mind: modern dating has made people worse at commitment not better.", "changemymind"],
      ["Why do people who've been hurt the most sometimes make the worst partners?", "debate"],
      ["The parasocial economy is making it easier to perform connection than to have it.", "hottake"],
    
    ],
  },
  content: {
    short: [
      ["First viral moment.", "story"],
      ["Worst performing post.", "story"],
      ["Best performing post.", "story"],
      ["Creator burnout.", "story"],
      ["Comment that stung.", "story"],
      ["Unexpected win.", "story"],
      ["Content mistake.", "story"],
      ["Why I started.", "story"],
      ["Almost quit.", "story"],
      ["Collab gone wrong.", "story"],
      ["Going viral.", "debate"],
      ["Posting every day.", "debate"],
      ["Niche down.", "debate"],
      ["Long form vs short form.", "debate"],
      ["Collabs.", "debate"],
      ["Monetising early.", "debate"],
      ["Faceless content.", "debate"],
      ["Build in public.", "debate"],
      ["Personal life on camera.", "debate"],
      ["Algorithm.", "hottake"],
      ["Authenticity online.", "hottake"],
      ["Follower count.", "hottake"],
      ["Views vs value.", "hottake"],
      ["Content guilt.", "hottake"],
      ["Creator economy.", "hottake"],
      ["Platform dependency.", "eli5"],
      ["Content strategy.", "eli5"],
      ["The hook.", "eli5"],
      ["Storytelling.", "eli5"],
      ["Audience vs community.", "eli5"],
      ["Retention.", "eli5"],
      ["Personal brand.", "eli5"],
      ["Change my mind: going viral is the worst metric.", "changemymind"],
      ["Change my mind: consistency beats quality.", "changemymind"],
      ["Change my mind: most creators should niche down less.", "changemymind"],
      ["Change my mind: the best time to monetise is earlier than you think.", "changemymind"],
      ["3 things killing your growth.", "unpack"],
      ["3 signs a creator has sold out.", "unpack"],
      ["3 underused content formats.", "unpack"],
    ],

    medium: [
      ["Why do most creators plateau after their first bit of traction?", "eli5"],
      ["Is posting consistently more important than posting quality? Argue it.", "debate"],
      ["3 things killing creators' growth that they don't realise.", "unpack"],
      ["Change my mind: going viral is the worst metric to optimise for.", "changemymind"],
      ["The gap between 1k and 100k followers — what is it really?", "eli5"],
      ["Why do talented creators get overlooked?", "eli5"],
      ["Change my mind: the best time to monetise is earlier than most people think.", "changemymind"],
      ["The actual difference between a hook and a clickbait title.", "eli5"],
      ["3 content formats that are underused and why they work.", "unpack"],
      ["Why is it so hard to be consistent when nobody is watching?", "eli5"],
      ["Change my mind: your personal life should stay off your content.", "changemymind"],
      ["What building a community actually requires that most creators skip.", "eli5"],
      ["Vulnerability and audience connection — where's the line?", "debate"],
      ["3 signs a creator has prioritised growth over quality.", "unpack"],
      ["Change my mind: niching down is overrated.", "changemymind"],
      ["Why do creators burn out even when they love what they do?", "eli5"],
      ["The difference between a creator's audience and their community.", "eli5"],
      ["Change my mind: collabs are the fastest legitimate way to grow.", "changemymind"],
      ["Why does raw unpolished content often outperform highly produced content?", "eli5"],
      ["3 things every creator needs to figure out before worrying about growth.", "unpack"],
      ["The creator who grows slowest is often the one who lasts longest. Make the case.", "debate"],
      ["Change my mind: most creators should be charging more for their products.", "changemymind"],
      ["Why do creators struggle to talk about what they actually do without sounding like they're selling?", "eli5"],
      ["3 metrics that feel important but are actually vanity metrics.", "unpack"],
    
      ["Authenticity on social media is mostly a performance. Unpack it.", "hottake"],
      ["The algorithm doesn't reward good content. It rewards content that keeps people addicted.", "hottake"],
      ["Most creators are building an audience but not a business. Why is that dangerous?", "debate"],
      ["Change my mind: personal brand is just ego with a strategy.", "changemymind"],
      ["The creator economy has a dark side nobody's talking about.", "hottake"],
      ["Content creation has become a mental health crisis dressed up as entrepreneurship.", "debate"],
      ["Change my mind: most creators would be better off with fewer followers and more customers.", "changemymind"],
      ["The attention economy has turned self-expression into a performance metric.", "hottake"],
      ["Why do creators with the most integrity often have the smallest audiences?", "eli5"],
      ["Change my mind: platform dependency is the biggest existential risk for modern creators.", "changemymind"],
      ["The pressure to be relatable is making creators less interesting.", "hottake"],
      ["Why does the creator economy reward quantity over depth?", "eli5"],
      ["Change my mind: the golden age of organic reach is permanently over.", "changemymind"],
      ["Most build in public content is a performance of vulnerability not actual vulnerability.", "hottake"],
      ["The line between content strategy and manipulation.", "debate"],
      ["Change my mind: most creators are one algorithm change away from zero.", "changemymind"],
      ["Why do creators who blow up often produce worse content after growth?", "eli5"],
      ["The parasocial relationship problem — creators creating dependency not community.", "hottake"],
      ["Change my mind: long-form content is making a comeback for good reasons.", "changemymind"],
      ["Most creator advice is survivorship bias dressed up as strategy.", "hottake"],
      ["The creator who treats their audience like customers will always beat the one who treats them like fans.", "debate"],
      ["Change my mind: most creators are playing a game that only platforms win.", "changemymind"],
      ["Why do the most technically skilled creators often have the least engaged audiences?", "eli5"],
      ["The monetisation conversation most creators avoid until it's too late.", "eli5"],
    
    ],
  },
  tech: {
    short: [
      ["Airplane mode.", "story"],
      ["Tech addiction moment.", "story"],
      ["Best app.", "story"],
      ["Tech that changed my life.", "story"],
      ["Screen time reality.", "story"],
      ["Digital detox attempt.", "story"],
      ["AI surprise.", "story"],
      ["Online argument.", "story"],
      ["Privacy concern.", "story"],
      ["Social media detox.", "story"],
      ["Screen time.", "debate"],
      ["AI.", "debate"],
      ["Social media.", "debate"],
      ["Smartphones.", "debate"],
      ["Crypto.", "debate"],
      ["Remote work tech.", "debate"],
      ["Children and tech.", "debate"],
      ["Digital detox.", "debate"],
      ["Open source.", "debate"],
      ["The metaverse.", "debate"],
      ["Wearable tech.", "debate"],
      ["Privacy.", "eli5"],
      ["Algorithm.", "eli5"],
      ["Data collection.", "eli5"],
      ["Digital identity.", "eli5"],
      ["Attention economy.", "eli5"],
      ["Misinformation online.", "eli5"],
      ["Tech addiction.", "eli5"],
      ["Online vs offline.", "eli5"],
      ["AI.", "eli5"],
      ["Notifications.", "hottake"],
      ["Big tech.", "hottake"],
      ["Tech bros.", "hottake"],
      ["The algorithm.", "hottake"],
      ["Doomscrolling.", "hottake"],
      ["Change my mind: smartphones made us less capable.", "changemymind"],
      ["Change my mind: the metaverse will matter eventually.", "changemymind"],
      ["Change my mind: AI safety concerns are overblown.", "changemymind"],
      ["Change my mind: most people would be better with a dumbphone.", "changemymind"],
      ["3 ways tech is quietly changing us.", "unpack"],
      ["3 apps worth deleting.", "unpack"],
      ["3 tech habits to break.", "unpack"],
    ],

    medium: [
      ["Is social media making us smarter or dumber? Pick a side.", "debate"],
      ["Will AI take jobs or create them? Where do you actually stand?", "debate"],
      ["Most people use technology without understanding it and that's becoming a problem.", "hottake"],
      ["3 ways tech is quietly changing human behaviour we don't talk about enough.", "unpack"],
      ["Change my mind: screen time limits are actually a privilege.", "changemymind"],
      ["The attention economy — explain it to someone who doesn't know the term.", "eli5"],
      ["Change my mind: open source software is one of the most important things on the internet.", "changemymind"],
      ["Why do the biggest tech companies keep getting bigger despite regulation?", "eli5"],
      ["3 tech habits silently eroding your ability to focus.", "unpack"],
      ["The relationship between tech and democracy — is it healthy?", "debate"],
      ["Change my mind: children should not have smartphones before 16.", "changemymind"],
      ["Why are people so willing to trade privacy for convenience?", "eli5"],
      ["The difference between tech that serves people and tech that exploits them.", "eli5"],
      ["Change my mind: the pace of technological change is too fast for society to absorb.", "changemymind"],
      ["3 industries AI will genuinely disrupt in the next 5 years.", "unpack"],
      ["Why do people adopt technology before they understand its risks?", "eli5"],
      ["Change my mind: the creator economy is the most important shift the internet has enabled.", "changemymind"],
      ["What digital wellbeing actually looks like in practice.", "eli5"],
      ["The gap between what tech companies promise and what they deliver.", "debate"],
      ["Change my mind: regulation will always lag behind technology.", "changemymind"],
      ["Why does big tech keep getting a pass that other industries don't?", "eli5"],
      ["Change my mind: most AI tools are solutions looking for problems.", "changemymind"],
      ["The tech company doing the most damage right now. Make your case.", "debate"],
      ["3 ways the smartphone has permanently changed how humans think.", "unpack"],
    
      ["Big tech companies are more powerful than most governments. Unpack it.", "hottake"],
      ["The attention economy is the most dangerous infrastructure ever built.", "debate"],
      ["Privacy is already gone and most people's response is a shrug. Why?", "eli5"],
      ["Change my mind: AI will make creativity less valuable not more.", "changemymind"],
      ["We built tools to save us time and now they own our time.", "hottake"],
      ["The internet has made misinformation structurally unbeatable. Argue it.", "debate"],
      ["Change my mind: social media companies are morally responsible for the mental health crisis.", "changemymind"],
      ["Why is it so hard to regulate technology when everyone agrees it needs regulating?", "eli5"],
      ["The tech industry's diversity problem isn't just ethical — it's a product problem.", "debate"],
      ["Change my mind: most AI safety concerns are overblown.", "changemymind"],
      ["Algorithmic recommendation systems are radicalising people at scale and nobody's accountable.", "hottake"],
      ["The surveillance capitalism model is incompatible with democracy. Argue it.", "debate"],
      ["Change my mind: cryptocurrency was always a solution looking for a problem.", "changemymind"],
      ["Why do people trust tech companies with their data more than governments?", "eli5"],
      ["The singularity isn't coming — but something almost as disruptive is.", "debate"],
      ["Change my mind: social media has done more damage to teenage girls than any other single force.", "changemymind"],
      ["Tech optimism is wilful blindness to who gets left behind.", "hottake"],
      ["Why does the tech industry consistently produce tools that benefit the already powerful?", "eli5"],
      ["Change my mind: the smartphone is the most consequential invention of the last 50 years.", "changemymind"],
      ["AI will create a two-tier society faster than any regulation can respond.", "hottake"],
      ["The open internet is dying and being replaced by walled gardens. Make the case.", "debate"],
      ["Change my mind: most people would be better off with a dumbphone.", "changemymind"],
      ["Why does the tech industry consistently attract people who want to change the world but end up optimising ad revenue?", "debate"],
      ["The next major tech monopoly is being built right now and nobody's paying attention. What is it?", "hottake"],
    
    ],
  },
  entrepreneurship: {
    short: [
      ["First client.", "story"],
      ["Biggest failure.", "story"],
      ["Almost quit.", "story"],
      ["Unexpected win.", "story"],
      ["First hire.", "story"],
      ["Imposter moment.", "story"],
      ["Cash flow crisis.", "story"],
      ["Starting out.", "story"],
      ["Pivot moment.", "story"],
      ["Burnout.", "story"],
      ["Charging more.", "story"],
      ["Funding.", "debate"],
      ["Solopreneur vs team.", "debate"],
      ["Passion business.", "debate"],
      ["Build in public.", "debate"],
      ["Side hustle to business.", "debate"],
      ["Niche.", "debate"],
      ["Business partner.", "debate"],
      ["Bootstrapped vs funded.", "debate"],
      ["Scaling.", "debate"],
      ["Cash flow.", "eli5"],
      ["Product-market fit.", "eli5"],
      ["Minimum viable product.", "eli5"],
      ["Sales.", "eli5"],
      ["Pricing.", "eli5"],
      ["Customer acquisition.", "eli5"],
      ["Churn.", "eli5"],
      ["Margins.", "eli5"],
      ["Knowing when to quit.", "eli5"],
      ["Competition.", "eli5"],
      ["Overnight success.", "hottake"],
      ["Startup culture.", "hottake"],
      ["Business coaches.", "hottake"],
      ["Hustle porn.", "hottake"],
      ["Change my mind: most people shouldn't start a business.", "changemymind"],
      ["Change my mind: passion is a bad reason to start a business.", "changemymind"],
      ["Change my mind: you don't need funding to build something real.", "changemymind"],
      ["Change my mind: building in public is more performance than strategy.", "changemymind"],
      ["3 things that kill businesses.", "unpack"],
      ["3 signs your business isn't viable.", "unpack"],
      ["3 things nobody tells you about entrepreneurship.", "unpack"],
      ["3 mistakes first-time founders make.", "unpack"],
    ],

    medium: [
      ["Why do most businesses actually fail in the first two years? Get specific.", "eli5"],
      ["Is passion a valid reason to start a business or is it a trap?", "debate"],
      ["What separates people who build things from people who just have ideas?", "eli5"],
      ["3 things entrepreneurs pretend don't matter that actually kill businesses.", "unpack"],
      ["Change my mind: you need funding to build something real.", "changemymind"],
      ["The difference between scaling a business and just growing one.", "eli5"],
      ["Change my mind: most business advice is too general to be useful.", "changemymind"],
      ["Why do solo founders underestimate how lonely building is?", "eli5"],
      ["3 customer acquisition mistakes most new businesses make.", "unpack"],
      ["Price vs perceived value — why people get it backwards.", "eli5"],
      ["Change my mind: finding a co-founder is more important than finding investment.", "changemymind"],
      ["Why do smart founders solve problems nobody actually has?", "eli5"],
      ["Building an audience vs building a customer base — what most people get wrong.", "eli5"],
      ["Change my mind: the best businesses solve boring problems.", "changemymind"],
      ["3 things that look like traction but aren't.", "unpack"],
      ["Why is it so hard to charge what your product or service is actually worth?", "eli5"],
      ["Change my mind: most entrepreneurs are better at starting than building.", "changemymind"],
      ["Operator vs visionary — which do you actually need to be?", "debate"],
      ["Why do so many entrepreneurs avoid sales even though it's the most important skill?", "eli5"],
      ["Change my mind: product-market fit is overused and often misunderstood.", "changemymind"],
      ["The thing most entrepreneurs learn too late about their own business.", "eli5"],
      ["Change my mind: most businesses fail because of founder psychology not market conditions.", "changemymind"],
      ["Why do entrepreneurs consistently overestimate revenue and underestimate costs?", "eli5"],
      ["3 things that look like a business but are actually just a job with more stress.", "unpack"],
    
      ["Entrepreneurship is being romanticised in a way that's actively hurting people. Go.", "hottake"],
      ["Most people who call themselves entrepreneurs are just self-employed with a logo.", "hottake"],
      ["The real reason people never start isn't time or money. It's fear with a good excuse.", "debate"],
      ["Change my mind: building in public is more performance than strategy.", "changemymind"],
      ["The startup culture obsession with disruption is mostly cosplay.", "hottake"],
      ["Venture capital has distorted what a successful business looks like. Argue it.", "debate"],
      ["Change my mind: most successful businesses aren't built on innovation — they're built on execution.", "changemymind"],
      ["Why do so many founders optimise for investor approval over customer value?", "eli5"],
      ["The hustle culture startup myth is keeping people from building sustainable things.", "hottake"],
      ["Change my mind: failure is not as romantically instructive as startup culture claims.", "changemymind"],
      ["Most entrepreneurship advice is survivorship bias at scale.", "hottake"],
      ["Why do businesses that solve the biggest problems often struggle the most commercially?", "eli5"],
      ["Change my mind: most unicorn startups are economically destructive.", "changemymind"],
      ["Ambition and ethics in business — where does it break down?", "debate"],
      ["Why does entrepreneurship culture disproportionately reward risk tolerance that comes from privilege?", "eli5"],
      ["Change my mind: the gig economy is exploitation dressed up as entrepreneurship.", "changemymind"],
      ["Most business coaches have never built a real business. And it shows.", "hottake"],
      ["Why do entrepreneurs consistently underestimate how long everything takes?", "eli5"],
      ["Change my mind: most startups would be better off as small businesses.", "changemymind"],
      ["The thing nobody tells you about what success in business actually costs.", "eli5"],
      ["Founder mental health is the biggest unaddressed risk factor in startups. Make the case.", "debate"],
      ["Change my mind: most entrepreneurs would have been happier staying employed.", "changemymind"],
      ["Why does startup culture celebrate suffering as a badge of honour?", "eli5"],
      ["The relationship between ego and entrepreneurship — when does it help and when does it destroy?", "debate"],
    
    ],
  },
  dating: {
    short: [
      ["First date.", "story"],
      ["Worst date.", "story"],
      ["Best date.", "story"],
      ["The ick.", "story"],
      ["First heartbreak.", "story"],
      ["Situationship.", "story"],
      ["Dating app story.", "story"],
      ["Red flag I ignored.", "story"],
      ["Love at first sight.", "story"],
      ["Ghosting experience.", "story"],
      ["Talking stage.", "story"],
      ["Dating apps.", "debate"],
      ["Long distance.", "debate"],
      ["Exes.", "debate"],
      ["Standards.", "debate"],
      ["Moving too fast.", "debate"],
      ["Marriage.", "debate"],
      ["Meeting online.", "debate"],
      ["Playing it cool.", "debate"],
      ["Settling.", "debate"],
      ["The one.", "debate"],
      ["Chemistry.", "eli5"],
      ["Compatibility.", "eli5"],
      ["Ghosting.", "eli5"],
      ["Attachment styles.", "eli5"],
      ["Love bombing.", "eli5"],
      ["Emotional availability.", "eli5"],
      ["Red flags.", "eli5"],
      ["Green flags.", "eli5"],
      ["Boundaries in dating.", "eli5"],
      ["Modern romance.", "hottake"],
      ["Dating market.", "hottake"],
      ["The ick.", "hottake"],
      ["Change my mind: dating apps are ruining romance.", "changemymind"],
      ["Change my mind: you know within the first date.", "changemymind"],
      ["Change my mind: you have to love yourself first.", "changemymind"],
      ["Change my mind: people don't fundamentally change.", "changemymind"],
      ["Change my mind: the talking stage is where most relationships fail.", "changemymind"],
      ["3 green flags people overlook.", "unpack"],
      ["3 things people mistake for love.", "unpack"],
      ["3 signs someone isn't emotionally available.", "unpack"],
      ["3 dating app mistakes.", "unpack"],
    ],

    medium: [
      ["Why do people keep choosing the wrong partners even when they know better?", "eli5"],
      ["Is modern dating actually broken or are people just less patient?", "debate"],
      ["What emotional availability actually looks like — the behaviour not the definition.", "eli5"],
      ["3 things people call standards that are actually just avoidance.", "unpack"],
      ["Change my mind: attachment styles are an excuse not to do the work.", "changemymind"],
      ["The difference between settling and being realistic.", "debate"],
      ["Change my mind: most people enter relationships to fix something in themselves.", "changemymind"],
      ["Why do people with the most relationship experience sometimes do it the worst?", "eli5"],
      ["3 things that are genuinely romantic that people overlook.", "unpack"],
      ["The role of timing in relationships — is it real or a cop-out?", "debate"],
      ["Change my mind: open relationships require more emotional maturity than most people have.", "changemymind"],
      ["Why do people ghost instead of just being honest?", "eli5"],
      ["The thing most people are actually looking for in a relationship that they can't name.", "eli5"],
      ["Change my mind: the talking stage is where most relationships fail.", "changemymind"],
      ["3 signs someone isn't as emotionally available as they say they are.", "unpack"],
      ["Why do people who've been hurt the most sometimes make the best partners?", "debate"],
      ["Change my mind: you should have a clear timeline for where a relationship is going.", "changemymind"],
      ["The relationship between self-esteem and who you choose to date.", "eli5"],
      ["Why do people stay in relationships they've outgrown?", "eli5"],
      ["Change my mind: sexual compatibility matters more than emotional compatibility.", "changemymind"],
      ["The thing that keeps long-term relationships interesting that people don't talk about.", "eli5"],
      ["Change my mind: most people's idea of a healthy relationship comes from fiction not reality.", "changemymind"],
      ["Why is it so hard to end a relationship you know is wrong?", "eli5"],
      ["3 relationship patterns that feel romantic but are actually dysfunctional.", "unpack"],
    
      ["Dating apps have made people objectively worse at forming real connections.", "hottake"],
      ["Most people date for validation not connection — and they don't even know it.", "hottake"],
      ["The idea of a soulmate is romantically appealing and practically harmful.", "debate"],
      ["Change my mind: you have to love yourself before you can love someone else.", "changemymind"],
      ["Modern dating has gamified attraction in a way that's rewiring how people relate.", "hottake"],
      ["The I'm not ready for a relationship excuse is almost always about one specific person.", "hottake"],
      ["Change my mind: most people would be better off with a relationship sabbatical.", "changemymind"],
      ["Why do people confuse intensity with intimacy?", "eli5"],
      ["The marriage rate declining isn't a crisis — it might be people finally being honest.", "debate"],
      ["Change my mind: most relationship problems are communication problems.", "changemymind"],
      ["Why do people perform vulnerability in dating without actually being vulnerable?", "eli5"],
      ["The dating market framing is making people transactional and destroying connection.", "hottake"],
      ["Change my mind: people who say they don't want labels want the benefits without the risk.", "changemymind"],
      ["Why do people's standards for partners rarely match their standards for themselves?", "eli5"],
      ["Romanticising toxicity in media has warped what people think love should feel like.", "debate"],
      ["Change my mind: most people aren't ready to be in a relationship — they just don't know it.", "changemymind"],
      ["The fantasy of being chosen is making people passive in their own love lives.", "hottake"],
      ["Why do people treat their romantic partners worse than their friends?", "eli5"],
      ["Change my mind: people fundamentally don't change — they just get better at hiding.", "changemymind"],
      ["The loneliness epidemic and the dating paradox — more options less connection.", "eli5"],
      ["Most people are looking for someone to complete them rather than complement them.", "hottake"],
      ["Change my mind: dating apps have created a generation of people who treat humans like products.", "changemymind"],
      ["Why do people who are perfectly good partners become incompatible over time?", "eli5"],
      ["The cultural script around what love should look like is actively making people lonely.", "debate"],
    
    ],
  },
  storytime: {
    short: [
      ["My biggest risk.", "story"],
      ["The phone call that changed everything.", "story"],
      ["Worst job.", "story"],
      ["That one teacher.", "story"],
      ["Embarrassing moment.", "story"],
      ["When I got it wrong.", "story"],
      ["The friend I lost.", "story"],
      ["Rock bottom.", "story"],
      ["First heartbreak.", "story"],
      ["The moment I grew up.", "story"],
      ["My biggest regret.", "story"],
      ["The lucky break.", "story"],
      ["Unexpected kindness.", "story"],
      ["Decision I almost didn't make.", "story"],
      ["Something I've never said out loud.", "story"],
      ["My worst year.", "story"],
      ["When I nearly quit.", "story"],
      ["The thing that scared me most.", "story"],
      ["Starting over.", "story"],
      ["The person who changed my life.", "story"],
      ["My proudest moment.", "story"],
      ["The conversation I needed.", "story"],
      ["When I realised I was wrong.", "story"],
      ["The version of me I left behind.", "story"],
      ["A moment of pure joy.", "story"],
      ["The time I surprised myself.", "story"],
      ["Advice I wish I'd taken sooner.", "story"],
      ["The relationship that changed me.", "story"],
      ["A moment of unexpected failure.", "story"],
      ["The day I stopped caring what people think.", "story"],
      ["My most embarrassing win.", "story"],
      ["The thing I had to give up.", "story"],
      ["Moment that restored my faith in people.", "story"],
      ["Time I had to be the bigger person.", "story"],
      ["The apology I needed to give.", "story"],
      ["When I finally listened to my gut.", "story"],
      ["The chapter I don't talk about.", "story"],
      ["A day I'll never forget.", "story"],
      ["The moment everything clicked.", "story"],
      ["When I realised I'd been living wrong.", "story"],
      ["The conversation that changed my life.", "story"],
      ["The decision that defined me.", "story"],
      ["My most valuable lesson.", "story"],
      ["The friendship I took for granted.", "story"],
      ["When I finally let go.", "story"],
    ],

    medium: [
      ["A time you had to start completely from scratch.", "story"],
      ["Most awkward conversation you've ever had to have.", "story"],
      ["A moment where you realised you'd been looking at something completely wrong.", "story"],
      ["A time you took a risk most people told you not to take.", "story"],
      ["The version of you from 5 years ago would be surprised by what?", "story"],
      ["A friendship that ended and what it taught you.", "story"],
      ["The moment you realised what you wanted to do — or had absolutely no idea.", "story"],
      ["A time someone believed in you before you believed in yourself.", "story"],
      ["A period of your life you'd describe as your lowest point.", "story"],
      ["The thing that happened that made you rethink everything.", "story"],
      ["A time you had to choose between two things you cared about equally.", "story"],
      ["A job or situation you stayed in too long and why.", "story"],
      ["The decision that took the longest to make and what finally pushed you.", "story"],
      ["A time you realised you'd become someone you didn't recognise.", "story"],
      ["A moment of unexpected kindness from a stranger.", "story"],
      ["The thing you almost didn't do that ended up defining you.", "story"],
      ["A conversation that changed the direction of your life.", "story"],
      ["The hardest thing you've ever had to say to someone.", "story"],
      ["A time you had to let go of something you weren't ready to let go of.", "story"],
      ["The moment your relationship with failure changed.", "story"],
      ["A time you were given responsibility you weren't sure you were ready for.", "story"],
      ["The thing you built or created that you're most proud of.", "story"],
      ["A moment when you realised you were becoming your parent — for better or worse.", "story"],
      ["The time you had to choose between being honest and being kind.", "story"],
    
      ["A moment where you genuinely didn't know if you'd make it through.", "story"],
      ["The thing you had to unlearn that was hardest to let go of.", "story"],
      ["A conversation that changed the trajectory of your life.", "story"],
      ["A time you were the villain in your own story — and what you did next.", "story"],
      ["The moment you realised the path you were on wasn't actually yours.", "story"],
      ["Most honest thing you've ever had to admit to yourself.", "story"],
      ["A time you chose yourself and what it cost you.", "story"],
      ["The relationship that taught you the most painful lesson.", "story"],
      ["A moment of grief — not necessarily death — that changed you permanently.", "story"],
      ["The time you realised your parents were just people.", "story"],
      ["The thing you built that didn't work and what you actually learned.", "story"],
      ["A time you had to walk away from something you'd invested everything in.", "story"],
      ["The version of yourself you had to let go of to become who you are.", "story"],
      ["The moment you realised fear had been making your decisions for years.", "story"],
      ["A time you were forced to be radically honest and what it changed.", "story"],
      ["The hardest year of your life and what carried you through.", "story"],
      ["The thing that broke you open and what came out the other side.", "story"],
      ["A time you had to choose between who you were and who you were becoming.", "story"],
      ["A mistake you're still making peace with.", "story"],
      ["The moment you stopped pretending everything was fine.", "story"],
      ["A time you had to forgive someone not for them but for yourself.", "story"],
      ["The thing nobody saw you going through that changed you the most.", "story"],
      ["A decision you made that you can't fully explain but know was right.", "story"],
      ["The version of yourself you're most ashamed of — and what you did with that.", "story"],
    
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
  const msgs = [
    { emoji: "🔥", text: "Rep done." },
    { emoji: "💪", text: "That's a take." },
    { emoji: "📈", text: "Growth." },
    { emoji: "🎙️", text: "Good yap." },
    { emoji: "👀", text: "One more?" },
  ];
  const msg = msgs[Math.floor(Math.random() * msgs.length)];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, animation: "fade-in 0.2s ease", padding: "20px" }} onClick={onDismiss}>
      <div style={{ background: T.surface, borderRadius: 28, padding: "40px 36px", textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.3)", animation: "pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1)", maxWidth: 360, width: "100%" }} onClick={e => e.stopPropagation()}>

        {/* Main message */}
        <div style={{ fontSize: 52, marginBottom: 10 }}>{msg.emoji}</div>
        <p style={{ fontSize: 26, fontWeight: 800, color: T.text, marginBottom: 4, letterSpacing: "-0.4px" }}>{msg.text}</p>
        <p style={{ fontSize: 14, color: T.textSub, marginBottom: 28, lineHeight: 1.5 }}>You just did something most people only think about.</p>

        {/* Challenge CTA */}
        <div style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)", borderRadius: 16, padding: "18px 20px", marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 4 }}>Done a rep? Post it.</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 12, lineHeight: 1.5 }}>Tag <strong style={{ color: "white" }}>@learntoyap</strong> and use <strong style={{ color: "white" }}>#yapchallenge</strong> on Instagram or TikTok.</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <a href="https://instagram.com/learntoyap" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", borderRadius: 100, padding: "7px 14px", color: "white", textDecoration: "none", fontSize: 12, fontWeight: 600 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              Instagram
            </a>
            <a href="https://tiktok.com/@learntoyap" target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.15)", borderRadius: 100, padding: "7px 14px", color: "white", textDecoration: "none", fontSize: 12, fontWeight: 600 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>
              TikTok
            </a>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onDismiss} style={{ flex: 1, background: T.text, color: T.bg, border: "none", borderRadius: 12, padding: "13px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Next Rep →</button>
          <button onClick={onDismiss} style={{ background: T.surfaceAlt, color: T.textSub, border: `1px solid ${T.border}`, borderRadius: 12, padding: "13px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Done</button>
        </div>
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
          <p style={{ fontWeight: 800, fontSize: 16, color: T.text, marginBottom: 2 }}>Welcome to learntoyap.co 👋</p>
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
  // Preconnect to Google Fonts for faster font loading
  if (typeof document !== "undefined") {
    const preconnects = [
      "https://fonts.googleapis.com",
      "https://fonts.gstatic.com",
    ];
    preconnects.forEach(href => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement("link");
        link.rel = href.includes("gstatic") ? "preconnect" : "preconnect";
        link.href = href;
        if (href.includes("gstatic")) link.crossOrigin = "anonymous";
        document.head.prepend(link);
      }
    });
  }
  const [dark, setDark]               = useState(false);
  const T                             = dark ? DARK : LIGHT;

  const [niche, setNiche]             = useState("all");
  const [difficulty, setDifficulty]   = useState("random");
  const [typeFilter, setTypeFilter]   = useState("all");
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
  const [prepNotes, setPrepNotes]   = useState("");
  const [timeLeft, setTimeLeft]       = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone]     = useState(false);
  const timerRef   = useRef(null);
  const shuffleRef = useRef(null);
  const TIMER_DURATIONS = { prep: 60, record: 60 };

  const { playWin, startTicks, stopTicks } = useSound();

  const nicheObj = NICHES.find(n => n.id === niche) || NICHES[0];
  const diffObj  = DIFFICULTIES.find(d => d.id === difficulty) || DIFFICULTIES[0];
  const topicCount = countTopicsFiltered(niche, difficulty, typeFilter);

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
    let pool = getAllTopics(niche, difficulty, typeFilter, null);
    if (!pool.length) pool = getAllTopics(niche, difficulty, "all", null);
    if (!pool.length) return;
    // Filter out already-seen topics this session
    const unseen = pool.filter(([t]) => !sessionTopics.has(t));
    const finalPool = unseen.length > 0 ? unseen : pool; // fallback if all seen

    setSpinning(true); setTopic(null); setTopicType(null); setView("spin"); setRecordPulse(false); setPrepNotes(""); setPrepNotes("");
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@800;900&display=swap');
        @font-face { font-family: 'Inter'; font-display: swap; }
        @font-face { font-family: 'Outfit'; font-display: swap; }
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
        .controls-wrap.visible { max-height: 800px; opacity: 1; }
        .niche-pill { border-radius:100px; padding:6px 13px; font-size:12px; font-weight:500; cursor:pointer; transition:all 0.15s; white-space:nowrap; border:1px solid transparent; font-family:inherit; }
        .tab-btn    { background:none; border:none; font-size:13px; font-weight:600; padding:10px 0; cursor:pointer; border-bottom:2px solid transparent; transition:all 0.2s; font-family:inherit; }
        .adj-btn    { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:18px; transition:all 0.15s; background:transparent; font-family:inherit; line-height:1; }
        .diff-btn   { padding:7px 18px; border-radius:100px; cursor:pointer; font-size:12px; font-weight:600; font-family:inherit; transition:all 0.15s; }

        /* ── MOBILE ── */
        @media (max-width: 480px) {
          .main-pad { padding: 14px 12px !important; }
          .header-pad { padding: 12px 14px !important; }
          .topic-box { min-height: 160px !important; padding: 24px 20px !important; }
          .topic-text { font-size: 17px !important; }
          .record-btn { width: 68px !important; height: 68px !important; }
          .record-btn-inner { width: 22px !important; height: 22px !important; }
          .focus-topic-box { min-height: 200px !important; padding: 32px 20px !important; }
          .focus-topic-text { font-size: 20px !important; }
          .focus-record-btn { width: 84px !important; height: 84px !important; }
          .timer-ring-wrap { width: 180px !important; height: 180px !important; }
          .timer-ring-svg { width: 180px !important; height: 180px !important; }
          .timer-num { font-size: 48px !important; }
          .watermark { font-size: 16px !important; }
          .tab-btn { font-size: 12px !important; }
          .header-logo-text { font-size: 13px !important; }
          .niche-pill { font-size: 11px !important; padding: 5px 10px !important; }
          .diff-btn { font-size: 11px !important; padding: 6px 12px !important; }
          .celebration-box { padding: 28px 24px !important; }
          .celebration-title { font-size: 22px !important; }
          .onboarding-grid { grid-template-columns: 1fr 1fr !important; }
          .adj-btn { width: 44px !important; height: 44px !important; font-size: 22px !important; }
          .start-btn { padding: 14px 40px !important; font-size: 17px !important; }
        }
      `}</style>

      {showCelebration && <CelebrationOverlay T={T} onDismiss={() => setShowCelebration(false)} />}

      {/* HEADER */}
      <header style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: focusMode ? "none" : "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: dark ? "rgba(14,14,18,0.97)" : "rgba(247,247,245,0.97)", backdropFilter: "blur(16px)", zIndex: 100, transition: "background 0.3s" }} className="header-pad">
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => { setActiveTab("spin"); setView("spin"); }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #4F46E5, #7C3AED)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(79,70,229,0.35)" }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 20, color: "white", lineHeight: 1 }}>Y</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: T.text, letterSpacing: "-0.3px", lineHeight: 1 }} className="header-logo-text">learn to </span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 15, background: "linear-gradient(135deg, #4F46E5, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.3px", lineHeight: 1 }} className="header-logo-text">yap</span>
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

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "20px 16px" }} className="main-pad">

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
                    <p style={{ fontSize: 22, fontWeight: 800, color: T.textMuted, letterSpacing: "-0.5px", marginBottom: 24 }}>learntoyap.co</p>

                    {/* Big topic box */}
                    <div style={{ width: "100%", minHeight: 240, background: spinning ? T.surfaceAlt : T.surface, border: `1.5px solid ${spinning ? T.border : topic ? T.text : T.border}`, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", padding: "44px 36px", position: "relative", overflow: "hidden", transition: "all 0.35s ease", boxShadow: topic && !spinning ? T.shadowMd : T.shadow, marginBottom: 28 }} className="focus-topic-box">
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
                          <p style={{ fontSize: 24, fontWeight: 700, color: T.text, lineHeight: 1.4, letterSpacing: "-0.3px", animation: "pop-in 0.3s cubic-bezier(0.34,1.56,0.64,1)", marginBottom: 20 }} className="focus-topic-text">{topic}</p>
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
                    <div style={{ width: "100%", minHeight: 180, background: spinning ? T.surfaceAlt : T.surface, border: `1.5px solid ${spinning ? T.border : topic ? T.text : T.border}`, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 28px", position: "relative", overflow: "hidden", transition: "all 0.35s ease", boxShadow: topic && !spinning ? T.shadowMd : T.shadow }} className="topic-box">
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
                          <p style={{ fontSize: 20, fontWeight: 700, color: T.text, lineHeight: 1.4, letterSpacing: "-0.2px", animation: "pop-in 0.3s cubic-bezier(0.34,1.56,0.64,1)", marginBottom: 16 }} className="topic-text">{topic}</p>
                          <button onClick={goToTimer} style={{ background: T.text, color: T.bg, border: "none", borderRadius: 100, padding: "9px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Start Timer →</button>
                        </div>
                      )}
                    </div>

                    {/* Normal watermark */}
                    <div style={{ textAlign: "center", marginTop: 10, opacity: 0.35 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: T.textSub, letterSpacing: "-0.2px" }}>learntoyap.co</p>
                    </div>

                    {/* Normal record button */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 16 }}>
                      <div onClick={!spinning ? spin : undefined} style={{ width: 76, height: 76, borderRadius: "50%", background: "radial-gradient(circle at 36% 36%, #FF5555, #CC0000)", cursor: spinning ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.12s", animation: recordPulse ? "rec-pulse 0.9s ease-out 3" : spinning ? "none" : "rec-idle 3s infinite", transform: spinning ? "scale(0.9)" : "scale(1)", position: "relative" }} className="record-btn">
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(0,0,0,0.25)", border: "2px solid rgba(255,255,255,0.2)" }} className="record-btn-inner" />
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
              <div style={{ animation: "timer-in 0.3s cubic-bezier(0.34,1.2,0.64,1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 80px)", gap: 20, marginTop: -20, width: "100%", overflowX: "hidden" }}>
                {topic && (
                <button onClick={goToTopic} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 100, padding: "12px 20px", cursor: "pointer", maxWidth: "100%", boxShadow: T.shadow, fontFamily: "inherit", WebkitTapHighlightColor: "transparent", minHeight: 44 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: T.textSub, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 360 }}>← {topic}</p>
                </button>
                )}

                {/* learntoyap watermark */}
                <p style={{ fontSize: 20, fontWeight: 800, color: T.textMuted, letterSpacing: "-0.4px" }} className="watermark">learntoyap.co</p>

                {/* Mode toggle */}
                <div style={{ display: "flex", background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 100, padding: 4, gap: 4 }}>
                  {[["prep","⚡ Prep","60s"],["record","🔴 Record","60s"]].map(([mode,label,dur]) => (
                    <button key={mode} onClick={() => switchTimerMode(mode)} style={{ padding: "7px 18px", borderRadius: 100, border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 12, background: timerMode === mode ? (mode === "prep" ? "#7C3AED" : "#DC2626") : "transparent", color: timerMode === mode ? "#fff" : T.textSub, transition: "all 0.2s" }}>{label} <span style={{ opacity: 0.5, fontSize: 10 }}>{dur}</span></button>
                  ))}
                </div>

                {/* Prep notes */}
                {timerMode === "prep" && !timerRunning && !timerDone && (
                  <div style={{ width: "100%", maxWidth: 400 }}>
                    <textarea
                      value={prepNotes}
                      onChange={e => setPrepNotes(e.target.value)}
                      placeholder="Jot your structure, hook, key points..."
                      style={{ width: "100%", minHeight: 90, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, color: T.text, fontFamily: "inherit", lineHeight: 1.6, resize: "vertical", outline: "none" }}
                    />
                  </div>
                )}

                {timerMode === "record" && prepNotes && (
                  <div style={{ width: "100%", maxWidth: 400, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 14px" }}>
                    <p style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Your notes</p>
                    <p style={{ fontSize: 13, color: T.textSub, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{prepNotes}</p>
                  </div>
                )}

                {/* Ring */}
                <div style={{ position: "relative", width: "min(210px, 80vw)", height: "min(210px, 80vw)", margin: "0 auto" }} className="timer-ring-wrap">
                  <svg width="100%" height="100%" viewBox="0 0 210 210" style={{ transform: "rotate(-90deg)" }} className="timer-ring-svg">
                    <circle cx="105" cy="105" r={r} fill="none" stroke={T.timerTrack} strokeWidth="7" />
                    <circle cx="105" cy="105" r={r} fill="none" stroke={timerDone ? "#16A34A" : timerRunning ? accentColor : T.borderStrong} strokeWidth="7" strokeDasharray={circ} strokeDashoffset={circ - (circ * timerProgress) / 100} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.95s linear, stroke 0.3s" }} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <span style={{ fontSize: timerDone ? 44 : 58, fontWeight: 800, color: timerDone ? "#16A34A" : T.text, lineHeight: 1, letterSpacing: "-2px" }} className="timer-num">{timerDone ? "✓" : timeLeft}</span>
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
                  {!timerRunning && !timerDone && <button onClick={startTimer} style={{ background: accentColor, color: "#fff", border: "none", borderRadius: 100, padding: "13px 48px", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 20px ${accentColor}40` }} className="start-btn">START</button>}
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
          <div style={{ animation: "fade-in 0.25s ease", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 52, marginBottom: 20 }}>🧱</div>
            <p style={{ fontWeight: 800, fontSize: 22, color: T.text, marginBottom: 8, letterSpacing: "-0.3px" }}>Frameworks</p>
            <p style={{ fontSize: 14, color: T.textSub, marginBottom: 6, lineHeight: 1.6, maxWidth: 340 }}>
              PREP, Hook → Story → Lesson, ELI5 and more. Structured practice to make great speaking automatic.
            </p>
            <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 20px", marginTop: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>Coming Soon</p>
            </div>
          </div>
        )}
        <SpeedInsights />
        <Analytics />

        {/* FOOTER */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: `1px solid ${T.border}`, textAlign: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <p style={{ fontSize: 12, color: T.textMuted }}>Free forever · Made by a creator, for creators</p>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <a href="https://instagram.com/learntoyap" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, color: T.textSub, textDecoration: "none", fontSize: 12, fontWeight: 600 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                @learntoyap
              </a>
              <a href="https://tiktok.com/@learntoyap" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, color: T.textSub, textDecoration: "none", fontSize: 12, fontWeight: 600 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>
                @learntoyap
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
