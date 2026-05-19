import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="hidden sm:block mt-12 bg-[color:var(--header)] text-white/75 text-sm">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="font-semibold text-white mb-3">TrolleyMate</div>
          <ul className="space-y-1.5">
            <li><Link href="/" className="hover:text-white">How it works</Link></li>
            <li><Link href="/deals" className="hover:text-white">This week&apos;s deals</Link></li>
            <li><Link href="/saved" className="hover:text-white">Price watchlist</Link></li>
            <li><Link href="/location" className="hover:text-white">Change location</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-white mb-3">Categories</div>
          <ul className="space-y-1.5">
            <li><Link href="/search?q=Fruit%20%26%20Veg" className="hover:text-white">Fruit & Veg</Link></li>
            <li><Link href="/search?q=Dairy" className="hover:text-white">Dairy</Link></li>
            <li><Link href="/search?q=Meat" className="hover:text-white">Meat</Link></li>
            <li><Link href="/search?q=Pantry" className="hover:text-white">Pantry staples</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-white mb-3">Retailers</div>
          <ul className="space-y-1.5">
            <li>Woolworths · Coles</li>
            <li>ALDI · IGA</li>
            <li>Costco · Big W</li>
            <li>Kmart · Target</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-white mb-3">About</div>
          <ul className="space-y-1.5">
            <li>Made in Australia 🇦🇺</li>
            <li>Prices refresh every 30 min</li>
            <li>No account, no tracking</li>
            <li>Trademarks owned by their respective retailers</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4 text-xs text-white/55 flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} TrolleyMate AU. Not affiliated with any retailer.</span>
          <span>Built with care in 🇦🇺. ABN xx xxx xxx xxx.</span>
        </div>
      </div>
    </footer>
  );
}
