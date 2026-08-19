'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Box, Check, ChevronRight, Gem, Loader2, LockKeyhole, Sparkles, Upload, UserRound, WalletCards } from 'lucide-react'
import PRODUCT_CONFIG from '@/lib/product-config'

type PiProduct = { id: string; slug: string; name: string; description?: string; price_in_pi: number }
type RestoredPurchases = { purchases?: Array<{ productId: string; quantity: number }> }
type PiAuthState = { 
  sdk: { makePurchase: (slug: string) => Promise<{ ok: boolean; productId?: string; paymentId?: string; txid?: string }> }
  products?: PiProduct[]
  restoredPurchases?: RestoredPurchases
  username?: string
}

declare global {
  interface Window {
    SDKLite?: { init: () => Promise<PiAuthState['sdk']> }
    Pi?: any
  }
}

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
      if (active) { setState({ sdk, products: next.products, restoredPurchases: next.restoredPurchases, username: next.username }) }
    }
    connect().catch(() => setLoading(false))
    return () => { active = false }
  }, [])

  return { ...state, loading }
}

export default function Page() {
  const auth = usePiAuth()
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const products = auth.products ?? []
  const product = products.find((item) => item.id === PRODUCT_CONFIG.PRODUCT_6a85a4ef749636eb2d8d7204)
  const [selected, setSelected] = useState<PiProduct | null>(null)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const quantity = auth.restoredPurchases?.purchases?.find((item) => item.productId === product?.slug)?.quantity ?? 0

  // Efek untuk menangkap username jika sudah login via SDKLite
  useEffect(() => {
    if (auth.username) {
      setCurrentUser(auth.username)
    }
  }, [auth.username])

  // Fungsi Login Manual saat tombol di Header diklik
  const handleDirectPiLogin = async () => {
    if (typeof window !== 'undefined' && window.Pi) {
      try {
        window.Pi.init({ version: "2.0", sandbox: true })
        const res = await window.Pi.authenticate(
          ['username', 'payments'],
          (incompletePayment: any) => { console.log("Incomplete payment found:", incompletePayment) }
        )
        setCurrentUser(res.user.username)
        setNotice(`Login sukses! Selamat datang ${res.user.username}`)
      } catch (err) {
        console.error(err)
        setNotice("Gagal melakukan autentikasi Pi Network.")
      }
    } else {
      alert("Aplikasi ini harus dibuka dari dalam Pi Browser!")
    }
  }

  async function purchase(mode: 'Buy' | 'Rent') {
    if (!product) { setNotice('This asset is currently unavailable.'); return }
    setBusy(true)
    setNotice('')
    try {
      const result = await auth.sdk.makePurchase(product.slug)
      if (result.ok) setNotice(`${mode} confirmed. Reference ${result.txid ?? result.paymentId ?? 'received'}.`)
      else setNotice('The purchase could not be completed.')
    } catch (error: any) {
      const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'purchase_error'
      setNotice(code === 'purchase_cancelled' ? 'Payment cancelled.' : code === 'product_not_found' ? 'This asset is unavailable.' : 'Transaction error.')
    } finally { setBusy(false) }
  }

  const displayProduct = product ?? { id: PRODUCT_CONFIG.PRODUCT_6a85a4ef749636eb2d8d7204, slug: '', name: 'Nusantara Metaverse Asset', price_in_pi: 1.0 }
  const categories = useMemo(() => ['Avatars', 'Vehicles', 'Fashion', 'Tools', 'Cultural Decor'], [])

  if (auth.loading) return <main className="min-h-screen bg-[#080b16] text-white grid place-items-center"><Loader2 className="animate-spin text-cyan-400 h-8 w-8" /></main>

  return (
    <main className="min-h-screen bg-[#080b16] text-slate-100">
      {/* HEADER */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-10">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-500/10 text-cyan-400">
            <Gem className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-semibold text-white">MetaForge Studio</h1>
            <p className="text-xs text-slate-400">Create the worlds you imagine</p>
          </div>
        </div>
        
        {/* Tombol Pi Pioneer dengan handler login */}
        <button 
          onClick={handleDirectPiLogin}
          className="flex items-center gap-2 rounded-full bg-slate-800/80 px-4 py-2 text-xs font-medium text-slate-200 border border-slate-700/60 hover:bg-slate-700/60 transition"
        >
          <UserRound className="h-4 w-4 text-cyan-400" />
          <span>{currentUser ? currentUser : 'Pi Pioneer'}</span>
        </button>
      </header>

      {/* NOTIFIKASI */}
      {notice && (
        <div role="status" className="mx-auto mb-4 max-w-6xl px-5 text-sm text-cyan-300 lg:px-10 bg-cyan-950/40 p-3 rounded-lg border border-cyan-800/50">
          {notice}
        </div>
      )}

      {/* HERO SECTION */}
      <section className="mx-auto max-w-6xl px-5 pb-8 pt-8 lg:px-10 lg:pt-16">
        <div className="max-w-3xl">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-400 uppercase">
            <Sparkles className="h-4 w-4" /> CREATOR MARKETPLACE
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Build your identity in the <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">next dimension.</span>
          </h2>
          <p className="mt-4 text-slate-400 sm:text-lg">
            Generate, preview, and collect expressive digital assets for metaverse events, games, and communities.
          </p>
        </div>
      </section>

      {/* FEATURED DROP & PRODUCT CARD */}
      <section className="mx-auto max-w-6xl px-5 pb-12 lg:px-10">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">FEATURED DROP</p>
            <h3 className="text-xl font-bold text-white">Made for the archipelago</h3>
          </div>
          <span className="rounded-full bg-cyan-950 px-3 py-1 text-xs font-semibold text-cyan-400 border border-cyan-800/50">New</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center gap-2">
                <Box className="h-5 w-5 text-cyan-400" />
                <span className="text-xs text-slate-400 font-medium">3D Asset</span>
              </div>
              <h4 className="text-2xl font-bold text-white">{displayProduct.name}</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span key={cat} className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{cat}</span>
                ))}
              </div>
              <p className="text-sm text-slate-400">3D Metaverse & Web3 digital asset.</p>
            </div>

            <div className="w-full md:w-auto flex flex-col items-start md:items-end justify-between h-full gap-4">
              <div>
                <p className="text-xs text-slate-400">From</p>
                <p className="text-3xl font-extrabold text-white">{displayProduct.price_in_pi} <span className="text-cyan-400 text-xl">Pi</span></p>
              </div>
              <button
                onClick={() => setSelected(displayProduct)}
                className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
              >
                <span>View asset</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL / POP-UP PREVIEW ASSET */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080b16]/80 p-5 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <button onClick={() => setSelected(null)} className="mb-4 flex items-center gap-1 text-xs text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back to store
            </button>
            
            <h3 className="text-2xl font-bold text-white">{selected.name}</h3>
            <p className="mt-2 text-sm text-slate-400">{selected.description ?? '3D Metaverse & Web3 digital asset.'}</p>
            
            <div className="my-6 rounded-xl bg-slate-950 p-4 border border-slate-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Price</span>
                <span className="font-bold text-white text-lg">{selected.price_in_pi} Pi</span>
              </div>
              {quantity > 0 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-cyan-400">
                  <Check className="h-4 w-4" /> Purchased quantity: {quantity}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={busy || !product}
                onClick={() => purchase('Buy')}
                className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <WalletCards className="h-4 w-4" />}
                Buy Now
              </button>
              <button
                disabled={busy || !product}
                onClick={() => purchase('Rent')}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50 border border-slate-700"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                Rent Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

