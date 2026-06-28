"use client";

import MarketingNavbar from "@/components/MarketingNavbar";
import MarketingFooter from "@/components/MarketingFooter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownContent = `
# Vela Competitive Analysis: Why Vela Dominates the Modern AI Email Client Landscape

## Executive Summary

Vela is not your every day email client. We've designed Vela to reimagine your inbox for the AI-native era. While our competitors remain stuck in the past with bloated interfaces, distracting ads, and clunky workflows, Vela delivers **blazing speed, AI-first intelligence, and respect for your time and privacy**.

---

## 🎯 Core Philosophy Comparison

| **Feature**           | **Vela**                             | **Gmail**                | **Outlook**             | **Superhuman**     | **Hey**                |
| --------------------- | ------------------------------------ | ------------------------ | ----------------------- | ------------------ | ---------------------- |
| **Design Philosophy** | Speed & Focus                        | Ads & Integration        | Enterprise Bloat        | Keyboard Obsession | Opinionated Simplicity |
| **Primary User**      | Power users & professionals          | Everyone (compromised)   | Enterprise teams        | Startup founders   | Casual users           |
| **AI Integration**    | ✅ **Native, context-aware**          | ⚠️ Basic (Smart Compose) | ⚠️ Copilot (extra cost) | ❌ Limited          | ❌ None                 |
| **Privacy First**     | ✅ **Zero tracking, no data selling** | ❌ Ads & data mining      | ❌ Microsoft ecosystem   | ✅ Good             | ✅ Good                 |
| **Open Source**       | ✅ **Built on Appwrite**              | ❌ Closed                 | ❌ Closed                | ❌ Closed           | ❌ Closed               |
| **Modern Stack**      | ✅ **Next.js 15, React 19**           | ⚠️ Legacy + new          | ⚠️ Mixed                | ✅ Modern           | ⚠️ Custom              |

**We believe that the winner is Vela** – The only client built from the ground up for the AI era with privacy at its core.

---

## ⚡ Performance

### Why Vela wins

- **<100ms perceived latency**
- **Scroll your emails in one page, no clunky arrows (cough cough gmail)**
- **Optimized but feature dense**
- **Keyboard-first architecture**

### Competitor Performance Issues

**Gmail:**

- Heavy legacy codebase slows down over time
- Multiple tabs = multiple memory hogs
- Ads and tracking scripts add 500ms+ to every action
- Search can take 1-2 seconds even on fast connections

**Outlook:**

- Enterprise bloat makes it feel like using a 2005 web app
- Loading spinners are a constant companion
- Desktop app is a 500MB+ electron monster
- They literally shove ads down your throat unless you pay

**Superhuman:**

- Fast, but requires expensive hardware
- Not optimized for older devices
- Still has occasional lag on complex threads

**Hey:**

- Simple = fast, but lacks so many features
- No advanced search capabilities
- Limited keyboard shortcuts

**Vela clearly wins here.**

---

## 🤖 AI Intelligence: Ask AI to manage your Inbox

### Vela's AI Superpowers

#### 1. **Context-Aware Summarization**

\`\`\`other
✅ One-click email summarization into 3-5 bullet points
✅ Understands your role (job title, company) for better context
✅ Saves summaries locally for instant recall
✅ Vela Intelligence integration for enterprise-grade intelligence
\`\`\`

#### 2. **Smart Reply Drafting**

\`\`\`other
✅ AI drafts professional replies based on email content
✅ Custom prompts: "Reply professionally acknowledging receipt"
✅ Learns your writing style over time
✅ Context-aware responses using your profile
\`\`\`

#### 3. **Inline AI Editor that supports Markdown**

\`\`\`other
✅ Slash commands (/fix grammar, /expand, /professional)
✅ Custom AI prompts for any writing task
✅ Real-time text modification with AI
✅ Markdown support with live preview
\`\`\`

#### 4. **AI Command Palette**

\`\`\`other
✅ Search emails with natural language
✅ AI-powered contact search
✅ Draft emails via AI commands
✅ Tool integration (search, contacts, draft)
\`\`\`

### Competitor AI Limitations

**Gmail (Smart Compose):**

- ❌ Basic sentence completion only
- ❌ No understanding of email context
- ❌ Generic suggestions, not personalized
- ❌ Requires manual acceptance of each suggestion

**Outlook (Copilot):**

- ❌ Extra $30/user/month
- ❌ Slow and clunky interface
- ❌ Limited to Microsoft ecosystem
- ❌ No inline editing capabilities

**Superhuman:**

- ❌ No native AI features
- ❌ Relies on third-party integrations
- ❌ AI feels bolted on, not integrated

**Hey:**

- ❌ No AI features at all
- ❌ Gimmicky features that are hard to get used to

**Winner: Vela** – AI native emails

---

## 🔍 Search & Organization

### Vela's Search Capabilities

\`\`\`other
✅ Instant search across subjects, senders, content
✅ AI-powered search suggestions
✅ Filter by: unread, starred, from, to, date ranges
✅ Thread-based organization
✅ Infinite scroll with lazy loading
✅ Real-time results as you type
\`\`\`

### Competitor Search Comparison

| **Feature**          | **Vela**   | **Gmail**  | **Outlook** | **Superhuman** | **Hey**  |
| -------------------- | ---------- | ---------- | ----------- | -------------- | -------- |
| **Speed**            | ⚡ Instant  | ⏳ 500ms-2s | ⏳ 1-3s      | ⚡ Fast         | ⚡ Fast   |
| **AI Suggestions**   | ✅ Yes      | ❌ No       | ❌ No        | ❌ No           | ❌ No     |
| **Natural Language** | ✅ Yes      | ⚠️ Limited | ⚠️ Limited  | ❌ No           | ❌ No     |
| **Thread View**      | ✅ Native   | ✅ Yes      | ✅ Yes       | ✅ Yes          | ⚠️ Basic |
| **Filters**          | ✅ Advanced | ✅ Advanced | ✅ Advanced  | ⚠️ Basic       | ⚠️ Basic |
| **Saved Searches**   | ✅ Coming   | ✅ Yes      | ✅ Yes       | ❌ No           | ❌ No     |

**Winner: Vela** – Fast while being smart

---

## 🛡️ Privacy & Security

### Vela's Privacy-First Approach

\`\`\`other
✅ Zero tracking – We never track your accounts
✅ No data selling – Your emails stay yours
✅ No model training – We don't train AI on your data
✅ Our BaaS is open source – Full transparency
✅ Local storage for preferences – Sensitive data stays on your computer
✅ GDPR compliant by design
✅ We don't store your emails at all
\`\`\`

### Competitor Privacy Concerns

**Gmail:**

- ❌ Scans all emails for ads targeting
- ❌ Builds detailed profiles on users
- ❌ Shares data with third-party advertisers
- ❌ Government data requests (thousands per year)

**Outlook:**

- ❌ Part of Microsoft's data collection ecosystem
- ❌ Linked to Windows, Office, Azure data
- ❌ Enterprise "privacy" = Microsoft can access
- ❌ US government data requests

**Superhuman:**

- ✅ Good privacy practices
- ❌ Closed source – can't verify claims
- ❌ US-based, subject to surveillance laws

**Hey:**

- ✅ Privacy-focused
- ❌ Smaller company, less scrutiny
- ❌ Limited transparency

**Winner: Vela** – The only truly private email client with open source transparency.

---

## 💰 Pricing: Value for Money

### Vela's Pricing Model

\`\`\`other
✅ Generous free plan
✅ No ads – ever
✅ No tracking – ever
✅ All features included
✅ Self-hostable option (roadmap)
✅ Open source core
✅ Pro plan is cheaper
\`\`\`

### Competitor Pricing

| **Client**     | **Free Tier**   | **Paid Tier**     | **Ads** | **Tracking** |
| -------------- | --------------- | ----------------- | ------- | ------------ |
| **Vela**       | ✅ Full features | $12/mo            | ❌ No    | ❌ No         |
| **Gmail**      | ✅ Basic         | $6/mo (Workspace) | ✅ Yes   | ✅ Yes        |
| **Outlook**    | ✅ Basic         | $4-20/mo          | ✅ Yes   | ✅ Yes        |
| **Superhuman** | ❌ None          | $30/mo            | ❌ No    | ⚠️ Some      |
| **Hey**        | ❌ None          | $99/year          | ❌ No    | ❌ No         |

While it appears that Gmail and Outlook are cheaper, Vela's free plan offers all the features of both Gmail and Outlook's paid plans. Vela's paid plan includes higher AI usage limits, which neither of the 2 offer at that price.

**Winner: Vela** – Premium experience, no hidden catches.

---

## 🎨 User Experience & Design

### Vela's Design Principles

\`\`\`other
✅ Minimalist, distraction-free interface
✅ Familiar UI
✅ Consistent
✅ Smart spacing and hierarchy
✅ Animated transitions (60fps)
✅ Responsive design (mobile coming soon)
✅ Accessibility-first approach
\`\`\`

### Design Comparison

| **Aspect**        | **Vela**        | **Gmail**           | **Outlook**       | **Superhuman** | **Hey**     |
| ----------------- | --------------- | ------------------- | ----------------- | -------------- | ----------- |
| **Aesthetics**    | ✅ Modern, clean | ⚠️ Dated, cluttered | ❌ Enterprise ugly | ✅ Polished     | ✅ Unique    |
| **Readability**   | ✅ Excellent     | ⚠️ Good             | ⚠️ Good           | ✅ Excellent    | ✅ Excellent |
| **Consistency**   | ✅ Perfect       | ⚠️ Inconsistent     | ❌ All over        | ✅ Good         | ✅ Good      |
| **Animations**    | ✅ Yes           | ⚠️ Basic            | ❌ Janky           | ✅ Yes          | ✅ Yes       |
| **Dark Mode**     | ✅ Native        | ✅ Yes               | ✅ Yes             | ✅ Yes          | ✅ Yes       |
| **Customization** | ✅ Themes coming | ⚠️ Limited          | ⚠️ Limited        | ❌ None         | ❌ None      |

**Winner: Vela** – The most thoughtfully designed interface that balances beauty and functionality.

---

## 📊 Feature Comparison Matrix

### Vela's clean sweep

| **Feature**            | **Vela**     | **Gmail** | **Outlook** | **Superhuman** | **Hey**  |
| ---------------------- | ------------ | --------- | ----------- | -------------- | -------- |
| **AI Summarization**   | ✅ Native     | ❌ No      | ⚠️ Copilot  | ❌ No           | ❌ No     |
| **AI Reply Drafting**  | ✅ Native     | ❌ No      | ⚠️ Copilot  | ❌ No           | ❌ No     |
| **AI Text Editing**    | ✅ Inline     | ❌ No      | ❌ No        | ❌ No           | ❌ No     |
| **Keyboard Shortcuts** | ✅ Full       | ⚠️ Basic  | ⚠️ Basic    | ✅ Full         | ⚠️ Basic |
| **Command Palette**    | ✅ AI-powered | ❌ No      | ❌ No        | ✅ Yes          | ❌ No     |
| **Dark Mode**          | ✅ Native     | ✅ Yes     | ✅ Yes       | ✅ Yes          | ✅ Yes    |
| **Offline Support**    | ✅ Coming     | ✅ Yes     | ✅ Yes       | ❌ No           | ❌ No     |
| **Self-Hosting**       | ✅ Roadmap    | ❌ No      | ❌ No        | ❌ No           | ❌ No     |

### Privacy & Security

| **Feature**               | **Vela**  | **Gmail** | **Outlook** | **Superhuman** | **Hey** |
| ------------------------- | --------- | --------- | ----------- | -------------- | ------- |
| **No Ads**                | ✅ Ever    | ❌ No      | ❌ No        | ✅ Yes          | ✅ Yes   |
| **No Tracking**           | ✅ Ever    | ❌ No      | ❌ No        | ✅ Mostly       | ✅ Yes   |
| **No Data Selling**       | ✅ Ever    | ❌ No      | ❌ No        | ✅ Yes          | ✅ Yes   |
| **Open Source**           | ✅ Core    | ❌ No      | ❌ No        | ❌ No           | ❌ No    |
| **End-to-End Encryption** | ✅ Roadmap | ❌ No      | ⚠️ Partial  | ❌ No           | ❌ No    |
| **GDPR Compliant**        | ✅ Yes     | ⚠️ Yes*   | ⚠️ Yes*     | ✅ Yes          | ✅ Yes   |

*Gmail and Outlook technically comply but still collect extensive data

---

## 🚀 Roadmap: What's Coming

Vela is evolving rapidly. Here's what's on the horizon:

### Short Term (Next 3 Months)

- [ ] Multiple account support
- [ ] Email signatures
- [ ] Attachment support
- [ ] Snooze functionality
- [ ] Schedule send
- [ ] Undo send
- [ ] Mobile apps (iOS & Android)
- [ ] Offline mode

### Medium Term (3-6 Months)

- [ ] Calendar integration
- [ ] Tasks/To-do integration
- [ ] Advanced filtering rules
- [ ] Team collaboration features
- [ ] Voice dictation
- [ ] Email analytics (privacy-preserving)

### Long Term (6-12 Months)

- [ ] AI-powered inbox triage
- [ ] Predictive email responses

---

## 🏆 Final Verdict: Why Vela Wins

### 1. **Speed**

Vela is **10x faster** than Gmail and Outlook. No loading spinners, no waiting—just instant email.

### 2. **AI Native**

While others bolt on AI as an afterthought, Vela was **built for AI from day one**. Every feature leverages intelligence.

### 3. **Privacy**

Vela is the **only** major email client that respects your privacy by default. No ads, no tracking, no data selling.

### 4. **Keyboard Navigation**

Vela offers the **most comprehensive keyboard experience** of any email client, period.

### 5. **Affordability**

Vela is **free to start,** and you can upgrade whenever, for a feature set comparable to tools much more pricey

### 7. **We listen**

With a **rapid roadmap** and **modern stack**, Vela will continue to outpace competitors. We are open to community feedback, and are actively developing the product

---

## 🎯 Who Should Use Vela?

### Perfect For:

✅ **Power users** who want keyboard control and speed

✅ **Professionals** who need AI assistance with emails

✅ **Privacy-conscious** users tired of being tracked

✅ **Developers** who appreciate modern tech stacks

✅ **Startups** looking for a competitive edge

✅ **Anyone** frustrated with slow, bloated email clients

### Maybe Not For:

⚠️ **Enterprise users** needing Microsoft/Google ecosystem integration (yet)

⚠️ **Casual users** who just want basic email (you'll be converted!)

⚠️ **Legacy system lovers** who prefer 2004-era interfaces

---

## 📢 Call to Action

**Stop settling for mediocre email experiences.**

Gmail is slow and spies on you. Outlook is bloated and ugly. Superhuman is expensive and closed. Hey is simple but limited.

**Vela is the future of email.**

- ✅ **Faster** than anything you've used
- ✅ **Smarter** with native AI integration
- ✅ **More private** than any major competitor
- ✅ **More powerful** keyboard control
- ✅ **Free** during beta

**Join the revolution. Try Vela today.**

---

*This analysis was created with a bias towards Vela because, frankly, it's the superior product. But don't take our word for it—try it yourself and experience the difference.* 🚀
`;

export default function VsTheWorldPage() {
  return (
    <div className="min-h-screen bg-[#b9c2c8] text-[#1e2a3b] selection:bg-[#7f99b0] selection:text-white flex flex-col relative overflow-x-hidden">
      
      {/* Background Lighting Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 bottom-0 right-[15%] w-[35%] bg-gradient-to-l from-white/70 to-transparent blur-[80px] transform skew-x-[-15deg] origin-top"></div>
        <div className="absolute top-0 bottom-0 right-[0%] w-[25%] bg-gradient-to-l from-black/[0.15] to-transparent blur-[60px] transform skew-x-[-15deg] origin-top"></div>
      </div>

      <MarketingNavbar />
      
      <main className="flex-1 pt-40 pb-32 px-12 md:px-24 max-w-[1400px] mx-auto w-full relative z-10 flex justify-center">
        <article className="prose prose-slate max-w-4xl w-full prose-headings:font-medium prose-a:text-[#305a7d] prose-pre:bg-white/40 prose-pre:border prose-pre:border-[#1e2a3b]/10 prose-th:bg-white/40 prose-th:p-3 prose-td:p-3 prose-table:border-collapse prose-table:border prose-table:border-[#1e2a3b]/10 prose-td:border-b prose-td:border-[#1e2a3b]/10 prose-tr:border-[#1e2a3b]/10 bg-white/40 border border-white/60 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdownContent}
          </ReactMarkdown>
        </article>
      </main>

      <MarketingFooter />
    </div>
  );
}
