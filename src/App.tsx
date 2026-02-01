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
  Upload,
  Workflow,
  X,
main
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

type TabKey = "chat" | "generate" | "brain" | "analytics";

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

type AppKey = "erp" | "drive" | "slack" | "meta" | "ga4" | "banks";

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
  { key: "chat", label: "Talk to BAT", icon: <Sparkles className="h-4 w-4" /> },
  { key: "generate", label: "Generate", icon: <FileText className="h-4 w-4" /> },
  { key: "brain", label: "BAT Brain", icon: <Brain className="h-4 w-4" /> },
  { key: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
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
    key: "erp" as const,
    name: "ERP System",
    desc: "Sync customers, invoices, inventory, and ops records.",
    badge: "Core",
    icon: <Database className="h-4 w-4" />,
  },
  {
    key: "drive" as const,
    name: "Google Drive",
    desc: "Index docs, sheets, and SOPs (knowledge base).",
    badge: "Docs",
    icon: <Globe className="h-4 w-4" />,
  },
  {
    key: "slack" as const,
    name: "Slack",
    desc: "Capture decisions, alerts, and ops conversations.",
    badge: "Comms",
    icon: <MessagesSquare className="h-4 w-4" />,
  },
  {
    key: "meta" as const,
    name: "Meta Ads",
    desc: "Pull campaign performance + audience insights.",
    badge: "Marketing",
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    key: "ga4" as const,
    name: "GA4 / Analytics",
    desc: "Track funnels, conversion, and attribution signals.",
    badge: "Marketing",
    icon: <Search className="h-4 w-4" />,
  },
  {
    key: "banks" as const,
    name: "Banking / Finance",
    desc: "Import transactions, cashflow, and reconciliations.",
    badge: "Finance",
    icon: <Shield className="h-4 w-4" />,
  },
];

type AppMeta = (typeof appsCatalog)[number];

const starterWorkflows: WorkflowItem[] = [
  {
    id: "wf-01",
    name: "Weekly Ops Health Check",
    category: "Operations",
    cadence: "Every Monday 09:00",
    status: "Running",
    impact: "Summarizes blockers, overdue tasks, key metrics.",
  },
  {
    id: "wf-02",
    name: "Marketing Spend Guardrails",
    category: "Marketing",
    cadence: "Hourly",
    status: "Running",
    impact: "Alerts when CAC/ROAS deviates beyond threshold.",
  },
  {
    id: "wf-03",
    name: "Invoice Aging Watch",
    category: "Finance",
    cadence: "Daily 18:00",
    status: "Paused",
    impact: "Creates follow-up tasks for overdue invoices.",
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
    title: "ROAS dipped below threshold",
    summary:
      "Meta Ads ROAS fell to 1.4 (threshold: 2.0) for Campaign: Prospecting A.",
    app: "meta",
    automation: "Marketing Spend Guardrails",
    severity: "Critical",
    time: "2m ago",
    ctaHint: "Ask BAT for root cause + next actions",
  },
  {
    id: "nt-02",
    title: "Invoice aging risk",
    summary: "3 invoices are now 14+ days overdue (total: $12,480).",
    app: "erp",
    automation: "Invoice Aging Watch",
    severity: "Warning",
    time: "31m ago",
    ctaHint: "Generate a follow-up email + task list",
  },
  {
    id: "nt-03",
    title: "Traffic anomaly",
    summary:
      "GA4 sessions spiked +38% vs yesterday. Check landing page performance.",
    app: "ga4",
    automation: "Analytics Spike Monitor",
    severity: "Info",
    time: "Today 09:12",
    ctaHint: "Generate a quick insight memo",
  },
  {
    id: "nt-04",
    title: "Finance threshold met",
    summary: "Banking: cash balance dropped below $25k (current: $23.6k).",
    app: "banks",
    automation: "Cashflow Guardrail",
    severity: "Critical",
    time: "Yesterday 18:40",
    ctaHint: "Ask BAT for runway + options",
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

function TopBar({ tier = "Premium" }: { tier?: string }) {
 main
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border bg-background shadow-sm">
          <span className="text-sm font-black">B</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="text-xl font-semibold tracking-tight">BAT</div>
            <Badge
              className="rounded-full"
              variant={tier === "Premium" ? "default" : "secondary"}
            >
              {tier}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Business memory + automated workflows for decisions in real time.
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

main
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
      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4 md:gap-2">
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
    case "weekly_ops":
      return "Weekly Ops Memo";
    case "kpi_review":
      return "KPI Review";
    case "process_sop":
      return "Process SOP";
    case "board_pack":
      return "Board Pack Summary";
    case "sales_pipeline":
      return "Sales Pipeline Digest";
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

function DocumentGenerator({
  onGenerate,
  seed,
}: {
  onGenerate: (args: { type: string; tone: string; constraints: string }) => void;
  seed?: { type?: string; tone?: string; constraints?: string; key?: string };
}) {
  const [type, setType] = useState("weekly_ops");
  const [tone, setTone] = useState("executive");
  const [constraints, setConstraints] = useState(
    "Use last 7 days of data. Keep it under 1 page. Include risks + next actions."
  );

  useEffect(() => {
    if (!seed) return;
    if (seed.type) setType(seed.type);
    if (seed.tone) setTone(seed.tone);
    if (seed.constraints) setConstraints(seed.constraints);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed?.key]);

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Generate a document</CardTitle>
        <CardDescription>
          Create reports, SOPs, briefs, and summaries from your BAT memory.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Document type</div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly_ops">Weekly Ops Memo</SelectItem>
                <SelectItem value="kpi_review">KPI Review</SelectItem>
                <SelectItem value="process_sop">Process SOP</SelectItem>
                <SelectItem value="board_pack">Board Pack Summary</SelectItem>
                <SelectItem value="sales_pipeline">Sales Pipeline Digest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Tone</div>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
                <SelectItem value="team">Team-friendly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Output</div>
            <Select defaultValue="pdf">
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="docx">DOCX</SelectItem>
                <SelectItem value="md">Markdown</SelectItem>
                <SelectItem value="slides">Slides</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Constraints</div>
          <Textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            className="min-h-[92px] rounded-2xl"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-4 w-4" /> Uses only sources you’ve approved.
          </div>
          <Button
            className="rounded-2xl"
            onClick={() => onGenerate({ type, tone, constraints })}
          >
            <FileText className="mr-2 h-4 w-4" /> Generate
          </Button>
        </div>
      </CardContent>
    </Card>
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
  console.assert(labelDocType("weekly_ops") === "Weekly Ops Memo", "labelDocType ok");
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
 main

  const [connected, setConnected] = useState<Record<AppKey, boolean>>({
    erp: true,
    drive: false,
    slack: false,
    meta: false,
    ga4: true,
    banks: false,
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
      text: "Hi — I’m BAT. Ask me anything about your operation. I’ll answer using your approved sources and show what I used.",
      meta: "Sources: ERP • Analytics (mock)",
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
        text: "Here’s what I found based on your current BAT memory. I can also generate a report or create an action list.",
        meta: "Sources: ERP • Docs • Finance (mock)",
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
      type: n.severity === "Critical" ? "weekly_ops" : "kpi_review",
      tone: "executive",
      constraints: buildGenConstraints(n),
    });
  };

  const addMockNotification = () => {
    const n: NotificationItem = {
      id: `nt-${Math.floor(Math.random() * 9000) + 1000}`,
      title: "New threshold alert",
      summary: "A monitored value crossed its configured threshold (mock).",
      app: "slack",
      automation: "Ops Alert Channel Monitor",
      severity: "Info",
      time: "Just now",
      ctaHint: "Ask BAT to summarize and propose next steps",
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
          tier="Premium"
          theme={theme}
          onToggleTheme={() =>
            setTheme((prev) => (prev === "dark" ? "light" : "dark"))
          }
        />
        <TopBar tier="Premium" />
 main

        {/* Global dialogs */}
        <Dialog open={apiOpen} onOpenChange={setApiOpen}>
          <DialogContent className="sm:max-w-[620px]">
            <DialogHeader>
              <DialogTitle>Add API link</DialogTitle>
              <DialogDescription>
                Preview: store a secure connector (OAuth/token/webhook) in the backend.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">App</div>
                <Select defaultValue="custom">
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Choose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom API</SelectItem>
                    <SelectItem value="erp">ERP System</SelectItem>
                    <SelectItem value="shopify">Shopify</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="quickbooks">QuickBooks</SelectItem>
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
                Add SOPs, playbooks, invoices, campaign briefs, etc. BAT indexes them for search + Q&A.
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
                    title="Talk to BAT"
                    subtitle="Ask questions, request decisions, and generate actions from your org memory."
                  />

                  <Card className="rounded-2xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Conversation</CardTitle>
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
                          placeholder="Ask BAT…"
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
                          value={`You are connected to BAT for org ${orgId}. Use the connector endpoint. Answer using only approved sources. Cite categories used (ERP, Docs, Marketing, Finance). If uncertain, ask a clarifying question.`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : null}

              {tab === "generate" ? (
                <motion.div key="generate" {...FADE} className="space-y-4">
                  <SectionHeader
                    title="Generate"
                    subtitle="Create reports, SOPs, briefs, and summaries from BAT memory."
                  />
                  <DocumentGenerator onGenerate={onGenerateDoc} seed={genSeed} />
                </motion.div>
              ) : null}

              {tab === "brain" ? (
                <motion.div key="brain" {...FADE} className="space-y-4">
                  <SectionHeader
                    title="BAT Brain"
                    subtitle="Integrations + Workflows + Data approval in one place."
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
                      label="Connected sources"
                      value={`${connectedCount} / ${appsCatalog.length}`}
                      hint="Integrations + uploads BAT can read."
                      icon={<Plug className="h-4 w-4" />}
                    />
                    <Stat
                      label="Docs indexed"
                      value={docsIndexed}
                      hint="Structured knowledge available for Q&A."
                      icon={<Database className="h-4 w-4" />}
                    />
                    <Stat
                      label="Active workflows"
                      value={runningCount}
                      hint="Always-on monitors across functions."
                      icon={<Workflow className="h-4 w-4" />}
                    />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                    <Card className="rounded-2xl shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base">Integrations</CardTitle>
                        <CardDescription>
                          Connect apps BAT can read and learn from.
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
                        Always-on monitors across operations, marketing, and finance.
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
                    title="Analytics"
                    subtitle="Usage, indexing velocity, and decision-support signals (preview)."
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
                        <SelectValue placeholder="App" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All apps</SelectItem>
                        <SelectItem value="erp">ERP</SelectItem>
                        <SelectItem value="drive">Drive</SelectItem>
                        <SelectItem value="slack">Slack</SelectItem>
                        <SelectItem value="meta">Meta</SelectItem>
                        <SelectItem value="ga4">GA4</SelectItem>
                        <SelectItem value="banks">Banking</SelectItem>
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
