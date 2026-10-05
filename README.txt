Anusha Anumula - portfolio

FILES
  index.html                 the whole site (styles and scripts inside)
  Anusha_Anumula_Resume.pdf  the resume the site links to
  api/ask.js                 optional: real AI answers for the "Ask about my work" box (Vercel only)
  package.json               tells Vercel how to run api/ask.js

------------------------------------------------------------
1) PUT IT ON GITHUB
  1. github.com > New repository > name it (e.g. portfolio) > Public > Create.
  2. "uploading an existing file" > drag in everything from this folder
     (keep the api folder) > Commit changes.

2) DEPLOY ON VERCEL
  1. vercel.com > sign in with GitHub > Add New > Project.
  2. Import the portfolio repo. Framework preset: "Other". Leave build settings empty.
  3. Deploy. You get a link like portfolio-xyz.vercel.app
     (you can rename it in Settings > Domains, or add your own domain).
  Every time you change a file on GitHub, Vercel updates the site automatically.

3) TURN ON REAL AI FOR THE ASK BOX (optional)
  Without this step the Ask box still works: it uses instant answers written into the page.
  With it, questions are answered by an AI model using only the facts about Anusha's work.
  1. Get an API key from Anthropic at console.anthropic.com (add a small amount of credit;
     each question costs a fraction of a cent).
  2. Vercel > your project > Settings > Environment Variables:
       Name: ANTHROPIC_API_KEY   Value: (your key)
     Optional: ANTHROPIC_MODEL to choose a model (see your API provider's docs for model names).
  3. Deployments > Redeploy.
  The badge in the Ask box changes to "Answered by AI" once it works.
  The key stays on Vercel's server; visitors never see it.
  Questions are limited to 300 characters and about 20 per visitor per hour.

GITHUB PAGES INSTEAD OF VERCEL?
  Works too (Settings > Pages > deploy from main), but GitHub Pages can't run api/ask.js,
  so the Ask box will use the instant answers.

EDITING
  Open index.html in any editor and search for the words you want to change.
  To add a GitHub profile link, search for  var LINKS=  and paste the URL after  github:
  If you change facts about Anusha, update them in both index.html (var FACTS) and api/ask.js (FACTS).
