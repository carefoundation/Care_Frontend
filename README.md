# Care - Crowdfunding & Donation Platform

A modern, beautiful crowdfunding and donation platform built with Next.js, TypeScript, and Tailwind CSS. This platform allows users to discover campaigns, make donations, start fundraisers, and manage everything through an intuitive admin panel.

## 🎨 Design Theme

### Public Website
- **Colors**: Green (#10b981) + White
- **Feel**: Clean, Trustworthy, Emotional, Simple & Modern
- **Focus**: Building trust and encouraging donations

### Admin Panel
- **Sidebar**: Black & White with animated Green highlights
- **Feel**: Powerful, Professional, Tech-style
- **Focus**: Efficient management and control

## 🚀 Features

### Public Website (Guest Users)
- ✅ Beautiful hero section with call-to-action
- ✅ Trust indicators (Total Raised, Donors, Campaigns, Success Rate)
- ✅ Urgent campaigns showcase
- ✅ Trending fundraisers
- ✅ "How It Works" section
- ✅ Success stories
- ✅ Partners showcase
- ✅ Campaign listing with filters and search
- ✅ Detailed campaign pages with donation functionality
- ✅ Authentication (Login/Register)

### User Dashboard
- ✅ Welcome message and stats overview
- ✅ Total donated, campaigns supported, total raised
- ✅ Donation history
- ✅ My campaigns management
- ✅ Tab-based navigation

### Admin Panel
- ✅ Professional black sidebar with green highlights
- ✅ Dashboard with key metrics
- ✅ Campaign management (Approve/Reject)
- ✅ User management
- ✅ Donation tracking
- ✅ Reports and analytics
- ✅ Content management

## 📁 Project Structure

```
care/
├── app/
│   ├── admin/              # Admin panel pages
│   │   ├── campaigns/      # Campaign management
│   │   ├── layout.tsx      # Admin layout with sidebar
│   │   └── page.tsx        # Admin dashboard
│   ├── campaigns/          # Public campaign pages
│   │   ├── [id]/          # Campaign detail page
│   │   └── page.tsx        # Campaign listing
│   ├── dashboard/          # User dashboard
│   ├── login/              # Login page
│   ├── register/           # Registration page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── admin/              # Admin-specific components
│   │   └── AdminSidebar.tsx
│   ├── campaigns/          # Campaign components
│   │   └── CampaignCard.tsx
│   ├── layout/             # Layout components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── ui/                 # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── ProgressBar.tsx
│       └── Toast.tsx
└── public/                 # Static assets
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Utilities**: clsx

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd care
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📄 Pages Overview

### Public Pages
- `/` - Home page with all sections
- `/campaigns` - Campaign listing with filters
- `/campaigns/[id]` - Individual campaign detail page
- `/login` - User login
- `/register` - User registration

### User Pages
- `/dashboard` - User dashboard with stats and campaigns

### Admin Pages
- `/admin` - Admin dashboard
- `/admin/campaigns` - Campaign management
- `/admin/users` - User management
- `/admin/donations` - Donation tracking
- `/admin/reports` - Reports and analytics

## 🎯 Key Features Implementation

### UX Rules
- ✅ Guest users clicking "Donate" are redirected to login
- ✅ After login, users are redirected back to the campaign page
- ✅ Loading states on all buttons and forms
- ✅ Toast notifications for success/error messages
- ✅ Smooth animations and transitions

### Responsive Design
- ✅ Mobile-first approach
- ✅ Responsive navigation (mobile menu)
- ✅ Adaptive layouts for all screen sizes

### Accessibility
- ✅ Semantic HTML
- ✅ Proper ARIA labels
- ✅ Keyboard navigation support
- ✅ Focus states

## 🎨 Color Palette

### Primary Colors
- **Green Primary**: `#10b981`
- **Green Dark**: `#059669`
- **Green Light**: `#34d399`
- **Green Background**: `#ecfdf5`

### Admin Colors
- **Black**: `#000000`
- **White**: `#ffffff`
- **Green Accent**: `#10b981`

## 📝 Next Steps

To make this a fully functional application, you'll need to:

1. **Backend Integration**
   - Set up API routes or connect to a backend
   - Implement authentication (JWT, sessions, etc.)
   - Add database for campaigns, users, donations

2. **Payment Integration**
   - Integrate payment gateway (Razorpay, Stripe, etc.)
   - Handle payment processing
   - Add payment history

3. **Image Upload**
   - Set up image upload functionality
   - Use cloud storage (Cloudinary, AWS S3, etc.)

4. **Email Notifications**
   - Send confirmation emails
   - Campaign updates
   - Donation receipts

5. **Additional Features**
   - Campaign creation form
   - User profile management
   - Comments and updates on campaigns
   - Social sharing integration

## 🤝 Contributing

This is a template project. Feel free to customize and extend it according to your needs.

## 📄 License

This project is open source and available under the MIT License.

---

Made with ❤️ for making a difference in the world
