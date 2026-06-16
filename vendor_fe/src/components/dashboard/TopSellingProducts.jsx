import { Trophy } from 'lucide-react'
import { TOP_SELLING_PRODUCTS } from '../../constants/topSellingProducts'
import ProductThumbnail from './ProductThumbnail'

const RANK_STYLES = {
  1: 'bg-amber-100 text-amber-800 ring-amber-200',
  2: 'bg-slate-200 text-slate-700 ring-slate-300',
  3: 'bg-orange-100 text-orange-800 ring-orange-200',
}

function RankBadge({ rank }) {
  const style = RANK_STYLES[rank] ?? 'bg-slate-100 text-slate-600 ring-slate-200'

  return (
    <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1 ${style}`}>
      {rank}
    </span>
  )
}

export default function TopSellingProducts() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.04)]">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
            <Trophy className="size-3.5" />
          </span>
          <h3 className="text-sm font-semibold text-slate-900">Top selling products</h3>
        </div>
        <p className="mt-1 text-xs text-slate-400">Best performers by units sold and revenue</p>
      </div>

      <div className="hidden grid-cols-[auto_auto_minmax(0,1.4fr)_auto_auto] gap-4 border-b border-slate-100 px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 md:grid">
        <span>Rank</span>
        <span>Product</span>
        <span>Name</span>
        <span className="text-right">Sold</span>
        <span className="text-right">Revenue</span>
      </div>

      <ul className="divide-y divide-slate-100">
        {TOP_SELLING_PRODUCTS.map((product) => (
          <li
            key={product.id}
            className="px-5 py-4 md:grid md:grid-cols-[auto_auto_minmax(0,1.4fr)_auto_auto] md:items-center md:gap-4"
          >
            <div className="flex items-center gap-3 md:contents">
              <RankBadge rank={product.rank} />
              <ProductThumbnail src={product.thumbnail} alt={product.name} />

              <div className="min-w-0 flex-1 md:col-span-1">
                <p className="truncate text-sm font-semibold text-slate-900">{product.name}</p>
                <div className="mt-2 flex items-center justify-between gap-3 md:hidden">
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{product.unitsSold}</span> sold
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    GH₵ {product.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-3 hidden text-right text-sm font-semibold text-slate-700 md:mt-0 md:block">
              {product.unitsSold.toLocaleString()}
            </p>

            <p className="hidden whitespace-nowrap text-right text-sm font-bold text-slate-900 md:block">
              GH₵ {product.revenue.toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
