import React, { useState } from "react";

export interface PositionRecord {
  id: string;
  coin: string;
  openedTime: string;
  closeTime: string;
  direction: "Long" | "Short";
  closingPnl: string;
  entryPrice: string;
  avgClosePrice: string;
  closedAmount: string;
}

export function DarkGlassTerminal(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<string>("Position History");
  const [tradeSide, setTradeSide] = useState<"buy" | "sell">("sell");
  const [orderType, setOrderType] = useState<"Market" | "Limit" | "Advanced">("Market");
  const [sliderVal, setSliderVal] = useState<number>(50);

  const mockPositions: PositionRecord[] = [
    {
      id: "1",
      coin: "BTC",
      openedTime: "2025-12-10 16:33:57",
      closeTime: "2025-12-10 16:33:57",
      direction: "Long",
      closingPnl: "+$1,456.00 USDC",
      entryPrice: "87,200.25",
      avgClosePrice: "92,009.25",
      closedAmount: "45,000.00",
    },
    {
      id: "2",
      coin: "BTC",
      openedTime: "2025-12-10 16:33:57",
      closeTime: "2025-12-10 16:33:57",
      direction: "Long",
      closingPnl: "+$1,456.00 USDC",
      entryPrice: "87,200.25",
      avgClosePrice: "92,009.25",
      closedAmount: "45,000.00",
    },
    {
      id: "3",
      coin: "BTC",
      openedTime: "2025-12-10 16:33:57",
      closeTime: "2025-12-10 16:33:57",
      direction: "Long",
      closingPnl: "+$1,456.00 USDC",
      entryPrice: "87,200.25",
      avgClosePrice: "92,009.25",
      closedAmount: "45,000.00",
    },
    {
      id: "4",
      coin: "BTC",
      openedTime: "2025-12-10 16:33:57",
      closeTime: "2025-12-10 16:33:57",
      direction: "Long",
      closingPnl: "+$1,456.00 USDC",
      entryPrice: "87,200.25",
      avgClosePrice: "92,009.25",
      closedAmount: "45,000.00",
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "#101018",
        color: "#E0E0E0",
      }}
      className="w-full min-h-screen font-sans select-none flex flex-col text-xs leading-normal"
    >
      {/* 1. TOP NAVIGATION BAR (Floating Frosted Glass Capsule) */}
      <header
        style={{
          background: "rgba(16, 16, 24, 0.85)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "inset 0 -1px 0 rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.35)",
        }}
        className="h-12 px-4 flex items-center justify-between gap-4 shrink-0 z-30"
      >
        {/* Left: Branding & Links */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center font-bold text-white text-[13px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
              S
            </div>
            <span className="font-bold text-sm tracking-tight text-[#F8F8F8]">SoDEX</span>
          </div>

          <nav className="hidden md:flex items-center gap-4 text-[#A8A8A8]">
            <a href="#trade" className="text-[#F8F8F8] font-medium transition-colors">Trade</a>
            <a href="#vault" className="hover:text-[#F8F8F8] transition-colors">Vault ▾</a>
            <a href="#portfolio" className="hover:text-[#F8F8F8] transition-colors">Portfolio ▾</a>
            <a href="#points" className="hover:text-[#F8F8F8] transition-colors">Points ▾</a>
            <a href="#leaderboard" className="hover:text-[#F8F8F8] transition-colors">Leaderboard ▾</a>
            <a href="#referrals" className="hover:text-[#F8F8F8] transition-colors">Referrals ▾</a>
            <a href="#more" className="hover:text-[#F8F8F8] transition-colors">More ▾</a>
          </nav>
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-4 py-1.5 rounded-full font-semibold text-xs text-[#101018] bg-[#F8F8F8] hover:bg-white transition-all shadow-[0_2px_8px_rgba(255,255,255,0.2)] cursor-pointer"
          >
            Deposit
          </button>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.15)",
            }}
            className="px-3 py-1 rounded-full text-[#E0E0E0] font-mono text-[11px] flex items-center gap-1.5"
          >
            <span className="text-[#F7931A]">🦊</span>
            <span>0x2c...E400</span>
            <span className="text-slate-500">▾</span>
          </div>
          <button
            type="button"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            className="px-3 py-1 rounded-full text-[#A8A8A8] hover:text-[#F8F8F8] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>⚛</span>
            <span>Research Terminal</span>
          </button>
        </div>
      </header>

      {/* 2. TICKER HEADER BAR */}
      <div
        style={{
          background: "#141419",
          borderBottom: "1px solid #242428",
        }}
        className="px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-[11px] shrink-0"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#A8A8A8] cursor-pointer">☆</span>
            <div className="w-5 h-5 rounded-full bg-[#F7931A] text-[#101018] flex items-center justify-center font-bold text-[10px]">
              ₿
            </div>
            <span className="font-bold text-sm text-[#F8F8F8]">BTC-USD</span>
            <span className="px-1.5 py-0.2 rounded bg-[#242428] text-[#00B887] font-mono font-medium">
              25x
            </span>
            <span className="text-base font-bold text-[#00B887] font-mono">
              93,226
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-5 text-[#A8A8A8]">
            <div>
              <span className="text-[#686870] block">Mark</span>
              <span className="font-mono text-[#E0E0E0]">93,228</span>
            </div>
            <div>
              <span className="text-[#686870] block">Index</span>
              <span className="font-mono text-[#E0E0E0]">92,524</span>
            </div>
            <div>
              <span className="text-[#686870] block">24H Change</span>
              <span className="font-mono text-[#00B887] font-semibold">+2,213.96 / +2.42%</span>
            </div>
            <div>
              <span className="text-[#686870] block">24H Volume</span>
              <span className="font-mono text-[#E0E0E0]">1,209,744.5</span>
            </div>
            <div>
              <span className="text-[#686870] block">Funding / Countdown</span>
              <span className="font-mono text-[#00B887]">+0.0012% 00:15:33</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE GRID */}
      <div className="flex-1 grid grid-cols-12 gap-[1px] bg-[#242428] overflow-hidden">
        {/* CENTER LEFT: CANDLESTICK CHART (7 cols) */}
        <section className="col-span-12 lg:col-span-7 bg-[#141419] flex flex-col min-h-[380px]">
          {/* Timeframe & Indicator Bar */}
          <div className="h-8 px-3 border-b border-[#242428] flex items-center justify-between text-[11px] text-[#A8A8A8]">
            <div className="flex items-center gap-2">
              {["1m", "5m", "15m", "30m", "1H", "4H", "1D", "1W"].map((tf, i) => (
                <button
                  key={tf}
                  type="button"
                  className={`px-1.5 py-0.5 rounded hover:text-[#F8F8F8] transition-colors ${
                    i === 2 ? "bg-[#242428] text-[#F8F8F8] font-bold" : ""
                  }`}
                >
                  {tf}
                </button>
              ))}
              <span className="text-[#303038]">|</span>
              <button type="button" className="hover:text-[#F8F8F8]">ƒx Indicators</button>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span>⛶</span>
              <span>⚙</span>
            </div>
          </div>

          {/* Simulated Candlestick Canvas */}
          <div className="flex-1 relative p-4 flex flex-col justify-between overflow-hidden bg-[radial-gradient(#25252D_1px,transparent_1px)] [background-size:24px_24px]">
            <div className="text-[11px] font-mono text-[#A8A8A8]">
              BTC/USDC · 1 · SoDEX <span className="text-[#00B887]">O 93296 H 93296 L 93296 C 93296 0 (0.00%)</span>
            </div>

            {/* Stylized SVG Candlesticks */}
            <svg className="w-full h-56" viewBox="0 0 600 220" preserveAspectRatio="none">
              <path
                d="M 10 150 L 50 120 L 90 140 L 130 90 L 170 110 L 210 60 L 250 80 L 290 50 L 330 110 L 370 70 L 410 130 L 450 100 L 490 150 L 530 140 L 570 110"
                fill="none"
                stroke="#00C087"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 10 150 L 50 120 L 90 140 L 130 90 L 170 110 L 210 60 L 250 80 L 290 50 L 330 110 L 370 70 L 410 130 L 450 100 L 490 150 L 530 140 L 570 110 L 570 220 L 10 220 Z"
                fill="url(#greenGrad)"
                opacity="0.15"
              />
              <defs>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00C087" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>

            {/* Price Line Badge */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#00B887] text-[#101018] font-mono font-bold px-2 py-0.5 rounded-l text-[10px]">
              93,296
            </div>
          </div>
        </section>

        {/* CENTER MIDDLE: ORDER BOOK (2 cols) */}
        <section className="col-span-12 sm:col-span-6 lg:col-span-2 bg-[#181820] flex flex-col border-l border-[#242428]">
          <div className="h-8 px-3 border-b border-[#242428] flex items-center justify-between text-[11px] font-medium text-[#A8A8A8]">
            <span className="text-[#F8F8F8] font-semibold">Order Book</span>
            <span>Market Trades</span>
          </div>

          <div className="grid grid-cols-3 text-[10px] text-[#686870] px-3 py-1 border-b border-[#242428]">
            <span>Price (USDC)</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Total</span>
          </div>

          {/* Asks (Sell) */}
          <div className="flex-1 flex flex-col justify-end gap-0.5 px-3 py-1 font-mono text-[10px]">
            {[
              { p: "93,228", a: "0.0375", t: "0.746", w: 75 },
              { p: "93,226", a: "0.0394", t: "0.667", w: 60 },
              { p: "93,224", a: "0.0436", t: "0.627", w: 55 },
              { p: "93,222", a: "0.0495", t: "0.536", w: 45 },
              { p: "93,220", a: "0.0566", t: "0.486", w: 40 },
            ].map((row, i) => (
              <div key={i} className="relative flex justify-between py-0.5 z-10">
                <div
                  style={{ width: `${row.w}%` }}
                  className="absolute right-0 top-0 bottom-0 bg-[#E03858]/15 -z-10"
                />
                <span className="text-[#D94B64]">{row.p}</span>
                <span className="text-right text-[#A8A8A8]">{row.a}</span>
                <span className="text-right text-[#686870]">{row.t}</span>
              </div>
            ))}
          </div>

          {/* Mid Market Spread */}
          <div className="px-3 py-1.5 my-1 bg-[#101018] border-y border-[#242428] flex items-center justify-between font-mono">
            <span className="text-sm font-bold text-[#00B887]">93,226 ↑</span>
            <span className="text-[10px] text-[#686870]">Spread 1 (0.0001%)</span>
          </div>

          {/* Bids (Buy) */}
          <div className="flex-1 flex flex-col gap-0.5 px-3 py-1 font-mono text-[10px]">
            {[
              { p: "93,200", a: "0.0819", t: "0.081", w: 25 },
              { p: "93,195", a: "0.1526", t: "0.234", w: 45 },
              { p: "93,194", a: "0.0691", t: "0.303", w: 60 },
              { p: "93,193", a: "0.0667", t: "0.370", w: 70 },
              { p: "93,192", a: "0.0564", t: "0.426", w: 85 },
            ].map((row, i) => (
              <div key={i} className="relative flex justify-between py-0.5 z-10">
                <div
                  style={{ width: `${row.w}%` }}
                  className="absolute right-0 top-0 bottom-0 bg-[#00B887]/15 -z-10"
                />
                <span className="text-[#00B887]">{row.p}</span>
                <span className="text-right text-[#A8A8A8]">{row.a}</span>
                <span className="text-right text-[#686870]">{row.t}</span>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT: TRADE EXECUTION MATRIX (3 cols) */}
        <section
          style={{
            background: "rgba(24, 24, 32, 0.8)",
            backdropFilter: "blur(14px)",
            boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.08)",
          }}
          className="col-span-12 sm:col-span-6 lg:col-span-3 p-4 flex flex-col gap-3.5 border-l border-[#242428]"
        >
          {/* Order Type Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#101018] rounded-lg border border-[#303038]">
            {(["Market", "Limit", "Advanced"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setOrderType(t)}
                className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all ${
                  orderType === t
                    ? "bg-[#242428] text-[#F8F8F8] shadow-sm font-semibold"
                    : "text-[#A8A8A8] hover:text-[#E0E0E0]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Leverage & Margin Mode */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-[#101018] p-2 rounded-lg border border-[#303038] flex justify-between">
              <span className="text-[#A8A8A8]">Cross</span>
              <span>▾</span>
            </div>
            <div className="bg-[#101018] p-2 rounded-lg border border-[#303038] flex justify-between font-mono font-bold text-[#F8F8F8]">
              <span>20x</span>
              <span>▾</span>
            </div>
          </div>

          {/* Direction Toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTradeSide("buy")}
              className={`py-2 rounded-lg font-bold text-xs transition-all ${
                tradeSide === "buy"
                  ? "bg-[#00B887] text-[#101018] shadow-[0_2px_12px_rgba(0,184,135,0.4)]"
                  : "bg-[#101018] text-[#A8A8A8] border border-[#303038] hover:text-[#00B887]"
              }`}
            >
              Buy / Long
            </button>
            <button
              type="button"
              onClick={() => setTradeSide("sell")}
              className={`py-2 rounded-lg font-bold text-xs transition-all ${
                tradeSide === "sell"
                  ? "bg-[#E03858] text-white shadow-[0_2px_12px_rgba(224,56,88,0.4)]"
                  : "bg-[#101018] text-[#A8A8A8] border border-[#303038] hover:text-[#E03858]"
              }`}
            >
              Sell / Short
            </button>
          </div>

          {/* Balance Metadata */}
          <div className="flex justify-between text-[11px] text-[#A8A8A8]">
            <span>Available to Trade</span>
            <span className="font-mono text-[#F8F8F8]">500 USDC ⟳</span>
          </div>

          {/* Amount Input */}
          <div className="bg-[#101018] p-2.5 rounded-lg border border-[#303038] flex justify-between items-center">
            <span className="text-[#686870]">Amount</span>
            <div className="flex items-center gap-1 font-mono font-bold text-[#F8F8F8]">
              <span>250</span>
              <span className="text-[#A8A8A8] text-[10px]">USDC ▾</span>
            </div>
          </div>

          {/* Slider */}
          <div className="flex flex-col gap-1.5">
            <input
              type="range"
              min={0}
              max={100}
              value={sliderVal}
              onChange={(e) => setSliderVal(parseInt(e.target.value, 10))}
              className="accent-[#E03858] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#686870] font-mono">
              <span>0%</span>
              <span>25%</span>
              <span className="text-[#E0E0E0] font-bold">50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Primary Action Button (Tactile Glass) */}
          <button
            type="button"
            style={{
              background: "linear-gradient(180deg, #E03858 0%, #C82A48 100%)",
              boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 4px 16px rgba(224, 56, 88, 0.4)",
            }}
            className="w-full py-3 rounded-xl font-bold text-sm text-white tracking-wide active:scale-[0.98] transition-transform cursor-pointer"
          >
            Sell / Short
          </button>

          {/* Fee & Margin Metrics */}
          <div className="pt-2 border-t border-[#303038] flex flex-col gap-1 text-[10px] text-[#A8A8A8]">
            <div className="flex justify-between">
              <span>Order Value</span>
              <span className="font-mono text-[#E0E0E0]">250.00 USDC</span>
            </div>
            <div className="flex justify-between">
              <span>Margin Required</span>
              <span className="font-mono text-[#E0E0E0]">0.00 USDC</span>
            </div>
            <div className="flex justify-between">
              <span>Liquidation Price</span>
              <span className="font-mono text-[#E0E0E0]">—</span>
            </div>
            <div className="flex justify-between">
              <span>Fees</span>
              <span className="font-mono text-[#E0E0E0]">0.045% / 0.015%</span>
            </div>
          </div>
        </section>
      </div>

      {/* 4. BOTTOM POSITION HISTORY & DATA TABLES */}
      <footer className="h-56 bg-[#181820] border-t border-[#242428] flex flex-col shrink-0">
        {/* Tab strip */}
        <div className="h-8 px-4 border-b border-[#242428] flex items-center justify-between text-[11px] text-[#A8A8A8]">
          <div className="flex items-center gap-4">
            {[
              "Balances",
              "Position",
              "Open Orders",
              "Trade History",
              "Funding History",
              "Order History",
              "Position History",
              "Deposits and Withdrawals",
            ].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-1.5 transition-colors ${
                  activeTab === tab
                    ? "text-[#F8F8F8] font-bold border-b-2 border-[#00B887]"
                    : "hover:text-[#E0E0E0]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[#686870]">
            <span>⏳</span>
            <span>⟳</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="text-[#686870] border-b border-[#242428] pb-1">
                <th className="pb-1 font-medium">Opened Time</th>
                <th className="pb-1 font-medium">Close Time</th>
                <th className="pb-1 font-medium">Coin</th>
                <th className="pb-1 font-medium">Direction</th>
                <th className="pb-1 font-medium text-right">Closing PnL</th>
                <th className="pb-1 font-medium text-right">Entry Price</th>
                <th className="pb-1 font-medium text-right">Avg Close Price</th>
                <th className="pb-1 font-medium text-right">Closed Amount</th>
              </tr>
            </thead>
            <tbody>
              {mockPositions.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-[#242428]/50 hover:bg-[#202025] transition-colors"
                >
                  <td className="py-2 text-[#A8A8A8]">{p.openedTime}</td>
                  <td className="py-2 text-[#A8A8A8]">{p.closeTime}</td>
                  <td className="py-2 flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#F7931A] text-[#101018] text-[9px] font-bold flex items-center justify-center">
                      ₿
                    </span>
                    <span className="text-[#E0E0E0]">{p.coin}</span>
                  </td>
                  <td className="py-2 text-[#00B887] font-semibold">{p.direction}</td>
                  <td className="py-2 text-right text-[#00B887] font-bold">{p.closingPnl}</td>
                  <td className="py-2 text-right text-[#E0E0E0]">{p.entryPrice}</td>
                  <td className="py-2 text-right text-[#E0E0E0]">{p.avgClosePrice}</td>
                  <td className="py-2 text-right text-[#E0E0E0]">{p.closedAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </footer>

      {/* 5. HUD STATUS STRIP */}
      <div
        style={{
          background: "#0A0A0D",
          borderTop: "1px solid #242428",
        }}
        className="h-6 px-4 flex items-center justify-between text-[10px] text-[#A8A8A8] font-mono shrink-0"
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[#00B887]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00B887]" />
            Stable connection
          </span>
          <span className="text-[#303038]">|</span>
          <span>SOSO: <strong className="text-[#00B887]">$0.6011 +0.09%</strong></span>
          <span>BTC: <strong className="text-[#E03858]">$92,075 -1.15%</strong></span>
          <span>BNB: <strong className="text-[#00B887]">$899.4 +1.21%</strong></span>
          <span>SOL: <strong className="text-[#E03858]">$137.98 -3.65%</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#686870]">Docs</span>
          <span className="text-[#686870]">Cookie</span>
          <span className="text-[#686870]">Support</span>
        </div>
      </div>
    </div>
  );
}

