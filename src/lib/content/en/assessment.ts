import type { AssessmentItem } from "../types";

/**
 * Banco de diagnóstico de inglés. Dificultades iniciales asignadas por nivel
 * CEFR objetivo (A1≈-2.5 … C2≈2.5) y ajustables con datos reales
 * (calibración: ver docs/ADAPTIVE_ENGINE.md → "Calibrar el banco").
 */
type Row = [
  n: number,
  skill: AssessmentItem["skill"],
  difficulty: number,
  prompt: string,
  options: string[],
  answer: string,
  extra?: { passage?: string; grammarId?: string },
];

const rows: Row[] = [
  // Vocabulary
  [1, "vocabulary", -2.8, "Choose the word that means 'perro'.", ["cat", "dog", "bird", "horse"], "dog"],
  [2, "vocabulary", -2.4, "I drink ___ every morning.", ["coffee", "chair", "window", "shoe"], "coffee"],
  [3, "vocabulary", -1.8, "The opposite of 'expensive' is…", ["cheap", "small", "rich", "heavy"], "cheap"],
  [4, "vocabulary", -1.3, "Can I ___ your pen? I'll give it back.", ["lend", "borrow", "take off", "rent"], "borrow"],
  [5, "vocabulary", -0.8, "'Actually' means…", ["actualmente", "en realidad", "activamente", "exactamente"], "en realidad"],
  [6, "vocabulary", -0.3, "We had to wait because of a two-hour ___.", ["delay", "deal", "delete", "degree"], "delay"],
  [7, "vocabulary", 0.3, "She finally decided to ___ the job offer because the salary was too low.", ["turn down", "turn up", "look after", "set off"], "turn down"],
  [8, "vocabulary", 0.8, "A ___ connection never drops.", ["reliable", "reluctant", "relevant", "remote"], "reliable"],
  [9, "vocabulary", 1.4, "His explanation was ___: he checked every single detail.", ["thorough", "though", "through", "tough"], "thorough"],
  [10, "vocabulary", 1.9, "Smartphones are now ___; you see them everywhere.", ["ubiquitous", "ambiguous", "obsolete", "scarce"], "ubiquitous"],
  [11, "vocabulary", 2.6, "Finding my old friend in Tokyo was pure ___.", ["serendipity", "hindsight", "leverage", "scrutiny"], "serendipity"],

  // Grammar
  [12, "grammar", -2.6, "She ___ a teacher.", ["is", "are", "am", "be"], "is"],
  [13, "grammar", -2.1, "My brother ___ in a bank.", ["work", "works", "working", "is work"], "works", { grammarId: "en:g:third-person-s" }],
  [14, "grammar", -1.7, "___ you like pizza?", ["Are", "Do", "Does", "Is"], "Do", { grammarId: "en:g:questions" }],
  [15, "grammar", -1.2, "I ___ to the cinema yesterday.", ["go", "went", "have gone", "was go"], "went", { grammarId: "en:g:past-simple" }],
  [16, "grammar", -0.9, "She is ___ engineer.", ["a", "an", "the", "—"], "an", { grammarId: "en:g:articles" }],
  [17, "grammar", -0.6, "The concert is ___ Saturday.", ["in", "on", "at", "by"], "on", { grammarId: "en:g:prepositions-time-place" }],
  [18, "grammar", -0.1, "I ___ here since 2020.", ["live", "lived", "have lived", "am living"], "have lived", { grammarId: "en:g:present-perfect" }],
  [19, "grammar", 0.2, "I enjoy ___ in the mountains.", ["hike", "to hike", "hiking", "hiked"], "hiking", { grammarId: "en:g:gerund-infinitive" }],
  [20, "grammar", 0.6, "If I ___ more money, I would travel more.", ["have", "had", "would have", "will have"], "had", { grammarId: "en:g:conditionals" }],
  [21, "grammar", 1.1, "By the time we arrived, the movie ___.", ["already started", "has already started", "had already started", "was already start"], "had already started"],
  [22, "grammar", 1.6, "If she had studied, she ___ the exam.", ["would pass", "would have passed", "will pass", "had passed"], "would have passed"],
  [23, "grammar", 2.1, "Not only ___ late, but he also forgot the documents.", ["he was", "was he", "he is", "did he was"], "was he"],
  [24, "grammar", 2.7, "___ had I left the house than it started to rain.", ["No sooner", "Hardly", "As soon", "Barely"], "No sooner"],

  // Reading
  [25, "reading", -2.2, "Where does Tom work?", ["At a school", "At a hospital", "At home", "At a bank"], "At a hospital", {
    passage: "Tom is a nurse. He works at a hospital in the city. He starts work at seven in the morning.",
  }],
  [26, "reading", -1.0, "Why did Ana take the bus?", ["Her car was broken.", "She likes buses.", "It was cheaper.", "She lives near the station."], "Her car was broken.", {
    passage: "Ana usually drives to work, but yesterday her car didn't start. She called a mechanic and took the bus instead. She arrived twenty minutes late.",
  }],
  [27, "reading", 0.0, "What is the main problem the team faced?", ["They missed the deadline.", "The client changed the requirements.", "The server went down.", "A teammate quit."], "The client changed the requirements.", {
    passage: "The team had planned to release the app in March. However, two weeks before launch, the client asked for several new features. As a result, the developers had to rewrite part of the code, and the release was moved to May.",
  }],
  [28, "reading", 1.0, "According to the text, spacing reviews…", ["is less effective than cramming.", "helps people remember information longer.", "only works for children.", "requires expensive software."], "helps people remember information longer.", {
    passage: "Researchers have repeatedly found that distributing practice over time—rather than cramming it into a single session—leads to more durable memories. Although cramming may produce good results on a test the next day, the information fades quickly afterwards.",
  }],
  [29, "reading", 2.0, "What does the author imply about fluency?", ["It depends mainly on talent.", "It is the same as accuracy.", "It can hide persistent errors.", "It cannot be measured."], "It can hide persistent errors.", {
    passage: "Fluency is often mistaken for mastery. A speaker who talks quickly and confidently may nonetheless repeat the same structural errors for years, precisely because nobody interrupts a conversation that seems to be going well.",
  }],
];

export const EN_ASSESSMENT: AssessmentItem[] = rows.map(
  ([n, skill, difficulty, prompt, options, answer, extra]) => ({
    id: `en:a:${n}`,
    language: "en",
    skill,
    difficulty,
    prompt,
    options,
    answer,
    passage: extra?.passage,
    grammarId: extra?.grammarId,
  }),
);
