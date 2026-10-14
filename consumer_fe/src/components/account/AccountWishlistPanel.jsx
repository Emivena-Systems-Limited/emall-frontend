import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'
import {
  ChevronRight, Eye, Heart, Loader2, PackageCheck,
  ShoppingCart, Trash2, X,
} from 'lucide-react'
import { accountSectionMeta } from './accountNavigation'
import CatalogLineItemCard from '../shared/CatalogLineItemCard'
import Images from '../../utils/Images'
import { notify } from '../../lib/notify'
import { getProductById } from '../../services/landingPageService'
import { syncAuthenticatedCart } from '../../hooks/useAuthenticatedCart'
import { AUTHENTICATED_CART_QUERY_KEY } from '../../constants/cart'
import {
  bulkDeleteWishlistItems,
  clearWishlist,
  getUserWishlist,
  getWishlistItem,
  moveAllWishlistItemsToCart,
  moveWishlistItemToCart,
  removeFromWishlist,
  updateWishlistVariant,
} from '../../services/wishlistService'

const QUERY_KEY = ['user-wishlist']

function EmptyWishlist() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex min-h-112 flex-col items-center justify-center px-6 py-14 text-center sm:py-16">
        <img src={Images.common.wishlist_empty} alt="" width={199} height={136} className="h-34 w-auto max-w-50 object-contain" />
        <h3 className="mt-8 text-xl font-bold text-slate-950">Your wishlist is empty</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Save items you love and find them here anytime.</p>
        <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-auth-primary px-6 py-3.5 text-sm font-bold text-white transition hover:bg-auth-primary-hover">Continue Shopping <ChevronRight className="size-4" /></Link>
      </div>
    </div>
  )
}

function WishlistSkeleton() {
  return (
    <div className="space-y-3 sm:space-y-4">
      {[1, 2, 3].map((key) => (
        <div
          key={key}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white px-3.5 py-4 sm:px-5 sm:py-6"
        >
          <div className="flex items-start gap-3 sm:gap-5">
            <div className="size-[4.5rem] shrink-0 rounded-xl bg-slate-200 sm:size-28 sm:rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-2 py-1">
              <div className="h-4 w-4/5 rounded bg-slate-200" />
              <div className="h-3 w-2/5 rounded bg-slate-100" />
              <div className="mt-6 flex justify-between gap-4">
                <div className="h-8 w-28 rounded-full bg-slate-100" />
                <div className="h-6 w-20 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function BusyButton({ busy, children, ...props }) {
  return <button {...props} disabled={busy || props.disabled}>{busy ? <Loader2 className="size-4 animate-spin" /> : null}{children}</button>
}

function ItemDetailsModal({ itemId, onClose }) {
  const { data, isPending, isError } = useQuery({
    queryKey: ['wishlist-item', itemId], queryFn: () => getWishlistItem(itemId), enabled: Boolean(itemId),
  })
  const item = Array.isArray(data) ? data.flat(Infinity)[0] : data
  return (
    <div className="fixed inset-0 z-70 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Wishlist item details">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-auth-primary">Saved item</p><h3 className="mt-1 text-xl font-bold text-slate-950">Wishlist details</h3></div><button onClick={onClose} aria-label="Close details" className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-500"><X className="size-4" /></button></div>
        {isPending ? <div className="grid min-h-44 place-items-center"><Loader2 className="size-7 animate-spin text-auth-primary" /></div> : null}
        {isError ? <p className="py-12 text-center text-sm text-red-600">Unable to load this wishlist item.</p> : null}
        {!isPending && !isError ? <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-5 text-sm"><p><span className="font-bold">Item ID:</span> {item?.id ?? itemId}</p><p><span className="font-bold">Product:</span> {item?.product?.name ?? 'Not available'}</p><p><span className="font-bold">Variant:</span> {item?.variant?.variant_name ?? 'Default'}</p><p><span className="font-bold">SKU:</span> {item?.variant?.sku ?? 'Not available'}</p><p><span className="font-bold">Saved:</span> {item?.created_at ? new Date(item.created_at).toLocaleString() : 'Not available'}</p></div> : null}
      </div>
    </div>
  )
}

function VariantSelector({ item, onUpdate, busy }) {
  const productId = item.product?.id
  const { data } = useQuery({ queryKey: ['wishlist-product-variants', productId], queryFn: () => getProductById(productId), enabled: Boolean(productId), staleTime: 300000 })
  const variants = data?.variants ?? []
  if (variants.length < 2) return item.variant?.variant_name ? <p className="mt-1 text-[11px] text-slate-500">Variant: {item.variant.variant_name}</p> : null
  return (
    <label className="mt-1 block text-[11px] text-slate-500">Variant
      <select value={item.variant?.id ?? ''} disabled={busy} onChange={(event) => onUpdate(item.id, event.target.value)} className="mt-0.5 block max-w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 outline-none focus:border-auth-primary">
        {variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.variant_name ?? variant.value ?? variant.sku}</option>)}
      </select>
    </label>
  )
}

function WishlistItem({ item, selected, onSelect, onRemove, onMove, onDetails, onVariant, busyAction }) {
  const product = item.product ?? {}
  const variant = item.variant ?? {}
  const [quantity, setQuantity] = useState(Math.max(1, Number(item.quantity) || 1))
  const price = Number(variant.discount_price ?? variant.price ?? product.regular_discount_price ?? product.regular_price ?? 0)
  const listPrice = Number(variant.price ?? product.regular_price ?? price)
  const image = variant.images?.[0]?.image_url
    ?? product.images?.find((entry) => entry.is_primary)?.image_url
    ?? product.images?.[0]?.image_url
  const href = `/${product.slug ?? ''}`
  const busy = Boolean(busyAction)

  return (
    <CatalogLineItemCard
      name={product.name ?? 'Saved product'}
      href={href}
      image={image}
      imageFallback={<Heart className="size-8" />}
      selectable
      showCheckboxOnMobile
      selected={selected}
      onSelect={() => onSelect(item.id)}
      quantity={quantity}
      onQuantityChange={setQuantity}
      unitPrice={price}
      lineTotal={price * quantity}
      comparePrice={listPrice > price ? listPrice : undefined}
      meta={(
        <div className="mt-1">
          <VariantSelector item={item} onUpdate={onVariant} busy={busyAction === `variant:${item.id}`} />
          {variant.sku ? <p className="mt-0.5 text-xs text-slate-400">SKU: {variant.sku}</p> : null}
        </div>
      )}
      actions={[
        { id: 'details', label: 'Details', icon: Eye, onClick: () => onDetails(item.id) },
        {
          id: 'move',
          label: 'Move to cart',
          icon: ShoppingCart,
          onClick: () => onMove(item.id),
          disabled: busy,
        },
        {
          id: 'remove',
          label: 'Remove',
          icon: Trash2,
          onClick: () => onRemove(item.id),
          disabled: busy,
        },
      ]}
    />
  )
}

export default function AccountWishlistPanel() {
  const meta = accountSectionMeta.wishlist
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const [selected, setSelected] = useState([])
  const [busyAction, setBusyAction] = useState('')
  const [detailsId, setDetailsId] = useState(null)

  const { data: items = [], isPending, isError, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getUserWishlist,
    refetchOnMount: 'always',
  })

  const refresh = async () => {
    setSelected([])
    queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: ['cart'] })
    queryClient.invalidateQueries({ queryKey: AUTHENTICATED_CART_QUERY_KEY })
    if (isAuthenticated) {
      try {
        await syncAuthenticatedCart(dispatch, 'replace')
      } catch (err) {
        if (import.meta.env.DEV) console.warn('[wishlist] cart sync error', err)
      }
    }
  }

  const actionMutation = useMutation({
    mutationFn: async ({ type, id, ids, variantId }) => {
      setBusyAction(id ? `${type}:${id}` : type)
      if (type === 'remove') return removeFromWishlist(id)
      if (type === 'move') return moveWishlistItemToCart(id)
      if (type === 'moveAll') return moveAllWishlistItemsToCart()
      if (type === 'bulkDelete') return bulkDeleteWishlistItems(ids)
      if (type === 'clear') return clearWishlist()
      if (type === 'variant') return updateWishlistVariant(id, variantId)
      return null
    },
    onSuccess: async (_, variables) => {
      await refresh()
      notify.success(
        variables.type === 'variant'
          ? 'Wishlist variant updated'
          : variables.type === 'move' || variables.type === 'moveAll'
            ? 'Moved to cart'
            : variables.type === 'remove'
              ? 'Removed from wishlist'
              : 'Wishlist updated',
      )
    },
    onError: (error) => notify.fromError(error, 'Wishlist action failed'),
    onSettled: () => setBusyAction(''),
  })
  const allSelected = items.length > 0 && selected.length === items.length
  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])
  const toolbarActions = useMemo(() => [
    { key: 'moveAll', label: 'Move all to cart', icon: ShoppingCart, primary: true },
    { key: 'bulkDelete', label: `Remove selected${selected.length ? ` (${selected.length})` : ''}`, icon: Trash2, disabled: !selected.length },
    { key: 'clear', label: 'Clear wishlist', icon: PackageCheck, danger: true },
  ], [selected.length])
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return <section><div><p className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-auth-primary">Saved products</p><h2 className="mt-1 text-lg font-bold tracking-tight text-slate-950 sm:text-xl">{meta.title}</h2><p className="mt-1.5 max-w-2xl text-xs text-slate-500 sm:text-sm">{meta.description}</p></div>
    <div className="mt-5">{isPending ? <WishlistSkeleton /> : null}{isError ? <div className="rounded-2xl border border-red-100 bg-white px-6 py-16 text-center"><p className="font-bold">We couldn’t load your wishlist.</p><button onClick={() => refetch()} className="mt-4 rounded-xl bg-auth-primary px-5 py-2.5 text-sm font-bold text-white">Try again</button></div> : null}{!isPending && !isError && !items.length ? <EmptyWishlist /> : null}
      {!isPending && !isError && items.length ? (
        <>
          <div className="mb-3 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => setSelected(allSelected ? [] : items.map((item) => item.id))}
                className="size-4 accent-red-600"
              />
              Select all
            </label>
            <div className="flex flex-wrap gap-2">
              {toolbarActions.map(({ key, label, icon: Icon, disabled, primary, danger }) => (
                <BusyButton
                  key={key}
                  busy={busyAction === key}
                  disabled={disabled || Boolean(busyAction)}
                  onClick={() => actionMutation.mutate({ type: key, ids: selected })}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition disabled:opacity-40 ${
                    primary
                      ? 'bg-auth-primary text-white'
                      : danger
                        ? 'border border-red-200 text-red-700'
                        : 'border border-slate-200 text-slate-700'
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </BusyButton>
              ))}
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {items.map((item) => (
              <WishlistItem
                key={item.id}
                item={item}
                selected={selected.includes(item.id)}
                onSelect={toggle}
                onDetails={setDetailsId}
                onRemove={(id) => actionMutation.mutate({ type: 'remove', id })}
                onMove={(id) => actionMutation.mutate({ type: 'move', id })}
                onVariant={(id, variantId) => actionMutation.mutate({ type: 'variant', id, variantId })}
                busyAction={busyAction}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
    {detailsId ? <ItemDetailsModal itemId={detailsId} onClose={() => setDetailsId(null)} /> : null}
  </section>
}
