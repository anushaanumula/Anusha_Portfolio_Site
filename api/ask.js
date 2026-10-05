// Vercel serverless function: answers questions about Anusha's work.
// Needs one environment variable in Vercel: ANTHROPIC_API_KEY
// Optional: ANTHROPIC_MODEL (defaults below; see the provider docs for current model names)

const FACTS = [
'Anusha Anumula is a full-stack developer with 5+ years of production experience, currently Full Stack Developer at Verizon via Incedo (June 2024–present), Dallas TX.',
'Her line: "I operate at the intersection of engineering, customers, and product. Passionate, curious, and hands-on."',
'Verizon network-operations portal: she talked directly with ops users to understand their workflows and pain points, designed directly in code (prototyping flows and layouts in React), demoed working builds and iterated on feedback. She built a shared component library on Material UI with React and TypeScript and one theme for color, spacing and type. Result: 25% less duplicated UI code, fewer clicks and screens for common tasks, fewer bugs and support tickets, positive user and client feedback, Best Deliverables recognition. After launch she reworked navigation and filters, simplified dense layouts and fixed slow views.',
'Maps: she designed and built interactive map views with WebGL-rendered markers for thousands of network sites, GeoServer-backed GIS diff maps showing added and removed coverage between data loads, and Python scripts to ingest county boundary data.',
'AI: she designed and built a GenAI prototype with the Google Gemini API that turned a reporting dashboard into a next-best-action and root-cause-analysis assistant, and presented the working prototype directly to client stakeholders. She built Gemini-powered code review prompts that flag code smells, vulnerabilities and standards issues. She uses AI daily (Claude, GitHub Copilot, Gemini) for exploring ideas, prototyping, boilerplate and review. Side projects: a RAG pipeline for natural-language questions across data sources, and a multi-source data retrieval agent.',
'Data viz: reusable React components that draw Kafka topic flows in real time, and Grafana/Prometheus dashboards for lag, throughput and broker health; faster diagnosis improved system reliability 20%.',
'T-Mobile (Java Developer, July 2023–May 2024): designed and built front-end components for a subscription-management dashboard in React and Redux, focused on responsiveness and accessibility; user satisfaction rose 40%. Also Spring Boot microservices, Kafka, JWT security, SQL tuning (20% faster queries).',
'TracFone (Software Developer, July 2019–2021): worked on retail shop flows for Straight Talk, TracFone and its other B2B and B2C brands; Spring/Java services, 30% faster SQL, 100+ unit tests, Jenkins/Docker CI/CD. University of North Texas: MS Computer Science, GPA 3.9, graduate teaching assistant.',
'Skills: TypeScript, JavaScript, React, Redux, Material UI, theming, WebGL, interactive maps, HTML, CSS, Jest, Node.js, Express, Java, Spring Boot, Python, Kafka, SQL, AWS, Docker, Git, pull requests and code review, CI/CD.',
'TracFone shop flows: she worked on shop flows for Straight Talk, TracFone and their other B2B and B2C brands.',
'Approach: she has a bias toward simplicity in design and code: fewer screens, one pattern everywhere, less code. On the Verizon portal she removed duplicate screens and patterns instead of adding new ones, cutting duplicated UI code by 25%.',
'Contact: anumula.anusha@outlook.com. Based in Dallas, Texas.'
].join("\n");

const RULES = "You are a helpful guide on Anusha Anumula's portfolio, answering a recruiter or hiring manager. " +
  "Answer ONLY from the facts below; never invent employers, numbers, tools or projects. " +
  "If the facts do not cover the question, say so in one sentence and suggest emailing her. " +
  "Refer to her as Anusha or she. Plain text, no markdown, 2-4 short sentences, warm and specific.\n\nFACTS:\n" + FACTS;

// Very small per-instance rate limit (best effort): 20 questions per IP per hour.
const hits = new Map();
function limited(ip) {
  const now = Date.now(), hour = 3600e3;
  const list = (hits.get(ip) || []).filter(t => now - t < hour);
  list.push(now); hits.set(ip, list);
  return list.length > 20;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(503).json({ error: "AI not configured" });
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0] || "unknown";
  if (limited(ip)) return res.status(429).json({ error: "Too many questions, try later" });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const question = String(body.question || "").slice(0, 300).trim();
  if (!question) return res.status(400).json({ error: "Missing question" });
  const history = Array.isArray(body.history) ? body.history.slice(-4)
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map(m => ({ role: m.role, content: m.content.slice(0, 1200) })) : [];

  const messages = [{ role: "user", content: RULES }, { role: "assistant", content: "Understood." }, ...history, { role: "user", content: question }];
  // keep roles alternating
  const clean = [];
  for (const m of messages) { if (clean.length && clean[clean.length - 1].role === m.role) clean[clean.length - 1].content += "\n" + m.content; else clean.push({ ...m }); }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5", max_tokens: 300, messages: clean })
    });
    if (!r.ok) return res.status(502).json({ error: "AI request failed" });
    const data = await r.json();
    const answer = (data.content || []).filter(c => c.type === "text").map(c => c.text).join("").trim();
    return res.status(200).json({ answer });
  } catch (e) {
    return res.status(502).json({ error: "AI request failed" });
  }
}
