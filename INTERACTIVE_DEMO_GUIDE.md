# Interactive Dashboard Demo - Implementation Guide

## 🎯 Goal
Add live, interactive dashboard views to your `/demo` presentation page.

## 📦 Components Created

### 1. `LiveDashboardEmbed.jsx` - Embedded iframe
**Location:** `resources/js/components/demo/LiveDashboardEmbed.jsx`

**Features:**
- ✅ Embeds live dashboard in demo page
- ✅ Fullscreen mode
- ✅ "Open in new tab" button
- ✅ Loading indicator
- ⚠️ Requires user to be logged in

**Usage:**
```jsx
import LiveDashboardEmbed from '@/components/demo/LiveDashboardEmbed';

<LiveDashboardEmbed
    title="Employee Dashboard - Live Demo"
    dashboardUrl="http://127.0.0.1:8000/dashboard"
    height="700px"
    showFullscreenButton={true}
/>
```

---

### 2. `LiveDemoButton.jsx` - Launch button (RECOMMENDED)
**Location:** `resources/js/components/demo/LiveDemoButton.jsx`

**Features:**
- ✅ Clean, professional button
- ✅ Opens dashboard in new tab
- ✅ No authentication issues
- ✅ Smooth demo flow

**Usage:**
```jsx
import LiveDemoButton from '@/components/demo/LiveDemoButton';

<LiveDemoButton
    dashboardUrl="http://127.0.0.1:8000/dashboard"
    label="Launch Live Dashboard"
    description="Click to explore the actual system"
/>
```

---

## 🚀 Quick Start (Recommended Approach)

### Step 1: Add Live Demo Button to Hero Section

**File:** `resources/js/components/demo/sections/HeroSection.jsx`

```jsx
import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import DemoSection from '../DemoSection';
import LiveDemoButton from '../LiveDemoButton';  // ADD THIS

export default function HeroSection() {
    return (
        <DemoSection id="hero" backgroundColor="bg-gradient-to-br from-blue-600 to-blue-800">
            {/* Your existing hero content */}

            {/* ADD THIS - Live Demo Button */}
            <div className="mt-12">
                <LiveDemoButton
                    dashboardUrl="http://127.0.0.1:8000/dashboard"
                    label="Launch Live Dashboard Demo"
                    description="Click to explore the actual HR system"
                />
            </div>
        </DemoSection>
    );
}
```

### Step 2: Rebuild Assets

```bash
npm run build
```

### Step 3: View Demo

```
http://rp-management-system.test/demo
```

Hard refresh: `Cmd + Shift + R`

---

## 🎨 Multiple Dashboard Links Example

Add quick links to different sections:

```jsx
import { ExternalLink } from 'lucide-react';

export default function SolutionSection() {
    const quickLinks = [
        { label: 'Dashboard', url: 'http://127.0.0.1:8000/dashboard' },
        { label: 'My Leaves', url: 'http://127.0.0.1:8000/my-leaves' },
        { label: 'Calendar', url: 'http://127.0.0.1:8000/calendar' },
        { label: 'WFH Schedule', url: 'http://127.0.0.1:8000/wfh' },
    ];

    return (
        <DemoSection id="solution" title="Explore Features">
            {/* Quick Access Bar */}
            <div className="flex flex-wrap gap-4 justify-center mt-8">
                {quickLinks.map((link, index) => (
                    <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white border-2 border-blue-500 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                        <ExternalLink className="w-4 h-4" />
                        {link.label}
                    </a>
                ))}
            </div>
        </DemoSection>
    );
}
```

---

## 📋 Where to Add Live Demos

### Hero Section (Priority 1) ✅
```jsx
// Show main dashboard first impression
<LiveDemoButton
    dashboardUrl="http://127.0.0.1:8000/dashboard"
    label="Launch Live Dashboard"
/>
```

### Leave Management Sections (Priority 2)
```jsx
// Employee view
<LiveDemoButton
    dashboardUrl="http://127.0.0.1:8000/my-leaves"
    label="Try Leave Request System"
    description="See how employees request time off"
/>

// Manager view (for HR users)
<LiveDemoButton
    dashboardUrl="http://127.0.0.1:8000/leave-requests"
    label="Manager Approval Queue"
    description="Review and approve team requests"
/>
```

### WFH Section (Priority 3)
```jsx
<LiveDemoButton
    dashboardUrl="http://127.0.0.1:8000/wfh"
    label="WFH Scheduler"
    description="Plan your remote work schedule"
/>
```

### Calendar Section (Priority 4)
```jsx
<LiveDemoButton
    dashboardUrl="http://127.0.0.1:8000/calendar"
    label="Team Calendar"
    description="See who's available and when"
/>
```

---

## 🔒 Authentication Considerations

### Problem
The dashboard requires login. Viewers must authenticate to see content.

### Solutions

#### Option A: Demo Account (Recommended)
1. Create a demo user: `demo@example.com` / `demo123`
2. Mention in demo: "Login with demo@example.com / demo123"
3. Pre-login for live presentations

#### Option B: Public Demo Mode
Create a guest-accessible demo view (more complex):

```php
// routes/web.php
Route::get('/demo/preview/{feature}', function ($feature) {
    // Return read-only preview without auth
})->name('demo.preview');
```

#### Option C: Screenshots/Videos (Simplest)
Use recorded media instead of live dashboards:
- No authentication issues
- Faster loading
- More controlled narrative

---

## 🎬 Alternative: Embedded iframe

If you want the dashboard embedded directly:

```jsx
import LiveDashboardEmbed from '@/components/demo/LiveDashboardEmbed';

<div className="mt-12">
    <LiveDashboardEmbed
        title="Employee Dashboard - Live Demo"
        dashboardUrl="http://127.0.0.1:8000/dashboard"
        height="700px"
    />
</div>
```

**Pros:**
- Dashboard visible in demo page
- No navigation away from presentation

**Cons:**
- Requires authentication (user sees login page)
- May have iframe security restrictions
- Loading slower than button

---

## 🎯 Recommended Configuration

### For Stakeholder Demos (Formal Presentation)
- Use **LiveDemoButton** components
- Pre-login before demo
- Have demo account ready: demo@example.com

### For Sales Demos (Interactive)
- Use **LiveDashboardEmbed** in key sections
- Login before starting presentation
- Show live data and interactions

### For Marketing Site (Public)
- Use **screenshots/videos** instead
- Add "Request Demo" buttons
- Link to signup page

---

## 🔧 Troubleshooting

### Issue: "Not Found" when clicking button
**Solution:** Ensure Laravel server is running:
```bash
herd restart
# or
php artisan serve
```

### Issue: Button shows but dashboard won't load
**Solution:** Check the URL matches your local setup:
- Herd: `http://rp-management-system.test/dashboard`
- Artisan serve: `http://127.0.0.1:8000/dashboard`

### Issue: iframe shows login page
**Solution:** This is expected. Either:
1. Login in another tab first (session shared)
2. Use LiveDemoButton instead (opens new tab)
3. Create demo account with auto-login

### Issue: iframe blocked by browser
**Solution:** Check browser console for X-Frame-Options errors.
May need to update Laravel middleware to allow same-origin iframes.

---

## 📊 Complete Example: Leave Management Section

```jsx
import React from 'react';
import DemoSection from '../DemoSection';
import FeatureCard from '../FeatureCard';
import LiveDemoButton from '../LiveDemoButton';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

export default function LeaveEmployeeSection() {
    return (
        <DemoSection
            id="leave-employee"
            title="Leave Management - Employee View"
            subtitle="Simple, Fast, Transparent"
        >
            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <FeatureCard
                    icon={Calendar}
                    title="Visual Calendar"
                    bullets={[
                        'See your leave at a glance',
                        'Check team availability',
                        'Plan ahead with confidence',
                    ]}
                />
                <FeatureCard
                    icon={Clock}
                    title="Real-Time Balance"
                    bullets={[
                        'Current leave balance',
                        'Pending requests',
                        'Automatic calculations',
                    ]}
                />
                <FeatureCard
                    icon={CheckCircle}
                    title="Quick Approvals"
                    bullets={[
                        'Submit in 30 seconds',
                        'Instant notifications',
                        'Track request status',
                    ]}
                />
            </div>

            {/* Live Demo Button */}
            <div className="mt-12">
                <LiveDemoButton
                    dashboardUrl="http://127.0.0.1:8000/my-leaves"
                    label="Try the Leave Request System"
                    description="See how employees request and track their time off"
                />
            </div>
        </DemoSection>
    );
}
```

---

## ✅ Next Steps

1. **Choose your approach:**
   - Simple: LiveDemoButton (recommended)
   - Advanced: LiveDashboardEmbed

2. **Update sections:**
   - Start with HeroSection
   - Add to key feature sections
   - Test each button works

3. **Rebuild and test:**
   ```bash
   npm run build
   ```

4. **Prepare demo account:**
   - Create: demo@example.com
   - Set password: demo123
   - Test login works

5. **Practice demo flow:**
   - Navigate through /demo
   - Click "Launch" buttons
   - Show live features

---

**Example file with live demo already added:**
- `resources/js/components/demo/sections/HeroSection_with_live_demo.jsx`

Copy this to `HeroSection.jsx` to see it in action!
