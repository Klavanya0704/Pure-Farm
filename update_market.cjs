const fs = require('fs');
let file = fs.readFileSync('src/components/pages.tsx', 'utf-8');

// Replace MarketPage
const marketPageRegex = /export function MarketPage\(\) \{[\s\S]*?\n\}\n/m;

const newMarketPage = export function MarketPage() {
  const [query, setQuery] = useState("");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedCrop, setSelectedCrop] = useState("All Crops");

  const cropsList = ["All Crops", ...Array.from(new Set(MANDI_PRICES.map(m => m.crop)))];
  const statesList = ["All States", ...Array.from(new Set(MANDI_PRICES.map(m => m.state)))];

  const rows = MANDI_PRICES.filter((item) => {
    const matchQuery = \\ \ \\.toLowerCase().includes(query.toLowerCase());
    const matchState = selectedState === "All States" || item.state === selectedState;
    const matchCrop = selectedCrop === "All Crops" || item.crop === selectedCrop;
    return matchQuery && matchState && matchCrop;
  });

  const getCropIcon = (crop) => {
    switch(crop.toLowerCase()) {
      case 'wheat': return '??';
      case 'paddy': return '??';
      case 'maize': return '??';
      case 'cotton': return '??';
      case 'mustard': return '??';
      case 'onion': return '??';
      case 'tomato': return '??';
      case 'potato': return '??';
      default: return '??';
    }
  };

  return (
    <RoleGuard allowedRoles={["farmer", "admin"]}>
      <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-[#f8faf9]">
        {/* HERO SECTION */}
        <div className="relative h-[280px] w-full flex items-center justify-center overflow-hidden rounded-b-[2rem]">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/e/ea/Corn_field_and_tractor_with_trailer_at_sunset.jpg)' }}
          >
            <div className="absolute inset-0 bg-black/40" />
          </div>
          <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
             <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white mb-4 shadow-lg border border-white/20">
               <TrendingUp className="h-6 w-6" />
             </div>
             <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 drop-shadow-md">Market Prices</h1>
             <p className="text-white/95 text-sm sm:text-base font-medium drop-shadow">Stay updated with the latest mandi prices across India</p>
             <p className="mt-5 text-[#a7f3d0] font-serif italic text-xl sm:text-2xl drop-shadow-md">"Better Prices, Brighter Futures"</p>
          </div>
        </div>

        {/* SEARCH + FILTER SECTION */}
        <div className="px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-card p-3 sm:p-4 border border-border flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search crop, mandi, state..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            <select 
              value={selectedCrop}
              onChange={e => setSelectedCrop(e.target.value)}
              className="h-11 w-full md:w-48 rounded-xl border border-input bg-background px-4 text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              {cropsList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="h-11 w-full md:w-48 rounded-xl border border-input bg-background px-4 text-sm focus:ring-1 focus:ring-primary outline-none"
            >
              {statesList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="h-11 w-full md:w-auto px-4 rounded-xl border border-input bg-background text-sm flex items-center justify-between text-muted-foreground">
               <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4"/> Today</span>
            </div>
          </div>
        </div>

        {/* MARKET PRICE TABLE */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 flex-1">
          <div className="max-w-6xl mx-auto">
            <div className="overflow-x-auto rounded-3xl border border-border bg-white shadow-card-lg">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#f0fdf4] border-b border-border text-sm">
                    <th className="py-5 px-6 font-bold text-[#1b4332] rounded-tl-3xl">Crop</th>
                    <th className="py-5 px-6 font-bold text-[#1b4332]">Mandi</th>
                    <th className="py-5 px-6 font-bold text-[#1b4332]">Arrival</th>
                    <th className="py-5 px-6 font-bold text-[#1b4332]">Price</th>
                    <th className="py-5 px-6 font-bold text-[#1b4332]">Trend</th>
                    <th className="py-5 px-6 font-bold text-[#1b4332] text-right rounded-tr-3xl">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => (
                    <tr key={item.id} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f3ee] text-xl shadow-sm border border-[#2d6a4f]/10">
                            {getCropIcon(item.crop)}
                          </span>
                          <span className="font-bold text-foreground text-[15px]">{item.crop}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="block font-bold text-foreground text-[15px]">{item.mandi}</span>
                        <span className="block text-xs font-medium text-muted-foreground mt-0.5">{item.state}</span>
                      </td>
                      <td className="py-4 px-6 text-sm text-foreground font-semibold">{item.arrival}</td>
                      <td className="py-4 px-6 font-black text-foreground text-[15px]">{formatRupees(item.price)}<span className="text-xs font-semibold text-muted-foreground">/qtl</span></td>
                      <td className="py-4 px-6">
                        <span className={\inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black \\}>
                          {item.changePct >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                          {Math.abs(item.changePct)}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="inline-flex h-9 items-center justify-center rounded-xl bg-[#e8f3ee] px-4 text-xs font-bold text-[#2d6a4f] hover:bg-[#d8efe5] transition-colors border border-[#2d6a4f]/10">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                     <tr>
                       <td colSpan={6} className="py-16 text-center text-muted-foreground text-sm font-medium">No market prices found matching your filters.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* BOTTOM VALUE PROPOSITION SECTION */}
        <div className="bg-white border-t border-border mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Clock, title: "Real-time Prices", desc: "Updated from authentic sources" },
                { icon: ShieldCheck, title: "Trusted Information", desc: "Verified mandi data" },
                { icon: LineChart, title: "Better Decisions", desc: "Plan your sell with confidence" },
                { icon: Users, title: "Stronger Farmers", desc: "Together for a prosperous future" }
              ].map((val, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f0fdf4] text-[#2d6a4f] mb-5 group-hover:scale-110 transition-transform duration-300">
                    <val.icon className="h-7 w-7" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">{val.title}</h4>
                  <p className="text-sm text-muted-foreground">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM DECORATIVE AREA */}
        <div className="bg-[#1b4332] relative overflow-hidden h-40 flex items-center justify-center rounded-t-[2.5rem]">
           <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ea/Corn_field_and_tractor_with_trailer_at_sunset.jpg')] bg-cover bg-center" />
           <p className="relative z-10 text-emerald-50 text-xl md:text-2xl font-serif italic tracking-wide">"Farming Today for a Greener Tomorrow"</p>
        </div>
      </div>
    </RoleGuard>
  );
}
;

file = file.replace(marketPageRegex, newMarketPage);

// Add Clock and LineChart to lucide-react imports if not there
if (!file.includes('Clock,')) {
    file = file.replace('CalendarDays,', 'CalendarDays,\n  Clock,\n  LineChart,');
}

fs.writeFileSync('src/components/pages.tsx', file, 'utf-8');
