import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
  Lightbulb,
  FileText,
  Users,
  Heart,
  ChevronDown,
  Code2,
  Database,
  ArrowRight,
  Search,
  MessageSquare,
  HelpCircle,
  Clock,
  Compass,
  Cpu,
  BookmarkCheck,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';

type TabKey = 'overview' | 'submit' | 'curate' | 'architecture';

export function About() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Interactive Checklist for Wish Submission
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Searched existing wishes to avoid duplicate proposals', checked: false },
    { id: 2, text: 'Clear problem statement describing the editor/reader pain point', checked: false },
    { id: 3, text: 'Identified target Wikimedia projects (e.g. Wikipedia, Commons, Wikidata)', checked: false },
    { id: 4, text: 'Selected appropriate technical tags (e.g. editing, multimedia, mobile)', checked: false },
  ]);

  const toggleChecklist = (id: number) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const toggleFaq = (idx: number) => {
    setExpandedFaq(prev => (prev === idx ? null : idx));
  };

  const completedChecklistCount = checklist.filter(c => c.checked).length;

  return (
    <div className="max-w-6xl mx-auto px-3.5 py-6 sm:px-6 sm:py-10 lg:px-8 space-y-8 sm:space-y-12 animate-in fade-in duration-300">
      {/* 1. Hero Header */}
      <div className="relative rounded-3xl border border-border-app bg-surface p-6 sm:p-12 shadow-sm overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center gap-6 sm:gap-8 justify-between">
        <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-3.5 py-1 text-xs font-semibold text-brand">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Community-Powered Wikimedia Tool</span>
          </div>

          <h1 className="text-2xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-[1.15]">
            Bridging Ideas and Engineering Across <span className="text-brand">Wikimedia</span>
          </h1>

          <p className="text-sm sm:text-lg text-text-secondary leading-relaxed">
            WikiWish is an independent, modern platform engineered to empower contributors. Discover, track, support, and curate Community Wishlist proposals with live Meta-Wiki synchronization and authentic OAuth verification.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 justify-center sm:justify-start">
            <Link to="/explore" className="w-full sm:w-auto">
              <Button size="sm" className="w-full sm:w-auto font-semibold shadow-sm flex items-center justify-center gap-2 h-10 sm:h-9">
                <Compass className="h-4 w-4" />
                <span>Explore Live Wishes</span>
              </Button>
            </Link>
            <a
              href="https://meta.wikimedia.org/wiki/Special:WishlistIntake"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="outline" size="sm" className="w-full sm:w-auto border-border-app font-semibold flex items-center justify-center gap-2 h-10 sm:h-9">
                <span>Submit on Meta-Wiki</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </a>
          </div>
        </div>

        {/* Logo Visual Anchor */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-brand/15 rounded-3xl blur-xl" />
          <div className="relative p-3.5 sm:p-4 rounded-3xl bg-surface border border-border-app shadow-xl">
            <img
              src="/wikiwish.png"
              alt="WikiWish Logo"
              className="h-24 w-24 sm:h-36 sm:w-36 object-contain rounded-2xl"
            />
          </div>
        </div>
      </div>

      {/* 2. Key Metrics & Value Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-border-app shadow-sm space-y-2 hover:border-brand/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-text-primary">Live Sync</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Directly coupled with Wikimedia Action API. Vote counts, titles, and discussions mirror Meta-Wiki in real time.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border-app shadow-sm space-y-2 hover:border-brand/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-text-primary">100% Genuine Identity</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            RFC 5849 OAuth 1.0a authentication ensures zero mock accounts, zero identity spoofing, and verified contributor rights.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border-app shadow-sm space-y-2 hover:border-brand/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <MessageSquare className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-text-primary">Direct Voting</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Support wishes, update comments, or withdraw votes directly within WikiWish—instantly published to Meta-Wiki.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border-app shadow-sm space-y-2 hover:border-brand/40 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-text-primary">Contributor Hub</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Search any contributor across Wikipedia and Wikimedia projects to review all wishes they’ve proposed or backed.
          </p>
        </div>
      </div>

      {/* 3. Interactive Section Tabs */}
      <div className="space-y-6">
        <div className="flex items-center justify-start border-b border-border-app pb-2 gap-2 overflow-x-auto scrollbar-none">
          {[
            { key: 'overview', label: 'Platform Mission', icon: Layers },
            { key: 'submit', label: 'How to Submit a Wish', icon: Lightbulb },
            { key: 'curate', label: 'Curation Playbook', icon: BookmarkCheck },
            { key: 'architecture', label: 'Technical Architecture', icon: Code2 },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Platform Mission */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-surface border border-border-app shadow-sm space-y-4">
                <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  The Challenge
                </span>
                <h3 className="text-xl font-bold text-text-primary">
                  Community Wishlist Fragmentation
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  The Wikimedia Community Wishlist receives hundreds of requests annually across dozens of language wikis. Proposers and supporters often find it difficult to track the lifecycle of their submissions, discover relevant proposals, or observe real-time engineering progress scattered across wikitext and talk pages.
                </p>
                <ul className="space-y-2 text-xs text-text-secondary">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Hard to track where wishes stand in engineering backlogs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Disjointed feedback loops across multiple project namespaces
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Limited visibility into which contributors share similar workflow needs
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl bg-surface border border-brand/30 shadow-sm space-y-4 ring-1 ring-brand/10">
                <span className="text-xs font-bold text-brand bg-brand/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  The WikiWish Solution
                </span>
                <h3 className="text-xl font-bold text-text-primary">
                  Unified, Transparent & Interactive
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  WikiWish bridges the gap between everyday wiki editors and software teams. It provides a real-time, categorized feed, personalized contributor dashboards, and two-way API support voting without bypassing MediaWiki authentication or licensing requirements.
                </p>
                <ul className="space-y-2 text-xs text-text-secondary">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    Instant overview of wishes you created or voted for
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    Direct support voting and comment updates synced to Meta-Wiki
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    Status pipelines highlighting actionable community opportunities
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: How to Submit a Wish */}
        {activeTab === 'submit' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Step-by-Step Interactive Guide */}
            <div className="grid md:grid-cols-4 gap-4">
              {[
                {
                  step: '01',
                  title: 'Search & Discover',
                  desc: 'Search WikiWish or Meta-Wiki first. If an existing proposal matches your idea, support it to consolidate votes.',
                  icon: Search,
                },
                {
                  step: '02',
                  title: 'Define the Pain Point',
                  desc: 'Focus on the problem you encounter while editing or reading, rather than dictating technical implementation details.',
                  icon: FileText,
                },
                {
                  step: '03',
                  title: 'Submit via Intake',
                  desc: 'Use Special:WishlistIntake on Meta-Wiki. Select project tags, target audience, and wish type (Feature / Bug / Change).',
                  icon: Lightbulb,
                },
                {
                  step: '04',
                  title: 'Engage & Refine',
                  desc: 'Your wish receives a canonical ID (e.g. W935). Engage on its talk page as community members vote and discuss.',
                  icon: MessageSquare,
                },
              ].map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-surface border border-border-app shadow-sm space-y-3 relative overflow-hidden group hover:border-brand/40 transition-all"
                  >
                    <span className="text-3xl font-extrabold text-brand/20 font-mono">
                      {s.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h4 className="font-bold text-sm text-text-primary">{s.title}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">{s.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Interactive Submission Readiness Checklist */}
            <div className="p-6 rounded-2xl bg-surface border border-border-app shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-app pb-4">
                <div>
                  <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                    <BookmarkCheck className="h-4 w-4 text-brand" />
                    <span>Wish Proposal Readiness Checklist</span>
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Click each item as you prepare your submission to verify proposal completeness.
                  </p>
                </div>
                <div className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-brand/10 text-brand shrink-0">
                  {completedChecklistCount} of {checklist.length} Completed
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                {checklist.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      item.checked
                        ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300'
                        : 'bg-surface-elevated/40 border-border-app text-text-primary hover:border-border-hover'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        item.checked
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-text-muted bg-surface'
                      }`}
                    >
                      {item.checked && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>
                    <span className="text-xs font-medium leading-snug">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border-app">
                <p className="text-xs text-text-muted">
                  Ready to post? Wikimedia's official intake wizard guides you through the final publishing step.
                </p>
                <a
                  href="https://meta.wikimedia.org/wiki/Special:WishlistIntake"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button size="sm" className="w-full justify-center gap-2 text-xs font-semibold">
                    <span>Open Special:WishlistIntake</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Curation Playbook */}
        {activeTab === 'curate' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-2xl bg-surface border border-border-app shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <BookmarkCheck className="h-5 w-5 text-brand" />
                <span>What is Wish Curation?</span>
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Submitting a wish is just the first step. <strong>Curation</strong> is the collaborative movement effort to refine, tag, clarify, and advance requests until volunteer developers, affiliate groups, or engineering teams can implement them.
              </p>
            </div>

            {/* Lifecycle Stages */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-surface border border-border-app space-y-2">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded">
                  Under Review
                </span>
                <h4 className="font-bold text-sm text-text-primary">Triage & Feasibility</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Newly proposed requests evaluated by community curators and WMF teams. Curators check if existing gadgets or tools already address the need.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-border-app space-y-2">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded">
                  Needs Clarification
                </span>
                <h4 className="font-bold text-sm text-text-primary">Scope Refinement</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Wishes with ambiguous use cases. Curators leave questions on the proposal’s talk page to help the proposer specify exact user workflows.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-border-app space-y-2">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded">
                  Community Opportunity
                </span>
                <h4 className="font-bold text-sm text-text-primary">Volunteer & Hackathon Ready</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  High-potential wishes ready for volunteer programmers, Toolforge developers, or Wikimedia Hackathon teams to build and deploy.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-border-app space-y-2">
                <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded">
                  Completed
                </span>
                <h4 className="font-bold text-sm text-text-primary">Deployed to Production</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Features and fixes that have been merged, released, and verified in MediaWiki core or extension repositories.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-border-app space-y-2">
                <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded">
                  Declined
                </span>
                <h4 className="font-bold text-sm text-text-primary">Resolution & Explanation</h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Closed with a transparent rationale (e.g. duplicate request, technically infeasible, or contrary to Wikimedia safety and privacy guidelines).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-brand/5 border border-brand/20 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-brand uppercase tracking-wider">
                    How you can help
                  </span>
                  <h4 className="font-bold text-sm text-text-primary">Start Curating Now</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Filter by status in Discover to find wishes that need your feedback or coding expertise.
                  </p>
                </div>
                <Link to="/explore">
                  <Button size="sm" className="w-full text-xs font-semibold">
                    Browse Wishes to Curate
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Technical Architecture */}
        {activeTab === 'architecture' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-surface border border-border-app space-y-2">
                <div className="flex items-center gap-2 text-brand font-bold text-sm">
                  <Database className="h-4 w-4" />
                  <span>MediaWiki Action API</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Retrieves live wish entities via <code className="bg-surface-elevated px-1 py-0.5 rounded">list=communityrequests-wishes</code> and parses real-time wikitext supporters.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-border-app space-y-2">
                <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                  <ShieldCheck className="h-4 w-4" />
                  <span>RFC 5849 OAuth 1.0a</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Strict cryptographic HMAC-SHA1 signatures securely sign edits under each contributor's verified Wikimedia credentials.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-border-app space-y-2">
                <div className="flex items-center gap-2 text-purple-500 font-bold text-sm">
                  <Cpu className="h-4 w-4" />
                  <span>Native Extension API</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Executes MediaWiki's native <code className="bg-surface-elevated px-1 py-0.5 rounded">action=wishlistvote</code> for canonical vote recording and cache purging.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-border-app space-y-2">
                <div className="flex items-center gap-2 text-blue-500 font-bold text-sm">
                  <Code2 className="h-4 w-4" />
                  <span>React 18 & TypeScript</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Modular component architecture with TanStack React Query for aggressive caching, real-time query invalidation, and fluid routing.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-border-app space-y-2">
                <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                  <Layers className="h-4 w-4" />
                  <span>Toolforge Ready</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Tailored for Wikimedia Toolforge hosting with environment-configured reverse proxies, TLS, and cross-origin resource sharing.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface border border-border-app space-y-2">
                <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                  <Heart className="h-4 w-4" />
                  <span>CC BY-SA 4.0 Compliance</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  All support comments and contributions inherit Wikimedia's Creative Commons Attribution-ShareAlike 4.0 and GFDL licenses.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Interactive Accordion FAQ */}
      <div className="space-y-4">
        <div className="border-b border-border-app pb-3">
          <h2 className="text-2xl font-extrabold text-text-primary flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-brand" />
            <span>Frequently Asked Questions</span>
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Learn more about Wikimedia OAuth, voting mechanics, and how WikiWish operates.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Do I need a Wikimedia account to use WikiWish?',
              a: 'You can freely browse, search, and filter wishes, inspect contributor activities, and review statistics without logging in. To officially support a wish or submit a comment that publishes to Meta-Wiki, you must authenticate with your verified Wikimedia account via OAuth.',
            },
            {
              q: 'How does my vote get reflected on Wikimedia Meta-Wiki?',
              a: 'When you click Support, WikiWish signs an authenticated request using your Wikimedia OAuth tokens and invokes MediaWiki’s native action=wishlistvote API. Your vote and optional comment are recorded directly onto Meta-Wiki under your genuine username.',
            },
            {
              q: 'Can I edit my comment or withdraw my support vote later?',
              a: 'Yes! WikiWish detects your active support state automatically. On any supported wish page, you will see options to "Edit comment" or "Remove support". Both actions immediately update the votes page and purge the wish entity cache on Meta-Wiki.',
            },
            {
              q: 'Is WikiWish an official Wikimedia Foundation product?',
              a: 'WikiWish is an independent community tool built to serve the Wikimedia movement. It interacts with the official MediaWiki APIs on Meta-Wiki in accordance with Wikimedia API and bot policies.',
            },
            {
              q: 'How are my Wikimedia account credentials protected?',
              a: 'WikiWish uses OAuth 1.0a. WikiWish never sees or stores your Wikimedia password. Authentication occurs directly on Wikimedia’s secure authorization servers, which issue scoped API access tokens to sign your wish edits.',
            },
          ].map((faq, idx) => {
            const isExpanded = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border-app bg-surface overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-elevated/40 transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-text-primary">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-surface-elevated flex items-center justify-center shrink-0 text-text-muted transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 bg-brand/10 text-brand' : ''
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border-app/40 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Bottom Call to Action Banner */}
      <div className="rounded-3xl border border-brand/20 bg-gradient-to-r from-brand/10 via-surface to-brand/5 p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-extrabold text-text-primary">
            Ready to shape the future of Wikimedia?
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
            Explore live proposals, vote for technical features that matter to your community, or submit your own wish today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link to="/explore">
            <Button className="font-semibold shadow-sm flex items-center gap-2">
              <span>Discover Wishes</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
