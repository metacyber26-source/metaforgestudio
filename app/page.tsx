'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Box, Check, ChevronRight, Gem, Loader2, LockKeyhole, Sparkles, Upload, UserRound, WalletCards } from 'lucide-react'
import { PRODUCT_CONFIG } from '@/lib/product-config'

type PiProduct = { id: string; slug: string; name: string; description?: string; price_in_pi: number }
type RestoredPurchases = { purchases?: Array<{ productId: string; quantity: number }> }
type PiAuthState = { sdk: { makePurchase: (slug: string) => Promise<{ ok: boolean; productId?: string; paymentId?: string; txid?: string }>; authenticate?: () => Promise<unknown> }; products?: PiProduct[]; restoredPurchases?: RestoredPurchases; username?: string }

declare global { interface Window { SDKLite?: { init: () => Promise<PiAuthState['sdk']> } } }

function usePiAuth() {
  const [state, setState] = useState<PiAuthState>({ sdk: { makePurchase: async () => ({ ok: false }) } })
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    async function connect() {
      if (!window.SDKLite) { setLoading(false); return }
      const sdk = await window.SDKLite.init()
      if (sdk.authenticate) await sdk.authenticate()
      const next = sdk as PiAuthState['sdk'] & Partial<PiAuthState>
      if (active) { setState({ sdk, products: next.products, restoredPurchases: next.restoredPurchases, username: next.username }); setLoading(false) }
    }
    connect().catch(() => setLoading(false))
    return () => { active = false }
  }, [])
  return { ...state, loading }
}

export default function Page() {
  const auth = usePiAuth()
  const products = auth.products ?? []
  const product = products.find((item) => item.id === PRODUCT_CONFIG.PRODUCT_6a85a4ef749636eb2d8d7204)
  const [selected, setSelected] = useState<PiProduct | null>(null)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const quantity = auth.restoredPurchases?.purchases?.find((item) => item.productId === product?.slug)?.quantity ?? 0

  async function purchase(mode: 'Buy' | 'Rent') {
    if (!product) { setNotice('This asset is currently unavailable.'); return }
    setBusy(true); setNotice('')
    try {
      const result = await auth.sdk.makePurchase(product.slug)
      if (result.ok) setNotice(`${mode} confirmed. Reference ${result.txid ?? result.paymentId ?? 'received'}.`)
      else setNotice('The purchase could not be completed.')
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'purchase_error'
      setNotice(code === 'purchase_cancelled' ? 'Payment cancelled.' : code === 'product_not_found' ? 'This asset is unavailable.' : 'Payment failed. Please try again.')
    } finally { setBusy(false) }
  }

  const displayProduct = product ?? { id: PRODUCT_CONFIG.PRODUCT_6a85a4ef749636eb2d8d7204, slug: '', name: 'Nusantara Metaverse Asset', price_in_pi: 1, description: '3D Metaverse & Web3 digital asset.' }
  const categories = useMemo(() => ['Avatars', 'Vehicles', 'Fashion', 'Tools', 'Cultural Decor'], [])

  if (auth.loading) return <main className="min-h-screen bg-[#080b16] text-white grid place-items-center"><Loader2 className="animate-spin text-cyan-300" /></main>

  return <main className="min-h-screen bg-[#080b16] text-slate-100">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-10"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-cyan-300 text-[#080b16]"><Gem size={21} /></div><div><p className="font-semibold tracking-tight">MetaForge Studio</p><p className="text-xs text-slate-400">Create the worlds you imagine</p></div></div><div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs"><UserRound size={14} className="text-cyan-300" /> {auth.username ?? 'Pi Pioneer'}</div></header>
    <section className="mx-auto max-w-6xl px-5 pb-8 pt-8 lg:px-10 lg:pt-16"><div className="max-w-3xl"><div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-cyan-300"><Sparkles size={15} /> Creator marketplace</div><h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">Build your identity in the <span className="text-cyan-300">next dimension.</span></h1><p className="mt-5 max-w-xl text-pretty leading-7 text-slate-400">Generate, preview, and collect expressive digital assets for metaverse events, games, and communities.</p></div></section>
    <section className="mx-auto max-w-6xl px-5 pb-12 lg:px-10"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Featured drop</p><h2 className="mt-2 text-2xl font-semibold">Made for the archipelago</h2></div><span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">New</span></div><article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-cyan-950/20"><div className="grid lg:grid-cols-[1.1fr_1fr]"><div className="relative min-h-64 overflow-hidden bg-gradient-to-br from-cyan-400/30 via-blue-700/30 to-fuchsia-500/30 p-6"><div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '32px 32px' }} /><div className="relative flex h-full flex-col justify-between"><div className="flex items-center justify-between"><Box className="text-cyan-200" size={34} /><span className="rounded-full bg-black/30 px-3 py-1 text-xs text-cyan-100">3D asset</span></div><div><p className="text-3xl font-semibold text-white">Nusantara<br />Metaverse Asset</p><div className="mt-4 flex flex-wrap gap-2">{categories.map((tag) => <span key={tag} className="rounded-full bg-black/25 px-2.5 py-1 text-xs text-slate-200">{tag}</span>)}</div></div></div></div><div className="flex flex-col justify-between p-6 sm:p-8"><div><div className="flex items-center justify-between"><span className="text-sm text-slate-400">Featured asset</span><span className="flex items-center gap-1 text-xs text-emerald-300"><LockKeyhole size={13} /> Verified drop</span></div><h3 className="mt-3 text-2xl font-semibold">{displayProduct.name}</h3><p className="mt-3 leading-6 text-slate-400">{displayProduct.description ?? '3D Metaverse & Web3 digital asset for avatars, vehicles, fashion, tools, and cultural decor.'}</p></div><div className="mt-8 flex items-end justify-between"><div><p className="text-xs text-slate-500">From</p><p className="text-3xl font-semibold text-cyan-300">{displayProduct.price_in_pi.toFixed(1)} <span className="text-base">Pi</span></p>{quantity > 0 && <p className="mt-1 text-xs text-emerald-300">Owned quantity: {quantity}</p>}</div><button onClick={() => setSelected(displayProduct)} className="flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 font-semibold text-[#080b16] transition hover:bg-cyan-200">View asset <ChevronRight size={17} /></button></div></div></div></article></section>
    {notice && <p role="status" className="mx-auto mb-8 max-w-6xl px-5 text-sm text-cyan-200 lg:px-10">{notice}</p>}
    {selected && <div className="fixed inset-0 z-50 overflow-y-auto bg-[#080b16]/95 p-5 backdrop-blur-sm"><div className="mx-auto max-w-2xl py-5"><button onClick={() => setSelected(null)} className="mb-8 flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={17} /> Back to catalog</button><div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]"><div className="flex min-h-72 items-end bg-gradient-to-br from-cyan-400/30 via-blue-700/30 to-fuchsia-500/30 p-7"><div><span className="rounded-full bg-black/25 px-3 py-1 text-xs text-cyan-100">Nusantara collection</span><h2 className="mt-4 text-4xl font-semibold text-white">{selected.name}</h2></div></div><div className="p-6 sm:p-8"><p className="leading-7 text-slate-300">{selected.description ?? 'A versatile 3D Metaverse & Web3 digital asset for creative worlds and cultural storytelling.'}</p><div className="mt-7 flex items-center justify-between border-y border-white/10 py-5"><span className="text-sm text-slate-400">Price</span><strong className="text-3xl text-cyan-300">{selected.price_in_pi.toFixed(1)} Pi</strong></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><button disabled={busy || !product} onClick={() => purchase('Buy')} className="flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 font-semibold text-[#080b16] disabled:cursor-not-allowed disabled:opacity-50">{busy ? <Loader2 size={17} className="animate-spin" /> : <WalletCards size={17} />} Buy for {selected.price_in_pi.toFixed(1)} Pi</button><button disabled={busy || !product} onClick={() => purchase('Rent')} className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-300/10 px-4 py-3 font-semibold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"><Check size={17} /> Rent for {selected.price_in_pi.toFixed(1)} Pi</button></div>{!product && <p className="mt-4 text-center text-sm text-amber-300">This product is not available in the current Pi catalog.</p>}<p className="mt-5 text-center text-xs leading-5 text-slate-500">Revenue sharing: 80% creator · 10% ICP2E Blitar Raya · 10% developer</p></div></div></div></div>}
  </main>
}
