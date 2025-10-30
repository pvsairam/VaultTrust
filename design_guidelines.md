# VaultTrust Design Guidelines
**Private Proof of Reserves - Privacy-Preserving Crypto Dashboard**

## Design Approach

**Hybrid Approach**: Glassmorphism aesthetic with DeFi-focused data visualization, drawing inspiration from modern crypto platforms (Uniswap, Aave) combined with clean dashboard patterns (Linear, Stripe).

**Design Principles**:
- Glassmorphism with depth and translucency
- Trust through visual clarity and data transparency
- Sophisticated crypto aesthetic without overwhelming complexity
- Responsive precision for financial data display

---

## Typography Hierarchy

**Font Stack**:
- **Primary**: Inter (Google Fonts) - body text, labels, data
- **Accent**: Space Grotesk (Google Fonts) - headings, hero, CTAs
- **Monospace**: JetBrains Mono - addresses, transaction hashes, numerical data

**Scale**:
- Hero Headline: text-6xl md:text-7xl, font-bold, tracking-tight
- Section Headers: text-4xl md:text-5xl, font-bold
- Card Titles: text-2xl, font-semibold
- Body Text: text-base md:text-lg
- Data Labels: text-sm, font-medium, uppercase, tracking-wide
- Metrics/Numbers: text-3xl md:text-4xl, font-bold, monospace
- Small Print: text-xs, opacity-70

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **4, 6, 8, 12, 16, 24** (e.g., p-4, gap-6, my-8, py-12, px-16, mb-24)

**Container Strategy**:
- Full-width sections: `w-full` with inner `max-w-7xl mx-auto px-6 md:px-8`
- Card containers: `max-w-6xl`
- Text content: `max-w-4xl`

**Grid Patterns**:
- Dashboard cards: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Proof table: Single column responsive table
- Stats display: `grid grid-cols-2 md:grid-cols-4 gap-4`

---

## Glassmorphism Implementation

**Glass Cards**:
- Background: `bg-white/10 dark:bg-black/10`
- Backdrop filter: `backdrop-blur-xl`
- Border: `border border-white/20 dark:border-white/10`
- Shadow: `shadow-2xl shadow-black/10`
- Rounded: `rounded-2xl` or `rounded-3xl`

**Layering Depth**:
- Hero section: Subtle gradient overlay on background
- Primary cards: Strong glass effect with higher opacity
- Secondary elements: Lighter glass with more transparency
- Overlays/modals: Maximum blur with darker tint

---

## Component Library

### Navigation
- Fixed top navbar with glass effect: `backdrop-blur-md bg-white/80 dark:bg-black/80`
- Logo left, navigation center, wallet connection right
- Mobile: Hamburger menu with slide-in drawer
- Network badge pill showing Sepolia with colored dot indicator

### Hero Section (Home)
- Full viewport height (min-h-screen)
- **Large hero image**: Abstract cryptographic/security-themed visual (encryption keys, network nodes, secure vault imagery) with gradient overlay
- Centered content with project name "VaultTrust" and caption overlay on image
- Blurred-background CTA buttons over image
- Animated floating geometric shapes or particles in background
- Three-column feature grid below hero explaining Encrypt → Compute → Decrypt

### Dashboard Cards
**Token Reserve Cards**:
- Glass card container (p-6, rounded-2xl)
- Token icon/symbol at top
- Large metric displays: "Verified Reserves", "Verified Liabilities"
- Coverage percentage with d3.js arc/gauge visualization
- Status badge (Fully Covered, Under-collateralized, Pending) with appropriate styling
- Mini sparkline chart showing historical trend
- "View Details" button at bottom

**Status Badges**:
- Fully Covered: Green background with check icon
- Under-collateralized: Orange/amber with warning icon
- Pending: Blue with clock icon
- Pill shape: `px-3 py-1 rounded-full text-xs font-semibold`

### Data Visualization (d3.js)
**Coverage Arc Gauge**:
- Semi-circular arc with gradient fill
- Animated percentage label in center
- Subtle glow effect on arc path
- Responsive sizing (scales with container)
- Smooth transition animations on data update

**Progress Indicators**:
- Linear progress bars with glass background
- Animated fill with gradient overlay
- Percentage label inline or above

### Submit Data Interface
**Protected Section**:
- Role check notice at top
- Large textarea for encrypted payload input (monospace font)
- Token symbol dropdown/input
- Glass-effect submit button with loading state
- Transaction hash display on success with Etherscan link

### Proofs Table
**Table Design**:
- Alternating row background with glass effect
- Columns: Timestamp, Token, Reserves, Liabilities, Coverage, Tx Hash, Actions
- Hoverable rows with subtle highlight
- Etherscan link icons
- "Verify Signature" button per row
- Pagination at bottom
- Responsive: Stacks on mobile with card-style layout

### Docs Page
**Visual Diagram**:
- Horizontal flow chart: Encrypt → Compute → Decrypt
- Illustrated icons for each step
- Connecting arrows with animations
- Glass card for each stage with explanation
- Code snippets in glass containers with syntax highlighting
- Links to Zama documentation in sidebar

### Wallet Connection (RainbowKit)
- Custom styling to match glassmorphism theme
- Network switcher with Sepolia emphasis
- ENS display support
- Account details in glass modal

### Footer
- Glass background with blur
- Three columns: Links, Social, Legal
- Center column: "build with <3 by xtestnet" (xtestnet links to https://x.com/xtestnet)
- Social icons with hover glass effect
- Subtle top border

---

## Animations (Framer Motion)

**Use Sparingly**:
- Page transitions: Fade-in with slight upward motion (y: 20 → 0)
- Card reveals: Stagger children with 0.1s delay
- Hover states: Scale (1.02) and brightness increase
- Data updates: Number counter animation
- Coverage arc: Smooth percentage fill on load
- Button interactions: Subtle scale on press

**Performance**:
- Use `will-change` sparingly
- Prefer CSS transforms over layout changes
- Disable animations on reduced motion preference

---

## Images

**Hero Image**:
- Large full-width hero background image
- Subject: Abstract security/encryption visualization - digital vault, cryptographic keys, encrypted data flow, or blockchain network nodes
- Treatment: Dark gradient overlay (from top and bottom) for text legibility
- Parallax effect on scroll (subtle)

**Dashboard Icons**:
- Token logos from CDN (CoinGecko API)
- Heroicons for UI elements (shield-check, lock, key, chart-bar, etc.)

**Docs Diagrams**:
- Custom SVG illustrations for Encrypt/Compute/Decrypt flow
- Placeholder: `<!-- CUSTOM ILLUSTRATION: Encryption flow diagram -->`

---

## Accessibility

- WCAG AA contrast ratios maintained
- Focus rings with glass treatment: `ring-2 ring-offset-2 ring-blue-500/50`
- Keyboard navigation throughout
- ARIA labels on interactive elements
- Screen reader-friendly table structures
- Skip to content link

---

## Responsive Breakpoints

- Mobile: Base styles
- Tablet: `md:` (768px)
- Desktop: `lg:` (1024px)
- Wide: `xl:` (1280px)

**Key Adjustments**:
- Hero text scales down on mobile
- Dashboard: 1 column → 2 columns → 3 columns
- Navigation collapses to hamburger
- Table converts to card layout
- Reduce glass blur intensity on mobile for performance

---

This design system creates a sophisticated, trustworthy crypto dashboard with cutting-edge glassmorphism aesthetics while maintaining clarity for critical financial data.