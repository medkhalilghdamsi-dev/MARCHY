import { useMemo, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Banknote, CalendarDays, Download, FileText, Info, Landmark, RefreshCw, Search, ShieldCheck, Wallet } from 'lucide-react'

const PROFILE_KEY = 'marchy-seller-onboarding-draft-v1'
const FILTERS = ['All activity', 'Sales', 'Fees', 'Refunds', 'Adjustments']
const money = value => `${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND`
const dateLabel = value => new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })

const illustrativeRows = [
  { id: 'DEMO-1048', date: '2026-10-28T10:30:00.000Z', kind: 'sale', label: 'Order sale · sample order', reference: 'ORD-DEMO-1048', gross: 289.000, fee: 28.900, net: 260.100, status: 'Pending settlement', channel: 'Cash on delivery' },
  { id: 'DEMO-1047', date: '2026-10-26T14:10:00.000Z', kind: 'sale', label: 'Order sale · sample order', reference: 'ORD-DEMO-1047', gross: 165.500, fee: 16.550, net: 148.950, status: 'In transit', channel: 'Online payment' },
  { id: 'DEMO-FEE-31', date: '2026-10-26T14:10:00.000Z', kind: 'fee', label: 'Marketplace commission · example', reference: 'ORD-DEMO-1047', gross: 0, fee: 16.550, net: -16.550, status: 'Recorded', channel: 'Platform fee' },
  { id: 'DEMO-1042', date: '2026-10-22T09:05:00.000Z', kind: 'sale', label: 'Order sale · sample order', reference: 'ORD-DEMO-1042', gross: 420.000, fee: 42.000, net: 378.000, status: 'Settled · example only', channel: 'Cash on delivery' },
  { id: 'DEMO-REF-08', date: '2026-10-21T11:40:00.000Z', kind: 'refund', label: 'Refund adjustment · example', reference: 'RET-DEMO-008', gross: 0, fee: 0, net: -55.000, status: 'Review only', channel: 'Refund review' }
]

export function SellerFinanceWorkspace() {
  const [profile] = useState(() => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') } catch { return {} } })
  const [filter, setFilter] = useState('All activity')
  const [query, setQuery] = useState('')
  const [period, setPeriod] = useState('30 days')
  const [tab, setTab] = useState('ledger')
  const rows = useMemo(() => illustrativeRows.filter(row => {
    const typeMatch = filter === 'All activity' || (filter === 'Sales' && row.kind === 'sale') || (filter === 'Fees' && row.kind === 'fee') || (filter === 'Refunds' && row.kind === 'refund') || (filter === 'Adjustments' && row.kind === 'adjustment')
    return typeMatch && [row.id, row.label, row.reference, row.channel].join(' ').toLowerCase().includes(query.toLowerCase())
  }), [filter, query])
  const totals = useMemo(() => illustrativeRows.reduce((acc, row) => ({ gross: acc.gross + row.gross, fees: acc.fees + row.fee, net: acc.net + row.net }), { gross: 0, fees: 0, net: 0 }), [])
  const exportCsv = () => {
    const header = ['Date', 'Reference', 'Description', 'Gross TND', 'Fees TND', 'Net TND', 'Status']
    const lines = rows.map(row => [row.date, row.reference, row.label, row.gross, row.fee, row.net, row.status].map(value => `"${String(value).replaceAll('"', '""')}"`).join(','))
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'marchy-finance-demo-ledger.csv'
    link.click()
    URL.revokeObjectURL(url)
  }
  const storeName = (profile.storeName || '').trim()
  return <section className="sc-finance">
    <header className="sc-finance-head"><div><span className="eyebrow">SELLER FINANCIAL CENTRE</span><h3>Finance & settlements</h3><p>Understand order proceeds, platform fees, COD movement and settlement records.</p></div><span className="sc-finance-demo"><Info size={14}/> ILLUSTRATIVE DEMO DATA</span></header>
    <div className="sc-finance-alert"><ShieldCheck size={17}/><span><b>Demo workspace — not a financial statement.</b> Every amount and transaction below is illustrative. No real seller balance, COD collection, payout, refund or bank connection is available in this prototype.</span></div>
    {!store && <div className="sc-finance-profile"><Wallet size={18}/> Add a storefront name in Business profile to prepare this seller workspace. The sample figures remain examples only.</div>}
    <div className="sc-finance-period"><div><b>Example activity</b><span>Sample reporting period</span></div><select value={period} onChange={e => setPeriod(e.target.value)} aria-label="Reporting period"><option>30 days</option><option>90 days</option><option>This year</option><option>All time</option></select></div>
    <div className="sc-finance-metrics">
      <article><span><Wallet size={16}/> Example gross sales</span><b>{money(totals.gross)}</b><small>Illustrative order value only</small></article>
      <article><span><Landmark size={16}/> Example platform fees</span><b>{money(totals.fees)}</b><small>Not a confirmed commission rate</small></article>
      <article><span><Banknote size={16}/> Example net proceeds</span><b>{money(totals.net)}</b><small>Not an amount payable to you</small></article>
      <article><span><CalendarDays size={16}/> Next settlement</span><b>Not scheduled</b><small>Requires live finance integration</small></article>
    </div>
    <div className="sc-finance-tabs" role="tablist" aria-label="Finance sections"><button type="button" role="tab" aria-selected={tab === 'ledger'} className={tab === 'ledger' ? 'active' : ''} onClick={() => setTab('ledger')}>Transaction ledger</button><button type="button" role="tab" aria-selected={tab === 'cod'} className={tab === 'cod' ? 'active' : ''} onClick={() => setTab('cod')}>COD reconciliation</button><button type="button" role="tab" aria-selected={tab === 'payouts'} className={tab === 'payouts' ? 'active' : ''} onClick={() => setTab('payouts')}>Settlements & payouts</button></div>
    {tab === 'ledger' && <div className="sc-finance-panel"><div className="sc-finance-toolbar"><label><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search reference or activity"/></label><select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter transactions">{FILTERS.map(item => <option key={item}>{item}</option>)}</select><button type="button" onClick={exportCsv}><Download size={15}/> Export CSV</button></div><div className="sc-finance-table-wrap"><table className="sc-finance-table"><thead><tr><th>Activity</th><th>Reference</th><th>Date</th><th>Gross</th><th>Fees</th><th>Net movement</th><th>Status</th></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><span className="sc-finance-activity">{row.kind === 'sale' ? <ArrowDownLeft size={15}/> : <ArrowUpRight size={15}/>}<span><b>{row.label}</b><small>{row.channel}</small></span></span></td><td>{row.reference}</td><td>{dateLabel(row.date)}</td><td>{row.gross ? money(row.gross) : '—'}</td><td>{row.fee ? money(row.fee) : '—'}</td><td className={row.net < 0 ? 'negative' : 'positive'}>{money(row.net)}</td><td><span className="sc-finance-status">{row.status}</span></td></tr>)}</tbody></table>{!rows.length && <div className="sc-finance-empty">No example activity matches this filter.</div>}</div><p className="sc-finance-footnote">Ledger examples are not posted accounting entries. In production, posted journal entries must be immutable; corrections must use linked reversals or adjustments.</p></div>}
    {tab === 'cod' && <div className="sc-finance-panel sc-finance-cod"><div className="sc-finance-empty-icon"><RefreshCw size={23}/></div><div><h4>Cash-on-delivery reconciliation</h4><p>COD follows separate operational events: buyer cash collection, courier remittance, platform reconciliation and seller settlement. A delivered order does not mean the courier has remitted the cash.</p></div><div className="sc-finance-cod-grid"><article><small>Cash collected</small><b>Not connected</b></article><article><small>Courier remitted</small><b>Not connected</b></article><article><small>Unmatched amount</small><b>Not calculated</b></article></div><div className="sc-finance-rule"><Info size={15}/> Live reconciliation requires carrier statements, shipment references, collection proof, remittance batches and an auditable discrepancy workflow.</div></div>}
    {tab === 'payouts' && <div className="sc-finance-panel sc-finance-payouts"><div className="sc-finance-empty-icon"><Landmark size={23}/></div><div><h4>No live settlement account connected</h4><p>When finance onboarding is available, approved sellers will see verified payout destinations, settlement batches, deductions, holds and remittance references here.</p></div><div className="sc-finance-payout-row"><span><b>Settlement schedule</b><small>Configured by MARCHY finance policy</small></span><strong>Not configured</strong></div><div className="sc-finance-payout-row"><span><b>Payout destination</b><small>Requires secure verification outside this demo</small></span><strong>Not connected</strong></div><div className="sc-finance-payout-row"><span><b>Latest payout</b><small>No real payout records are available</small></span><strong>—</strong></div></div>}
  </section>
}
