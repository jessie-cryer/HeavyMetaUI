import ConnectionPanel from './ConnectionPanel'

const areas = [
  { number: '01', title: 'Build your deck', description: 'A place for your next Commander idea. Find cards, shape your list, and keep your drafts private.', detail: 'Start with a private draft. Publish a snapshot when you’re ready to share it.' },
  { number: '02', title: 'Find your next card', description: 'Explore cards and printings, then bring the right pieces into your deck.', detail: 'Search for a card, choose a printing, and add it directly to your working list.' },
  { number: '03', title: 'Share your perspective', description: 'Publish a list, discover other builders, and talk through the choices that make a deck yours.', detail: 'Explore published lists and leave comments. Withdraw your own list whenever you want.' },
]

export default function App() {
  return (
    <div className="shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="flex items-center justify-between gap-4 border-b border-white/15 py-6">
        <a className="brand" href="/" aria-label="HeavyMeta home"><span aria-hidden="true">H/M</span> HeavyMeta</a>
        <span className="text-xs tracking-widest text-stone-400 uppercase">Commander community</span>
      </header>
      <main id="main">
        {import.meta.env.DEV && <ConnectionPanel />}
        <section className="hero" aria-labelledby="title">
          <p className="eyebrow">Every deck has a point of view.</p>
          <h1 id="title">Find your cards.<br /><span>Make your mark.</span></h1>
          <p className="intro">A home for thoughtful deckbuilding and the people behind the lists.</p>
          <p className="preview-note">Early preview · Deckbuilding and community features are coming next.</p>
        </section>
        <section aria-labelledby="explore-heading" className="pb-16">
          <h2 id="explore-heading" className="mb-6 text-sm font-medium uppercase tracking-widest text-stone-400">What we’re building</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {areas.map((area) => (
              <article className="feature" key={area.number}>
                <span className="number" aria-hidden="true">{area.number}</span>
                <h3>{area.title}</h3>
                <p>{area.description}</p>
                <details><summary>How it will work</summary><p>{area.detail}</p></details>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-white/15 py-6 text-sm text-stone-400">HeavyMeta · An independent Magic: The Gathering community project.</footer>
    </div>
  )
}
