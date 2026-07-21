import { ProductInput, ProductMoneyInput } from '../products/ProductFormControls'
import VariantImageUpload from '../products/VariantImageUpload'
import VariantPricingSummary from '../products/VariantPricingSummary'
import { formatMoney, resolveVariantPricing } from '../../utils/productPricing'
import CardStepHeader from './CardStepHeader'
import VariantCompatibleModelsSection from './VariantCompatibleModelsSection'
import VariantIdentitySection from './VariantIdentitySection'
import { MAX_VARIANT_IMAGE_COUNT } from './variantConstants'
import { svFieldError } from './variantFormUtils'

/** Steps shared between the single-variant form and the add-variant details drawer: photo, identity/specs, pricing, stock, compatible models. */
export default function VariantDetailFields({ formik, productValues, isCustomPrice, setIsCustomPrice, mainQty, startStep = 3 }) {
  const pricing = resolveVariantPricing(formik.values, productValues)

  return (
    <>
      {/* Step: Images */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
        <CardStepHeader
          step={startStep}
          title="Add a photo for this value"
          subtitle="Shown to customers when they select this option."
          required
        />
        <div data-field="images">
          <VariantImageUpload
            label="Variant image"
            hint="JPG or PNG · Max 5MB"
            images={formik.values.images}
            maxImages={MAX_VARIANT_IMAGE_COUNT}
            thumbnailSizeClass="size-20 sm:size-24"
            onChange={(images) => {
              formik.setFieldValue('images', images)
              formik.setFieldTouched('images', true, false)
            }}
            error={svFieldError(formik, 'images')}
          />
        </div>
      </div>

      {/* Step: Identity & specs */}
      <VariantIdentitySection formik={formik} step={startStep + 1} />

      {/* Step: Pricing */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
        <CardStepHeader
          step={startStep + 2}
          title="Pricing"
          subtitle="Use the base product's price, or set a custom price just for this value."
        />
        <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setIsCustomPrice(false)
              formik.setFieldValue('price', '')
              formik.setFieldValue('discount_price', '')
            }}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              !isCustomPrice ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Use base price
          </button>
          <button
            type="button"
            onClick={() => setIsCustomPrice(true)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              isCustomPrice ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Custom price
          </button>
        </div>

        {isCustomPrice && (
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <ProductMoneyInput
              id="price"
              name="price"
              label="Regular price (GH₵)"
              hint={`Base product: GH₵ ${formatMoney(pricing.parent.regularPrice)}`}
              reserveHintSpace
              placeholder={formatMoney(pricing.parent.regularPrice)}
              value={formik.values.price}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={svFieldError(formik, 'price')}
            />
            <ProductMoneyInput
              id="discount_price"
              name="discount_price"
              label="Sale price (GH₵)"
              hint="Leave empty to inherit base sale price."
              reserveHintSpace
              optional
              placeholder={
                pricing.parent.salePrice != null
                  ? formatMoney(pricing.parent.salePrice)
                  : 'No base sale price'
              }
              value={formik.values.discount_price}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={svFieldError(formik, 'discount_price')}
            />
          </div>
        )}

        <VariantPricingSummary variantValue={formik.values} productValues={productValues} />
      </div>

      {/* Step: Stock */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-6">
        <CardStepHeader step={startStep + 3} title="Stock quantity" required />
        <div className="grid items-stretch gap-4 sm:grid-cols-1 lg:max-w-xs">
          <ProductInput
            id="quantity"
            name="quantity"
            type="number"
            label="Units in stock"
            hint={
              mainQty != null
                ? `Max ${mainQty} units (main product stock).`
                : 'Set main stock on the product first.'
            }
            placeholder="0"
            value={formik.values.quantity}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={svFieldError(formik, 'quantity')}
          />
          {/* Reserved quantity and low stock alert hidden for variant add/edit for now. */}
        </div>
      </div>

      {/* Step: Compatible models */}
      <VariantCompatibleModelsSection formik={formik} step={startStep + 4} />
    </>
  )
}
