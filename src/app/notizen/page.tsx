// app/page.tsx (Next.js 13+ App Router)
// Rein optische Notizen-Seite – keine Logik.
// Ersetze die Platzhaltertexte einfach durch deine eigenen Notizen.

export default function Page() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800 antialiased">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Meine Notizen</h1>
          <p className="mt-2 text-sm md:text-base text-slate-500">Stand: <time suppressHydrationWarning>{new Date().toLocaleDateString()}</time></p>
        </header>

        {/* Karte */}
        <article className="rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur p-6 md:p-8 space-y-10">
          {/* Abschnitt: Heute */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Heute</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Kurzer Überblick über den Tag …</li>
              <li>Wichtige Termine/Erkenntnisse …</li>
              <li>Notier hier frei, was relevant ist.</li>
            </ul>
          </section>

          {/* Abschnitt: Ideen */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Ideen</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 p-4 bg-white/60">
                <h3 className="font-medium mb-2">🧠 Konzept A</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Kurze Beschreibung oder Stichpunkte …</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4 bg-white/60">
                <h3 className="font-medium mb-2">🌱 Konzept B</h3>
                <p className="text-sm text-slate-600 leading-relaxed">Notizen, Links, Gedanken …</p>
              </div>
            </div>
          </section>

          {/* Abschnitt: To‑dos (rein visuell) */}
          <section>
            <h2 className="text-xl font-semibold mb-3">To‑dos</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-4 w-4 rounded border border-slate-300" aria-hidden />
                <span>Einen Punkt, den ich nicht vergessen will …</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-4 w-4 rounded border border-slate-300" aria-hidden />
                <span>Noch ein To‑do (nur Optik, keine Funktion) …</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-block h-4 w-4 rounded border border-slate-300" aria-hidden />
                <span>Optional: Prioritäten, Deadlines etc. als Text.</span>
              </li>
            </ul>
          </section>

          {/* Abschnitt: Leseliste */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Leseliste</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Buchtitel oder Artikel – kurze Notiz …</li>
              <li>Linktitel – warum lesenswert …</li>
              <li>Paper/Thread – Kerngedanke …</li>
            </ol>
          </section>

          {/* Abschnitt: Zitate/Code */}
          <section>
            <h2 className="text-xl font-semibold mb-3">Zitate & Schnipsel</h2>
            <figure className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <blockquote className="text-slate-700 italic leading-relaxed">„Kurzes Zitat oder Merksatz …“</blockquote>
              <figcaption className="mt-2 text-xs text-slate-500">— Quelle / Autor</figcaption>
            </figure>
            <pre className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-slate-900 text-slate-100 p-4 text-sm"><code></code></pre>
          </section>
        </article>

        {/* Footer Hinweis */}
        <footer className="mt-12 text-center text-xs text-slate-400">
          <p>Nur Optik – keine Interaktionen oder Logik. ✨</p>
        </footer>
      </div>
    </main>
  );
}
