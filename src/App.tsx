import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Bell,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Database,
  FileText,
  Globe,
  Lock,
  MessagesSquare,
  Plug,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sparkles,
  Sun,
  Upload,
  Workflow,
  X,
  Moon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * BAT — Business Automated Thought (UI Preview)
 * UI-only preview. Connectors, uploads, workflows, and notifications are mocked.
 *
 * Reverted: full tabbed layout + right-side notifications feed with compact cards.
 */

const FADE = {
  initial: { opacity: 0, y: 10, filter: "blur(2px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(2px)" },
  transition: { type: "spring", stiffness: 220, damping: 22 },
} as const;

type TabKey = "chat" | "generate" | "calendar" | "brain" | "analytics";

type TabMeta = { key: TabKey; label: string; icon: React.ReactNode };

type WorkflowItem = {
  id: string;
  name: string;
  category: string;
  cadence: string;
  status: "Running" | "Paused";
  impact: string;
};

type NotificationSeverity = "Info" | "Warning" | "Critical";

type AppKey = "instagram" | "tiktok" | "youtube" | "linkedin" | "x" | "meta";

type NotificationItem = {
  id: string;
  title: string;
  summary: string;
  app: AppKey;
  automation: string;
  severity: NotificationSeverity;
  time: string;
  ctaHint?: string;
};

const TAB_META: TabMeta[] = [
  { key: "chat", label: "Campaign Hub", icon: <Sparkles className="h-4 w-4" /> },
  { key: "generate", label: "Create Content", icon: <FileText className="h-4 w-4" /> },
  { key: "calendar", label: "Content Calendar", icon: <Calendar className="h-4 w-4" /> },
  { key: "brain", label: "BAT Studio", icon: <Brain className="h-4 w-4" /> },
  { key: "analytics", label: "Performance", icon: <BarChart3 className="h-4 w-4" /> },
];

const TAB_STYLE: Record<TabKey, { glow: string; ring: string; icon: string }> = {
  chat: {
    glow: "from-amber-500/20 via-orange-500/15 to-rose-500/20",
    ring: "ring-amber-500/20",
    icon: "text-amber-200/80",
  },
  generate: {
    glow: "from-blue-500/20 via-indigo-500/15 to-violet-500/20",
    ring: "ring-blue-500/20",
    icon: "text-blue-200/80",
  },
  calendar: {
    glow: "from-lime-500/20 via-emerald-500/15 to-green-500/20",
    ring: "ring-lime-500/20",
    icon: "text-lime-200/80",
  },
  brain: {
    glow: "from-emerald-500/20 via-teal-500/15 to-cyan-500/20",
    ring: "ring-emerald-500/20",
    icon: "text-emerald-200/80",
  },
  analytics: {
    glow: "from-cyan-500/20 via-sky-500/15 to-indigo-500/20",
    ring: "ring-cyan-500/20",
    icon: "text-cyan-200/80",
  },
};

const appsCatalog = [
  {
    key: "instagram",
    name: "Instagram",
    desc: "Reels, carousels, and creator collaborations.",
    badge: "Reels",
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    key: "tiktok",
    name: "TikTok",
    desc: "Short-form trends, hooks, and fast edits.",
    badge: "Shorts",
    icon: <Workflow className="h-4 w-4" />,
  },
  {
    key: "youtube",
    name: "YouTube",
    desc: "Long-form strategy, thumbnails, and series.",
    badge: "Video",
    icon: <Upload className="h-4 w-4" />,
  },
  {
    key: "linkedin",
    name: "LinkedIn",
    desc: "Founder POV, company news, and lead gen.",
    badge: "B2B",
    icon: <MessagesSquare className="h-4 w-4" />,
  },
  {
    key: "x" as const,
    name: "X / Twitter",
    desc: "Threads, rapid takes, and community replies.",
    badge: "Realtime",
    icon: <RefreshCw className="h-4 w-4" />,
  },
  {
    key: "meta",
    name: "Meta Ads",
    desc: "Paid social creative + audience testing.",
    badge: "Paid",
    icon: <Search className="h-4 w-4" />,
  },
];

type AppMeta = (typeof appsCatalog)[number];

const starterWorkflows: WorkflowItem[] = [
  {
    id: "wf-01",
    name: "Trend Radar Sprint",
    category: "Creative",
    cadence: "Every weekday 08:00",
    status: "Running",
    impact: "Pulls trending hooks + audio for the content queue.",
  },
  {
    id: "wf-02",
    name: "Performance Guardrails",
    category: "Paid Social",
    cadence: "Hourly",
    status: "Running",
    impact: "Flags spikes or drops in CTR, CPC, and ROAS.",
  },
  {
    id: "wf-03",
    name: "Creator Collab Tracker",
    category: "Partnerships",
    cadence: "Daily 18:00",
    status: "Paused",
    impact: "Summarizes collab outreach status + follow-ups.",
  },
];

const sampleUsage = [
  { d: "Mon", q: 18, docs: 42 },
  { d: "Tue", q: 24, docs: 58 },
  { d: "Wed", q: 21, docs: 71 },
  { d: "Thu", q: 29, docs: 64 },
  { d: "Fri", q: 33, docs: 83 },
  { d: "Sat", q: 17, docs: 55 },
  { d: "Sun", q: 14, docs: 49 },
];

const sampleNotifications: NotificationItem[] = [
  {
    id: "nt-01",
    title: "Reel retention dipped",
    summary:
      "Instagram Reels avg watch time fell 18% on the last 3 posts. Hook might be too slow.",
    app: "instagram",
    automation: "Hook Velocity Monitor",
    severity: "Warning",
    time: "4m ago",
    ctaHint: "Generate new hooks + openers",
  },
  {
    id: "nt-02",
    title: "TikTok spike detected",
    summary: "One TikTok hit 2.3x baseline views in 2 hours.",
    app: "tiktok",
    automation: "Trend Radar Sprint",
    severity: "Info",
    time: "18m ago",
    ctaHint: "Spin 3 follow-up variants",
  },
  {
    id: "nt-03",
    title: "YouTube thumbnail underperforming",
    summary: "CTR dropped below 3.2% on the latest upload.",
    app: "youtube",
    automation: "Thumbnail A/B Watch",
    severity: "Warning",
    time: "Today 09:12",
    ctaHint: "Generate 5 new thumbnail concepts",
  },
  {
    id: "nt-04",
    title: "Paid creative fatigue",
    summary: "Meta Ads CTR declined 22% week-over-week on core creative.",
    app: "meta",
    automation: "Performance Guardrails",
    severity: "Critical",
    time: "Yesterday 18:40",
    ctaHint: "Refresh ad creative with new angles",
  },
];

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium text-foreground shadow-sm">
      {children}
    </span>
  );
}

function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription className="text-sm">{label}</CardDescription>
          <div className="text-muted-foreground">{icon}</div>
        </div>
        <CardTitle className="text-2xl tracking-tight">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

function Copyable({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-2xl border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="mt-1 break-all text-xs text-muted-foreground">
            {value}
          </div>
        </div>
        <Button
          variant="ghost"
          className="rounded-2xl hover:scale-[1.02] transition-transform duration-200"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            } catch {
              // ignore
            }
          }}
        >
          {copied ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Copied
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" /> Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ChatMessage({
  role,
  text,
  meta,
}: {
  role: "user" | "assistant";
  text: string;
  meta?: string;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[86%] rounded-2xl border px-4 py-3 shadow-sm ${
          isUser ? "bg-primary text-primary-foreground" : "bg-background"
        }`}
      >
        <div className="text-sm leading-relaxed">{text}</div>
        {meta ? (
          <div
            className={`mt-2 text-xs ${
              isUser ? "text-primary-foreground/80" : "text-muted-foreground"
            }`}
          >
            {meta}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-lg font-semibold tracking-tight">{title}</div>
        <div className="text-sm text-muted-foreground">{subtitle}</div>
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

function TopBar({
  tier = "Premium",
  theme,
  onToggleTheme,
}: {
  tier?: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  const isDark = theme === "dark";
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border bg-background shadow-sm">
          <span className="text-sm font-black">B</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="text-xl font-semibold tracking-tight">BAT Social</div>
            <Badge
              className="rounded-full"
              variant={tier === "Premium" ? "default" : "secondary"}
            >
              {tier}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Social media marketing studio powered by BAT Brain.
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          className="rounded-2xl hover:scale-[1.02] transition-transform duration-200"
          onClick={onToggleTheme}
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          {isDark ? (
            <>
              <Sun className="mr-2 h-4 w-4" /> Light
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" /> Dark
            </>
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="rounded-2xl hover:scale-[1.02] transition-transform duration-200"
            >
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>BAT Preferences</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Lock className="mr-2 h-4 w-4" /> Data Access Controls
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Shield className="mr-2 h-4 w-4" /> Compliance Mode
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Workflow className="mr-2 h-4 w-4" /> Automations
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button className="rounded-2xl hover:scale-[1.03] transition-transform duration-300 shadow-[0_0_20px_rgba(0,255,255,0.25)] bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
          <Sparkles className="mr-2 h-4 w-4" /> New Insight
        </Button>
      </div>
    </div>
  );
}

function TabNav({ tab, setTab }: { tab: TabKey; setTab: (t: TabKey) => void }) {
  return (
    <div className="rounded-2xl border bg-muted/20 p-1.5 sm:p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-5 md:gap-2">
        {TAB_META.map((t) => {
          const styles = TAB_STYLE[t.key];
          const active = tab === t.key;
          return (
            <motion.button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className={[
                "group relative isolate flex items-center justify-center gap-2 rounded-xl",
                "px-2.5 py-2 sm:px-3 sm:py-2.5",
                "min-h-[40px] sm:min-h-[44px]",
                "text-[13px] sm:text-sm font-medium",
                "transition-all",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <span
                className={[
                  "pointer-events-none absolute inset-0 -z-20 rounded-xl opacity-0",
                  "bg-gradient-to-r",
                  styles.glow,
                  "transition-opacity duration-200",
                  active ? "opacity-100" : "group-hover:opacity-70",
                ].join(" ")}
              />

              {active ? (
                <motion.span
                  layoutId="active-pill"
                  className={[
                    "absolute inset-0 -z-10 rounded-xl",
                    "bg-background/70 backdrop-blur",
                    "ring-1",
                    styles.ring,
                    "shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_10px_30px_rgba(0,0,0,0.18),0_0_24px_rgba(56,189,248,0.12)]",
                  ].join(" ")}
                  transition={{ type: "spring", stiffness: 520, damping: 38 }}
                />
              ) : null}

              <span
                className={
                  "inline-flex items-center justify-center " +
                  (active ? "text-foreground" : styles.icon)
                }
              >
                {t.icon}
              </span>
              <span className="truncate">{t.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function IntegrationCard({
  app,
  connected,
  onConnect,
  onDisconnect,
}: {
  app: AppMeta;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border bg-background shadow-sm">
              {app.icon}
            </div>
            <div>
              <CardTitle className="text-base">{app.name}</CardTitle>
              <CardDescription className="text-xs">{app.desc}</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="rounded-full">
            {app.badge}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">Connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Not connected</span>
              </>
            )}
          </div>
          {connected ? (
            <Button variant="ghost" className="rounded-2xl" onClick={onDisconnect}>
              Disconnect
            </Button>
          ) : (
            <Button className="rounded-2xl" onClick={onConnect}>
              <Plug className="mr-2 h-4 w-4" /> Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function WorkflowRow({
  wf,
  onToggle,
}: {
  wf: WorkflowItem;
  onToggle: (id: string) => void;
}) {
  const running = wf.status === "Running";
  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="truncate text-sm font-semibold">{wf.name}</div>
          <Badge variant="secondary" className="rounded-full">
            {wf.category}
          </Badge>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{wf.impact}</div>
        <div className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Pill>{wf.cadence}</Pill>
          <Pill>{running ? "Live" : "Paused"}</Pill>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {running ? "On" : "Off"}
          </span>
          <Switch checked={running} onCheckedChange={() => onToggle(wf.id)} />
        </div>
        <Button variant="ghost" className="rounded-2xl">
          Configure <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ApprovalRow({
  label,
  defaultOn = false,
}: {
  label: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between rounded-2xl border bg-background p-4 shadow-sm">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {on ? "Included in BAT outputs" : "Excluded from BAT outputs"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{on ? "On" : "Off"}</span>
        <Switch checked={on} onCheckedChange={setOn} />
      </div>
    </div>
  );
}

function labelDocType(type: string) {
  switch (type) {
    case "content_plan":
      return "Content Plan";
    case "creative_sprint":
      return "Creative Sprint";
    case "campaign_brief":
      return "Campaign Brief";
    case "thumbnail_pack":
      return "Thumbnail Pack";
    case "ad_pack":
      return "Paid Ad Pack";
    default:
      return "Document";
  }
}

function labelTone(tone: string) {
  switch (tone) {
    case "executive":
      return "Executive";
    case "operator":
      return "Operator";
    case "investor":
      return "Investor";
    case "team":
      return "Team-friendly";
    default:
      return "Standard";
  }
}

function severityPill(sev: NotificationSeverity) {
  switch (sev) {
    case "Critical":
      return {
        label: "Critical",
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
      };
    case "Warning":
      return { label: "Warning", icon: <AlertCircle className="h-3.5 w-3.5" /> };
    default:
      return { label: "Info", icon: <Bell className="h-3.5 w-3.5" /> };
  }
}

function buildTalkPrompt(orgId: string, appName: string, n: NotificationItem) {
  return `Org ${orgId}: Notification from ${appName} (${n.automation}) — ${n.title}. Details: ${n.summary}. Explain what happened, why, and what I should do next.`;
}

function buildGenConstraints(n: NotificationItem) {
  return `Use this notification as the primary context:\n- App: ${n.app}\n- Automation: ${n.automation}\n- Alert: ${n.title}\n- Details: ${n.summary}\n\nOutput a concise brief with: (1) what happened, (2) likely causes, (3) immediate actions, (4) follow-ups, (5) questions to validate in the source app. Keep it under 1 page.`;
}

function NotificationRow({
  item,
  app,
  unread,
  expanded,
  onToggleExpand,
  onTalk,
  onGenerate,
  onMarkRead,
  onDismiss,
}: {
  item: NotificationItem;
  app: AppMeta;
  unread: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onTalk: () => void;
  onGenerate: () => void;
  onMarkRead: () => void;
  onDismiss: () => void;
}) {
  const sev = severityPill(item.severity);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggleExpand}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggleExpand();
        }
      }}
      className={[
        "w-full text-left rounded-xl border bg-background shadow-sm",
        "transition-all hover:shadow-md",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        unread ? "ring-1 ring-primary/20" : "opacity-95",
      ].join(" ")}
    >
      {/* Compact header (small card) */}
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex items-start gap-2">
            <div className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-lg border bg-background shadow-sm">
              {app.icon}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="truncate text-sm font-semibold">{item.title}</div>
                {unread ? (
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                ) : null}
              </div>

              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {item.time}
                </span>
                <span>•</span>
                <span className="truncate">{app.name}</span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="secondary"
                  className="rounded-full inline-flex items-center gap-1 text-[11px] px-2 py-0"
                >
                  {sev.icon} {sev.label}
                </Badge>
                <Badge
                  variant="secondary"
                  className="rounded-full text-[11px] px-2 py-0"
                >
                  {item.automation}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-none items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-xl px-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMarkRead();
              }}
            >
              {unread ? "Read" : "Unread"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-xl px-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDismiss();
              }}
              aria-label="Dismiss"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="mt-0.5 text-muted-foreground">
              <ChevronRight
                className={[
                  "h-4 w-4 transition-transform",
                  expanded ? "rotate-90" : "",
                ].join(" ")}
              />
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              key="expanded"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="pt-2.5">
                <div className="rounded-xl border bg-muted/10 p-2.5 text-xs text-muted-foreground leading-relaxed">
                  {item.summary}
                </div>

                {item.ctaHint ? (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {item.ctaHint}
                  </div>
                ) : null}

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <Button
                    className="h-9 rounded-xl"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onTalk();
                    }}
                  >
                    <MessagesSquare className="mr-2 h-4 w-4" /> Talk to BAT
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-9 rounded-xl"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onGenerate();
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" /> Generate
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

const generationCategories = [
  {
    key: "content",
    label: "Content Engine",
    description: "High-velocity posts, reels, and shorts.",
    accent: "from-lime-400/20 via-green-500/10 to-emerald-500/20",
    badge: "Core",
    inputs: [
      {
        label: "Channel",
        options: ["Instagram", "TikTok", "YouTube Shorts", "LinkedIn", "X / Twitter"],
      },
      {
        label: "Format",
        options: ["Post", "Reel", "Carousel", "Short video", "Thread"],
      },
      {
        label: "Goal",
        options: ["Awareness", "Engagement", "Leads", "Conversion", "Retention"],
      },
    ],
  },
  {
    key: "creative",
    label: "Creative Lab",
    description: "Hooks, scripts, thumbnails, and storyboards.",
    accent: "from-emerald-400/20 via-lime-500/10 to-green-500/20",
    badge: "Studio",
    inputs: [
      { label: "Artifact", options: ["Hook Pack", "Script", "Storyboard", "Thumbnail"] },
      { label: "Style", options: ["Bold", "Clean", "Edgy", "Premium", "Playful"] },
      { label: "Inspiration", options: ["Competitors", "Top posts", "Trends", "UGC"] },
    ],
  },
  {
    key: "paid",
    label: "Paid Social",
    description: "Meta ad packs, variants, and testing plans.",
    accent: "from-green-400/20 via-lime-500/10 to-emerald-500/20",
    badge: "Ads",
    inputs: [
      { label: "Platform", options: ["Meta", "TikTok", "YouTube", "LinkedIn"] },
      { label: "Asset", options: ["Ad Copy", "Creative Pack", "Landing Brief"] },
      { label: "Objective", options: ["Acquire", "Retarget", "Upsell", "Launch"] },
    ],
  },
  {
    key: "community",
    label: "Community",
    description: "Replies, engagement loops, and creator collabs.",
    accent: "from-lime-500/20 via-emerald-500/10 to-green-500/20",
    badge: "Social",
    inputs: [
      { label: "Channel", options: ["Instagram", "TikTok", "YouTube", "LinkedIn"] },
      { label: "Action", options: ["Engage", "Collaborate", "Moderate", "Respond"] },
      { label: "Tone", options: ["Helpful", "Playful", "Expert", "Hype"] },
    ],
  },
];

function GenerateStudio({
  onGenerate,
  seed,
}: {
  onGenerate: (args: { type: string; tone: string; constraints: string }) => void;
  seed?: { type?: string; tone?: string; constraints?: string; key?: string };
}) {
  const [selectedCategory, setSelectedCategory] = useState(
    generationCategories[0].key
  );
  const [selectedInputs, setSelectedInputs] = useState<Record<string, string>>(() =>
    generationCategories.reduce((acc, category) => {
      category.inputs.forEach((input) => {
        acc[`${category.key}:${input.label}`] = input.options[0];
      });
      return acc;
    }, {} as Record<string, string>)
  );
  const safeSelectedInputs = useMemo(() => {
    const next = { ...selectedInputs };
    generationCategories.forEach((category) => {
      category.inputs.forEach((input) => {
        const key = `${category.key}:${input.label}`;
        if (!next[key]) {
          next[key] = input.options[0];
        }
      });
    });
    return next;
  }, [selectedInputs]);
  const [inputQuery, setInputQuery] = useState<Record<string, string>>({});
  const [expandedInputs, setExpandedInputs] = useState<Record<string, boolean>>({});
  const [activeField, setActiveField] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(
    "Generate a high-impact artifact using the last 30 days of data. Highlight insights, assets, and next actions."
  );

  useEffect(() => {
    if (!seed) return;
    if (seed.constraints) setPrompt(seed.constraints);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed?.key]);

  const activeCategory =
    generationCategories.find((category) => category.key === selectedCategory) ??
    generationCategories[0];

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden rounded-3xl border bg-background shadow-[0_0_35px_rgba(56,189,248,0.12)]">
        <motion.div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-fuchsia-500/10"
          animate={{ opacity: [0.45, 0.8, 0.45] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <CardHeader className="gap-2">
          <CardTitle className="text-xl">Generate anything</CardTitle>
          <CardDescription>
            BAT Studio turns your data and memory into media, policies, diagrams, and
            execution-ready artifacts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-5">
            {generationCategories.map((category, index) => (
              <motion.button
                key={category.key}
                type="button"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * index }}
                onClick={() => setSelectedCategory(category.key)}
                className={[
                  "rounded-2xl border px-3 py-3 text-left transition-all",
                  selectedCategory === category.key
                    ? "border-primary/40 bg-primary/10 shadow-[0_0_18px_rgba(56,189,248,0.2)]"
                    : "bg-background hover:border-primary/30",
                ].join(" ")}
              >
                <div className="text-sm font-semibold">{category.label}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {category.description}
                </div>
                <div className="mt-2">
                  <Badge variant="secondary" className="rounded-full">
                    {category.badge}
                  </Badge>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="space-y-4">
              <div
                className={[
                  "rounded-3xl border p-5",
                  "bg-gradient-to-br",
                  activeCategory.accent,
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold">{activeCategory.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {activeCategory.description}
                    </div>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {activeCategory.badge}
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {activeCategory.inputs.map((input) => {
                      const key = `${activeCategory.key}:${input.label}`;
                      return (
                        <Pill key={input.label}>
                          {input.label}: {safeSelectedInputs[key]}
                        </Pill>
                      );
                    })}
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    {activeCategory.inputs.map((input) => {
                      const key = `${activeCategory.key}:${input.label}`;
                      const selected = safeSelectedInputs[key] ?? input.options[0];
                      const query = inputQuery[key] ?? "";
                      const filteredOptions = input.options.filter((option) =>
                        option.toLowerCase().includes(query.trim().toLowerCase())
                      );
                      const showAll = expandedInputs[key] ?? false;
                      const visibleOptions = showAll
                        ? filteredOptions
                        : filteredOptions.slice(0, 10);
                      const isOpen = activeField === key;

                      return (
                        <div
                          key={input.label}
                          className="rounded-2xl border bg-background/60 p-3"
                        >
                          <button
                            type="button"
                            className="flex w-full items-center justify-between text-left"
                            onClick={() => setActiveField(isOpen ? null : key)}
                          >
                            <div>
                              <div className="text-xs font-medium text-muted-foreground">
                                {input.label}
                              </div>
                              <div className="mt-1 text-sm font-semibold">{selected}</div>
                            </div>
                            <ChevronRight
                              className={[
                                "h-4 w-4 text-muted-foreground transition-transform",
                                isOpen ? "rotate-90" : "",
                              ].join(" ")}
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen ? (
                              <motion.div
                                key={`${key}-panel`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-3 space-y-3">
                                  <div className="flex items-center gap-2 rounded-2xl border bg-background/70 px-3 py-2 text-xs">
                                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                                    <input
                                      value={query}
                                      onChange={(e) =>
                                        setInputQuery((prev) => ({
                                          ...prev,
                                          [key]: e.target.value,
                                        }))
                                      }
                                      placeholder={`Search ${input.label.toLowerCase()}…`}
                                      className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                                    />
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {visibleOptions.map((option) => (
                                      <motion.button
                                        key={option}
                                        type="button"
                                        whileHover={{ y: -1 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() =>
                                          setSelectedInputs((prev) => ({
                                            ...prev,
                                            [key]: option,
                                          }))
                                        }
                                        className={[
                                          "rounded-full border px-3 py-1 text-xs transition-all",
                                          selected === option
                                            ? "border-primary/50 bg-primary/20 text-foreground"
                                            : "bg-background/60 text-muted-foreground",
                                        ].join(" ")}
                                      >
                                        {option}
                                      </motion.button>
                                    ))}
                                    {filteredOptions.length === 0 ? (
                                      <div className="text-xs text-muted-foreground">
                                        No matches. Try another keyword.
                                      </div>
                                    ) : null}
                                  </div>
                                  {filteredOptions.length > 10 ? (
                                    <button
                                      type="button"
                                      className="text-xs text-muted-foreground hover:text-foreground"
                                      onClick={() =>
                                        setExpandedInputs((prev) => ({
                                          ...prev,
                                          [key]: !showAll,
                                        }))
                                      }
                                    >
                                      {showAll ? "Show fewer" : "Show all options"}
                                    </button>
                                  ) : null}
                                </div>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-background p-4 space-y-3">
                <div className="text-sm font-semibold">Generation prompt</div>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[110px] rounded-2xl"
                  placeholder="Describe the artifact, audience, and success criteria..."
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="h-4 w-4" /> Uses only sources you’ve approved.
                  </div>
                  <Button
                    className="rounded-2xl"
                    onClick={() => {
                      const inputSummary = activeCategory.inputs
                        .map(
                          (input) =>
                            `${input.label}: ${
                              safeSelectedInputs[`${activeCategory.key}:${input.label}`]
                            }`
                        )
                        .join(" • ");
                      onGenerate({
                        type: `${activeCategory.label} • ${inputSummary}`,
                        tone: activeCategory.label,
                        constraints: prompt,
                      });
                    }}
                  >
                    <Sparkles className="mr-2 h-4 w-4" /> Launch generation
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border bg-background p-4">
                <div className="text-xs text-muted-foreground">Active category</div>
                <div className="mt-2 text-base font-semibold">{activeCategory.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {activeCategory.description}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  {activeCategory.inputs.map((input) => (
                    <Pill key={input.label}>
                      {safeSelectedInputs[`${activeCategory.key}:${input.label}`]}
                    </Pill>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border bg-background p-4">
                <div className="text-xs text-muted-foreground">Output pack</div>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Primary artifact</span>
                    <span className="text-muted-foreground">Draft</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Key assets</span>
                    <span className="text-muted-foreground">3 visuals</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Distribution plan</span>
                    <span className="text-muted-foreground">Timeline</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Live output stream</CardTitle>
            <CardDescription>Watch the workspace fill as BAT creates artifacts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                title: "Storyboards + hooks",
                detail: "3 narrative options generated from competitor analysis.",
                status: "Ready",
              },
              {
                title: "Draft artifact",
                detail: "Primary output assembled with brand tone + CTA.",
                status: "In progress",
              },
              {
                title: "Distribution plan",
                detail: "Release cadence + channel checklist.",
                status: "Queued",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="flex items-start justify-between gap-3 rounded-2xl border bg-muted/10 p-4"
              >
                <div>
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{item.detail}</div>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  {item.status}
                </Badge>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Access generated assets</CardTitle>
            <CardDescription>Everything is organized by channel and format.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Social media kit", meta: "Reel + captions + thumbnails" },
              { label: "Operations pack", meta: "Policy + BPMN diagram" },
              { label: "Legal templates", meta: "NDA + annexes" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border bg-background p-3"
              >
                <div>
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.meta}</div>
                </div>
                <Button variant="ghost" className="rounded-2xl">
                  Open <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="rounded-2xl border bg-muted/10 p-3 text-xs text-muted-foreground">
              BAT keeps source data, intermediate drafts, and final artifacts in a single
              workspace so teams can review and ship faster.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const calendarPlans = [
  {
    key: "weekly",
    label: "Weekly Sprint",
    range: "Next 7 days",
    cadence: "12 posts",
  },
  {
    key: "monthly",
    label: "Monthly Plan",
    range: "Next 30 days",
    cadence: "48 posts",
  },
  {
    key: "yearly",
    label: "Annual Strategy",
    range: "Next 12 months",
    cadence: "480 posts",
  },
];

const channelMix = [
  { channel: "Instagram", count: 8, formats: ["Reels", "Carousels", "Stories"] },
  { channel: "YouTube", count: 4, formats: ["Long-form", "Shorts", "Community"] },
  { channel: "TikTok", count: 6, formats: ["Trends", "UGC", "Duets"] },
  { channel: "LinkedIn", count: 4, formats: ["Founder POV", "Carousel", "Text"] },
];

function ContentCalendar() {
  const [planTitle, setPlanTitle] = useState("Untitled content plan");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [prompt, setPrompt] = useState("");
  const [platforms, setPlatforms] = useState({
    instagram: true,
    tiktok: true,
    youtube: true,
    linkedin: false,
  });
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [autoApproval, setAutoApproval] = useState(false);
  const [useScheduler, setUseScheduler] = useState(true);

  const goalOptions = [
    "Awareness",
    "Engagement",
    "Lead generation",
    "Product launch",
    "Retention",
  ];

  const platformMeta = {
    instagram: { label: "Instagram", icon: <Sparkles className="h-4 w-4" /> },
    tiktok: { label: "TikTok", icon: <Workflow className="h-4 w-4" /> },
    youtube: { label: "YouTube", icon: <Upload className="h-4 w-4" /> },
    linkedin: { label: "LinkedIn", icon: <MessagesSquare className="h-4 w-4" /> },
    x: { label: "X / Twitter", icon: <RefreshCw className="h-4 w-4" /> },
    meta: { label: "Meta Ads", icon: <Search className="h-4 w-4" /> },
  } as const;

  type PlatformKey = keyof typeof platformMeta;
  type PlanStatus = "In-progress" | "Completed" | "Cancelled" | "Draft";
  type PlanItem = {
    id: string;
    title: string;
    platform: PlatformKey;
    type: "Video" | "Image" | "Text";
    state: string;
    postState: string;
    time: string;
  };
  type ContentPlan = {
    id: string;
    title: string;
    status: PlanStatus;
    updated: string;
    owner: string;
    schedule: string;
    platforms: PlatformKey[];
    items: PlanItem[];
  };

  const approvalQueue = [
    {
      id: "asset-001",
      title: "Hook pack A",
      platform: "instagram",
      type: "Text",
      status: "Pending approval",
      summary: "5 short hooks focused on retention and watch-time.",
      preview:
        "1) Stop scrolling if your reels are stuck under 2k views. 2) Your content is fine, your first 2 seconds are killing it...",
    },
    {
      id: "asset-002",
      title: "Episode 4 teaser",
      platform: "youtube",
      type: "Video",
      status: "Pending approval",
      summary: "20-second teaser generated from the long-form script.",
      preview: "video",
    },
    {
      id: "asset-003",
      title: "Launch teaser still",
      platform: "instagram",
      type: "Image",
      status: "Needs updates",
      summary: "Static image creative for launch-day countdown post.",
      preview: "image",
    },
  ];

  const [approvedAssetIds, setApprovedAssetIds] = useState<Set<string>>(() => new Set());
  const [previewAssetId, setPreviewAssetId] = useState<string | null>(null);

  const [plans, setPlans] = useState<ContentPlan[]>([
    {
      id: "plan-current",
      title: "May Product Push",
      status: "In-progress",
      updated: "Today",
      owner: "Marketing Ops",
      schedule: "May 01 – May 31",
      platforms: ["instagram", "youtube", "linkedin"],
      items: [
        {
          id: "pi-1",
          title: "Instagram reel: 3 launch mistakes",
          platform: "instagram",
          type: "Video",
          state: "Approved",
          postState: "Scheduled",
          time: "May 08, 09:30",
        },
        {
          id: "pi-2",
          title: "LinkedIn launch breakdown",
          platform: "linkedin",
          type: "Text",
          state: "Pending",
          postState: "Draft",
          time: "Not scheduled",
        },
        {
          id: "pi-3",
          title: "YouTube teaser",
          platform: "youtube",
          type: "Video",
          state: "Approved",
          postState: "Completed",
          time: "May 03, 12:00",
        },
      ],
    },
    {
      id: "plan-april",
      title: "April Launch Sprint",
      status: "Completed",
      updated: "May 01",
      owner: "Demand Gen",
      schedule: "Apr 01 – Apr 30",
      platforms: ["instagram", "tiktok", "meta"],
      items: [
        {
          id: "pi-4",
          title: "Creator collaboration reel",
          platform: "instagram",
          type: "Video",
          state: "Approved",
          postState: "Completed",
          time: "Apr 27, 15:00",
        },
        {
          id: "pi-5",
          title: "Carousel: pricing FAQs",
          platform: "instagram",
          type: "Image",
          state: "Approved",
          postState: "Completed",
          time: "Apr 24, 10:00",
        },
      ],
    },
    {
      id: "plan-march",
      title: "Evergreen Refresh",
      status: "Cancelled",
      updated: "Apr 02",
      owner: "Brand Team",
      schedule: "Mar 01 – Mar 31",
      platforms: ["youtube", "linkedin"],
      items: [
        {
          id: "pi-6",
          title: "Weekly shorts recap",
          platform: "youtube",
          type: "Video",
          state: "Approved",
          postState: "Cancelled",
          time: "Cancelled before posting",
        },
      ],
    },
  ]);

  const [selectedPlanId, setSelectedPlanId] = useState("plan-current");
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? plans[0];

  const previewAsset = approvalQueue.find((item) => item.id === previewAssetId) ?? null;

  const workflowSteps = [
    { id: 1, label: "Define goal" },
    { id: 2, label: "Generate plan" },
    { id: 3, label: "Preview + approve" },
    { id: 4, label: "Publish + monitor" },
  ] as const;

  const toggleAssetApproval = (id: string) => {
    setApprovedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const cancelPlan = (id: string) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === id
          ? {
              ...plan,
              status: "Cancelled",
              items: plan.items.map((item) => ({
                ...item,
                postState:
                  item.postState === "Completed" ? "Completed" : "Cancelled",
                time:
                  item.postState === "Completed"
                    ? item.time
                    : "Cancelled before posting",
              })),
            }
          : plan
      )
    );
  };


  const createPlan = (asDraft: boolean) => {
    const id = `plan-${Date.now()}`;
    const enabledPlatforms = (Object.keys(platforms) as Array<keyof typeof platforms>)
      .filter((key) => platforms[key]) as PlatformKey[];

    const newPlan: ContentPlan = {
      id,
      title: planTitle.trim() || "Untitled content plan",
      status: asDraft ? "Draft" : "In-progress",
      updated: "Just now",
      owner: "You",
      schedule: asDraft ? "Draft • schedule not set" : "Upcoming 30 days",
      platforms: enabledPlatforms.length ? enabledPlatforms : ["instagram"],
      items: [
        {
          id: `${id}-item-1`,
          title: asDraft ? "Draft content item" : "Generated kickoff asset",
          platform: enabledPlatforms[0] ?? "instagram",
          type: "Text",
          state: asDraft ? "Draft" : "Pending",
          postState: asDraft ? "Draft" : useScheduler ? "Scheduled" : "Manual posting",
          time: asDraft ? "Not scheduled" : useScheduler ? "TBD by scheduler" : "Post manually",
        },
      ],
    };

    setPlans((prev) => [newPlan, ...prev]);
    setSelectedPlanId(id);
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border bg-background shadow-[0_0_35px_rgba(163,230,53,0.18)]">
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xl">Content Calendar</CardTitle>
              <CardDescription>
                Build a new plan first. Scheduling is optional but recommended.
              </CardDescription>
            </div>
            <Button className="rounded-2xl">
              <Calendar className="mr-2 h-4 w-4" /> New Content Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-2xl border bg-muted/10 p-4">
            <div className="text-sm font-semibold">New content plan workflow</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {workflowSteps.map((item) => {
                const active = step === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStep(item.id)}
                    className={[
                      "flex items-center gap-3 rounded-2xl border px-3 py-2 text-left transition-all",
                      active
                        ? "border-primary/50 bg-primary/15"
                        : "bg-background/70 hover:border-primary/30",
                    ].join(" ")}
                  >
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold">
                      {item.id}
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-2xl border bg-background/80">
              <CardHeader>
                <CardTitle className="text-base">Plan setup</CardTitle>
                <CardDescription>
                  Pick a goal (optional), add a prompt (optional), and start instantly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Plan title</div>
                  <Input
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    className="rounded-2xl"
                    placeholder="Name this content plan"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Goal</div>
                  <div className="flex flex-wrap gap-2">
                    {goalOptions.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => setSelectedGoal((cur) => (cur === goal ? "" : goal))}
                        className={[
                          "rounded-full border px-4 py-1.5 text-sm transition-all",
                          selectedGoal === goal
                            ? "border-primary/60 bg-primary/15 text-foreground"
                            : "bg-background text-muted-foreground",
                        ].join(" ")}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    Prompt (optional)
                  </div>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[90px] rounded-2xl"
                    placeholder="Optional context, campaign direction, tone, or constraints..."
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {(Object.keys(platforms) as Array<keyof typeof platforms>).map((key) => {
                    const isOn = platforms[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setPlatforms((prev) => ({
                            ...prev,
                            [key]: !prev[key],
                          }))
                        }
                        className={[
                          "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-all",
                          isOn
                            ? "border-primary/60 bg-primary/15 text-foreground"
                            : "bg-background text-muted-foreground",
                        ].join(" ")}
                      >
                        {platformMeta[key].icon}
                        {platformMeta[key].label}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2 rounded-2xl border bg-muted/10 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">Auto approval</div>
                      <div className="text-xs text-muted-foreground">
                        Approve generated pieces automatically.
                      </div>
                    </div>
                    <Switch checked={autoApproval} onCheckedChange={setAutoApproval} />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">Use scheduler</div>
                      <div className="text-xs text-muted-foreground">
                        Optional, but recommended for reliable posting.
                      </div>
                    </div>
                    <Switch checked={useScheduler} onCheckedChange={setUseScheduler} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button className="rounded-2xl" onClick={() => createPlan(false)}>
                    Launch Content Calendar
                  </Button>
                  <Button variant="outline" className="rounded-2xl" onClick={() => createPlan(true)}>
                    Save as Draft
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border bg-background/80">
              <CardHeader>
                <CardTitle className="text-base">Approvals</CardTitle>
                <CardDescription>
                  Preview each piece in detail, approve it, or download it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {approvalQueue.map((item) => {
                  const approved = autoApproval || approvedAssetIds.has(item.id);
                  return (
                    <div key={item.id} className="rounded-2xl border bg-muted/10 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold">{item.title}</div>
                          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                            {platformMeta[item.platform].icon}
                            {platformMeta[item.platform].label} • {item.type} • {approved ? "Approved" : item.status}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">{item.summary}</div>
                        </div>
                        <Badge variant="secondary" className="rounded-full">
                          {approved ? "Approved" : "Action needed"}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          className="rounded-2xl"
                          onClick={() => setPreviewAssetId(item.id)}
                        >
                          Preview
                        </Button>
                        <Button
                          variant="ghost"
                          className="rounded-2xl"
                        >
                          Download
                        </Button>
                        <Button
                          className="rounded-2xl"
                          onClick={() => toggleAssetApproval(item.id)}
                          disabled={autoApproval}
                        >
                          {approved ? "Unapprove" : "Approve"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border bg-background">
        <CardHeader>
          <CardTitle className="text-xl">Active & archived plans</CardTitle>
          <CardDescription>
            See statuses, platforms used, content status, and posting schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-2">
            {plans.map((plan) => {
              const active = selectedPlan.id === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={[
                    "w-full rounded-2xl border px-4 py-3 text-left transition-all",
                    active
                      ? "border-primary/50 bg-primary/15"
                      : "bg-background/70 hover:border-primary/30",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{plan.title}</div>
                    <Badge variant="secondary" className="rounded-full">
                      {plan.status}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{plan.schedule}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {plan.platforms.map((platformKey) => (
                      <span
                        key={`${plan.id}-${platformKey}`}
                        className="inline-flex items-center gap-1 rounded-full border bg-background/80 px-2 py-0.5 text-[11px]"
                      >
                        {platformMeta[platformKey].icon}
                        {platformMeta[platformKey].label}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Updated {plan.updated} • {plan.owner}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border bg-muted/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">{selectedPlan.title}</div>
                <div className="text-xs text-muted-foreground">{selectedPlan.schedule}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  {selectedPlan.status}
                </Badge>
                {selectedPlan.status !== "Cancelled" ? (
                  <Button
                    variant="outline"
                    className="h-8 rounded-xl px-2 text-xs"
                    onClick={() => cancelPlan(selectedPlan.id)}
                  >
                    Cancel plan
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {selectedPlan.items.map((item) => (
                <div key={item.id} className="rounded-xl border bg-background/80 px-3 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        className="h-8 rounded-xl px-2 text-xs"
                      >
                        Preview
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8 rounded-xl px-2 text-xs"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
                    {platformMeta[item.platform].icon}
                    {platformMeta[item.platform].label} • {item.type} • Content status: {item.state}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Publishing: {item.postState} • {item.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(previewAsset)} onOpenChange={(open) => !open && setPreviewAssetId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewAsset?.title ?? "Preview"}</DialogTitle>
            <DialogDescription>
              {previewAsset ? platformMeta[previewAsset.platform].label : ""} • {previewAsset?.type}
            </DialogDescription>
          </DialogHeader>
          {previewAsset?.type === "Video" ? (
            <div className="rounded-2xl border bg-muted/20 p-4">
              <div className="aspect-video rounded-xl border bg-background/80 p-4">
                <div className="text-sm font-medium">Video preview mock-up</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  ▶ 00:00 / 00:20 • Captions • Brand watermark • CTA overlay.
                </div>
              </div>
            </div>
          ) : null}
          {previewAsset?.type === "Image" ? (
            <div className="rounded-2xl border bg-muted/20 p-4">
              <div className="aspect-square rounded-xl border bg-gradient-to-br from-lime-500/20 via-emerald-500/15 to-cyan-500/20 p-4">
                <div className="text-sm font-medium">Image preview mock-up</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Hero title, subtitle, and CTA badge placement preview.
                </div>
              </div>
            </div>
          ) : null}
          {previewAsset?.type === "Text" ? (
            <div className="rounded-2xl border bg-muted/20 p-4 text-sm text-muted-foreground">
              {previewAsset.preview}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" className="rounded-2xl" onClick={() => setPreviewAssetId(null)}>
              Close
            </Button>
            <Button variant="outline" className="rounded-2xl">
              Download
            </Button>
            <Button
              className="rounded-2xl"
              onClick={() => {
                if (previewAsset) toggleAssetApproval(previewAsset.id);
                setPreviewAssetId(null);
              }}
              disabled={autoApproval}
            >
              Approve asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function runSmokeTests() {
  const uniq = (arr: string[]) => new Set(arr).size === arr.length;

  const tabKeys = TAB_META.map((t) => t.key);
  // eslint-disable-next-line no-console
  console.assert(uniq(tabKeys), "TAB_META keys should be unique");

  const appKeys = appsCatalog.map((a) => a.key as string);
  // eslint-disable-next-line no-console
  console.assert(uniq(appKeys), "appsCatalog keys should be unique");

  // eslint-disable-next-line no-console
  console.assert(sampleUsage.length === 7, "sampleUsage should be 7 days");

  const notifIds = sampleNotifications.map((n) => n.id);
  // eslint-disable-next-line no-console
  console.assert(uniq(notifIds), "sampleNotifications ids should be unique");

  // eslint-disable-next-line no-console
  console.assert(labelDocType("content_plan") === "Content Plan", "labelDocType ok");
  // eslint-disable-next-line no-console
  console.assert(labelTone("executive") === "Executive", "labelTone ok");

  const n = sampleNotifications[0];
  // eslint-disable-next-line no-console
  console.assert(buildGenConstraints(n).includes(n.title), "genConstraints contains title");
}

runSmokeTests();

export default function BatTabPreview() {
  const [tab, setTab] = useState<TabKey>("chat");
  const [orgId] = useState("bw_demo_org");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem("bat-theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("bat-theme", theme);
  }, [theme]);

  const [connected, setConnected] = useState<Record<AppKey, boolean>>({
    instagram: true,
    tiktok: true,
    youtube: false,
    linkedin: true,
    x: false,
    meta: true,
  });

  const [workflowState, setWorkflowState] = useState<WorkflowItem[]>([
    ...starterWorkflows,
  ]);
  const [indexProgress, setIndexProgress] = useState(74);

  const [chat, setChat] = useState<
    Array<{ role: "user" | "assistant"; text: string; meta?: string }>
  >([
    {
      role: "assistant",
      text: "Hi — I’m BAT Social. Ask me about your content pipeline, hooks, or performance. I’ll answer using your approved sources.",
      meta: "Sources: Instagram • TikTok • Meta Ads (mock)",
    },
  ]);

  const [chatInput, setChatInput] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [apiOpen, setApiOpen] = useState(false);

  // Notifications feed (mock)
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    ...sampleNotifications,
  ]);
  const [unreadIds, setUnreadIds] = useState<Set<string>>(
    () => new Set(sampleNotifications.map((n) => n.id))
  );
  const [notifQuery, setNotifQuery] = useState("");
  const [notifAppFilter, setNotifAppFilter] = useState<AppKey | "all">("all");
  const [expandedNotifId, setExpandedNotifId] = useState<string | null>(null);

  // Generate tab seed (so notifications can pre-fill the generator)
  const [genSeed, setGenSeed] = useState<{
    type?: string;
    tone?: string;
    constraints?: string;
    key?: string;
  }>({ key: "init" });

  const connectedCount = useMemo(
    () => Object.values(connected).filter(Boolean).length,
    [connected]
  );

  const docsIndexed = useMemo(() => 128 + connectedCount * 31, [connectedCount]);
  const signals = useMemo(() => 19 + connectedCount * 6, [connectedCount]);

  const runningCount = useMemo(
    () => workflowState.filter((w) => w.status === "Running").length,
    [workflowState]
  );

  const connectorEndpoint = useMemo(() => {
    const token = btoa(`${orgId}.read.30d.chatgpt`).replace(/=+$/g, "");
    return `https://api.blackwing.local/bat/v1/${orgId}/connector?token=bat_${token}_token`;
  }, [orgId]);

  const unreadCount = useMemo(() => unreadIds.size, [unreadIds]);

  const filteredNotifications = useMemo(() => {
    const q = notifQuery.trim().toLowerCase();
    return notifications
      .filter((n) => (notifAppFilter === "all" ? true : n.app === notifAppFilter))
      .filter((n) => {
        if (!q) return true;
        return (
          n.title.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q) ||
          n.automation.toLowerCase().includes(q)
        );
      })
      .sort((a, b) =>
        unreadIds.has(a.id) === unreadIds.has(b.id)
          ? 0
          : unreadIds.has(a.id)
            ? -1
            : 1
      );
  }, [notifications, notifQuery, notifAppFilter, unreadIds]);

  const onToggleWorkflow = (id: string) => {
    setWorkflowState((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, status: w.status === "Running" ? "Paused" : "Running" }
          : w
      )
    );
  };

  const onGenerateDoc = ({
    type,
    tone,
    constraints,
  }: {
    type: string;
    tone: string;
    constraints: string;
  }) => {
    const summary = `Generated: ${labelDocType(type)} • Tone: ${labelTone(
      tone
    )} • Constraints: ${constraints}`;

    setChat((c) => [
      ...c,
      {
        role: "assistant",
        text: "Done. I drafted a document from your BAT memory and staged it for review.",
        meta: summary,
      },
    ]);

    setTab("chat");
  };

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text) return;

    setChatInput("");
    setChat((c) => [
      ...c,
      { role: "user", text },
      {
        role: "assistant",
        text: "Here’s what I found based on your current BAT memory. I can also generate a creative pack or launch a new campaign sprint.",
        meta: "Sources: Instagram • YouTube • Meta Ads (mock)",
      },
    ]);
  };

  const toggleRead = (id: string) => {
    setUnreadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setExpandedNotifId((cur) => (cur === id ? null : cur));
  };

  const clearRead = () => {
    // Remove read notifications (not in unreadIds)
    setNotifications((prev) => prev.filter((n) => unreadIds.has(n.id)));
    setExpandedNotifId(null);
  };

  const talkFromNotification = (n: NotificationItem) => {
    setUnreadIds((prev) => {
      const next = new Set(prev);
      next.delete(n.id);
      return next;
    });

    setExpandedNotifId(null);
    setTab("chat");

    const appName = appsCatalog.find((a) => a.key === n.app)?.name ?? "App";
    const prompt = buildTalkPrompt(orgId, appName, n);

    setChat((c) => [
      ...c,
      { role: "user", text: prompt },
      {
        role: "assistant",
        text: "Got it — here’s the context, likely causes, and the best next actions. I’ll also tell you what to verify in the source app.",
        meta: `Sources: ${appName} (mock)`,
      },
    ]);
  };

  const generateFromNotification = (n: NotificationItem) => {
    setUnreadIds((prev) => {
      const next = new Set(prev);
      next.delete(n.id);
      return next;
    });

    setExpandedNotifId(null);
    setTab("generate");

    setGenSeed({
      key: `notif_${n.id}_${Date.now()}`,
      type: n.severity === "Critical" ? "creative_sprint" : "content_plan",
      tone: "executive",
      constraints: buildGenConstraints(n),
    });
  };

  const addMockNotification = () => {
    const n: NotificationItem = {
      id: `nt-${Math.floor(Math.random() * 9000) + 1000}`,
      title: "New threshold alert",
      summary: "A monitored value crossed its configured threshold (mock).",
      app: "linkedin",
      automation: "Executive Voice Monitor",
      severity: "Info",
      time: "Just now",
      ctaHint: "Generate a sharper hook + CTA",
    };

    setNotifications((prev) => [n, ...prev]);
    setUnreadIds((prev) => {
      const next = new Set(prev);
      next.add(n.id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <TopBar
          tier="Agency"
          theme={theme}
          onToggleTheme={() =>
            setTheme((prev) => (prev === "dark" ? "light" : "dark"))
          }
        />

        {/* Global dialogs */}
        <Dialog open={apiOpen} onOpenChange={setApiOpen}>
          <DialogContent className="sm:max-w-[620px]">
            <DialogHeader>
                <DialogTitle>Add channel connection</DialogTitle>
                <DialogDescription>
                Preview: store a secure connector (OAuth/token/webhook) in the backend.
                </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">App</div>
                <Select defaultValue="instagram">
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Choose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="x">X / Twitter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Auth type</div>
                <Select defaultValue="oauth">
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Choose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oauth">OAuth</SelectItem>
                    <SelectItem value="token">Token</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="text-xs font-medium text-muted-foreground">Base URL</div>
                <Input className="rounded-2xl" placeholder="https://api.vendor.com/v1" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="text-xs font-medium text-muted-foreground">Permissions</div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    Read
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    Write (optional)
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    Webhooks
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    PII redaction
                  </Badge>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                className="rounded-2xl"
                onClick={() => setApiOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="rounded-2xl"
                onClick={() => {
                  setApiOpen(false);
                  setIndexProgress((p) => Math.min(99, p + 5));
                }}
              >
                Save connection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogContent className="sm:max-w-[620px]">
            <DialogHeader>
              <DialogTitle>Upload documents</DialogTitle>
              <DialogDescription>
                Add brand guides, briefs, scripts, creative references, and campaign docs. BAT indexes them for search + Q&A.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="rounded-2xl border bg-muted/20 p-6 text-center">
                <Upload className="mx-auto h-6 w-6" />
                <div className="mt-2 text-sm font-medium">Drop files here</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  PDF, DOCX, XLSX, CSV, PPTX, TXT
                </div>
                <Button className="mt-3 rounded-2xl">Choose files</Button>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                className="rounded-2xl"
                onClick={() => setUploadOpen(false)}
              >
                Close
              </Button>
              <Button
                className="rounded-2xl"
                onClick={() => {
                  setUploadOpen(false);
                  setIndexProgress((p) => Math.min(99, p + 8));
                }}
              >
                Start indexing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Layout: main content + right notifications */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
          {/* Main */}
          <div className="space-y-4">
            <TabNav tab={tab} setTab={setTab} />

            <AnimatePresence mode="wait">
              {tab === "chat" ? (
                <motion.div key="chat" {...FADE} className="space-y-4">
                  <SectionHeader
                    title="Campaign Hub"
                    subtitle="Plan, brief, and ship social campaigns with BAT as your agency."
                  />

                  <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Creative Command</CardTitle>
                      <CardDescription>Preview UI: responses are mocked.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="max-h-[420px] overflow-auto rounded-2xl border bg-muted/10 p-4">
                        <div className="space-y-3">
                          {chat.map((m, idx) => (
                            <ChatMessage
                              key={`${m.role}_${idx}`}
                              role={m.role}
                              text={m.text}
                              meta={m.meta}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask BAT about your next post…"
                          className="rounded-2xl"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              sendChat();
                            }
                          }}
                        />
                        <Button className="rounded-2xl" onClick={sendChat}>
                          <MessagesSquare className="mr-2 h-4 w-4" /> Send
                        </Button>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Lock className="h-4 w-4" /> Answers use approved sources only (mock).
                        </span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <Copyable
                          label="Connector endpoint (preview)"
                          value={connectorEndpoint}
                        />
                        <Copyable
                          label="System prompt (preview)"
                          value={`You are connected to BAT Social for org ${orgId}. Use the connector endpoint. Answer using only approved sources. Cite channels used (Instagram, TikTok, YouTube, LinkedIn, Meta Ads). If uncertain, ask a clarifying question.`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : null}

              {tab === "generate" ? (
                <motion.div key="generate" {...FADE} className="space-y-4">
                  <SectionHeader
                    title="Create Content"
                    subtitle="Generate social content, creative packs, and campaign assets."
                  />
                  <GenerateStudio onGenerate={onGenerateDoc} seed={genSeed} />
                </motion.div>
              ) : null}

              {tab === "calendar" ? (
                <motion.div key="calendar" {...FADE} className="space-y-4">
                  <SectionHeader
                    title="Content Calendar"
                    subtitle="Plan monthly, weekly, or yearly content with the right channel mix."
                  />
                  <ContentCalendar />
                </motion.div>
              ) : null}

              {tab === "brain" ? (
                <motion.div key="brain" {...FADE} className="space-y-4">
                  <SectionHeader
                    title="BAT Studio"
                    subtitle="Connect channels, manage workflows, and approve data access."
                    right={
                      <div className="flex items-center gap-2">
                        <Button className="rounded-2xl" onClick={() => setApiOpen(true)}>
                          <Plug className="mr-2 h-4 w-4" /> Add API
                        </Button>
                        <Button
                          variant="ghost"
                          className="rounded-2xl"
                          onClick={() => setUploadOpen(true)}
                        >
                          <Upload className="mr-2 h-4 w-4" /> Upload
                        </Button>
                      </div>
                    }
                  />

                  <div className="grid gap-4 md:grid-cols-3">
                    <Stat
                      label="Connected channels"
                      value={`${connectedCount} / ${appsCatalog.length}`}
                      hint="Channels BAT can read and learn from."
                      icon={<Plug className="h-4 w-4" />}
                    />
                    <Stat
                      label="Assets indexed"
                      value={docsIndexed}
                      hint="Creative assets ready for reuse."
                      icon={<Database className="h-4 w-4" />}
                    />
                    <Stat
                      label="Active workflows"
                      value={runningCount}
                      hint="Always-on monitors across channels."
                      icon={<Workflow className="h-4 w-4" />}
                    />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                    <Card className="rounded-2xl shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base">Integrations</CardTitle>
                        <CardDescription>
                          Connect channels BAT can read and learn from.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-2">
                        {appsCatalog.map((app) => (
                          <IntegrationCard
                            key={app.key}
                            app={app}
                            connected={!!connected[app.key]}
                            onConnect={() =>
                              setConnected((c) => ({ ...c, [app.key]: true }))
                            }
                            onDisconnect={() =>
                              setConnected((c) => ({ ...c, [app.key]: false }))
                            }
                          />
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base">Data approval</CardTitle>
                        <CardDescription>
                          Control what BAT can use in outputs.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <ApprovalRow label="Operations" defaultOn />
                        <ApprovalRow label="Marketing" defaultOn />
                        <ApprovalRow label="Finance" defaultOn={false} />
                        <ApprovalRow label="People / HR" defaultOn={false} />
                        <ApprovalRow label="Customer support" defaultOn />
                        <div className="pt-2 text-xs text-muted-foreground inline-flex items-center gap-2">
                          <Lock className="h-4 w-4" /> You can revoke access anytime.
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Workflows</CardTitle>
                      <CardDescription>
                        Always-on monitors across social and paid media.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {workflowState.map((wf) => (
                        <WorkflowRow key={wf.id} wf={wf} onToggle={onToggleWorkflow} />
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Memory status</CardTitle>
                      <CardDescription>
                        Indexing + signal extraction runs continuously.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Index progress</div>
                        <div className="text-sm text-muted-foreground">{indexProgress}%</div>
                      </div>
                      <Progress value={indexProgress} />

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div className="rounded-2xl border bg-muted/20 p-3">
                          <div className="font-medium text-foreground">{docsIndexed}</div>
                          <div className="mt-0.5">Docs indexed</div>
                        </div>
                        <div className="rounded-2xl border bg-muted/20 p-3">
                          <div className="font-medium text-foreground">{signals}</div>
                          <div className="mt-0.5">Signals tracked</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                          <Lock className="h-4 w-4" /> Private to your org
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-2xl hover:scale-[1.02] transition-transform duration-200"
                          onClick={() =>
                            setIndexProgress((p) => (p >= 96 ? 74 : Math.min(99, p + 7)))
                          }
                        >
                          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : null}

              {tab === "analytics" ? (
                <motion.div key="analytics" {...FADE} className="space-y-4">
                  <SectionHeader
                      title="Performance"
                      subtitle="Content velocity, audience growth, and creative signals."
                  />

                  <div className="grid gap-4 md:grid-cols-3">
                    <Stat
                      label="Weekly questions"
                      value={sampleUsage.reduce((s, x) => s + x.q, 0)}
                      hint="Total questions asked this week."
                      icon={<MessagesSquare className="h-4 w-4" />}
                    />
                    <Stat
                      label="Weekly docs touched"
                      value={sampleUsage.reduce((s, x) => s + x.docs, 0)}
                      hint="Docs used across answers (mock)."
                      icon={<FileText className="h-4 w-4" />}
                    />
                    <Stat
                      label="Health score"
                      value={`${Math.min(98, Math.max(62, indexProgress + 12))}%`}
                      hint="Composite quality score (mock)."
                      icon={<Shield className="h-4 w-4" />}
                    />
                  </div>

                  <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Knowledge activity</CardTitle>
                      <CardDescription>Usage + indexing trend (preview).</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sampleUsage}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="d" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="docs" fillOpacity={0.25} />
                          <Line type="monotone" dataKey="q" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Notifications (RIGHT) */}
          <div className="space-y-4">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base inline-flex items-center gap-2">
                      <Bell className="h-4 w-4" /> Notifications
                    </CardTitle>
                    <CardDescription>
                      Automation alerts you can act on.
                      {unreadCount ? ` ${unreadCount} unread.` : ""}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl"
                    onClick={addMockNotification}
                  >
                    + Mock
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  <Input
                    value={notifQuery}
                    onChange={(e) => setNotifQuery(e.target.value)}
                    placeholder="Search alerts…"
                    className="rounded-2xl h-9"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={notifAppFilter}
                      onValueChange={(v) => setNotifAppFilter(v as AppKey | "all")}
                    >
                      <SelectTrigger className="rounded-2xl h-9">
                        <SelectValue placeholder="Channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All channels</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="x">X / Twitter</SelectItem>
                        <SelectItem value="meta">Meta Ads</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      className="rounded-2xl h-9"
                      onClick={clearRead}
                      disabled={notifications.length === unreadIds.size}
                      title="Remove read notifications"
                    >
                      Clear read
                    </Button>
                  </div>
                </div>

                <div className="max-h-[720px] overflow-auto rounded-2xl border bg-muted/10 p-2">
                  <div className="space-y-2">
                    {filteredNotifications.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">
                        No notifications match your filters.
                      </div>
                    ) : (
                      filteredNotifications.map((n) => {
                        const app = appsCatalog.find((a) => a.key === n.app) as
                          | AppMeta
                          | undefined;
                        if (!app) return null;

                        const unread = unreadIds.has(n.id);
                        const expanded = expandedNotifId === n.id;

                        return (
                          <NotificationRow
                            key={n.id}
                            item={n}
                            app={app}
                            unread={unread}
                            expanded={expanded}
                            onToggleExpand={() =>
                              setExpandedNotifId((cur) => (cur === n.id ? null : n.id))
                            }
                            onTalk={() => talkFromNotification(n)}
                            onGenerate={() => generateFromNotification(n)}
                            onMarkRead={() => toggleRead(n.id)}
                            onDismiss={() => dismissNotification(n.id)}
                          />
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Preview feed — real alerts come from automations.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
