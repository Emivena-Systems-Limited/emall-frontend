/**
 * Living application documentation for consumer_fe.
 *
 * Update this file whenever you add routes, slices, hooks, API integrations,
 * or ship a feature. The Developer Guide page reads from here automatically.
 */

export const appMeta = {
  lastUpdated: '2026-06-05',
  currentPhase: 'Auth (Login + Register)',
  summary:
    'Login and registration flows with Ghana phone validation, OTP verification, and animated verifying state.',
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
      'Mock auth service (dev OTP: 123456) — swaps to API when ready',
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
    status: 'planned',
    items: ['App shell', 'Header / footer', 'Mobile nav'],
  },
  {
    phase: 'Catalog',
    status: 'planned',
    items: ['Product listing', 'Product detail', 'Search & filters'],
  },
  {
    phase: 'Cart & checkout',
    status: 'planned',
    items: ['Cart slice', 'Cart page', 'Checkout flow'],
  },
]

export const routes = [
  {
    path: '/',
    name: 'Root redirect',
    status: 'done',
    file: 'src/routes/AppRoutes.jsx',
    notes: 'Redirects to /login',
  },
  {
    path: '/login',
    name: 'Login',
    status: 'done',
    file: 'src/pages/auth/LoginPage.jsx',
    notes: 'Phone (Ghana) + Email tabs, terms checkbox',
  },
  {
    path: '/login/verify',
    name: 'OTP Verification',
    status: 'done',
    file: 'src/pages/auth/VerifyOtpPage.jsx',
    notes: '6-digit OTP, verifying loader, resend timer',
  },
  {
    path: '/register',
    name: 'Register',
    status: 'done',
    file: 'src/pages/auth/RegisterPage.jsx',
    notes: 'Full registration form → OTP verify flow',
  },
  {
    path: '/register/verify',
    name: 'Register OTP Verification',
    status: 'done',
    file: 'src/pages/auth/VerifyOtpPage.jsx',
    notes: 'Shared verify page for register flow',
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

export const queryHooks = []

export const apiIntegrations = [
  {
    method: 'POST',
    endpoint: '/auth/register',
    purpose: 'Create consumer account before OTP verification',
    status: 'in-progress',
  },
  {
    method: 'POST',
    endpoint: '/auth/otp/request',
    purpose: 'Request OTP for phone or email login',
    status: 'in-progress',
  },
  {
    method: 'POST',
    endpoint: '/auth/otp/verify',
    purpose: 'Verify OTP and receive access token',
    status: 'in-progress',
  },
]

export const plannedPages = [
  { name: 'Home', path: '/home', status: 'planned', notes: 'Post-login landing' },
  { name: 'Products', path: '/products', status: 'planned' },
  { name: 'Product detail', path: '/products/:id', status: 'planned' },
  { name: 'Cart', path: '/cart', status: 'planned' },
]

export const authNotes = {
  devOtp: '123456',
  phoneValidation: 'src/utils/validateGhanaPhone.js',
  authService: 'src/services/authService.js — mock fallback until API is live',
  components: 'src/components/auth/*',
}

export const authFlow = {
  overview:
    'Two entry flows (login + register) share a single OTP verification page. On success, credentials are stored in Redux (persisted) and the user is redirected to /dev-guide (placeholder post-auth destination).',
  constants: {
    otpLength: 6,
    resendCooldownSeconds: 60,
    devMockOtp: '123456',
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
          description: 'User picks Phone or Email tab (AuthTabs). Terms checkbox required.',
        },
        {
          order: 2,
          title: 'Enter contact & submit',
          route: '/login',
          description:
            'Phone: Ghana mobile (+233, 9 digits, MTN/Telecel/AT prefix). Email: standard format. Validates all fields + terms on submit.',
        },
        {
          order: 3,
          title: 'Request OTP',
          route: '/login',
          description: 'POST /auth/otp/request with { method, contact }. Falls back to mock on API failure.',
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
            'POST /auth/otp/verify with { method, contact, otp }. Mock accepts OTP 123456. On success: setCredentials → /dev-guide.',
        },
      ],
      navigationState: ['flow', 'method', 'contact', 'displayContact'],
      apiCalls: [
        { step: 'Submit login', method: 'POST', endpoint: '/auth/otp/request' },
        { step: 'Verify OTP', method: 'POST', endpoint: '/auth/otp/verify' },
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
            'POST /auth/register with profile payload (name, gender, email, region, city, district, phone). Mock fallback on failure.',
        },
        {
          order: 4,
          title: 'Request OTP',
          route: '/register',
          description: 'POST /auth/otp/request with phone contact (E.164). Sent after successful register.',
        },
        {
          order: 5,
          title: 'Navigate to verify',
          route: '/register/verify',
          description:
            'Router state: { flow: "register", method: "phone", contact, displayContact, profile }. Redirects to /register if state missing.',
        },
        {
          order: 6,
          title: 'Enter OTP & verify',
          route: '/register/verify',
          description:
            'Shared VerifyOtpPage. POST /auth/otp/verify includes profile for mock user creation. On success: setCredentials → /dev-guide.',
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
        { step: 'Continue', method: 'POST', endpoint: '/auth/register' },
        { step: 'Continue', method: 'POST', endpoint: '/auth/otp/request' },
        { step: 'Verify OTP', method: 'POST', endpoint: '/auth/otp/verify' },
      ],
    },
  ],
  sharedVerify: {
    file: 'src/pages/auth/VerifyOtpPage.jsx',
    routes: ['/login/verify', '/register/verify'],
    components: ['OtpInput', 'OtpVerifyingLoader', 'ResendTimer'],
    behaviour: [
      'Detects flow from pathname or navigation state (login vs register)',
      'Shows animated verifying loader during POST /auth/otp/verify',
      'Resend calls requestOtp again after 60s cooldown',
      'Dev hint shows mock OTP 123456 when import.meta.env.DEV',
    ],
  },
  validation: [
    { field: 'Phone', rules: 'Required. 9-digit Ghana mobile. Prefix must be MTN, Telecel, or AT.' },
    { field: 'Email', rules: 'Required. Valid email format (user@domain.tld).' },
    { field: 'Names', rules: 'First and last name required (trimmed).' },
    { field: 'Gender', rules: 'Required. Female or Male.' },
    { field: 'Region / City / District', rules: 'Required. Searchable selects. Other opens inline custom text input.' },
    { field: 'Terms', rules: 'Checkbox must be checked before submit (login + register).' },
    { field: 'OTP', rules: '6 digits required. Invalid code shows inline error + Retry button label.' },
  ],
  postAuth: {
    action: 'setCredentials({ user, accessToken })',
    slice: 'src/store/slices/authSlice.jsx',
    persisted: true,
    redirect: '/dev-guide',
    notes: 'Replace redirect with /home when post-auth landing is built.',
  },
}
