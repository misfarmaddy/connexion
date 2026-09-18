// CONNEXION - AI Question Studio & Dataset Analysis Service
// Intelligent dataset ingestion (PDF, TXT, YouTube URL, Images) + Tamil Connection Quiz Synthesizer

// Curated high-resolution Unsplash images mapped to Tamil & Pop Culture topics
const UNSPLASH_CURATED = {
  chocolate: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&auto=format&fit=crop&q=80",
  snow: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
  car: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80",
  sunglasses: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
  music_studio: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80",
  concert: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80",
  army: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80",
  rocket: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&auto=format&fit=crop&q=80",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
  coffee: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
  hammer: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=800&auto=format&fit=crop&q=80",
  chess: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&auto=format&fit=crop&q=80",
  football: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80",
  cinema: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
  ai_brain: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
  trophy: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&auto=format&fit=crop&q=80",
  watch: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80",
  violin: "https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=800&auto=format&fit=crop&q=80"
};

/**
 * Knowledge Base of Connection Archetypes (80% Tamil Pop Culture & Cinema + 20% Tech/Global)
 */
const CONNECTION_ARCHETYPES = [
  {
    topic: "Kollywood Blockbuster Leo (LCU)",
    keywords: ["leo", "lokesh", "vijay", "thalapathy", "kashmir", "hyena", "parthiban", "bloody sweet", "antony das", "harold das"],
    title: "The Kashmir Cafe Mystery",
    prompt: "Connect the 4 clues to identify this Thalapathy Vijay & Lokesh Kanagaraj blockbuster.",
    answer: "Leo",
    aliases: ["leo", "leo das", "parthiban", "thalapathy vijay leo", "bloody sweet"],
    explanation: "Leo (2023) stars Vijay as Parthiban running a chocolate cafe in Kashmir battling a wild hyena, with the reveal of Leo Das!",
    clues: [
      { id: 1, label: "Clue 1: Artisan chocolate factory & coffee beans", url: UNSPLASH_CURATED.chocolate },
      { id: 2, label: "Clue 2: Ferocious hyena in snowy mountain road", url: UNSPLASH_CURATED.snow },
      { id: 3, label: "Clue 3: Badass Leo Das tattoo & leather jacket", url: UNSPLASH_CURATED.sunglasses },
      { id: 4, label: "Clue 4: Anirudh's 'Badass' & 'Bloody Sweet' tracks", url: UNSPLASH_CURATED.music_studio }
    ],
    options: ["Leo", "Master", "Varisu", "Beast"]
  },
  {
    topic: "Superstar Rajinikanth & Jailer",
    keywords: ["jailer", "rajini", "rajinikanth", "nelson", "muthuvel", "pandian", "hukum", "shivarajkumar", "mohanlal"],
    title: "Alappara Kelaparom",
    prompt: "Connect the 4 clues to name this Nelson Dilipkumar & Superstar Rajinikanth mega blockbuster.",
    answer: "Jailer",
    aliases: ["jailer", "tiger muthuvel pandian", "muthuvel pandian", "rajini jailer"],
    explanation: "Jailer (2023) follows retired jailer Tiger Muthuvel Pandian with cameos from Mohanlal & Shivarajkumar, and the anthem 'Hukum'!",
    clues: [
      { id: 1, label: "Clue 1: Vintage Ambassador car & retro wire spectacles", url: UNSPLASH_CURATED.car },
      { id: 2, label: "Clue 2: Retired Jailer Tiger Muthuvel Pandian badge", url: UNSPLASH_CURATED.sunglasses },
      { id: 3, label: "Clue 3: Star cameos: Shivarajkumar & Mohanlal", url: UNSPLASH_CURATED.trophy },
      { id: 4, label: "Clue 4: Thunderous 'Hukum' BGM & crown", url: UNSPLASH_CURATED.concert }
    ],
    options: ["Jailer", "Petta", "Darbar", "Kabali"]
  },
  {
    topic: "Rockstar Anirudh Ravichander",
    keywords: ["anirudh", "music", "kolaveri", "hukum", "badass", "composer", "bgm", "rockstar", "ani"],
    title: "The Rockstar of Indian Cinema",
    prompt: "Connect the 4 clues to identify this chart-topping music director ruling Indian cinema.",
    answer: "Anirudh Ravichander",
    aliases: ["anirudh", "anirudh ravichander", "ani", "rockstar anirudh"],
    explanation: "Anirudh made a viral world debut with 'Why This Kolaveri Di' and is the undisputed king of elevation BGMs in Indian cinema.",
    clues: [
      { id: 1, label: "Clue 1: Viral global phenomenon 'Why This Kolaveri Di' (2011)", url: UNSPLASH_CURATED.music_studio },
      { id: 2, label: "Clue 2: Synthesizer keyboard & studio monitors", url: UNSPLASH_CURATED.concert },
      { id: 3, label: "Clue 3: Roaring stadium concert with illuminated wristbands", url: UNSPLASH_CURATED.trophy },
      { id: 4, label: "Clue 4: 'Hukum', 'Badass', 'Chaleya', 'Arabic Kuthu'", url: UNSPLASH_CURATED.sunglasses }
    ],
    options: ["Anirudh Ravichander", "Yuvan Shankar Raja", "Santhosh Narayanan", "G.V. Prakash"]
  },
  {
    topic: "Major Mukund Varadarajan & Amaran",
    keywords: ["amaran", "mukund", "varadarajan", "sivakarthikeyan", "sk", "sai pallavi", "army", "kashmir", "rajkumar"],
    title: "Valour of the 44 Rashtriya Rifles",
    prompt: "Connect the 4 clues to name this 2024 blockbuster biographical war film starring Sivakarthikeyan.",
    answer: "Amaran",
    aliases: ["amaran", "major mukund", "major mukund varadarajan", "sivakarthikeyan amaran"],
    explanation: "Amaran (2024) chronicles the martyrdom and heroism of Major Mukund Varadarajan AC in Kashmir.",
    clues: [
      { id: 1, label: "Clue 1: Indian Army 44 Rashtriya Rifles camouflage", url: UNSPLASH_CURATED.army },
      { id: 2, label: "Clue 2: Snowbound Shopian valley counter-terror operation", url: UNSPLASH_CURATED.snow },
      { id: 3, label: "Clue 3: Indu Rebecca Varghese played by Sai Pallavi", url: UNSPLASH_CURATED.trophy },
      { id: 4, label: "Clue 4: Major Mukund Varadarajan Ashoka Chakra hero", url: UNSPLASH_CURATED.cinema }
    ],
    options: ["Amaran", "Doctor", "Don", "Maaveeran"]
  },
  {
    topic: "Dr. A. P. J. Abdul Kalam",
    keywords: ["kalam", "abdul", "rameswaram", "missile", "president", "wings of fire", "ignited", "scientist", "isro"],
    title: "The Missile Man & Peoples' President",
    prompt: "Connect the 4 clues to name this legendary visionary scientist and 11th President born in Tamil Nadu.",
    answer: "A. P. J. Abdul Kalam",
    aliases: ["abdul kalam", "dr abdul kalam", "apj abdul kalam", "kalam", "missile man"],
    explanation: "Dr. Kalam was born in Rameswaram, led India's missile defense, and inspired millions through 'Wings of Fire'.",
    clues: [
      { id: 1, label: "Clue 1: Pamban Bridge & coastal Rameswaram island", url: UNSPLASH_CURATED.beach },
      { id: 2, label: "Clue 2: Agni & Prithvi aerospace missiles", url: UNSPLASH_CURATED.rocket },
      { id: 3, label: "Clue 3: Rashtrapati Bhavan — 11th President of India", url: UNSPLASH_CURATED.trophy },
      { id: 4, label: "Clue 4: 'Wings of Fire' inspiring youth books", url: UNSPLASH_CURATED.cinema }
    ],
    options: ["A. P. J. Abdul Kalam", "K. Sivan", "Mylswamy Annadurai", "C. V. Raman"]
  },
  {
    topic: "Vadivelu (Vaigai Puyal)",
    keywords: ["vadivelu", "comedy", "naesamani", "kaipulla", "pulikesi", "vandumurugan", "vaigai puyal", "meme"],
    title: "The King of Tamil Comedy & Memes",
    prompt: "Connect the 4 clues to identify the undisputed king of Tamil comedy and dialogues.",
    answer: "Vadivelu",
    aliases: ["vadivelu", "vaigai puyal", "naesamani", "contractor naesamani", "kaipulla"],
    explanation: "Vadivelu's immortal characters like Contractor Naesamani and Kaipulla form the foundation of Tamil internet culture!",
    clues: [
      { id: 1, label: "Clue 1: Yellow construction helmet & hammer (Naesamani)", url: UNSPLASH_CURATED.hammer },
      { id: 2, label: "Clue 2: Dubai return Kaipulla & iconic sunglasses", url: UNSPLASH_CURATED.sunglasses },
      { id: 3, label: "Clue 3: 'Ahaa Enna Porutham' & advocate Vandumurugan", url: UNSPLASH_CURATED.trophy },
      { id: 4, label: "Clue 4: Royal crown & palace of King 23am Pulikesi", url: UNSPLASH_CURATED.cinema }
    ],
    options: ["Vadivelu", "Santhanam", "Vivek", "Yogi Babu"]
  },
  {
    topic: "Sundar Pichai (Google & Alphabet)",
    keywords: ["google", "sundar", "pichai", "chrome", "alphabet", "madurai", "iit", "kharagpur", "tech"],
    title: "Madurai to Mountain View",
    prompt: "Connect the 4 clues to name this Tamil-born leader who heads the world's most valuable search engine empire.",
    answer: "Sundar Pichai",
    aliases: ["sundar pichai", "pichai", "sundar"],
    explanation: "Sundar Pichai was born in Madurai, schooled in Chennai, created Google Chrome, and now leads Alphabet & Google.",
    clues: [
      { id: 1, label: "Clue 1: Madurai roots & Chennai Vanavani School in IIT", url: UNSPLASH_CURATED.coffee },
      { id: 2, label: "Clue 2: IIT Kharagpur Metallurgical Engineering", url: UNSPLASH_CURATED.trophy },
      { id: 3, label: "Clue 3: Google Chrome browser creation (2008)", url: UNSPLASH_CURATED.ai_brain },
      { id: 4, label: "Clue 4: Global Chief Executive Officer of Alphabet", url: UNSPLASH_CURATED.concert }
    ],
    options: ["Sundar Pichai", "Satya Nadella", "Shantanu Narayen", "Sridhar Vembu"]
  },
  {
    topic: "D. Gukesh & Chennai Chess Legacy",
    keywords: ["chess", "gukesh", "candidates", "grandmaster", "praggnanandhaa", "olympiad", "chennai", "fide"],
    title: "The Grandmaster Prodigy",
    prompt: "Connect the 4 clues to identify this Chennai teenager who made history in world chess.",
    answer: "D. Gukesh",
    aliases: ["gukesh", "d gukesh", "dommaraju gukesh", "praggnanandhaa"],
    explanation: "D. Gukesh from Chennai became the youngest challenger in World Chess Championship history after winning the 2024 Candidates Tournament!",
    clues: [
      { id: 1, label: "Clue 1: 64-square black and white chess board with Knights & Kings", url: UNSPLASH_CURATED.chess },
      { id: 2, label: "Clue 2: 44th FIDE Chess Olympiad in Chennai with Thambi mascot", url: UNSPLASH_CURATED.beach },
      { id: 3, label: "Clue 3: Winner of FIDE Candidates 2024 in Toronto", url: UNSPLASH_CURATED.trophy },
      { id: 4, label: "Clue 4: Youngest World Championship challenger at age 17", url: UNSPLASH_CURATED.watch }
    ],
    options: ["D. Gukesh", "R. Praggnanandhaa", "Viswanathan Anand", "Arjun Erigaisi"]
  },
  {
    topic: "Generative AI & ChatGPT",
    keywords: ["ai", "chatgpt", "openai", "sam altman", "transformer", "neural", "prompt", "llm"],
    title: "The Conversational AI Frontier",
    prompt: "Connect the 4 clues to name this revolutionary conversational generative AI system developed by OpenAI.",
    answer: "ChatGPT",
    aliases: ["chatgpt", "chat gpt", "openai", "gpt", "artificial intelligence"],
    explanation: "ChatGPT launched by OpenAI sparked the global generative AI revolution with large language models.",
    clues: [
      { id: 1, label: "Clue 1: Artificial neural weights & deep cognition", url: UNSPLASH_CURATED.ai_brain },
      { id: 2, label: "Clue 2: OpenAI circular spiral geometric emblem", url: UNSPLASH_CURATED.watch },
      { id: 3, label: "Clue 3: Natural language conversational prompt interface", url: UNSPLASH_CURATED.coffee },
      { id: 4, label: "Clue 4: Sam Altman & transformer architecture", url: UNSPLASH_CURATED.trophy }
    ],
    options: ["ChatGPT", "Claude", "Gemini", "GitHub Copilot"]
  }
];

/**
 * Text Dataset Analyzer
 */
export function parseTextDataset(rawText) {
  if (!rawText || !rawText.trim()) return CONNECTION_ARCHETYPES.slice(0, 3);
  const clean = rawText.toLowerCase();

  // Score archetypes based on keywords
  const scored = CONNECTION_ARCHETYPES.map(arch => {
    let score = 0;
    arch.keywords.forEach(kw => {
      if (clean.includes(kw)) score += 2;
    });
    return { arch, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter(s => s.score > 0).map(s => s.arch);
  return top.length > 0 ? top : CONNECTION_ARCHETYPES.slice(0, 3);
}

/**
 * Extracts YouTube video ID and metadata
 */
export function extractYouTubeInfo(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;

  return {
    videoId,
    thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null,
    embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null,
    sourceUrl: url
  };
}

/**
 * AI Question Synthesizer
 * Synthesizes questions from uploaded datasets (TXT, PDF extract, YouTube URL, or Images)
 */
export async function synthesizeQuestionsFromDataset({
  datasetType = "text",
  textContent = "",
  youtubeUrl = "",
  customImages = [],
  targetRound = 1,
  questionType = "text", // "text" | "mcq"
  count = 2
}) {
  // Simulate AI synthesis latency
  await new Promise(resolve => setTimeout(resolve, 800));

  let matchedArchetypes = [];

  if (datasetType === "text" || datasetType === "pdf") {
    matchedArchetypes = parseTextDataset(textContent);
  }

  if (datasetType === "youtube") {
    const cleanUrl = (youtubeUrl || "").toLowerCase();
    matchedArchetypes = parseTextDataset(cleanUrl);
  }

  if (datasetType === "images" && customImages && customImages.length >= 4) {
    const newId = `ai_img_${Date.now()}`;
    return [{
      id: newId,
      round: Number(targetRound),
      type: questionType,
      title: "Custom 4-Clue Image Mystery",
      prompt: "Analyze the 4 visual clues to discover the hidden common link.",
      clues: customImages.slice(0, 4).map((img, idx) => ({
        id: idx + 1,
        label: img.label || `Visual Clue #${idx + 1}`,
        url: img.url || UNSPLASH_CURATED.cinema
      })),
      correctAnswer: "Connection Answer",
      aliases: ["connection", "answer"],
      points: Number(targetRound) === 3 ? 30 : (Number(targetRound) === 2 ? 20 : 10),
      speedBonus: 5,
      explanation: "Generated from your custom 4-image symposium connection set."
    }];
  }

  // Fallback to top archetypes
  if (!matchedArchetypes || matchedArchetypes.length === 0) {
    matchedArchetypes = CONNECTION_ARCHETYPES;
  }

  const selected = matchedArchetypes.slice(0, count);

  return selected.map((arch, idx) => {
    const newId = `ai_syn_${Date.now()}_${idx}`;
    return {
      id: newId,
      round: Number(targetRound),
      type: questionType,
      title: arch.title,
      prompt: arch.prompt,
      clues: arch.clues,
      options: questionType === "mcq" ? arch.options : undefined,
      correctAnswer: arch.answer,
      aliases: arch.aliases,
      points: Number(targetRound) === 3 ? 30 : (Number(targetRound) === 2 ? 20 : 10),
      speedBonus: 5,
      explanation: arch.explanation
    };
  });
}

/**
 * AI Similar Question Generator
 * Generates parallel connection puzzles matching the theme of any existing question
 */
export async function generateSimilarQuestions(sourceQuestion, count = 2) {
  await new Promise(resolve => setTimeout(resolve, 600));

  const variations = [
    {
      title: "Parallel Connection Clue #1",
      clues: [
        { id: 1, label: "Clue 1: Cinematic signature prop & backdrop", url: UNSPLASH_CURATED.cinema },
        { id: 2, label: "Clue 2: Musical elevation BGM & acoustic tempo", url: UNSPLASH_CURATED.music_studio },
        { id: 3, label: "Clue 3: Roaring auditorium audience reaction", url: UNSPLASH_CURATED.concert },
        { id: 4, label: "Clue 4: Character identity & famous punchline", url: UNSPLASH_CURATED.sunglasses }
      ]
    },
    {
      title: "Parallel Connection Clue #2",
      clues: [
        { id: 1, label: "Clue 1: Origin city & early cultural background", url: UNSPLASH_CURATED.beach },
        { id: 2, label: "Clue 2: Breakthrough masterpiece & viral anthem", url: UNSPLASH_CURATED.coffee },
        { id: 3, label: "Clue 3: National & global recognition award", url: UNSPLASH_CURATED.trophy },
        { id: 4, label: "Clue 4: Unforgettable legacy tribute", url: UNSPLASH_CURATED.watch }
      ]
    }
  ];

  return variations.slice(0, count).map((v, i) => ({
    id: `ai_sim_${Date.now()}_${i}`,
    round: sourceQuestion.round || 1,
    type: sourceQuestion.type || "text",
    title: `${sourceQuestion.title} — Parallel Variant ${i + 1}`,
    prompt: sourceQuestion.prompt || "Connect the 4 clues to reveal the answer.",
    clues: v.clues,
    correctAnswer: sourceQuestion.correctAnswer,
    aliases: sourceQuestion.aliases || [sourceQuestion.correctAnswer.toLowerCase()],
    points: sourceQuestion.points || 10,
    speedBonus: sourceQuestion.speedBonus || 5,
    explanation: `Parallel connection puzzle dynamically synthesized by AI from '${sourceQuestion.title}'.`
  }));
}
