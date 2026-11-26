// Everything on the home page that isn't a publication, project, or post lives here.

export type NewsItem = {
  date: string; // "YYYY-MM"
  text: string;
  href?: string;
};

export const site = {
  name: "Yidu Song",
  url: "https://song2du.github.io",
  description:
    "Undergraduate in Computer Engineering and Psychology at Gachon University, exploring human–AI interaction.",
  // The line under your name on the home page. In the statement and bio,
  // *asterisks* mark emphasized words (shown in the accent color).
  statement: "A system with a *high score* is not always the *best one for people*.",
  headline: "Computer Engineering & Psychology · Gachon University",
  affiliation: "Research Assistant, HCI Lab",
  bio: [
    "I am an undergraduate student at Gachon University majoring in Computer Engineering and Psychology. I am currently a research assistant at the university's HCI Lab, where I focus on the development and study of *negotiation agents*.",
    "My question started there. I built a negotiation agent and expected one version to be the best, but it was the one people liked the least. Since then I have been asking why a system with a high score is not always the best one for people.",
    "My research is driven by the vision of AI for Psychology. My ultimate goal is to design and develop AI agents that foster positive feedback loops within human society.",
    "I am always open to collaboration and discussions regarding my research or shared visions. Please feel free to reach out.",
  ],
  links: [
    { label: "Email", href: "mailto:song6341@gachon.ac.kr" },
    { label: "GitHub", href: "https://github.com/song2du" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/yidu-song-552374346" },
    // { label: "Google Scholar", href: "https://scholar.google.com/citations?user=..." },
  ],
  // Newest first.
  news: [
    {
      date: "2026-08",
      text: "Won 2nd place in the research track at the joint Computer Science × AI academic festival, Gachon University.",
    },
    {
      date: "2025-12",
      text: "Received the Encouragement Award at the AI Agent Competition (Kakao × KSC 2025).",
      href: "/blog/first-ai-agent-competition/",
    },
  ] satisfies NewsItem[] as NewsItem[],
};
