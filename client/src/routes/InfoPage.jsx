import { useDocumentTitle } from '../lib/hooks.js';

const PAGES = {
  about: {
    title: 'About ProofCV',
    intro: 'ProofCV is a free resume self-audit for first- and second-year students applying for technical internships.',
    sections: [
      ['Why it exists', 'Students often get passed over because their project bullets are vague or use different words from the posting. Paid resume reviews are out of reach for many. ProofCV gives honest, explainable feedback for free.'],
      ['What makes it different', 'It separates skills your resume already shows from ones it only shows under other wording, and from real gaps. It never suggests claiming a skill you didn\'t list. Rewrites leave [placeholders] for real numbers instead of inventing them.'],
      ['How it works', 'A rule-based engine with a dictionary of 150+ technical skills, their aliases and related terms. It matches whole words (so "Java" never matches "JavaScript"), weights skills by how the posting describes them, and checks each bullet for a strong verb, a named tool, a real result and a sensible length.'],
      ['Who built it', 'Built at MLH HackDay: The Battle Royale, hosted by GDG on Campus at Acropolis Institute of Technology and Research, Indore, for the "ATS Keyword & Project Bullet Improver" problem statement.'],
    ],
  },
  privacy: {
    title: 'Privacy',
    intro: 'Short version: your resume never leaves your browser.',
    sections: [
      ['What we process', 'The resume and job description you paste are analysed by code running on your device. ProofCV\'s server has no endpoint that accepts resume text.'],
      ['What is stored, and where', 'Drafts, saved resumes, audit history and your theme are saved in your browser\'s local storage on this device. Local accounts store your name, email and a salted hash of your password in the same place.'],
      ['Cloud sign-in', 'If this build has Google/email cloud sign-in enabled, Firebase Authentication handles only your sign-in. Your resumes and audits still stay in your browser.'],
      ['Your controls', 'Export everything as JSON or delete all your data from Settings at any time. Clearing your browser\'s site data also removes it.'],
      ['No tracking', 'ProofCV uses no analytics, ads or third-party trackers.'],
    ],
  },
  terms: {
    title: 'Terms',
    intro: 'ProofCV is a free self-audit tool provided as-is.',
    sections: [
      ['Not a guarantee', 'JD keyword coverage is a rule of thumb for one posting, using ProofCV\'s own dictionary and weights. It is not an ATS score and doesn\'t predict any screening or hiring decision. Real ATS systems differ by employer.'],
      ['Your responsibility', 'You decide what goes on your resume. Only list skills, tools and results that are true. ProofCV will never ask you to claim something you haven\'t done.'],
      ['Limits', 'ProofCV reads pasted text only. It can\'t check your file\'s layout, fonts or how a particular system parses it.'],
      ['Availability', 'This is a hackathon project. Features may change, and stored data lives only in your browser.'],
    ],
  },
  guidelines: {
    title: 'Community Guidelines',
    intro: 'ProofCV is built around one rule: improve the wording, never the facts.',
    sections: [
      ['Be honest', 'Use the "worded differently" suggestions only when they describe what you really did. Leave "not found" skills off until you have real experience with them.'],
      ['Use real numbers', 'Replace every [placeholder] with a figure you could explain in an interview, or delete it.'],
      ['Respect privacy', 'Remove your phone number and address before sharing a printed report. Don\'t paste other people\'s resumes without permission.'],
    ],
  },
};

export default function InfoPage({ page }) {
  const content = PAGES[page];
  useDocumentTitle(content.title);
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-[40px] font-bold tracking-tight text-fg">{content.title}</h1>
      <p className="mt-3 text-lg text-fg-muted">{content.intro}</p>
      <div className="mt-10 space-y-8">
        {content.sections.map(([heading, body]) => (
          <section key={heading}>
            <h2 className="text-[20px] font-semibold text-fg">{heading}</h2>
            <p className="mt-2 leading-relaxed text-fg-muted">{body}</p>
          </section>
        ))}
      </div>
      <p className="mt-12 text-sm text-fg-subtle">Last updated 24 November 2026.</p>
    </article>
  );
}
