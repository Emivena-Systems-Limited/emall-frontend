/**
 * Living application documentation for consumer_fe.
 *
 * Update this file whenever you add routes, slices, hooks, API integrations,
 * or ship a feature. The Developer Guide page reads from here automatically.
 */

export const appMeta = {
  lastUpdated: '2026-06-21',
  currentPhase: 'Homepage landing API',
  summary:
    'Public home landing at / uses Laravel landing-page data where available. Auth flows call the Laravel API, then authenticated users return to the landing page with a session dropdown and logout. Cart flows continue to checkout, and product cards open a responsive product details page.',
}

export const updateInstructions = [
  'Add a progressLog entry when you finish a meaningful chunk of work.',
  'Register new routes in routes[] as you add them to AppRoutes.jsx.',
  'Update authFlow when login/register/verify behaviour changes.',
  'Register Redux slices, query hooks, and API endpoints in their respective arrays.',
  'Move roadmap items from planned → in-progress → done as you build.',
]

export const progressLog = [
  {
    date: '2026-06-22',
    title: 'Cart and product details mobile responsiveness',
    items: [
      'Improved /cart mobile row spacing, product image sizing, rail spacing, and delivery modal scrolling',
      'Improved /:slug mobile swatches, action buttons, review wrapping, product rails, and section padding',
      'Verified both pages still build successfully after responsive adjustments',
    ],
  },
  {
    date: '2026-06-22',
    title: 'Product details UI alignment',
    items: [
      'Adjusted /:slug layout to more closely match the supplied product details UI',
      'Updated product info panel with compact pricing, image colour swatches, compatible model chips, stock note, and purchase buttons',
      'Reworked review, seller, description, product image, and horizontal product rail styling to match the provided design',
      'Kept changes scoped to the existing product details page sections',
    ],
  },
  {
    date: '2026-06-22',
    title: 'Cart page UI alignment',
    items: [
      'Updated /cart to match the provided cart UI with shopping cart table, saved items table, order total, and product rails',
      'Added cart item row details: free delivery tag, seller link, rating, delete, save for later/add to cart, and share actions',
      'Added delivery information modal opened from the order total section',
      'Kept the implementation scoped to consumer_fe cart UI only',
    ],
  },
  {
    date: '2026-06-21',
    title: 'Top Categories View All page',
    items: [
      'Added /categories page for all parent categories',
      'Homepage Top Categories now always displays only the first 10 categories',
      'Top Categories View All now navigates to /categories instead of expanding inline',
      'Categories page uses GET /category/get_parents first and static categories as fallback',
    ],
  },
  {
    date: '2026-06-21',
    title: 'Homepage View All product pages',
    items: [
      'Added reusable ProductListingPage for homepage product buckets',
      'Added /products, /products/recommended, /products/best-sellers, /products/flash-sales, and /products/explore routes',
      'Homepage View All links now route to their respective product listing pages',
      'Listing pages use landing-page API products first and existing static products as fallback',
    ],
  },
  {
    date: '2026-06-21',
    title: 'Homepage product API sections',
    items: [
      'Added GET /landing-page/home service and useLandingPageData React Query hook',
      'Recommended For You now uses recommended_products when the backend returns items',
      'Best Sellers now uses best_sellers when the backend returns items',
      'Flash Sales now uses flash_sales when the backend returns items',
      'Explore Your Interests now uses random_products when the backend returns items',
      'Static product grids remain as fallback because the current backend product arrays are empty',
    ],
  },
  {
    date: '2026-06-20',
    title: 'Homepage category API',
    items: [
      'Top Categories now fetches parent categories from GET /category/get_parents through API_BASE_URL, matching the backend /api/category/get_parents path',
      'Homepage shows the first 10 categories by default',
      'View All expands the category list inline and Show Less returns to the first 10',
      'Static category thumbnails remain as a fallback when the API category does not include an image',
    ],
  },
  {
    date: '2026-06-18',
    title: 'Product details page',
    items: [
      'Added /:slug product details page with image gallery, thumbnails, product information, variants, stock status, quantity selector, and purchase buttons',
      'Added ratings, review summary, rating distribution, review cards, seller showcase, product description, and related product rails',
      'Landing product cards now open product details while the cart icon still navigates to the cart',
    ],
  },
  {
    date: '2026-06-17',
    title: 'Checkout page',
    items: [
      'Added responsive /checkout page with guest and user checkout states',
      'Added delivery address section with Add Address / Edit actions that route to the address page placeholder',
      'Grouped checkout items by store with store subtotals, delivery fees, and store totals',
      'Added promo code handling, order total breakdown, payment method selection, and disabled Place Order rules',
      'Cart Proceed to checkout now navigates to /checkout',
    ],
  },
  {
    date: '2026-06-16',
    title: 'Registration OTP cleanup',
    items: [
      'Removed the extra POST /user/auth/login call after successful registration',
      'Registration now relies on POST /user/auth/register to create the account and trigger the registration OTP',
      'Register continues directly to /register/verify after successful account creation',
    ],
  },
  {
    date: '2026-06-15',
    title: 'Auth route guards',
    items: [
      'Added GuestOnlyRoute wrapper for authentication entry routes',
      'Authenticated users are redirected to / when they try to access /login, /login/verify, /register, or /register/verify',
      'Guard uses persisted Redux auth state after PersistGate rehydration',
    ],
  },
  {
    date: '2026-06-15',
    title: 'Cart page',
    items: [
      'Added responsive /cart page with My Cart heading, item rows, product images, prices, quantities, remove actions, and item subtotals',
      'Added Select all items / Deselect all items behavior with item checkboxes',
      'Cart summary updates item count, subtotal, red discount value, and total when quantities or items change',
      'Homepage ProductCard links now open /cart for homepage product clicks',
      'Related products display below the cart using existing product card styling',
    ],
  },
  {
    date: '2026-06-11',
    title: 'Post-auth landing polish',
    items: [
      'Login and registration OTP success now redirect authenticated users to the landing page',
      'My Account remains available from the authenticated navbar dropdown',
      'Registration requires the terms and conditions checkbox before submit, but terms are not sent in the auth API payload',
      'Backend SQL exception messages are sanitized before showing auth toasts',
      'Expired or unavailable OTP responses show a direct request-new-code message',
      'Duplicate active OTP responses continue to the verify page and tell users to use the existing code',
    ],
  },
  {
    date: '2026-06-11',
    title: 'Registration location polish',
    items: [
      'Expanded selectable cities and districts across all 16 Ghana regions',
      'Corrected the Ghana phone prefix flag to red, gold, and green with the black star',
      'Kept Other options for manual city or district entry where needed',
    ],
  },
  {
    date: '2026-06-11',
    title: 'Account page & authenticated navbar',
    items: [
      'OTP success stores authenticated users and exposes My Account from the navbar dropdown',
      'Added protected My Account page with dashboard shortcuts',
      'Navbar shows My Account dropdown instead of Sign In/Register when authenticated',
      'Logout calls the backend when available and always clears the persisted Redux session',
    ],
  },
  {
    date: '2026-06-10',
    title: 'Authentication API wiring',
    items: [
      'Auth service calls Laravel user auth endpoints through the shared Axios apiClient',
      'Login, register, verify OTP, and resend OTP use React Query mutations',
      'OTP success stores normalized user and accessToken in Redux auth slice',
      'Removed silent mock OTP fallback from the auth service',
    ],
  },
  {
    date: '2026-06-05',
    title: 'Landing layout — navbar & footer',
    items: [
      'Modular SiteLayout with Navbar + Footer on HomePage',
      'Responsive navbar — mobile drawer, tablet search row, desktop full bar',
      'Footer — company/help/faq columns, social, app badges, payments',
      'Shared Container (max 1440px) for modern laptop resolutions',
      'Site nav constants in src/constants/siteNav.js',
    ],
  },
  {
    date: '2026-06-05',
    title: 'Registration & account verification',
    items: [
      'Register page — name, gender, email, region/city/district, Ghana phone',
      'Searchable region, city, and district selects — all 16 Ghana regions',
      'City and district include Other option with custom text input for payload',
      'Register → /register/verify OTP → verifying loader → app entry',
      'Shared VerifyOtpPage for login and register flows',
      'Form validation — all fields required, scroll-to-first-error, animated FieldError',
      'Auth flow documented in appDocs.js → Developer Guide',
    ],
  },
  {
    date: '2026-06-05',
    title: 'Login & OTP verification',
    items: [
      'Login page with Phone / Email tabs',
      'Ghana phone validation (+233, network prefix checks)',
      'OTP verification page with 6-digit input',
      'Animated verifying OTP loader (Framer Motion)',
      'Resend timer (60s countdown)',
      'Auth service prepared for API-backed OTP flow',
      'Framer Motion tab + page transitions',
    ],
  },
  {
    date: '2026-06-05',
    title: 'Project foundation',
    items: [
      'Redux Toolkit store with auth slice + redux-persist',
      'TanStack Query client + React Query Devtools (dev)',
      'Axios apiClient with auth interceptors',
      'Sonner notifications via notify helper',
      'Central Images registry (Images.jsx)',
      'Developer guide page at /dev-guide',
    ],
  },
]

export const roadmap = [
  {
    phase: 'Foundation',
    status: 'done',
    items: ['Stack setup', 'Developer guide', 'Auth slice'],
  },
  {
    phase: 'Auth pages',
    status: 'done',
    items: ['Login + OTP', 'Register + verify', 'Wire setCredentials to real API'],
  },
  {
    phase: 'Layout & navigation',
    status: 'in-progress',
    items: ['Landing navbar', 'App shell', 'Header / footer', 'Mobile nav'],
  },
  {
    phase: 'Catalog',
    status: 'in-progress',
    items: ['Product listing', 'Product detail', 'Search & filters'],
  },
  {
    phase: 'Cart & checkout',
    status: 'done',
    items: ['Cart page', 'Quantity and remove actions', 'Checkout flow'],
  },
]

export const routes = [
  {
    path: '/',
    name: 'Home',
    status: 'in-progress',
    file: 'src/pages/HomePage.jsx',
    notes: 'Public landing page with SiteLayout navbar + footer',
  },
  {
    path: '/login',
    name: 'Login',
    status: 'done',
    file: 'src/pages/auth/LoginPage.jsx',
    notes: 'Phone (Ghana) + Email tabs. Guest-only route redirects authenticated users to /',
  },
  {
    path: '/login/verify',
    name: 'OTP Verification',
    status: 'done',
    file: 'src/pages/auth/VerifyOtpPage.jsx',
    notes: '6-digit OTP, verifying loader, resend timer. Guest-only route redirects authenticated users to /',
  },
  {
    path: '/register',
    name: 'Register',
    status: 'done',
    file: 'src/pages/auth/RegisterPage.jsx',
    notes: 'Full registration form → OTP verify flow. Guest-only route redirects authenticated users to /',
  },
  {
    path: '/register/verify',
    name: 'Register OTP Verification',
    status: 'done',
    file: 'src/pages/auth/VerifyOtpPage.jsx',
    notes: 'Shared verify page for register flow. Guest-only route redirects authenticated users to /',
  },
  {
    path: '/account',
    name: 'My Account',
    status: 'done',
    file: 'src/pages/AccountPage.jsx',
    notes: 'Protected account dashboard for authenticated users',
  },
  {
    path: '/cart',
    name: 'My Cart',
    status: 'done',
    file: 'src/pages/CartPage.jsx',
    notes: 'Responsive cart review page with quantities, item actions, summary totals, and related products',
  },
  {
    path: '/checkout',
    name: 'Checkout',
    status: 'done',
    file: 'src/pages/CheckoutPage.jsx',
    notes: 'Responsive guest/user checkout with address, store-grouped items, coupon, totals, payment methods, and Place Order rules',
  },
  {
    path: '/categories',
    name: 'All Categories',
    status: 'done',
    file: 'src/pages/CategoriesPage.jsx',
    notes: 'View All page for Top Categories using parent category API with static fallback',
  },
  {
    path: '/products',
    name: 'All Products',
    status: 'done',
    file: 'src/pages/ProductListingPage.jsx',
    notes: 'Aggregated product listing page for all homepage product buckets',
  },
  {
    path: '/products/recommended',
    name: 'Recommended Products',
    status: 'done',
    file: 'src/pages/ProductListingPage.jsx',
    notes: 'View All page for recommended_products with static fallback',
  },
  {
    path: '/products/best-sellers',
    name: 'Best Sellers',
    status: 'done',
    file: 'src/pages/ProductListingPage.jsx',
    notes: 'View All page for best_sellers with static fallback',
  },
  {
    path: '/products/flash-sales',
    name: 'Flash Sales',
    status: 'done',
    file: 'src/pages/ProductListingPage.jsx',
    notes: 'View All page for flash_sales with static fallback',
  },
  {
    path: '/products/explore',
    name: 'Explore Products',
    status: 'done',
    file: 'src/pages/ProductListingPage.jsx',
    notes: 'View All page for random_products with static fallback',
  },
  {
    path: '/:slug',
    name: 'Product Details',
    status: 'done',
    file: 'src/pages/ProductDetailsPage.jsx',
    notes: 'Responsive product details page with gallery, variants, stock, quantity, reviews, seller details, and related products',
  },
  {
    path: '/dev-guide',
    name: 'Developer Guide',
    status: 'done',
    file: 'src/pages/DeveloperGuide.jsx',
    notes: 'Living docs + stack reference',
  },
]

export const reduxSlices = [
  {
    name: 'auth',
    file: 'src/store/slices/authSlice.jsx',
    persisted: true,
    purpose: 'User session, accessToken, isAuthenticated — set on OTP success',
    actions: ['setCredentials', 'updateUser', 'logout'],
  },
]

export const queryHooks = [
  {
    name: 'useLandingPageData',
    file: 'src/hooks/useLandingPageData.js',
    purpose: 'GET /landing-page/home for recommended_products, best_sellers, flash_sales, and random_products on the homepage',
  },
  {
    name: 'TopCategoriesSection useQuery',
    file: 'src/components/home/TopCategoriesSection.jsx',
    purpose: 'GET /category/get_parents through categoryService.getParentCategories for homepage categories',
  },
  {
    name: 'useRegisterUserMutation',
    file: 'src/hooks/useAuthMutations.js',
    purpose: 'POST /user/auth/register through authService.registerUser',
  },
  {
    name: 'useRequestOtpMutation',
    file: 'src/hooks/useAuthMutations.js',
    purpose: 'POST /user/auth/login for login OTP request and resend flows',
  },
  {
    name: 'useVerifyOtpMutation',
    file: 'src/hooks/useAuthMutations.js',
    purpose: 'POST /user/auth/verify_otp and normalize auth response for Redux',
  },
  {
    name: 'useResendOtpMutation',
    file: 'src/hooks/useAuthMutations.js',
    purpose: 'Resend OTP via authService.resendOtp',
  },
  {
    name: 'useLogoutMutation',
    file: 'src/hooks/useAuthMutations.js',
    purpose: 'POST /user/auth/logout before clearing local Redux session',
  },
]

export const apiIntegrations = [
  {
    method: 'POST',
    endpoint: '/user/auth/register',
    purpose: 'Create consumer account and trigger registration OTP',
    status: 'wired',
  },
  {
    method: 'POST',
    endpoint: '/user/auth/login',
    purpose: 'Request OTP for email or phone login',
    status: 'wired',
  },
  {
    method: 'POST',
    endpoint: '/user/auth/verify_otp',
    purpose: 'Verify OTP and receive access token',
    status: 'wired',
  },
  {
    method: 'POST',
    endpoint: '/user/auth/logout',
    purpose: 'End backend auth session when the user logs out',
    status: 'wired',
  },
  {
    method: 'GET',
    endpoint: '/category/get_parents',
    purpose: 'Fetch parent categories for the homepage Top Categories section',
    status: 'wired',
  },
  {
    method: 'GET',
    endpoint: '/landing-page/home',
    purpose: 'Fetch homepage product sections: recommended_products, best_sellers, flash_sales, and random_products',
    status: 'wired',
  },
]

export const plannedPages = [
  { name: 'Products', path: '/products', status: 'done' },
  { name: 'Product detail', path: '/:slug', status: 'done' },
]

export const authNotes = {
  phoneValidation: 'src/utils/validateGhanaPhone.js',
  authService: 'src/services/authService.js — Axios calls to Laravel user auth endpoints',
  components: 'src/components/auth/*',
}

export const authFlow = {
  overview:
    'Two entry flows (login + register) share a single OTP verification page. On success, credentials are stored in Redux (persisted) and the user is redirected to the landing page.',
  constants: {
    otpLength: 6,
    resendCooldownSeconds: 60,
    methods: ['phone', 'email'],
    flows: ['login', 'register'],
  },
  flows: [
    {
      id: 'login',
      name: 'Login',
      entryRoute: '/login',
      verifyRoute: '/login/verify',
      file: 'src/pages/auth/LoginPage.jsx',
      steps: [
        {
          order: 1,
          title: 'Choose login method',
          route: '/login',
          description: 'User picks Phone or Email tab (AuthTabs).',
        },
        {
          order: 2,
          title: 'Enter contact & submit',
          route: '/login',
          description:
            'Phone: Ghana mobile (+233, 9 digits, MTN/Telecel/AT prefix). Email: standard format. Validates selected contact field on submit.',
        },
        {
          order: 3,
          title: 'Request OTP',
          route: '/login',
          description: 'POST /user/auth/login with email or phone_number through useRequestOtpMutation. Login is OTP-based, so every login request goes through verification. If the backend reports an active OTP already exists, the user continues to /login/verify with the existing code.',
        },
        {
          order: 4,
          title: 'Navigate to verify',
          route: '/login/verify',
          description:
            'Router state: { flow: "login", method, contact, displayContact }. Redirects to /login if state missing.',
        },
        {
          order: 5,
          title: 'Enter OTP',
          route: '/login/verify',
          description: '6-digit OtpInput. ResendTimer (60s). Submit triggers verifying loader.',
        },
        {
          order: 6,
          title: 'Verify OTP',
          route: '/login/verify',
          description:
            'POST /user/auth/verify_otp with email/phone_number, otp_token, and type. On success: setCredentials → /.',
        },
      ],
      navigationState: ['flow', 'method', 'contact', 'displayContact'],
      apiCalls: [
        { step: 'Submit login', method: 'POST', endpoint: '/user/auth/login' },
        { step: 'Verify OTP', method: 'POST', endpoint: '/user/auth/verify_otp' },
      ],
    },
    {
      id: 'register',
      name: 'Register',
      entryRoute: '/register',
      verifyRoute: '/register/verify',
      file: 'src/pages/auth/RegisterPage.jsx',
      steps: [
        {
          order: 1,
          title: 'Fill registration form',
          route: '/register',
          description:
            'First/last name, phone, email, region → city → district, gender. Searchable location selects with Other + inline custom input. All fields required.',
        },
        {
          order: 2,
          title: 'Accept terms & continue',
          route: '/register',
          description:
            'Validates every field + terms together. Scrolls to first error. Phone/email format checks via validateGhanaPhone / validateEmail.',
        },
        {
          order: 3,
          title: 'Register account',
          route: '/register',
          description:
            'POST /user/auth/register with first_name, last_name, email, phone_number, region, district, city_or_town. Backend sends the registration OTP from this request.',
        },
        {
          order: 4,
          title: 'Navigate to verify',
          route: '/register/verify',
          description:
            'Router state: { flow: "register", method: "email", contact, displayContact, profile }. Redirects to /register if state missing.',
        },
        {
          order: 5,
          title: 'Enter OTP & verify',
          route: '/register/verify',
          description:
            'Shared VerifyOtpPage. POST /user/auth/verify_otp returns auth data. On success: setCredentials → /.',
        },
      ],
      navigationState: ['flow', 'method', 'contact', 'displayContact', 'profile'],
      profilePayload: [
        'firstName',
        'lastName',
        'gender',
        'email',
        'region',
        'city',
        'district',
        'phone',
      ],
      apiCalls: [
        { step: 'Continue', method: 'POST', endpoint: '/user/auth/register' },
        { step: 'Verify OTP', method: 'POST', endpoint: '/user/auth/verify_otp' },
      ],
    },
  ],
  sharedVerify: {
    file: 'src/pages/auth/VerifyOtpPage.jsx',
    routes: ['/login/verify', '/register/verify'],
    components: ['OtpInput', 'OtpVerifyingLoader', 'ResendTimer'],
    behaviour: [
      'Detects flow from pathname or navigation state (login vs register)',
      'Shows animated verifying loader during POST /user/auth/verify_otp',
      'Resend calls login OTP request again after 60s cooldown',
      'Stores normalized API auth response in Redux after successful verification',
    ],
  },
  validation: [
    { field: 'Phone', rules: 'Required. 9-digit Ghana mobile. Prefix must be MTN, Telecel, or AT.' },
    { field: 'Email', rules: 'Required. Valid email format (user@domain.tld).' },
    { field: 'Names', rules: 'First and last name required (trimmed).' },
    { field: 'Gender', rules: 'Required. Female or Male.' },
    { field: 'Region / City / District', rules: 'Required. Searchable selects. Other opens inline custom text input.' },
    { field: 'Terms', rules: 'Checkbox must be checked before registration submit.' },
    { field: 'OTP', rules: '6 digits required. Invalid code shows inline error + Retry button label.' },
  ],
  postAuth: {
    action: 'setCredentials({ user, accessToken })',
    slice: 'src/store/slices/authSlice.jsx',
    persisted: true,
    redirect: '/',
    notes: 'Navbar switches to My Account dropdown while authenticated; clicking My Account opens /account.',
  },
}
