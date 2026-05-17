"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import Link from 'next/link';
import { useRouter } from "next/navigation";

interface LeadItem {
  id?: string;
  title: string;
  location: string;
  site: string;
  details?: string[];
  email?: string;
  phone?: string;
  platform?: string;
  source?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  score?: 'high' | 'medium' | 'low';
  verified?: boolean;
  name?: string; // Changed to optional to prevent errors
  company?: string; // Changed to optional to prevent errors
  cat?: string; // For LEADS_DATA
  status?: string; // For SEARCH_RESULT_LEADS
}

interface TemplateItem {
  category: string;
  title: string;
  description: string;
  stats: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'admin';
  text: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
}

interface OutreachItem {
  id: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  status: 'sent' | 'scheduled' | 'draft' | 'completed';
  businessName: string;
  isFollowUp: boolean;
}

const LEADS_DATA = [
  {
    name: "Ahmed", title: "Owner", company: "Restaurant",
    cat: "Restaurant",
    email: "ahmed@restaurant.ae",
    phone: "+971501234567",
    site: "restaurant.ae",
    score: "high",
    location: "Dubai, UAE", // Standardized property
    status: "New"
  },
  {
    name: "Fatima", title: "Manager", company: "Dental Clinic",
    cat: "Dental Clinic",
    email: "fatima@dental.ae",
    phone: "+971509876543",
    site: "dental.ae",
    score: "high",
    status: "New",
    location: "Abu Dhabi, UAE", // Standardized property
  },
  {
    name: "Mohammed", title: "CEO", company: "Marketing Agency",
    cat: "Marketing Agency",
    email: "mo@agency.ae",
    phone: "+971502345678",
    site: "agency.ae",
    score: "medium",
    status: "Contacted",
    location: "Dubai, UAE", // Standardized property
  },
  {
    name: "Layla", title: "Agent", company: "Real Estate",
    cat: "Real Estate",
    email: "layla@realestate.ae",
    phone: "+971503456789",
    site: "realestate.ae",
    score: "high",
    status: "Enriched",
    location: "Dubai, UAE", // Standardized property
  },
  {
    name: "Khalid", title: "Trainer", company: "Gym & Fitness",
    cat: "Gym & Fitness",
    email: "khalid@gym.ae",
    phone: "+971504567890",
    site: "gym.ae",
    score: "medium",
    status: "New",
    location: "Abu Dhabi, UAE", // Standardized property
  },
];

const TEMPLATES_DATA = [
  {
    category: "COLD OUTREACH",
    title: "Introduction Email",
    description: "Perfect for reaching out to prospects you haven't met before. Friendly and conversational.",
    stats: "42% open rate · 8% reply rate",
  },
  {
    category: "FOLLOW-UP",
    title: "Second Touch",
    description: "Use this after your first email gets no response. Subtle reminder without being pushy.",
    stats: "38% open rate · 6% reply rate",
  },
  {
    category: "PARTNERSHIP",
    title: "Partnership Proposal",
    description: "For reaching out to potential partners or joint ventures. Professional and formal.",
    stats: "55% open rate · 12% reply rate",
  },
  {
    category: "CASE STUDY",
    title: "Success Story",
    description: "Share a win with a similar prospect. Social proof increases conversion rates.",
    stats: "60% open rate · 15% reply rate",
  },
];

const EXPORT_HISTORY = [
  { name: "Restaurant Owners - Dubai", date: "Jan 15, 2025", count: "47 leads", status: "completed" },
  { name: "Dental Clinics - UAE", date: "Jan 12, 2025", count: "23 leads", status: "completed" },
];

const ALL_COUNTRIES = [
  { n: "United Arab Emirates", s: "Dubai, Abu Dhabi", f: "🇦🇪" },
  { n: "Saudi Arabia", s: "Riyadh, Jeddah", f: "🇸🇦" },
  { n: "Egypt", s: "Cairo, Alexandria", f: "🇪🇬" },
  { n: "Kuwait", s: "Kuwait City", f: "🇰🇼" },
  { n: "Qatar", s: "Doha", f: "🇶🇦" },
  { n: "Bahrain", s: "Manama", f: "🇧🇭" },
  { n: "Oman", s: "Muscat", f: "🇴🇲" },
  { n: "Jordan", s: "Amman", f: "🇯🇴" },
  { n: "Lebanon", s: "Beirut", f: "🇱🇧" },
  { n: "Morocco", s: "Casablanca, Rabat", f: "🇲🇦" },
  { n: "Tunisia", s: "Tunis", f: "🇹🇳" },
  { n: "Pakistan", s: "Karachi, Lahore", f: "🇵🇰" },
  { n: "United States", s: "New York, LA", f: "🇺🇸" },
  { n: "United Kingdom", s: "London, Manchester", f: "🇬🇧" },
  { n: "Canada", s: "Toronto, Vancouver", f: "🇨🇦" },
  { n: "Australia", s: "Sydney, Melbourne", f: "🇦🇺" },
  { n: "Germany", s: "Berlin, Munich", f: "🇩🇪" },
  { n: "France", s: "Paris, Lyon", f: "🇫🇷" },
  { n: "Spain", s: "Madrid, Barcelona", f: "🇪🇸" },
  { n: "Italy", s: "Rome, Milan", f: "🇮🇹" },
  { n: "India", s: "Mumbai, Delhi", f: "🇮🇳" },
  { n: "Japan", s: "Tokyo, Osaka", f: "🇯🇵" },
  { n: "Singapore", s: "Singapore", f: "🇸🇬" },
  { n: "Netherlands", s: "Amsterdam, Rotterdam", f: "🇳🇱" },
  { n: "Sweden", s: "Stockholm, Gothenburg", f: "🇸🇪" },
  { n: "Switzerland", s: "Zurich, Geneva", f: "🇨🇭" },
  { n: "South Africa", s: "Cape Town, Johannesburg", f: "🇿🇦" },
  { n: "Brazil", s: "São Paulo, Rio", f: "🇧🇷" },
  { n: "Mexico", s: "Mexico City", f: "🇲🇽" },
  { n: "China", s: "Beijing, Shanghai", f: "🇨🇳" },
];

const SEARCH_RESULT_LEADS = [
  { name: 'John Doe', title: 'Software Engineer', company: 'Tech Solutions', location: 'San Francisco, CA', email: 'john.doe@example.com', phone: '+1 415-555-0123', site: 'techsolutions.io', status: 'New' },
  { name: 'Jane Smith', title: 'Product Manager', company: 'Innovate Inc.', location: 'New York, NY', email: 'jane.smith@example.com', phone: '+1 212-555-0199', site: 'innovate.com', status: 'New' },
  { name: 'Peter Jones', title: 'UX Designer', company: 'Creative Minds', location: 'Austin, TX', email: 'peter.jones@example.com', phone: '+1 512-555-0144', site: 'creativeminds.com', status: 'Contacted' },
  { name: 'Mary Johnson', title: 'Data Scientist', company: 'Data Corp', location: 'Chicago, IL', email: 'mary.johnson@example.com', phone: '+1 312-555-0188', site: 'datacorp.ai', status: 'New' },
  { name: 'David Williams', title: 'Marketing Head', company: 'Growth Co.', location: 'Los Angeles, CA', email: 'david.williams@example.com', phone: '+1 213-555-0177', site: 'growthco.com', status: 'Enriched' },
  { name: 'Sarah Brown', title: 'CEO', company: 'StartupX', location: 'Miami, FL', email: 'sarah.brown@example.com', phone: '+1 305-555-0166', site: 'startupx.net', status: 'New' },
  { name: 'Michael Davis', title: 'CTO', company: 'Future Systems', location: 'Seattle, WA', email: 'michael.davis@example.com', phone: '+1 206-555-0155', site: 'future.tech', status: 'New' },
  { name: 'Emily Wilson', title: 'HR Manager', company: 'People First', location: 'Boston, MA', email: 'emily.wilson@example.com', phone: '+1 617-555-0133', site: 'peoplefirst.hr', status: 'Contacted' },
  { name: 'Chris Miller', title: 'Sales Director', company: 'SellWell', location: 'Denver, CO', email: 'chris.miller@example.com', phone: '+1 303-555-0122', site: 'sellwell.org', status: 'Enriched' },
  { name: 'Jessica Taylor', title: 'Accountant', company: 'Finance Pros', location: 'Atlanta, GA', email: 'jessica.taylor@example.com', phone: '+1 404-555-0111', site: 'financepros.com', status: 'New' },
];

const PIPELINE_DATA = [
  { stage: "Discovered", leads: ["Ahmed Restaurant", "Fatima Dental", "Mohammed Agency", "Layla Real Estate"] },
  { stage: "Contacted", leads: ["Ahmed Restaurant", "Fatima Dental", "Mohammed Agency"] },
  { stage: "Proposal", leads: ["Mohammed Agency", "Layla Real Estate", "Khalid Gym"] },
  { stage: "Negotiating", leads: ["Ahmed Restaurant", "Fatima Dental", "Mohammed Agency"] },
  { stage: "Won", leads: ["Layla Real Estate", "Khalid Gym"] },
];



const PRICING_PLANS = [
  {
    name: "Free",
    price: "0",
    period: "month",
    badge: "TEST THE ENGINE",
    features: [
      { text: "25 verified leads", included: true },
      { text: "CSV export", included: true },
      { text: "Email discovery", included: true },
      { text: "Basic filters", included: true },
      { text: "No outreach tools", included: false },
      { text: "No pipeline access", included: false },
    ],
    cta: "Start Free",
    link: "/authentication?tab=signup",
    highlight: false,
  },
  {
    name: "Starter",
    price: "29.99",
    period: "month",
    badge: "STARTER PIPELINE",
    description: "Up to 500 leads per month",
    features: [
      { text: "500 leads / month", included: true },
      { text: "CSV export", included: true },
      { text: "Email templates", included: true },
      { text: "Basic outreach tools", included: true },
      { text: "Lead history", included: true },
      { text: "Simple upgrade path to ALPHA", included: true },
    ],
    cta: "Start Building",
    link: "/pricing/payment_process",
    highlight: true,
  },
  {
    name: "Outbound",
    price: "49.99",
    period: "month",
    badge: "OUTBOUND ENGINE",
    description: "For teams ready to reach more of the right prospects with more flexibility",
    features: [
      { text: "1,000+ verified leads", included: true },
      { text: "Unlimited templates", included: true },
      { text: "Multi-channel outreach", included: true },
      { text: "Pipeline tracking", included: true },
      { text: "Follow-up tools", included: true },
    ],
    cta: "Start Building",
    link: "/pricing/payment_process",
    highlight: true,
  },
  {
    name: "Growth",
    price: "99.99",
    period: "month",
    badge: "AUTONOMOUS GROWTH",
    description: "For teams ready to scale faster with intelligent outreach and automation",
    features: [
      { text: "AI-first lead discovery", included: true },
      { text: "Automation lead discovery", included: true },
      { text: "AI-assisted outreach", included: true },
      { text: "Smarter targeting logic", included: true },
      { text: "Built for scalable prospecting", included: true },
    ],
    cta: "Start Building",
    link: "/pricing/payment_process",
    highlight: true,
  },
];

interface LogEntry {
  msg: string;
  time: string;
}

interface NotificationRecord {
  id: string;
  message: string;
  createdAt: string;
  from: string;
  read?: boolean;
}

interface PipelineColProps {
  title: string;
  leads: string[];
  color?: string;
}

function PipelineCol({ title, leads, color = "var(--accent)" }: PipelineColProps) {
  return (
    <div className="pipeline-card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="pipeline-header">
        <div className="pipeline-title">{title}</div>
        <div className="pipeline-count">{leads.length} lead{leads.length === 1 ? '' : 's'}</div>
      </div>
      <div className="pipeline-meta">Latest stage activity and pipeline insights.</div>
      <div className="pipeline-leads">
        {leads.slice(0, 4).map((lead) => (
          <div key={lead} className="pipeline-lead">{lead}</div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [activePage, setActivePage] = useState("dashboard");
  const [findStep, setFindStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [searchKw, setSearchKw] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [selectedLoc, setSelectedLoc] = useState("");
  const [selectedVol, setSelectedVol] = useState<number>(25);
  const [filters, setFilters] = useState({ verified: true, website: false, highScore: false });
  const [searchType, setSearchType] = useState<'personal' | 'company'>('personal');
  const [searchTitle, setSearchTitle] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [language, setLanguage] = useState('English');
  const [searchResultLeads, setSearchResultLeads] = useState<LeadItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');

  const [searchOutcomeCount, setSearchOutcomeCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [formErrors, setFormErrors] = useState({ title: '', industry: '', location: '' });

  // New states for Person Search
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['CEO']);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['LinkedIn']);
  const [leadType, setLeadType] = useState('All');
  const [audienceSize, setAudienceSize] = useState('Any');
  const [requiredContactInfo, setRequiredContactInfo] = useState<string[]>(['Email']);
  const [cityState, setCityState] = useState('');
  const [isCountryDropOpen, setIsCountryDropOpen] = useState(false);
  const [savedResultIds, setSavedResultIds] = useState<string[]>([]);

  const toggleArrayState = (val: string, current: string[], setter: (v: string[]) => void) => {
    if (current.includes(val)) {
      setter(current.filter(i => i !== val));
    } else {
      setter([...current, val]);
    }
  };

  const persistLeadsToLibrary = async (leads: LeadItem[]): Promise<void> => {
    if (!Array.isArray(leads) || leads.length === 0) {
      return;
    }

    try {
      const saveResults = await Promise.all(leads.map(async (lead) => {
        const response = await fetch('/api/leads/collect', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: lead.title,
            location: lead.location,
            site: lead.site,
            email: lead.email,
            phone: lead.phone,
            details: lead.details || [],
            platform: lead.platform ?? 'web',
            source: lead.source ?? 'Lead Search',
            score: lead.score ?? 'high',
            verified: lead.verified !== false,
          }),
        });

        if (!response.ok) {
          const body = await response.text();
          console.warn('Lead persistence failed:', response.status, body, lead);
        }

        return response.ok;
      }));

      const savedCount = saveResults.filter(Boolean).length;
      if (savedCount > 0) {
        await loadMyLeadsFromServer();
        logActivity('Lead persistence', {
          count: savedCount,
          source: leads[0]?.source ?? 'Unknown',
        });
      }
    } catch (error) {
      console.warn('Could not save provider leads to database:', error);
    }
  };

  const loadMyLeadsFromServer = async (): Promise<void> => {
    try {
      const response = await fetch('/api/leads/collect');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.leads)) {
          setMyLeads(data.leads);
        }
      }
    } catch (error) {
      console.warn('Failed to load leads:', error);
    }
  };



  const loadOutreachItemsFromServer = async (): Promise<void> => {
    try {
      const response = await fetch('/api/outreach');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.outreachItems)) {
          setOutreachItems(data.outreachItems);
        }
      }
    } catch (error) {
      console.warn('Failed to load outreach items:', error);
    }
  };

  const saveOutreachItem = async (item: OutreachItem) => {
    try {
      await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      setOutreachItems(prev => {
        // Avoid duplicates and handle updates
        const filtered = prev.filter(i => i.id !== item.id);
        return [item, ...filtered];
      });
      return item;
    } catch (error) {
      console.error('Failed to save outreach item:', error);
    }
  };

  const deleteOutreachFromServer = async (id: string) => {
    try {
      await fetch(`/api/outreach?id=${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('Failed to delete outreach from server:', error);
    }
  };

  const loadExportHistoryFromServer = async (): Promise<void> => {
    try {
      const response = await fetch('/api/export-history');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.exportHistory)) {
          setExportHistory(data.exportHistory);
        }
      }
    } catch (error) {
      console.warn('Failed to load export history:', error);
    }
  };

  const saveExportHistoryItem = async (item: { name: string; date: string; count: string; status: string }) => {
    try {
      const response = await fetch('/api/export-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (response.ok) {
        await loadExportHistoryFromServer();
      } else {
        console.error('Failed to save export history item');
      }
    } catch (error) {
      console.error('Error saving export history item:', error);
    }
  };

  const [myLeads, setMyLeads] = useState<LeadItem[]>([]);
  const [timer, setTimer] = useState(0);
  const [searchProgress, setSearchProgress] = useState({ a: 0, b: 0, c: 0 });
  const [searchLogs, setSearchLogs] = useState<LogEntry[]>([]);
  const [leadCredits, setLeadCredits] = useState(25);
  const [leadsUsed, setLeadsUsed] = useState(0);
  const [currentPlan, setCurrentPlan] = useState<'Free' | 'Starter' | 'Outbound' | 'Growth'>('Free');
  const [userName, setUserName] = useState("ARFA User");
  const [userEmail, setUserEmail] = useState("");
  const [userImage, setUserImage] = useState("");
  const [userRole, setUserRole] = useState("Free lead collector");
  const [profileName, setProfileName] = useState("ARFA User");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileCompany, setProfileCompany] = useState("ARFA Inc.");
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [planStartDate, setPlanStartDate] = useState<string | null>(null);
  const lastChatLength = useRef(0);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');
  const [myLeadsFilter, setMyLeadsFilter] = useState("all");
  const [composeTo, setComposeTo] = useState('');
  const [composeBusinessName, setComposeBusinessName] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeLead, setComposeLead] = useState<LeadItem | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [templates, setTemplates] = useState<TemplateItem[]>(TEMPLATES_DATA);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [newTemplateCategory, setNewTemplateCategory] = useState('');
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [exportLeadScope, setExportLeadScope] = useState<'all' | 'recent' | 'pipeline'>('all');
  const [exportIncludeEmail, setExportIncludeEmail] = useState(true);
  const [exportIncludePhone, setExportIncludePhone] = useState(true);
  const [exportIncludeWebsite, setExportIncludeWebsite] = useState(false);
  const [exportIncludeScore, setExportIncludeScore] = useState(false);
  const [exportHistory, setExportHistory] = useState(EXPORT_HISTORY);
  const [sendMode, setSendMode] = useState("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [settingsTab, setSettingsTab] = useState("profile");
  const [outreachItems, setOutreachItems] = useState<OutreachItem[]>([]);
  const [outreachFilter, setOutreachFilter] = useState<'all' | 'sent' | 'scheduled' | 'draft'>('all');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatStatus, setChatStatus] = useState<'ai' | 'admin_pending' | 'admin'>('ai');
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // Track which key is currently loaded to prevent race conditions
  const initializedKey = useRef<string | null>(null);

  // Generate a unique chat key based on user email
  const userChatKey = useMemo(() => {
    if (!userEmail) return 'arfa_support_chat_demo_user';
    return `arfa_support_chat_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }, [userEmail]);

  const loadSupportChatState = async (key: string) => {
    try {
      const res = await fetch(`/api/user/chat?userId=${key}`);
      if (res.ok) {
        const data = await res.json();
        return {
          messages: Array.isArray(data.messages) ? data.messages : [],
          status: data.status || 'ai'
        };
      }
    } catch (e) {
      console.warn("Failed to load chat from server", e);
    }
    return { messages: [], status: 'ai' as const };
  };

  const saveSupportChatState = async (messages: ChatMessage[], status: 'ai' | 'admin_pending' | 'admin', key: string) => {
    try {
      const res = await fetch('/api/user/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: key, messages, status }),
      });
      if (!res.ok) {
        console.error("Support API failed:", res.status);
      }
    } catch (e) {
      console.error("Failed to save chat to server", e);
    }
  };

  const [modalAlert, setModalAlert] = useState<{show: boolean, title: string, msg: string, type: 'info' | 'success' | 'error'}>({
    show: false, title: '', msg: '', type: 'info'
  });

  const remainingLeads = Math.max(0, leadCredits - leadsUsed);
  const collectedLeadsCount = Math.max(myLeads.length, leadsUsed);
  const pipelineLeadCount = PIPELINE_DATA.reduce((sum, item) => sum + item.leads.length, 0);
  const contactedCount = PIPELINE_DATA.find((item) => item.stage === 'Contacted')?.leads.length ?? 0;
  const followUpsDueCount = contactedCount;

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'GET',
        credentials: 'same-origin',
      });
      const data = await response.json();
      if (response.ok && Array.isArray(data.notifications)) {
        setNotifications(data.notifications.map((notification: NotificationRecord) => ({
          ...notification,
          read: notification.read ?? false,
        })));
      }
    } catch (error) {
      console.warn('Failed to load notifications:', error);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      // Assuming an API endpoint to mark all unread notifications for the current user as read
      await fetch('/api/notifications/mark-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      // Optimistically update the local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  useEffect(() => {
    const notificationInterval = setInterval(() => {
      if (userEmail) { // Only poll if user is identified
        loadNotifications();
      }
    }, 20000); // Poll for system notifications every 20 seconds
    return () => clearInterval(notificationInterval);
  }, [userEmail]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Fetch user profile and credits from the server (source of truth)
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'same-origin',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            if (data.user.role !== 'user') {
              router.push('/admin');
              return;
            }
            setUserName(data.user.name || 'ARFA User');
            setUserEmail(data.user.email || data.user.username || '');
            setUserImage(data.user.profileImage || '');
            setCurrentPlan(data.user.plan || 'Free');
            setPlanStartDate(data.user.planStartDate || null);
            setLeadsUsed(data.user.leadsUsed || 0);

            // Load library and notifications after auth confirmation
            await loadMyLeadsFromServer();
            await loadOutreachItemsFromServer();
            await loadExportHistoryFromServer();
            await loadNotifications();
            return;
          }
        }
        
        // If session is lost, redirect to login
        router.push('/authentication?tab=login');
      } catch (error) {
        console.warn('Failed to fetch current user profile:', error);
      }
    };
    loadUser();
  }, [router]);

  // Load chat state once userEmail is available
  useEffect(() => {
    const syncChat = async () => {
      if (userEmail && initializedKey.current !== userChatKey) {
        const storedState = await loadSupportChatState(userChatKey);
        setChatMessages(storedState.messages);
        setChatStatus(storedState.status);
        initializedKey.current = userChatKey;
      }
    };
    syncChat();
  }, [userEmail, userChatKey]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (initializedKey.current === userChatKey) {
        const storedState = await loadSupportChatState(userChatKey);
        // Only update if messages length is different to prevent flickering
        setChatMessages(prev => {
            if (prev.length !== storedState.messages.length) {
                return storedState.messages;
            }
            return prev;
        });
        setChatStatus(prev => prev === storedState.status ? prev : storedState.status);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [userChatKey]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [chatMessages]);

  // Persist outreach items and check for completed schedules
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const dueItems = outreachItems.filter(item => item.status === 'scheduled' && new Date(item.date) <= now);

      dueItems.forEach(item => {
        fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: item.to, subject: item.subject, text: item.body }),
        })
          .then(async response => {
            const result = await response.json();
            if (response.ok) {
              showAlert('Email Sent', `Scheduled email to ${item.to} has been sent successfully!`, 'success');
              saveOutreachItem({ ...item, status: 'sent' });
              setOutreachItems(current => current.map(i => i.id === item.id ? { ...i, status: 'sent' } : i));
            } else {
              console.error('Failed to send scheduled email', result);
            }
          })
          .catch(e => console.error('Error sending scheduled email:', e));
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [outreachItems]);


  useEffect(() => {
    if (activePage === 'my-leads') {
      loadMyLeadsFromServer();
    }
  }, [activePage]);

  useEffect(() => {
    if (showNotificationPanel) {
      markNotificationsAsRead();
    }
  }, [showNotificationPanel]);

  useEffect(() => {
    if (activePage === 'support') {
      setChatUnreadCount(0);
    } else {
      const diff = chatMessages.length - lastChatLength.current;
      if (diff > 0) {
        setChatUnreadCount((prev) => prev + diff);
      }
    }
    lastChatLength.current = chatMessages.length;
  }, [chatMessages, activePage]);

  useEffect(() => {
    const planLimits: Record<string, number> = {
      Free: 25,
      Starter: 500,
      Outbound: 1000,
      Growth: 5000,
    };
    setLeadCredits(planLimits[currentPlan] || 25);
  }, [currentPlan]);

  useEffect(() => {
    setProfileName(userName);
    setProfileEmail(userEmail);
    setProfileImagePreview(userImage);
  }, [userName, userEmail, userImage]);

  // Effect to hide the final results popup if navigating away or starting a new search
  useEffect(() => {
    if (activePage !== 'prospector' || isSearching) {
      setShowFinalResults(false);
    }
  }, [activePage, isSearching]);


  const filteredCountries = useMemo(() => {
    const v = countrySearch.toLowerCase().trim();
    return v ? ALL_COUNTRIES.filter(c => c.n.toLowerCase().startsWith(v)) : ALL_COUNTRIES;
  }, [countrySearch]);

  useEffect(() => {
    setUserRole(currentPlan === 'Free' ? 'Free lead collector' : `${currentPlan} plan user`);
  }, [currentPlan]);

  const currentPlanDetails = PRICING_PLANS.find((plan) => plan.name === currentPlan) ?? PRICING_PLANS[0];
  const currentPlanPrice = currentPlanDetails.price === 'Coming' ? 'Custom pricing' : `$${currentPlanDetails.price}`;
  const currentBillingLabel = currentPlanDetails.price === 'Coming'
    ? 'Custom pricing' : `${currentPlanPrice} / ${currentPlanDetails.period}`;
  const currentPlanStart = planStartDate ? new Date(planStartDate) : null;
  const currentPlanExpiry = currentPlanStart ? new Date(currentPlanStart.getTime() + 30 * 24 * 60 * 60 * 1000) : null;
  const currentPlanStartLabel = currentPlanStart ? currentPlanStart.toLocaleDateString() : 'Today';
  const currentPlanExpiryLabel = currentPlanExpiry ? currentPlanExpiry.toLocaleDateString() : 'N/A';
  const currentPlanPeriodRange = currentPlanStart && currentPlanExpiry
    ? `${currentPlanStartLabel} — ${currentPlanExpiryLabel}`
    : 'No active paid subscription';

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch (error) {
      console.warn('Logout request failed', error);
    } finally {
      router.push('/authentication?tab=login');
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          profileImage: profileImagePreview,
        }),
      });
      const data = await response.json();
      if (response.ok && data.user) {
        setUserName(data.user.name);
        setProfileName(data.user.name);
        setUserImage(data.user.profileImage || '');
        setSettingsMessage('Profile updated successfully.');
      } else {
        setSettingsMessage(data.error || 'Unable to update profile.');
      }
    } catch (error) {
      setSettingsMessage('Profile update failed.');
      console.warn('Profile update failed', error);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setSettingsMessage('Passwords do not match.');
      return;
    }
    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSettingsMessage('Password updated successfully.');
      } else {
        setSettingsMessage(data.error || 'Unable to update password.');
      }
    } catch (error) {
      setSettingsMessage('Password update failed.');
      console.warn('Password update failed', error);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = () => {
    if (typeof window !== 'undefined' && window.confirm('Delete your account? This cannot be undone.')) {
      setSettingsMessage('Account deletion is not enabled in this demo.');
    }
  };

  const HeaderProfile = () => (
    <div className="header-actions">
      {/* Support Chat Icon */}
      <div className="notification-icon" onClick={() => {
        setActivePage('support');
        setChatUnreadCount(0);
      }} title="Support Chat">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        {chatUnreadCount > 0 && activePage !== 'support' && (
          <div className="notification-badge">{chatUnreadCount}</div>
        )}
      </div>

      {/* Notification Icon */}
      <div className="notification-icon" onClick={() => {
        const nextState = !showNotificationPanel;
        setShowNotificationPanel(nextState);
        if (nextState) loadNotifications();
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {notifications.filter((notification) => !notification.read).length > 0 && !showNotificationPanel && (
          <div className="notification-badge">{notifications.filter((notification) => !notification.read).length}</div>
        )}
      </div>

      {/* Profile */}
      <div className="header-profile" onClick={() => setActivePage('settings')}>
        <div className="header-profile-image">
          {userImage || profileImagePreview ? (
            <img src={userImage || profileImagePreview} alt="Profile" />
          ) : (
            <span>{(profileName || 'User').split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2)}</span>
          )}
        </div>
        <div>
          <div className="header-profile-name">{userName}</div>
          <div className="header-profile-email">{userEmail || 'No email set'}</div>
        </div>
      </div>
    </div>
  );

  const handleLeadEmail = (lead: LeadItem) => {
    const subject = `Quick question about ${lead.title}`;
    const body = `Hi there,\n\nI came across ${lead.title} while researching ${lead.location} prospects and wanted to see if you are open to a quick chat about verified lead generation. I help teams like yours turn qualified connections into real meetings with no extra tools required.\n\nWould you be available for a 10-minute call this week?\n\nBest,\nYour Name`;

    setComposeTo(lead.email || '');
    setComposeBusinessName(lead.title);
    setComposeSubject(subject);
    setComposeBody(body);
    setComposeLead(lead);
    setActivePage('compose');
  };

  const handleLeadPhone = (lead: LeadItem) => {
    if (!lead.phone) return;
    window.location.href = `tel:${lead.phone.replace(/\s+/g, '')}`;
  };

  const handleLeadSite = (lead: LeadItem) => {
    if (!lead.site) return;
    const url = lead.site.startsWith('http') ? lead.site : `https://${lead.site}`;
    window.open(url, '_blank');
  };

  const showAlert = (title: string, msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setModalAlert({ show: true, title, msg, type });
  };

  const logActivity = async (action: string, details?: Record<string, any>) => {
    try {
      await fetch('/api/activity/log', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, details: details || {} }),
      });
    } catch (error) {
      console.warn('Activity log failed:', error);
    }
  };

  useEffect(() => {
    if (!modalAlert.show) return;
    const timeout = window.setTimeout(() => {
      setModalAlert({ show: false, title: '', msg: '', type: 'info' });
    }, 3200);
    return () => window.clearTimeout(timeout);
  }, [modalAlert.show, modalAlert.msg]);

  const handleSaveDraft = async () => {
    const newItem: OutreachItem = {
      id: Math.random().toString(36).substr(2, 9),
      to: composeTo || 'No recipient',
      subject: composeSubject || '(No Subject)',
      body: composeBody,
      date: new Date().toISOString(),
      status: 'draft',
      businessName: composeBusinessName || 'N/A',
      isFollowUp: false
    };
    await saveOutreachItem(newItem);
    showAlert('Draft Saved', 'Your email has been saved to drafts.', 'success');
    logActivity('Draft saved', {
      to: newItem.to,
      subject: newItem.subject,
      status: newItem.status,
    });
  };

  const handleAddFollowUp = () => {
    setComposeBody(prev => prev + "\n\nI'll follow up with you in a few days if I don't hear back. Looking forward to connecting!");
    
    // Add a ghost record for follow-up tracking
    const newItem: OutreachItem = {
      id: Math.random().toString(36).substr(2, 9),
      to: composeTo || 'N/A',
      subject: 'Follow-up tagged',
      body: '',
      date: new Date().toISOString(),
      status: 'scheduled',
      businessName: composeBusinessName || 'N/A',
      isFollowUp: true
    };

    // Persist the follow-up so it survives refreshes
    (async () => {
      try {
        const saved = await saveOutreachItem(newItem);
        if (saved) {
          setOutreachItems(prev => [saved, ...prev]);
          logActivity('Follow-up added', { to: saved.to, subject: saved.subject, status: saved.status });
          showAlert('Follow-up Tagged', 'Follow-up tracking has been enabled for this lead.', 'success');
        } else {
          setOutreachItems(prev => [newItem, ...prev]);
          showAlert('Follow-up Tagged', 'Follow-up tracking added locally.', 'info');
        }
      } catch (e) {
        console.error('Failed to save follow-up item:', e);
        // still add to UI optimistically
        setOutreachItems(prev => [newItem, ...prev]);
        showAlert('Follow-up Tagged', 'Follow-up added locally (could not persist).', 'info');
      }
    })();
  };

  const handleSendEmail = async () => {
    if (!composeTo) {
      showAlert('Missing Info', 'Please enter a recipient email address.', 'error');
      return;
    }
    if (!composeSubject) {
      showAlert('Missing Info', 'Please enter a subject.', 'error');
      return;
    }
    if (!composeBody) {
      showAlert('Missing Info', 'Please enter the email body.', 'error');
      return;
    }

    if (sendMode === 'later' && !scheduledDate) {
      showAlert('Scheduling Error', 'Please select a date and time for scheduling.', 'error');
      return;
    }

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          text: composeBody,
          scheduledAt: sendMode === 'later' ? scheduledDate : null,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        const msg = sendMode === 'later'
          ? `Email scheduled successfully for ${new Date(scheduledDate).toLocaleString()}!` 
          : `Email sent successfully!${result.previewUrl ? '\nPreview: ' + result.previewUrl : ''}`;
        showAlert('Success', msg, 'success');
        
        const newItem: OutreachItem = {
          id: Math.random().toString(36).substr(2, 9),
          to: composeTo,
          subject: composeSubject,
          body: composeBody,
          date: sendMode === 'later' ? scheduledDate : new Date().toISOString(),
          status: sendMode === 'later' ? 'scheduled' : 'sent',
          businessName: composeBusinessName || 'N/A',
          isFollowUp: false
        };
        await saveOutreachItem(newItem);

        logActivity(sendMode === 'later' ? 'Email scheduled' : 'Email sent', {
          to: composeTo,
          subject: composeSubject,
          scheduledAt: sendMode === 'later' ? scheduledDate : null,
          status: newItem.status,
        });

        setComposeTo('');
        setComposeBusinessName('');
        setComposeSubject('');
        setComposeBody('');
        setComposeLead(null);
        setShowTemplateModal(false);
      } else {
        showAlert('Error', `Failed to send email: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      showAlert('System Error', 'Failed to send email. Please try again.', 'error');
    }
  };

  const handleSendChatMessage = (text: string, type: 'text' | 'image' | 'file' = 'text', fileUrl?: string, fileName?: string) => {
    const cleanText = text?.trim();
    if (!cleanText && type === 'text') return;
    if (initializedKey.current !== userChatKey) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'user',
      text: cleanText,
      timestamp: new Date().toISOString(),
      type: type,
      fileUrl: fileUrl,
      fileName: fileName
    };

    const currentMessages = [...chatMessages, userMsg];
    setChatMessages(currentMessages);
    saveSupportChatState(currentMessages, chatStatus, userChatKey);

    setChatInput("");

    if (chatStatus === 'ai') {
      setTimeout(() => {
        const triggerText = cleanText.toLowerCase();
        let reply = "I'm analyzing your request regarding your account. Is there anything specific you need help with?";
        if (triggerText.includes("human") || triggerText.includes("admin") || triggerText.includes("issue")) {
          reply = "I understand this is important. I can connect you with a live admin. Please click 'Talk to Human' below or I can try to help you here.";
        }
        const aiMsg: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          sender: 'ai',
          text: reply,
          timestamp: new Date().toISOString(),
          type: 'text'
        };

        setChatMessages(prev => [...prev, aiMsg]);
        saveSupportChatState([...currentMessages, aiMsg], 'ai', userChatKey);

        if (activePage !== 'support') {
          setChatUnreadCount((prevCount) => prevCount + 1);
        }
      }, 1000);
    }
  };

  const handleRequestAdmin = () => {
    setChatStatus('admin_pending');
    const systemMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'ai',
      text: "Transferring you to a live admin... They will respond shortly.",
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    const nextMsgs = [...chatMessages, systemMsg];
    setChatMessages(nextMsgs);
    saveSupportChatState(nextMsgs, 'admin_pending', userChatKey);
    setChatStatus('admin_pending');

    if (activePage !== 'support') {
      setChatUnreadCount((prevCount) => prevCount + 1);
    }

    setTimeout(() => {
      const adminMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 10),
        sender: 'admin',
        text: "Hi! I'm the support admin. How can I help resolve this for you today?",
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      setChatMessages(prev => [...prev, adminMsg]);
      saveSupportChatState([...nextMsgs, adminMsg], 'admin', userChatKey);
      setChatStatus('admin');
      if (activePage !== 'support') {
        setChatUnreadCount((prevCount) => prevCount + 1);
      }
    }, 2000);
  };

  const handleLeadMore = async (lead: LeadItem) => {
    const text = `Name: ${lead.name || lead.title}\nCompany: ${lead.company || lead.title}\nLocation: ${lead.location}\nWebsite: ${lead.site}\nEmail: ${lead.email || 'N/A'}\nPhone: ${lead.phone || 'N/A'}`;
    try {
      await navigator.clipboard.writeText(text);
      showAlert('Copied', 'Lead details copied to clipboard', 'success');
    } catch (error) {
      showAlert('Copied', 'Lead information saved to clipboard.', 'success');
    }
  };

  const handleSendToMyEmail = async () => {
    if (filteredLeads.length === 0) {
      showAlert('No Leads', 'There are no leads in your current filter to send.', 'error');
      return;
    }

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userEmail,
          subject: `Your ARFA Lead Export - ${new Date().toLocaleDateString()}`,
          text: `You have exported ${filteredLeads.length} leads from your library.\n\n` + 
                filteredLeads.map(l => `- ${l.name} (${l.title}) at ${l.company}: ${l.email || 'No Email'}`).join('\n'),
        }),
      });

      if (response.ok) {
        showAlert('Success', `We've sent ${filteredLeads.length} leads to ${userEmail}`, 'success');
      } else {
        showAlert('Error', 'Failed to send the email. Please check your connection.', 'error');
      }
    } catch (error) {
      showAlert('System Error', 'An unexpected error occurred while sending the email.', 'error');
    }
  };

  const handleDeleteLead = async (leadToDelete: LeadItem) => {
    const originalLeads = [...myLeads];
    setMyLeads(prev => prev.filter(lead => lead.id !== leadToDelete.id));
    try {
      const deleteUrl = leadToDelete.id
        ? `/api/leads/collect?id=${encodeURIComponent(leadToDelete.id)}`
        : `/api/leads/collect?title=${encodeURIComponent(leadToDelete.title)}`;
      await fetch(deleteUrl, { method: 'DELETE' });
    } catch (e) {
      setMyLeads(originalLeads);
    }
  };

  const handleCreateTemplate = () => {
    if (!newTemplateTitle.trim()) {
      return;
    }

    const newTemplate: TemplateItem = {
      category: newTemplateCategory.trim() || 'CUSTOM TEMPLATE',
      title: newTemplateTitle.trim(),
      description: newTemplateDescription.trim() || 'A custom outreach template created by you.',
      stats: 'Custom template',
    };

    setTemplates(prev => [newTemplate, ...prev]);
    setNewTemplateCategory('');
    setNewTemplateTitle('');
    setNewTemplateDescription('');
    setShowNewTemplateModal(false);
  };

  const handleDownloadCSV = async () => {
    const exportLeads = exportLeadScope === 'all'
      ? filteredLeads
      : exportLeadScope === 'recent'
        ? filteredLeads.slice(0, Math.min(8, filteredLeads.length))
        : filteredLeads.filter((lead) => lead.location.toLowerCase().includes('dubai') || lead.location.toLowerCase().includes('uae'));

    const headers = ['Title'];
    if (exportIncludeEmail) headers.push('Email');
    if (exportIncludePhone) headers.push('Phone');
    if (exportIncludeWebsite) headers.push('Website');
    if (exportIncludeScore) headers.push('Score');

    const rows = exportLeads.map((lead) => {
      const row = [`"${lead.title}"`];
      if (exportIncludeEmail) row.push(`"${lead.email || ''}"`);
      if (exportIncludePhone) row.push(`"${lead.phone || ''}"`);
      if (exportIncludeWebsite) row.push(`"${lead.site || ''}"`);
      if (exportIncludeScore) row.push(`"${lead.score || ''}"`);
      return row;
    });

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();

    const now = new Date();
    const newExportItem = {
      name: `${exportLeadScope === 'all' ? 'All leads' : exportLeadScope === 'recent' ? 'Recent leads' : 'Pipeline leads'} export`,
      date: now.toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      count: `${exportLeads.length} lead${exportLeads.length === 1 ? '' : 's'}`,
      status: 'completed',
    };
    await saveExportHistoryItem(newExportItem);
  };

  const handleSelectTemplate = (template: TemplateItem) => {
    setComposeSubject(template.title);
    setActivePage('compose');

    const businessName = composeBusinessName || composeLead?.title || 'your company';
    const location = composeLead?.location || 'your region';
    const body = `Hi there,\n\n${template.description}\n\nI came across ${businessName} while researching ${location} prospects and wanted to see if you are open to a quick chat about verified lead generation. I help teams like yours turn qualified connections into real meetings with no extra tools required.\n\nWould you be available for a 10-minute call this week?\n\nBest,\nYour Name`;
    setComposeBody(body);
    setShowTemplateModal(false);
  };

  const filteredOutreach = outreachItems.filter(item => {
    if (outreachFilter === 'all') return true;
    if (outreachFilter === 'scheduled') return item.status === 'scheduled';
    if (outreachFilter === 'sent') return item.status === 'sent' || item.status === 'completed';
    if (outreachFilter === 'draft') return item.status === 'draft';
    return true;
  });

  const activeFollowUps = outreachItems.filter(i => i.isFollowUp).length;

  const filteredLeads = myLeads
    .filter(lead => myLeadsFilter === 'all' || (lead.status || 'New') === myLeadsFilter)
    .filter(lead => (lead.company || "").toLowerCase().includes(searchKw.toLowerCase()));

  const startSearchFlow = async () => {
    const desired = selectedVol;
    if (desired > remainingLeads) {
      if (remainingLeads <= 0) {
        setLimitMessage('Your monthly lead credits are exhausted. Upgrade to a paid monthly pack to continue collecting verified leads.');
      } else {
        setLimitMessage(`Only ${remainingLeads} lead credits remain. Choose a smaller search size or upgrade your plan to continue.`);
      }
      setShowLimitModal(true);
      return;
    }

    setIsSearching(true);
    setTimer(0);
    setSearchProgress({ a: 0, b: 0, c: 0 });
    setSearchLogs([]);
    setSearchOutcomeCount(0);

    const searchQuery = [searchTitle, selectedIndustry, searchKw, selectedLoc]
      .map((part) => (part || '').trim())
      .filter(Boolean)
      .join(' ')
      .trim() || 'verified leads';

    logActivity('Lead search started', {
      query: searchQuery,
      location: selectedLoc,
      websiteUrl: websiteUrl || null,
      volume: desired,
    });

    const timerInterval = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);

    let finalLeads: LeadItem[] = [];
    let logMessage = 'No verified leads found for this search.';
    let timeoutId = 0;

    try {
      const controller = new AbortController();
      timeoutId = window.setTimeout(() => controller.abort(), 9500);
      const response = await fetch('/api/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          query: searchQuery,
          location: selectedLoc,
          volume: desired,
          platforms: ['linkedin', 'google', 'instagram', 'facebook'],
          targetUrl: websiteUrl || undefined,
        }),
      });

      const data = await response.json();
      const hasRealResults = response.ok && Array.isArray(data.leads) && data.leads.length > 0 && data.origin !== 'sample';

      if (hasRealResults) {
        finalLeads = data.leads;
        setSearchOutcomeCount(finalLeads.length);
        const sourceText = data.origin === 'scraper' ? 'scraper' : 'API search';
        logMessage = `Found ${finalLeads.length} verified leads from ${sourceText}.`;

        if (data.origin !== 'stored') {
          await persistLeadsToLibrary(finalLeads);
        }
      } else if (response.ok && data.origin === 'sample') {
        logMessage = 'Search returned sample/demo data only. No real verified leads were found.';
      } else if (!response.ok) {
        logMessage = 'Lead search API returned an error. No verified leads found.';
      }

      setSearchResultLeads(finalLeads);
      setSearchLogs(prev => [...prev, { msg: logMessage, time: '0:03' }]);
    } catch (error) {
      const isAbort = error instanceof Error && error.name === 'AbortError';
      setSearchResultLeads(finalLeads);
      setSearchOutcomeCount(0);
      setSearchLogs(prev => [...prev, { msg: isAbort ? 'Search timed out after 10 seconds. Try a smaller query or use a location-specific keyword.' : 'Unable to reach lead search API. No verified leads available.', time: '0:03' }]);
      console.warn('Lead search request failed:', error);
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    }

    setMyLeads((prev) => {
      const merged = [...prev];
      finalLeads.forEach((lead) => {
        if (!merged.some((item) => item.title === lead.title)) {
          merged.push(lead);
        }
      });
      return merged;
    });

    setTimeout(() => setSearchProgress(p => ({ ...p, a: 25 })), 500);
    setTimeout(() => setSearchLogs(prev => [...prev, { msg: 'Scanning sources for matching prospects...', time: '0:02' }]), 800);
    setTimeout(() => setSearchProgress(p => ({ ...p, a: 50 })), 2000);
    setTimeout(() => setSearchLogs(prev => [...prev, { msg: 'Found top matches and working profiles', time: '0:05' }]), 3000);
    setTimeout(() => setSearchProgress(p => ({ ...p, a: 100 })), 4000);
    
    setTimeout(() => setSearchProgress(p => ({ ...p, b: 25 })), 4500);
    setTimeout(() => setSearchLogs(prev => [...prev, { msg: 'Enriching contact information...', time: '0:08' }]), 5000);
    setTimeout(() => setSearchProgress(p => ({ ...p, b: 50 })), 6000);
    setTimeout(() => setSearchLogs(prev => [...prev, { msg: 'Email addresses extracted', time: '0:10' }]), 7000);
    setTimeout(() => setSearchProgress(p => ({ ...p, b: 100 })), 7000);

    setTimeout(() => setSearchProgress(p => ({ ...p, c: 25 })), 7500);
    setTimeout(() => setSearchLogs(prev => [...prev, { msg: 'Verifying email deliverability...', time: '0:12' }]), 8000);
    setTimeout(() => setSearchProgress(p => ({ ...p, c: 50 })), 9000);
    setTimeout(() => setSearchLogs(prev => [...prev, { msg: 'Scoring leads by quality...', time: '0:14' }]), 9500);
    
    setTimeout(() => {
      setSearchProgress(p => ({ ...p, c: 100 }));
      setSearchLogs(prev => [...prev, { msg: 'Complete! Ready for outreach', time: '0:15' }]);
      
      // Save new usage count to database immediately
      const nextUsed = Math.min(leadCredits, leadsUsed + desired);
      fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadsUsed: nextUsed }),
      })
      .then(() => setLeadsUsed(nextUsed))
      .catch(err => console.warn('Failed to sync lead usage to server:', err));

      if (nextUsed >= leadCredits) {
        setLimitMessage('Your monthly lead credits are exhausted. Upgrade to a paid monthly pack to continue collecting verified leads.');
        setShowLimitModal(true);
      }

      clearInterval(timerInterval);
      setTimeout(() => {
        setIsSearching(false);
        setFindStep(3); // Go to step 3 panel
        setShowFinalResults(true); // Show the popup on top
      }, 2000);
    }, 10000);
  };

  const LeadCard = ({ lead }: { lead: LeadItem }) => {
    const [showDetails, setShowDetails] = useState(false);

    return (
      <div className="result-lead-card flex-col items-stretch" style={{ marginBottom: 15, padding: 0, overflow: 'hidden' }}>
        {/* Main Card Content (Previous Design) */}
        <div className="flex items-center gap-4 w-full" style={{ padding: '16px 20px' }}>
          <div className="res-avatar">
            {lead.name ? lead.name.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2) : '??'}
          </div>
          <div className="res-lead-info">
            <div className="res-lead-name" style={{ fontSize: '15px' }}>{lead.name || lead.title || lead.company}</div>
            <div className="res-lead-meta">{lead.location || lead.company || lead.title || lead.site}</div>
            <div className="res-lead-contact flex items-center gap-4 mt-3">
              {lead.email && (
                <button onClick={() => handleLeadEmail(lead)} className="text-gray-400 hover:text-[#6C63FF] transition-colors" title="Email">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </button>
              )}
              {lead.phone && (
                <button onClick={() => handleLeadPhone(lead)} className="text-gray-400 hover:text-[#6C63FF] transition-colors" title="Call">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                </button>
              )}
              {lead.site && (
                <button onClick={() => handleLeadSite(lead)} className="text-gray-400 hover:text-[#6C63FF] transition-colors" title="Website">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                </button>
              )}
              <button 
                onClick={() => {
                  if (currentPlan === 'Free') {
                    showAlert('Upgrade Required', 'The Pipeline feature is only available on paid plans.', 'info');
                  } else {
                    setActivePage('pipeline');
                  }
                }} 
                className="text-gray-400 hover:text-[#6C63FF] transition-colors" 
                title="View in Pipeline"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              </button>
              <button onClick={() => setShowDetails(!showDetails)} className="text-gray-400 hover:text-[#6C63FF] transition-colors" title="Show More Details">
                <svg className={`w-5 h-5 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {lead.score && (
              <div className={`score-pill ${lead.score === 'high' ? 'bg-green-bg text-green' : lead.score === 'medium' ? 'bg-amber-bg text-amber' : lead.score === 'low' ? 'bg-red-bg text-red' : ''}`}>
                {lead.score.toUpperCase()}
              </div>
            )}
            <span className="text-xs font-semibold bg-[#6C63FF]/20 text-[#6C63FF] px-2.5 py-1 rounded-full">New</span>
          </div>
        </div>

        {/* Expandable Gray Box */}
        {showDetails && (
          <div style={{
            backgroundColor: '#161B30',
            padding: '20px',
            borderTop: '1px solid #fff',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            borderTopColor: 'var(--border)'

          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ color: 'var(--tx)', fontSize: '14px', fontWeight: 500 }}>{lead.company}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ color: 'var(--tx2)', fontSize: '13px' }}>{lead.email || 'N/A'}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ color: 'var(--tx2)', fontSize: '13px' }}>{lead.phone || 'N/A'}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <a href={lead.site?.startsWith('http') ? lead.site : `https://${lead.site}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: '13px', textDecoration: 'none' }}>
                {lead.site || 'N/A'}
              </a>
            </div>

            {(lead.linkedin || lead.facebook || lead.instagram) && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                {lead.linkedin && (
                  <a href={lead.linkedin} target="_blank" rel="noreferrer" style={{ color: 'var(--tx2)', fontSize: '12px', textDecoration: 'none' }}>
                    LinkedIn ↗
                  </a>
                )}
                {lead.facebook && (
                  <a href={lead.facebook} target="_blank" rel="noreferrer" style={{ color: 'var(--tx2)', fontSize: '12px', textDecoration: 'none' }}>
                    Facebook ↗
                  </a>
                )}
                {lead.instagram && (
                  <a href={lead.instagram} target="_blank" rel="noreferrer" style={{ color: 'var(--tx2)', fontSize: '12px', textDecoration: 'none' }}>
                    Instagram ↗
                  </a>
                )}
              </div>
            )}

            <button 
              onClick={() => handleDeleteLead(lead)} 
              className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider"
              style={{ marginTop: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', width: 'fit-content' }}
            >
              Delete Lead
            </button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="app min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg: #0A0F1E; /* Dark background */
          --surface: #0B1229; /* Card background */
          --surface-light: #0F172A; /* Lighter card background / input background */
          --border: #1A2A3D; /* Border color */
          --border-hover: #2A5A8A; /* Border hover color */
          --tx: #DCE8F5; /* Primary text color */
          --tx2: #7A9AB8; /* Secondary text color */
          --tx3: #4A6080; /* Tertiary text color */
          --accent: #6C63FF; /* Accent color (purple) */
          --accent-glow: rgba(108,99,255,0.14); /* Accent background glow */
          --green: #68D391; /* Green for success/positive */
          --green-bg: rgba(104,211,145,0.1); /* Green background */
          --red: #EF4444; /* Red for errors/danger */
        }
        * { margin:0; padding:0; box-sizing:border-box; font-family: 'DM Sans', sans-serif; }

        /* Global Scrollbar Style */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        ::-webkit-scrollbar-track {
          background: var(--surface-light);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: var(--border-hover);
          border-radius: 10px;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: var(--border-hover) var(--surface-light);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--surface-light);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border-hover);
          border-radius: 10px;
        }

        /* Step Indicator */
        .wizard-wrap { padding: 0; }
        .progress-bar { height: 3px; background: var(--border); border-radius: 2px; margin-bottom: 24px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--accent); transition: width 0.3s; }
        
        .step-bar { display: flex; align-items: center; margin-bottom: 32px; }
        .step-item { display: flex; align-items: center; gap: 8px; }
        .s-line { flex: 1; height: 1px; background: var(--border); margin: 0 10px; min-width: 40px; }
        .s-line.done { background: var(--green); }
        .s-circle { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 500; flex-shrink: 0; border: 1px solid var(--border); background: var(--surface-light); color: var(--tx2); transition: all 0.2s; }
        .s-circle.active { background: var(--accent-glow); color: var(--accent); border-color: var(--accent); }
        .s-circle.done { background: var(--green-bg); color: var(--green); border-color: var(--green); }
        .s-label { font-size: 12px; color: var(--tx2); white-space: nowrap; }
        .s-label.active { color: var(--tx); font-weight: 500; }

        .card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:28px 28px 24px;}
        .card-title { font-size: 15px; font-weight: 500; color: var(--tx); margin-bottom: 3px; }
        .card-sub { font-size: 12px; color: var(--tx2); margin-bottom: 20px; }
        .row2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        
        .tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
        .tag { font-size: 11px; padding: 4px 10px; border-radius: 20px; border: 1px solid var(--border); color: var(--tx2); cursor: pointer; background: var(--surface-light); user-select: none; transition: all 0.2s; }
        .tag:hover { border-color: var(--accent); }
        .tag.sel { background: var(--accent-glow); color: var(--accent); border-color: var(--accent); }

        .country-wrap { position: relative; }
        .cdrop { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 999; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
        .copt { padding: 8px 12px; font-size: 13px; color: var(--tx); cursor: pointer; }
        .copt:hover { background: var(--surface-light); }
        .no-res { padding: 8px 12px; font-size: 12px; color: var(--tx2); }

        .wizard-results { /* No specific styles needed beyond default block display */ }
        .result-list { display: flex; flex-direction: column; gap: 10px; }
        .res-lead-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px; animation: fadeIn 0.3s ease-out; }
        .res-avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--accent-glow); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; color: var(--accent); flex-shrink: 0; }
        .res-lead-info { flex: 1; min-width: 0; }
        .res-lead-name { font-size: 13px; font-weight: 500; color: var(--tx); }
        .res-lead-meta { font-size: 11px; color: var(--tx2); margin-top: 2px; }
        .res-lead-contact { font-size: 11px; color: var(--accent); margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .res-badge { font-size: 10px; padding: 3px 8px; border-radius: 20px; flex-shrink: 0; font-weight: 600; }
        .res-badge.hot { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        .res-badge.warm { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.2); }
        .res-save-btn { font-size: 11px; padding: 5px 12px; border-radius: 6px; border: 1px solid var(--border); background: transparent; color: var(--tx2); cursor: pointer; flex-shrink: 0; transition: all 0.2s; }
        .res-save-btn:hover { background: var(--surface-light); color: var(--tx); border-color: var(--tx3); }
        .res-save-btn:disabled { color: var(--green); border-color: var(--green); cursor: default; background: var(--green-bg); }

        .db-checkpoint-card {
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .db-checkpoint-card .title {
          font-size: 18px;
          font-weight: 600;
          color: var(--tx);
        }
        .db-checkpoint-card .free-plan-leads-limit {
          font-size: 14px;
          color: var(--tx2);
        }
        .db-checkpoint-card .leads-count {
          font-size: 32px;
          font-weight: 700;
          color: var(--tx);
        }
        .db-checkpoint-card .usage-details {
          font-size: 14px;
          color: var(--tx2);
        }
        .db-checkpoint-card .actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        .db-usage-bar {
          margin-top: 24px;
        }
        .db-usage-bar .title {
          font-size: 16px;
          font-weight: 600;
          color: var(--tx);
          margin-bottom: 12px;
        }
        .db-usage-bar .bar {
          width: 100%;
          height: 8px;
          background-color: var(--surface-light);
          border-radius: 4px;
          overflow: hidden;
        }
        .db-usage-bar .bar .progress {
          width: 20%;
          height: 100%;
          background-color: var(--accent);
          border-radius: 4px;
        }
        .db-usage-bar .limit-text {
          margin-top: 8px;
          font-size: 12px;
          color: var(--tx2);
        }
        .db-date-range {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;
        }
        .db-date-range select {
          background-color: var(--surface-light);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px 12px;
          color: var(--tx);
          font-size: 14px;
        }
        .db-stats-grid {
          margin-top: 24px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .db-stat-card {
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
        }
        .db-stat-card .title {
          font-size: 16px;
          font-weight: 600;
          color: var(--tx);
        }
        .db-stat-card .value {
          font-size: 32px;
          font-weight: 700;
          color: var(--tx);
          margin-top: 8px;
        }
        .db-footer {
          margin-top: 40px;
          text-align: center;
          font-size: 14px;
          color: var(--tx2);
        }
        .db-footer a {
          color: var(--accent);
          text-decoration: none;
        }

        .app { display:flex; height:100vh; overflow:hidden; }
        .sidebar { width:var(--sidebar); background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; flex-shrink:0; }
        .content { flex:1; overflow:hidden; display:flex; flex-direction:column; }
        .page { display:none; flex-direction:column; flex:1; height:100%; min-height:0; animation: fadeIn 0.3s ease-out; }
        .page.active { display:flex; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        .sb-brand { padding:24px 20px; }
        .sb-logo { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; letter-spacing:-1px; color:var(--tx); }
        .sb-logo span { color:var(--accent); }
        .sidebar-profile { padding: 0 20px 18px; display: flex; align-items: center; gap: 14px; }
        .profile-avatar, .avatar { width: 52px; height: 52px; border-radius: 50%; background: var(--surface-light); border: 1px solid var(--border); display: grid; place-items: center; color: var(--tx); font-weight: 700; overflow: hidden; }
        .profile-avatar img, .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .profile-name { font-size: 14px; font-weight: 700; color: var(--tx); }
        .profile-role { font-size: 12px; color: var(--tx2); }
        .profile-badge { margin-top: 4px; font-size: 11px; color: var(--tx3); }
        .sidebar-badge { margin: 10px 0 14px; display: inline-flex; align-items: center; justify-content: center; padding: 6px 10px; border-radius: 999px; background: rgba(108, 99, 255, 0.08); color: #6C63FF; font-size: 11px; font-weight: 700; letter-spacing: 0.02em; }
        .sb-nav { padding:10px; flex:1; display:flex; flex-direction:column; }
        .sidebar-footer { padding:20px 24px; border-top:1px solid var(--border); margin-top:auto; }
        .footer-meta { display:flex; flex-direction:column; gap:4px; }
        .footer-name { font-size:14px; font-weight:700; color:var(--tx); }
        .footer-role { font-size:12px; color:var(--tx2); }
        .logout-btn { width:100%; margin-top:14px; background:var(--surface-light); border:1px solid var(--border); border-radius:12px; color:var(--tx); padding:10px 14px; cursor:pointer; transition:background .2s, transform .2s; }
        .logout-btn:hover { background:var(--surface); transform:translateY(-1px); }
        .nav-group-label { font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--tx3); padding:10px 12px; }
        .nav-item { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:10px; color:var(--tx2); cursor:pointer; transition:all .2s; font-size:13px; font-weight:500; }
        .nav-item:hover { background:var(--surface-light); color:var(--tx); text-decoration: none; }
        .nav-item.active { background:var(--accent-glow); color:var(--accent); }
        .nav-item.locked { cursor: not-allowed; opacity: 0.6; }
        .nav-item.locked:hover { background: transparent; color: var(--tx2); }
        .lock-icon { margin-left: auto; color: var(--tx3); }
        .nav-badge { margin-left:auto; font-size:10px; font-weight:700; padding:2px 8px; border-radius:100px; background:var(--surface-light); }

        .topbar { padding:20px 32px; border-bottom:1px solid var(--border); background:rgba(10,15,30,0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display:flex; align-items:center; justify-content:space-between; gap:16px; position: sticky; top:0; z-index:10; }
        .header-actions { display: flex; align-items: center; gap: 12px; }
        .notification-icon { position: relative; width: 40px; height: 40px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .2s; }
        .notification-icon:hover { background: var(--surface-light); border-color: var(--border-hover); }
        .notification-icon svg { color: var(--tx2); }
        .notification-badge { position: absolute; top: -4px; right: -4px; background: #ef4444; color: white; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }
        .header-profile { display:inline-flex; align-items:center; gap:12px; background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:10px 14px; cursor: pointer; transition: all .2s; }
        .header-profile:hover { background: var(--surface-light); border-color: var(--border-hover); }
        .header-profile-image { width:40px; height:40px; border-radius:50%; background:var(--surface-light); overflow:hidden; display:grid; place-items:center; }
        .header-profile-image img { width:100%; height:100%; object-fit:cover; }
        .header-profile-name { font-size:13px; font-weight:700; color:var(--tx); }
        .header-profile-email { font-size:11px; color:var(--tx2); }
        .page-title { font-family:'Syne',sans-serif; font-size:20px; font-weight:700; }
        .topbar-subtitle { margin-top: 4px; font-size: 12px; color: var(--tx2); }
        .btn { padding:10px 20px; border-radius:10px; font-weight:600; cursor:pointer; transition:all .2s; border:none; font-size:13px; }
        .btn-primary {background: var(--accent);color: #fff;box-shadow: 0 4px 15px rgba(108,99,255,0.3);padding: 6px 20px;border-radius: 6px;cursor: pointer}
        .btn-primary:hover { transform: translateY(-1px); background: #5a54e0; }
        .btn-outline {cursor: pointer;background: transparent;border: 1px solid var(--border);color: var(--tx);transition: all .2s;padding: 6px 20px;border-radius: 6px;cursor:pointer;}
        .btn-outline:hover { background:var(--surface-light); border-color:var(--tx3); }
        .body { padding:32px; flex:1; overflow-y: auto; }

        .stat-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:18px 20px; }
        
        .lead-card { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:20px; margin-bottom:12px; display:flex; align-items:center; gap:16px; transition:all .2s; }
        .lead-card:hover { border-color:var(--border-hover); background:var(--surface-light); }

        .wizard{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:28px 28px 24px;margin-bottom:16px;}
        .step-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;}
        .step-tag{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--tx3);}
        .step-dots{display:flex;gap:6px;}
        .step-dot{width:6px;height:6px;border-radius:50%;background:var(--border);transition:all .3s;}
        .step-dot.done{background:var(--accent);}
        .step-dot.active{background:var(--accent);width:18px;border-radius:3px;}
        .step-q{font-size:20px;font-weight:500;letter-spacing:-.3px;margin-bottom:20px;}
        
        .field-label{font-size:12px;color:var(--tx2);margin-bottom:7px;font-weight:500;letter-spacing:.03em;}
        .field-input{width:100%;padding:11px 14px;background:var(--surface-light);border:1px solid var(--border);border-radius:10px;color:var(--tx);font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border-color .2s;}
        .field-input:focus{border-color:var(--accent);}

        .chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;}
        .chip{padding:7px 14px;background:var(--surface-light);border:1px solid var(--border);border-radius:100px;font-size:12px;font-weight:500;color:var(--tx2);cursor:pointer;transition:all .18s;user-select:none;}
        .chip:hover{border-color:var(--accent);color:var(--tx);}
        .chip.selected{background:var(--accent-glow);border-color:var(--accent);color:var(--accent);}

        .loc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
        .loc-card{padding:12px 14px;background:var(--surface-light);border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:10px;}
        .loc-card:hover{border-color:var(--accent);}
        .loc-card.selected{background:var(--accent-glow);border-color:var(--accent);}
        .loc-flag{font-size:18px;width:24px;text-align:center;}
        .loc-name{font-size:13px;font-weight:500;}
        .loc-sub{font-size:11px;color:var(--tx3);}
        .loc-check{margin-left:auto;width:16px;height:16px;border-radius:50%;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;transition:all .18s;}
        .loc-card.selected .loc-check{background:var(--accent);border-color:var(--accent);}

        .vol-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;}
        .vol-card{padding:14px;background:var(--surface-light);border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:all .18s;text-align:center;}
        .vol-card.selected{background:var(--accent-glow);border-color:var(--accent);}
        .vol-num{font-family:'Instrument Serif',serif;font-size:24px;font-weight:400;margin-bottom:2px;}
        .vol-lbl{font-size:11px;color:var(--tx2);}
        .vol-card.selected .vol-num { color: var(--accent); }
        .vol-card.selected .vol-lbl { color: var(--accent); }

        .btn-row{display:flex; justify-content:space-between; gap:16px; margin-top:32px;}
        .btn-next{flex: 1; padding:10px 20px; background:var(--accent); border:none; border-radius:10px; color:#fff; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600; cursor:pointer; transition:all .2s; box-shadow: 0 4px 15px rgba(108,99,255,0.3);}
        .btn-next:hover{ transform: translateY(-1px); background: #5a54e0; }
        .btn-next:disabled{ background: var(--accent); opacity:.5; cursor:not-allowed; transform: none; box-shadow:none; }
        .btn-next:disabled:hover{ background: var(--accent); transform: none; }
        .btn-back-step{flex: 1; padding:13px 20px; background:transparent; border:1px solid var(--border); border-radius:10px; color:var(--tx2); font-family:'DM Sans',sans-serif; font-size:14px; cursor:pointer; transition:all .15s;}
        .btn-back-step:hover{border-color:var(--tx3); color:var(--tx); background:var(--surface-light);}

        .processing{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px 28px;margin-bottom:16px;}
        .proc-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}
        .proc-label{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--tx3);}
        .proc-timer{font-size:13px;font-weight:600;color:var(--tx2);}
        .proc-title{font-size:18px;font-weight:500;margin-bottom:20px;color:var(--tx);}
        .proc-item{margin-bottom:18px;}
        .proc-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;}
        .proc-name{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--tx2);}
        .proc-dot{width:8px;height:8px;border-radius:50%;background:var(--tx3);animation:pulse 2s infinite;}
        .proc-dot.running{background:var(--accent);animation:pulse 1s infinite;}
        .proc-dot.done{background:var(--green);}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .proc-pct{font-size:13px;font-weight:600;color:var(--tx2);}
        .proc-pct.done{color:var(--green);}
        .proc-bar-track{height:4px;background:var(--surface-light);border-radius:2px;overflow:hidden;}
        .proc-bar-fill{height:100%;background:linear-gradient(90deg,var(--accent),#8B7FFF);border-radius:2px;transition:width 0.3s ease;}
        .proc-bar-fill.done{background:var(--green);}
        .activity{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px 28px;}
        .act-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}
        .act-label{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--tx3);}
        .act-status{font-size:12px;font-weight:600;color:var(--tx2);}
        .act-log{display:flex;flex-direction:column;gap:10px;}
        .act-line{display:flex;gap:8px;font-size:13px;color:var(--tx2);align-items:center;}
        .act-arrow{color:var(--accent);}
        .act-time{margin-left:auto;color:var(--tx3);font-size:12px;}
        .act-empty{display:flex;align-items:center;justify-content:center;gap:10px;color:var(--tx3);padding:20px;text-align:center;font-size:13px;}
        .chat-log{display:flex;flex-direction:column;gap:12px;overflow-y:auto;flex:1;min-height:0;scrollbar-width:thin;scrollbar-color:var(--border-hover) var(--surface-light);padding-right:4px;}
        .chat-log::-webkit-scrollbar{width:10px;}
        .chat-log::-webkit-scrollbar-track{background:var(--surface-light);border-radius:10px;}
        .chat-log::-webkit-scrollbar-thumb{background:var(--border-hover);border-radius:10px;}
        .chat-message{max-width:84%;padding:16px 18px;border-radius:18px;font-size:13px;box-shadow:0 10px 25px rgba(0,0,0,0.08);border:1px solid transparent;transition:transform .2s,border-color .2s,background .2s;position:relative;}
        .chat-message.user{align-self:flex-end;background:#0f5ce6;color:#fff;border-color:rgba(96, 165, 250, 0.28);border-radius:18px 18px 4px 18px;}
        .chat-message.admin, .chat-message.ai{align-self:flex-start;background:#0F172A;color:#dce8f5;border-color:rgba(56, 189, 248, 0.18);border-radius:18px 18px 18px 4px;}
        .chat-message:hover{transform:translateY(-1px);}
        .chat-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;opacity:.75;margin-bottom:8px;}
        .chat-image-note{font-size:11px;font-style:italic;margin-bottom:10px;opacity:.8;}
        .chat-meta{font-size:9px;color:var(--tx3);margin-top:12px;text-align:right;}
        .chat-message.admin .chat-meta{text-align:left;}
        .typing-indicator { display: flex; gap: 4px; align-items: center; padding: 4px 0; }
        .typing-indicator span { width: 6px; height: 6px; background: var(--tx2); border-radius: 50%; animation: typing 1s infinite ease-in-out; }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .support-card { background: #111827; border: 1px solid var(--border); border-radius: 24px; display: flex; flex-direction: column; height: 100%; box-shadow: 0 12px 40px rgba(0,0,0,0.25); overflow: hidden; }
        .support-header { padding: 20px 24px; border-bottom: 1px solid var(--border); background: rgba(15, 23, 42, 0.6); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
        .support-footer { padding: 20px 24px; border-top: 1px solid var(--border); background: var(--surface); display: flex; gap: 12px; align-items: center; flex-shrink: 0; }

        .filter-tabs { display:flex; gap:8px; border-bottom:1px solid var(--border); margin-bottom:24px; }
        .tab { padding:10px 16px; font-size:13px; font-weight:500; color:var(--tx2); cursor:pointer; border-bottom:2px solid transparent; }
        .tab:hover { color:var(--tx); }
        .tab.active { color:var(--accent); border-bottom-color:var(--accent); }
        
        .compose-layout { display: flex; flex: 1; }
        .compose-main { flex: 1; padding: 32px; display: flex; flex-direction: column; }
        .compose-sidebar { width: 320px; border-left: 1px solid var(--border); padding: 24px; background-color: var(--surface); overflow-y: auto; }
        .email-editor { background-color: var(--surface); border: 1px solid var(--border); border-radius: 16px; flex: 1; display: flex; flex-direction: column; }
        .editor-field { padding: 12px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 16px; }
        .editor-label { color: var(--tx2); font-size: 13px; width: 100px; }
        .editor-input { background: transparent; border: none; outline: none; color: var(--tx); font-size: 13px; flex: 1; }
        .editor-body { flex: 1; padding: 20px; }
        .editor-textarea { width: 100%; height: 100%; background: transparent; border: none; outline: none; color: var(--tx); font-size: 14px; resize: none; line-height: 1.6; }
        .editor-actions { padding: 16px 20px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .sidebar-card { background-color: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 20px; }
        .sidebar-title { font-weight: 600; margin-bottom: 12px; font-size: 14px; }

        .notification-panel { position: fixed; top: 0; right: 0; width: 380px; height: 100vh; background: var(--bg); border-left: 1px solid var(--border); transform: translateX(100%); transition: transform 0.3s ease; z-index: 1000; }
        .notification-panel.active { transform: translateX(0); }
        .notification-header { padding: 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .notification-title { font-size: 18px; font-weight: 600; color: var(--tx); }
        .notification-close { background: none; border: none; color: var(--tx2); cursor: pointer; padding: 4px; border-radius: 4px; transition: all 0.2s; }
        .notification-close:hover { background: var(--surface-light); color: var(--tx); }
        .notification-content { padding: 24px; overflow-y: auto; height: calc(100vh - 80px); }
        .notification-empty { text-align: center; padding: 40px 20px; }
        .notification-empty-icon { font-size: 48px; margin-bottom: 16px; }
        .notification-empty-title { font-size: 16px; font-weight: 600; color: var(--tx); margin-bottom: 8px; }
        .notification-empty-desc { font-size: 14px; color: var(--tx2); line-height: 1.5; }
        .notification-item { display: flex; gap: 12px; padding: 16px; border: 1px solid var(--border); border-radius: 12px; margin-bottom: 12px; background: var(--surface); transition: border-color 0.2s ease, background 0.2s ease; }
        .notification-item.unread { border-color: var(--accent); background: rgba(108,99,255,0.08); }
        .notification-item-icon { font-size: 20px; flex-shrink: 0; }
        .notification-item-content { flex: 1; }
        .notification-item-title { font-weight: 600; color: var(--tx); margin-bottom: 4px; }
        .notification-item-message { color: var(--tx2); font-size: 14px; line-height: 1.4; margin-bottom: 8px; }
        .notification-item-time { font-size: 12px; color: var(--tx3); }
        .sidebar-select { width: 100%; background: var(--surface-light); border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; color: var(--tx); }
        
        .templates-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 24px; }
        .template-card { background-color: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; }
        .template-card .category { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--tx3); margin-bottom: 8px; }
        .template-card .title { font-size: 18px; font-weight: 600; color: var(--tx); margin-bottom: 8px; }
        .template-card .description { color: var(--tx2); font-size: 13px; line-height: 1.6; flex: 1; margin-bottom: 16px; }
        .template-card .stats { font-size: 12px; color: var(--tx3); margin-bottom: 16px; }
        .template-card .actions { display: flex; gap: 12px; }
        .new-template-card { border: 2px dashed var(--border); background-color: transparent; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px; }

        .export-section { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .export-section .title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
        .export-section .subtitle { font-size: 13px; color: var(--tx2); margin-bottom: 20px; }
        .export-options { display: flex; gap: 40px; }
        .export-column { display: flex; flex-direction: column; gap: 12px; }
        .export-history-item { display: flex; align-items: center; justify-content: space-between; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 12px; }

        .pricing-wrap{max-width:1200px;margin:0 auto;padding:0;}
        .pricing-head{text-align:center;margin-bottom:40px;}
        .pricing-eyebrow{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--tx3);margin-bottom:12px;}
        .pricing-headline{font-size:36px;font-weight:600;line-height:1.2;margin-bottom:16px;color:var(--tx);}
        .pricing-headline em{font-style:italic;color:var(--tx2);}
        .pricing-head > p{font-size:14px;color:var(--tx3);}
        
        .pricing-toggle-wrap{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:40px;}
        .pill-toggle{width:50px;height:28px;background:var(--surface-light);border:1px solid var(--border);border-radius:20px;position:relative;cursor:pointer;transition:all .3s;display:flex;align-items:center;padding:0 3px;}
        .pill-toggle.an{background:var(--accent-glow);border-color:var(--accent);}
        .pill-toggle-thumb{width:22px;height:22px;background:var(--tx);border-radius:50%;position:absolute;left:3px;transition:left .3s;}
        .pill-toggle.an .pill-toggle-thumb{left:25px;background:var(--accent);}
        .save-badge{font-size:12px;font-weight:600;color:var(--green);}
        
        .pricing-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:40px;}
        .pricing-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:32px 24px;position:relative;transition:all .3s;display:flex;flex-direction:column;}
        .pricing-card:hover{border-color:var(--accent);transform:translateY(-4px);}
        .pricing-card.featured{border-color:var(--accent);background:linear-gradient(135deg,rgba(108,99,255,0.1),rgba(108,99,255,0.05));box-shadow:0 0 20px rgba(108,99,255,0.2);}
        .pricing-card.featured:hover{transform:translateY(-8px);}
        .featured-badge{position:absolute;top:16px;right:16px;background:var(--accent-glow);border:1px solid var(--accent);color:var(--accent);font-size:11px;font-weight:700;padding:6px 12px;border-radius:100px;}
        
        .price-num{font-family:'Instrument Serif',serif;font-size:42px;font-weight:400;color:var(--tx);}
        .pricing-card .text-xs{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--tx3);}
        .pricing-card.featured .text-xs{color:var(--accent);}
        .pricing-card .text-sm{font-size:14px;color:var(--tx2);}
        .pricing-card ul{list-style:none;}
        .pricing-card li{display:flex;align-items:center;gap:8px;font-size:13px;color:var(--tx2);margin-bottom:10px;}
        .pricing-card li svg{width:16px;height:16px;flex-shrink:0;}
        .pricing-card li.off{color:var(--tx3);opacity:0.6;}
        .pricing-card li.off svg{stroke:var(--tx3);}
        
        .pipeline-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
        .pipeline-card { background: var(--surface); border: 1px solid var(--border); border-radius: 22px; padding: 22px; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 12px 24px rgba(9, 14, 29, 0.05); min-height: 220px; }
        .pipeline-card .pipeline-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .pipeline-card .pipeline-title { font-size: 16px; font-weight: 700; }
        .pipeline-card .pipeline-count { font-size: 13px; color: var(--tx2); background: var(--surface-light); padding: 8px 12px; border-radius: 999px; }
        .pipeline-card .pipeline-meta { font-size: 12px; color: var(--tx3); }
        .pipeline-card .pipeline-leads { display: grid; gap: 10px; }
        .pipeline-card .pipeline-lead { padding: 12px 14px; border-radius: 14px; background: var(--surface-light); border: 1px solid var(--border); color: var(--tx); font-size: 13px; }

        .lead-page-hero { display: flex; flex-direction: column; gap: 20px; padding: 24px; background: linear-gradient(180deg, rgba(7,11,24,0.95), rgba(10,15,30,0.85)); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; margin-bottom: 24px; }
        .hero-top { font-size: 12px; color: var(--tx3); cursor: pointer; }
        .hero-title { font-size: 28px; font-weight: 700; color: var(--tx); line-height: 1.05; }
        .hero-sub { font-size: 14px; color: var(--tx2); max-width: 560px; }
        .hero-banner { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 20px; border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; background: rgba(15,22,48,0.85); }
        .lead-search-row { display: flex; align-items: center; gap: 16px; margin-top: 18px; }
        .lead-count-pill { min-width: 82px; padding: 12px 16px; border-radius: 999px; background: rgba(255,255,255,0.05); color: var(--surface); font-weight: 700; text-align: center; }
        .lead-card-view { justify-content: space-between; padding: 20px 22px; border-radius: 20px; }
        .lead-card-view .btn-outline { padding: 10px 12px; min-width: auto; }

        .results-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
        .results-title{font-size:16px;font-weight:600;}
        .results-sub{font-size:12px;color:var(--tx2);}
        .summary-bar{background:var(--green-bg);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:16px;margin-bottom:24px; animation: fadeIn 0.4s ease;}
        .result-lead-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px 18px;margin-bottom:10px;display:flex;align-items:center;gap:14px;transition:all 0.2s; animation: fadeIn 0.3s ease;}
        .result-lead-card:hover { border-color: var(--border-hover); background: var(--surface-light); }
        .score-pill{flex-shrink:0;padding:3px 10px;border-radius:100px;font-size:10px;font-weight:700; letter-spacing:0.05em;background:var(--green-bg);color:var(--green);}
        .verified-tag{display:flex;align-items:center;gap:4px;font-size:11px;color:var(--green);flex-shrink:0;}
        .modal-backdrop{position:fixed;inset:0;background:rgba(8,13,28,0.78);display:flex;align-items:center;justify-content:center;z-index:120;backdrop-filter:blur(4px);padding:20px;}
        .modal-card{width:min(760px,100%);background:var(--surface);border:1px solid var(--border);border-radius:28px;padding:28px;box-shadow:0 40px 90px rgba(5,10,25,0.35);position:relative;max-height:90vh;overflow-y:auto;}
        .modal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;gap:16px;}
        .modal-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--accent);background:rgba(108,99,255,0.14);padding:10px 14px;border-radius:999px;}
        .modal-close{all:unset;cursor:pointer;width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:var(--surface-light);border:1px solid var(--border);color:var(--tx2);font-size:18px;}
        .modal-title{font-size:28px;font-weight:700;color:var(--tx);margin-bottom:8px;}
        .modal-copy{font-size:14px;color:var(--tx2);line-height:1.8;margin-bottom:20px;}
        .modal-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px;}
        .modal-btn{padding:12px 22px;border-radius:999px;border:none;font-size:13px;font-weight:700;cursor:pointer;}
        .modal-btn.primary{background:linear-gradient(90deg,#5C53FF,#4CA4FF);color:#fff;}
        .modal-btn.outline{background:transparent;border:1px solid var(--border);color:var(--tx);}
        .modal-list{display:flex;flex-direction:column;gap:12px;max-height:320px;overflow-y:auto;margin-top:20px;padding-right:4px;} /* This is for other modals, keep it */
        .modal-lead-item{background:var(--surface-light);border:1px solid var(--border);border-radius:18px;padding:18px;} /* Removed previous max-height/overflow-y as it was not the correct target for this modal */
        .modal-lead-title{font-size:14px;font-weight:700;color:var(--tx);margin-bottom:8px;}
        .modal-lead-copy{font-size:13px;color:var(--tx2);line-height:1.7;}

        .alert-backdrop{position:fixed;inset:0;background:rgba(8,13,28,0.82);display:flex;align-items:center;justify-content:center;z-index:130;backdrop-filter:blur(4px);padding:20px;}
        .alert-card{width:min(440px,100%);background:var(--surface);border:1px solid var(--border);border-radius:22px;padding:22px 24px;box-shadow:0 24px 60px rgba(0,0,0,0.24);}
        .alert-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;}
        .alert-title{font-size:18px;font-weight:700;color:var(--tx);}
        .alert-message{font-size:14px;color:var(--tx2);line-height:1.75;}
        .alert-close{all:unset;cursor:pointer;width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:var(--surface-light);border:1px solid var(--border);color:var(--tx2);font-size:18px;}
        .alert-card.alert-success{border-color:#10b981;background:rgba(16,185,129,0.08);}
        .alert-card.alert-error{border-color:#ef4444;background:rgba(239,68,68,0.08);}
        .alert-card.alert-info{border-color:#3b82f6;background:rgba(59,130,246,0.08);}

        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 40px; text-align: center; }
        .empty-icon { font-size: 64px; margin-bottom: 20px; flex-shrink: 0; }
        .empty-title { font-size: 28px; font-weight: 700; margin-bottom: 12px; }
        .empty-desc { font-size: 14px; color: var(--tx2); margin-bottom: 24px; max-width: 400px; }

        .settings-layout { display: flex; flex: 1; }
        .settings-nav { width: 200px; padding: 24px; border-right: 1px solid var(--border); background: var(--surface); }
        .settings-nav .nav-item { padding: 10px 12px; }
        .settings-content { flex: 1; padding: 32px; }
        .settings-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
        .form-group { margin-bottom: 20px; }
        .form-label { font-size: 13px; font-weight: 500; color: var(--tx2); margin-bottom: 8px; display: block; }
        .form-input { width: 100%; padding: 10px 14px; background: var(--surface-light); border: 1px solid var(--border); border-radius: 8px; color: var(--tx); font-family: 'DM Sans', sans-serif; }
        .form-input:focus { outline: none; border-color: var(--accent); }
        .profile-photo { display: flex; align-items: center; gap: 16px; }
        .avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--surface-light); color: var(--tx); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 600; }
        .danger-zone { border-left: 3px solid var(--red); padding-left: 16px; }
        .danger-zone .form-label { color: var(--red); }

        svg.icon { width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:2; stroke-linecap:round; stroke-linejoin:round; }
      ` }} />

      {/* SIDEBAR - User Dashboard */}
      <div className="sidebar">
        <div className="sb-brand">
          <div className="sb-logo">ARFA<span>.</span></div>
        </div>
        <div className="sb-nav">
          <div className="nav-group-label">Main</div>
          <div className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => setActivePage('dashboard')}>
            📊 Dashboard
          </div>
          <div className={`nav-item ${activePage === 'prospector' ? 'active' : ''}`} onClick={() => setActivePage('prospector')}>
            🔍 Prospector
          </div>
          <div className={`nav-item ${activePage === 'my-leads' ? 'active' : ''}`} onClick={() => setActivePage('my-leads')}>
            📋 Lead Library
          </div>
          <div className={`nav-item ${activePage === 'pipeline' ? 'active' : ''} ${currentPlan === 'Free' ? 'locked' : ''}`} onClick={() => currentPlan !== 'Free' && setActivePage('pipeline')}>
            🔄 Pipeline {currentPlan === 'Free' && <span className="lock-icon">🔒</span>}
          </div>

          <div className="nav-group-label" style={{marginTop: '20px'}}>Outreach</div>
          <div className={`nav-item ${activePage === 'compose' ? 'active' : ''} ${currentPlan === 'Free' ? 'locked' : ''}`} onClick={() => currentPlan !== 'Free' && setActivePage('compose')}>
            ✉️ Compose {currentPlan === 'Free' && <span className="lock-icon">🔒</span>}
          </div>
          <div className={`nav-item ${activePage === 'templates' ? 'active' : ''} ${currentPlan === 'Free' ? 'locked' : ''}`} onClick={() => currentPlan !== 'Free' && setActivePage('templates')}>
            📝 Templates {currentPlan === 'Free' && <span className="lock-icon">🔒</span>}
          </div>
          <div className={`nav-item ${activePage === 'exports' ? 'active' : ''} ${currentPlan === 'Free' ? 'locked' : ''}`} onClick={() => currentPlan !== 'Free' && setActivePage('exports')}>
            📥 Export {currentPlan === 'Free' && <span className="lock-icon">🔒</span>}
          </div>

          <div className="nav-group-label" style={{marginTop: '20px'}}>Account</div>
          <div className={`nav-item ${activePage === 'plan' ? 'active' : ''}`} onClick={() => setActivePage('plan')}>
            💎 Pricing
          </div>
          <div className={`nav-item ${activePage === 'support' ? 'active' : ''}`} onClick={() => setActivePage('support')}>
            🆘 Support
          </div>
          <div className={`nav-item ${activePage === 'settings' ? 'active' : ''}`} onClick={() => setActivePage('settings')}>
            ⚙️ Settings
          </div>
        </div>
        <div className="sidebar-footer">
          {currentPlan === 'Free' && (
            <button 
              onClick={() => setActivePage('plan')}
              className="btn-primary"
              style={{width: '100%', marginBottom: '14px'}}
            >
              Unlock full access
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      {/* NOTIFICATION PANEL - User Dashboard */}
      <div className={`notification-panel ${showNotificationPanel ? 'active' : ''}`}>
        <div className="notification-header">
          <div className="notification-title">Notifications</div>
          <button className="notification-close" onClick={() => setShowNotificationPanel(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="notification-content">
          {notifications.length === 0 ? (
            <div className="notification-empty">
              <div className="notification-empty-icon">🔔</div>
              <div className="notification-empty-title">No notifications yet</div>
              <div className="notification-empty-desc">When the admin sends updates or billing alerts, they'll appear here.</div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className={`notification-item ${notification.read ? '' : 'unread'}`}>
                <div className="notification-item-icon">📢</div>
                <div className="notification-item-content">
                  <div className="notification-item-title">From {notification.from}</div>
                  <div className="notification-item-message">{notification.message}</div>
                  <div className="notification-item-time">{new Date(notification.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="content flex flex-col h-full overflow-hidden"> {/* Added flex-col h-full overflow-hidden */}
        {/* --- 0. DASHBOARD --- */}
        <div className={`page ${activePage === 'dashboard' ? 'active' : ''}`}>
          <div className="topbar shrink-0"> {/* Added shrink-0 */}
            <div>
              <div className="page-title">Dashboard</div>
              {userEmail ? <div className="topbar-subtitle">Signed in as {userEmail}</div> : null}
            </div>
            <HeaderProfile />
          </div>
          <div className="body flex-1 overflow-y-auto custom-scrollbar"> {/* Added flex-1 overflow-y-auto custom-scrollbar */}
            <div className="db-checkpoint-card">
              <div className="title">Progress Checkpoint</div>
              <div className="free-plan-leads-limit">You are on the {currentPlan} plan. You can collect up to {leadCredits} leads.</div>
              <div className="leads-count">{remainingLeads}</div>
              <div className="usage-details">{collectedLeadsCount} leads collected · {leadCredits} quota</div>
              <div className="actions">
                <button className="btn btn-primary" onClick={() => setActivePage('plan')}>Upgrade Plan</button>
                <button className="btn btn-outline" onClick={() => setActivePage('prospector')}>Find Leads</button>
              </div>
            </div>

            <div className="db-usage-bar">
              <div className="title">Monthly Lead Credits</div>
              <div className="bar"><div className="progress" style={{width: `${Math.min(100, (leadsUsed / leadCredits) * 100)}%`}}></div></div>
              <div className="limit-text">{leadsUsed} of {leadCredits} leads used</div>
            </div>

            <div className="db-date-range">
              <select>
                <option>All Time</option>
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
              </select>
            </div>

            <div className="db-stats-grid">
              <div className="db-stat-card">
                <div className="title">Leads Found</div>
                <div className="value">{collectedLeadsCount}</div>
              </div>
              <div className="db-stat-card">
                <div className="title">In Pipeline</div>
                <div className="value">{pipelineLeadCount}</div>
              </div>
              <div className="db-stat-card">
                <div className="title">Follow-ups Active</div>
                <div className="value">{activeFollowUps}</div>
              </div>
              <div className="db-stat-card">
                <div className="title">Total Outreach</div>
                <div className="value">{outreachItems.length}</div>
              </div>
            </div>

            <div className="card" style={{marginTop: '24px'}}>
              <div className="results-header">
                <div>
                  <div className="results-title">Outreach Activity Hub</div>
                  <div className="results-sub">Manage your sent, scheduled, and draft emails</div>
                </div>
                <div className="filter-tabs" style={{marginBottom: 0, border: 'none'}}>
                   {['all', 'sent', 'scheduled', 'draft'].map(f => (
                     <div key={f} className={`tab ${outreachFilter === f ? 'active' : ''}`} onClick={() => setOutreachFilter(f as any)} style={{textTransform: 'capitalize'}}>
                       {f}
                     </div>
                   ))}
                </div>
              </div>

              <div className="modal-list" style={{maxHeight: '400px', marginTop: '10px'}}>
                {filteredOutreach.length === 0 ? (
                  <div className="act-empty">No {outreachFilter !== 'all' ? outreachFilter : ''} activities found.</div>
                ) : (
                  filteredOutreach.map((item) => (
                    <div key={item.id} className="modal-lead-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div>
                        <div className="modal-lead-title" style={{display:'flex', alignItems:'center', gap:'8px'}}>
                          {item.subject}
                          <span className={`res-badge ${item.status === 'sent' || item.status === 'completed' ? 'warm' : 'hot'}`} style={{fontSize:'9px'}}>
                            {item.status === 'completed' ? 'SENT' : item.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="modal-lead-copy">To: {item.to} • {item.businessName}</div>
                        <div className="modal-lead-copy" style={{fontSize:'11px', marginTop:'4px'}}>Date: {new Date(item.date).toLocaleString()} ({item.status})</div>
                      </div>
                      <button className="btn-outline" style={{padding:'4px 8px'}} onClick={async () => {
                        setOutreachItems(prev => prev.filter(i => i.id !== item.id));
                        await deleteOutreachFromServer(item.id);
                      }}>Remove</button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="db-footer">
              Need help? <a href="#" onClick={() => setActivePage('support')}>Contact our support team</a>
            </div>
          </div>
        </div>

        {/* --- 1. PROSPECTOR --- */}
        <div className={`page ${activePage === 'prospector' ? 'active' : ''}`}>
          <div className="topbar shrink-0"> {/* Added shrink-0 */}
            <div className="page-title">Prospector</div>
            <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
              <span style={{fontSize:'12px', color:'var(--tx3)'}}>{remainingLeads} of {leadCredits} lead credits remaining</span>
              <button className="btn btn-primary" onClick={() => setActivePage('plan')}>Upgrade Plan</button>
            </div>
            <HeaderProfile />
          </div>
          <div className="body flex-1 overflow-y-auto custom-scrollbar"> {/* Added flex-1 overflow-y-auto custom-scrollbar */}
            <h1 className="page-title" style={{fontSize: '28px', marginBottom: '8px'}}>Find your next leads</h1>
            <p style={{color: 'var(--tx2)', marginBottom: '32px'}}>Start with 25 free leads. No setup needed.</p>

            {/* --- WIZARD --- */}
            {!isSearching && findStep < 3 && !showFinalResults && (
              <div className="wizard-wrap">
                <div className="step-bar">
                  <div className="step-item">
                    <div className={`s-circle ${findStep >= 1 ? 'active' : ''} ${findStep > 1 ? 'done' : ''}`}>1</div>
                    <div className={`s-label ${findStep === 1 ? 'active' : ''}`}>Role</div>
                  </div>
                  <div className={`s-line ${findStep > 1 ? 'done' : ''}`}></div>
                  <div className="step-item">
                    <div className={`s-circle ${findStep >= 2 ? 'active' : ''} ${findStep > 2 ? 'done' : ''}`}>2</div>
                    <div className={`s-label ${findStep === 2 ? 'active' : ''}`}>Target</div>
                  </div>
                  <div className={`s-line ${findStep > 2 ? 'done' : ''}`}></div>
                  <div className="step-item">
                    <div className={`s-circle ${findStep >= 3 ? 'active' : ''}`}>3</div>
                    <div className={`s-label ${findStep === 3 ? 'active' : ''}`}>Review</div>
                  </div>
                </div>

                {findStep === 1 && (
                  <div className="wizard">
                    <h2 className="step-q">Who are you looking for?</h2>
                    <div className="form-group">
                      <label className="form-label">Job Title</label>
                      <input
                        type="text"
                        className="field-input"
                        style={formErrors.title ? { borderColor: 'var(--red)' } : {}}
                        placeholder="e.g. CEO, Founder, Head of Marketing"
                        value={searchTitle}
                        onChange={(e) => setSearchTitle(e.target.value)}
                      />
                      {formErrors.title && <p style={{ color: 'var(--red)', fontSize: '12px', marginTop: '4px' }}>{formErrors.title}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location (Country / City)</label>
                      <input
                        type="text"
                        className="field-input"
                        style={formErrors.location ? { borderColor: 'var(--red)' } : {}}
                        placeholder="e.g. United States, London"
                        value={selectedLoc}
                        onChange={(e) => setSelectedLoc(e.target.value)}
                      />
                      {formErrors.location && <p style={{ color: 'var(--red)', fontSize: '12px', marginTop: '4px' }}>{formErrors.location}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Website URL (optional)</label>
                      <input
                        type="url"
                        className="field-input"
                        placeholder="e.g. https://example.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                      />
                      <p style={{ color: 'var(--tx3)', fontSize: '12px', marginTop: '4px' }}>Paste a landing page to collect real leads from the website.</p>
                    </div>
                    <div className="btn-row">
                      <button onClick={() => {
                        const errors = { title: '', location: '' };
                        let hasError = false;
                        if (!searchTitle.trim()) {
                          errors.title = 'Job title is required.';
                          hasError = true;
                        }
                        if (!selectedLoc.trim()) {
                          errors.location = 'Location is required.';
                          hasError = true;
                        }
                        setFormErrors(prev => ({ ...prev, ...errors }));
                        if (!hasError) {
                          setFormErrors({ title: '', industry: '', location: '' });
                          setFindStep(2);
                        }
                      }} className="btn-next">
                        Next: Define Target →
                      </button>
                    </div>
                  </div>
                )}

                {findStep === 2 && (
                  <div className="wizard">
                    <h2 className="step-q">What industry are they in?</h2>
                    <div className="form-group">
                      <label className="form-label">Industry / Keywords</label>
                      <input
                        type="text"
                        className="field-input"
                        style={formErrors.industry ? { borderColor: 'var(--red)' } : {}}
                        placeholder="e.g. Software, Real Estate, Healthcare"
                        value={selectedIndustry}
                        onChange={(e) => setSelectedIndustry(e.target.value)}
                      />
                      {formErrors.industry && <p style={{ color: 'var(--red)', fontSize: '12px', marginTop: '4px' }}>{formErrors.industry}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">How many leads do you need?</label>
                      <input
                        type="range"
                        min="5"
                        max="25"
                        step="5"
                        value={selectedVol}
                        onChange={(e) => setSelectedVol(parseInt(e.target.value))}
                        style={{width: '100%'}}
                      />
                      <div style={{textAlign: 'center', marginTop: '8px', fontSize: '14px', fontWeight: 600}}>{selectedVol} leads</div>
                    </div>
                    <div className="btn-row">
                      <button onClick={() => setFindStep(1)} className="btn-back-step">
                        ← Back
                      </button>
                      <button onClick={startSearchFlow} className="btn-next">
                        Find Leads
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- SEARCHING VIEW --- */}
            {(isSearching || findStep === 3) && (
              <div className="flex flex-col gap-6">
                <div className="row2">
                  <div className="processing">
                    <div className="proc-header">
                      <div className="proc-label">Processing your leads</div>
                      <div className="proc-timer">{`0:${timer.toString().padStart(2, '0')}`}</div>
                    </div>
                    <div className="proc-title">{findStep === 3 ? 'Search Complete' : 'Your leads are being generated...'}</div>
                    <div className="proc-item">
                      <div className="proc-row">
                        <div className="proc-name"><span className={`proc-dot ${searchProgress.a < 100 ? 'running' : 'done'}`}></span>Searching for profiles</div>
                        <div className={`proc-pct ${searchProgress.a === 100 ? 'done' : ''}`}>{searchProgress.a}%</div>
                      </div>
                      <div className="proc-bar-track"><div className={`proc-bar-fill ${searchProgress.a === 100 ? 'done' : ''}`} style={{ width: `${searchProgress.a}%` }}></div></div>
                    </div>
                    <div className="proc-item">
                      <div className="proc-row">
                        <div className="proc-name"><span className={`proc-dot ${searchProgress.b < 100 ? 'running' : 'done'}`}></span>Enriching contacts</div>
                        <div className={`proc-pct ${searchProgress.b === 100 ? 'done' : ''}`}>{searchProgress.b}%</div>
                      </div>
                      <div className="proc-bar-track"><div className={`proc-bar-fill ${searchProgress.b === 100 ? 'done' : ''}`} style={{ width: `${searchProgress.b}%` }}></div></div>
                    </div>
                    <div className="proc-item">
                      <div className="proc-row">
                        <div className="proc-name"><span className={`proc-dot ${searchProgress.c < 100 ? 'running' : 'done'}`}></span>Validating emails</div>
                        <div className={`proc-pct ${searchProgress.c === 100 ? 'done' : ''}`}>{searchProgress.c}%</div>
                      </div>
                      <div className="proc-bar-track"><div className={`proc-bar-fill ${searchProgress.c === 100 ? 'done' : ''}`} style={{ width: `${searchProgress.c}%` }}></div></div>
                    </div>
                  </div>
                  <div className="activity">
                    <div className="act-header">
                      <div className="act-label">Activity Feed</div>
                      <div className="act-status">{findStep === 3 ? 'Completed' : 'Live'}</div>
                    </div>
                    <div className="act-log">
                      {searchLogs.length === 0 ? (
                        <div className="act-empty">Starting search engine...</div>
                      ) : (
                        searchLogs.map((log, i) => (
                          <div key={i} className="act-line">
                            <span className="act-arrow">&gt;</span>
                            <span>{log.msg}</span>
                            <span className="act-time">{log.time}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Results Section Below */}
                {findStep === 3 && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="results-header">
                      <div className="results-title">Collected Leads</div>
                      <div className="results-sub">Showing results for your latest search</div>
                    </div>
                    <div className="space-y-4">
                      {searchResultLeads.map((lead, index) => (
                        <LeadCard key={index} lead={lead} />
                      ))}
                    </div>
                    <div className="mt-8 text-center">
                      <button className="btn btn-outline" onClick={() => { setFindStep(1); setSearchResultLeads([]); }}>Start New Search</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* --- RESULTS VIEW --- */}
            {showFinalResults && !isSearching && (
              <div className="modal-backdrop">
                <div className="modal-card">
                  <div className="modal-header">
                    <span className="modal-label">Collection Complete</span>
                    <button className="modal-close" onClick={() => setShowFinalResults(false)}>×</button>
                  </div>
                  <div className="modal-title">Your leads have been collected!</div>
                  <div className="modal-copy">
                    We successfully found and verified {searchOutcomeCount} leads based on your criteria. 
                    They are now available in your Lead Library for outreach.
                  </div>

                  <div className="modal-actions" style={{ display: 'flex', gap: '16px', width: '100%' }}>
                    <button className="modal-btn outline" style={{ flex: 1 }} onClick={() => { setActivePage('my-leads'); setShowFinalResults(false); }}>View Leads</button>
                    <button className="modal-btn primary" style={{ flex: 1 }} onClick={() => { 
                      setFindStep(1); 
                      setIsSearching(false); 
                      setShowFinalResults(false); 
                      setSearchResultLeads([]);
                      setSearchTitle('');
                      setSelectedIndustry('');
                      setSelectedLoc('');
                    }}>Refine Search</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- 2. MY LEADS / LEAD LIBRARY --- */}
        <div className={`page ${activePage === 'my-leads' ? 'active' : ''}`}>
          <div className="topbar shrink-0">
            <div className="page-title">Lead Library</div>
            <HeaderProfile />
          </div>
          <div className="body flex-1 overflow-y-auto custom-scrollbar">
            <div className="lead-page-hero">
              <div className="hero-top">
                <a href="#" onClick={() => setActivePage('dashboard')}>← Back to Dashboard</a>
              </div>
              <h1 className="hero-title">These could be your next clients.</h1>
              <p className="hero-sub">Start by contacting the ones that look promising.</p>

              <div className="hero-banner">
                <div>
                  <p className="font-semibold" style={{color:'var(--tx)'}}>{filteredLeads.length} trial leads ready</p>
                  <p className="text-sm" style={{color:'var(--tx2)'}}>You have collected {myLeads.length} lead{myLeads.length === 1 ? '' : 's'} in your library.</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-outline" onClick={handleDownloadCSV}>Download CSV</button>
                  <button className="btn btn-primary" onClick={handleSendToMyEmail}>Send to my email</button>
                </div>
              </div>
            </div>

            <div className="chips" style={{ marginBottom: '24px' }}>
              {['all', 'New', 'Contacted', 'Enriched'].map(f => (
                <div 
                  key={f} 
                  className={`chip ${myLeadsFilter === f ? 'selected' : ''}`}
                  onClick={() => setMyLeadsFilter(f)}
                >
                  {f === 'all' ? 'All Leads' : f}
                </div>
              ))}
            </div>

            <div className="relative mb-6 card" style={{padding: '18px 20px', marginBottom: '15px'}}>
              <input
                type="text"
                placeholder="Search company..."
                value={searchKw}
                onChange={(e) => setSearchKw(e.target.value)}
                className="field-input"
                style={{paddingLeft: '40px'}}
              />
              <div className="absolute left-8 top-1/2 -translate-y-1/2" style={{left: '30px'}}>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm text-gray-400 bg-transparent px-2" style={{right: '30px'}}>{filteredLeads.length} leads</span>
            </div>

            <p className="text-sm" style={{color:'var(--tx2)', marginBottom: '16px'}}>Pick the most promising opportunity and start the first conversation.</p>

            <div className="space-y-4">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead, index) => (
                  <LeadCard key={index} lead={lead} />
                ))
              ) : (
                <div className="empty-state" style={{padding: '40px 0'}}>
                  <div className="empty-icon">📂</div>
                  <div className="empty-title" style={{fontSize: '18px'}}>No leads found</div>
                  <div className="empty-desc" style={{maxWidth: '300px'}}>Try adjusting your filters or run a new search in the Prospector.</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- 3. PIPELINE --- */}
        <div className={`page ${activePage === 'pipeline' ? 'active' : ''}`}>
          <div className="topbar shrink-0"><div className="page-title">Pipeline</div><HeaderProfile /></div> {/* Added shrink-0 */}
          <div className="body flex-1 overflow-y-auto custom-scrollbar"> {/* Added flex-1 overflow-y-auto custom-scrollbar */}
            <div className="pipeline-grid">
              {PIPELINE_DATA.map((stage) => (
                <PipelineCol
                  key={stage.stage}
                  title={stage.stage}
                  leads={stage.leads}
                  color={stage.stage === 'Won' ? 'var(--green)' : stage.stage === 'Negotiating' ? '#f59e0b' : stage.stage === 'Proposal' ? '#3b82f6' : 'var(--accent)'}
                />
              ))}
            </div>
          </div>
        </div>

        {/* --- 4. COMPOSE --- */}
        <div className={`page ${activePage === 'compose' ? 'active' : ''}`}>
          <div className="topbar shrink-0"> {/* Added shrink-0 */}
            <div className="page-title">Compose Email</div>
            <div style={{display:'flex', gap:'12px'}}>
              <button className="btn btn-outline" onClick={handleSaveDraft}>Save Draft</button>
              <button className="btn btn-primary" onClick={handleSendEmail}>Send Email</button>
            </div>
            <HeaderProfile />
          </div>
          <div className="compose-layout flex-1 overflow-hidden"> {/* Added flex-1 overflow-hidden */}
            <div className="compose-main">
              <div className="email-editor">
                <div className="editor-field">
                  <div className="editor-label">To</div>
                  <input
                    type="text"
                    className="editor-input"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    placeholder="lead@example.com"
                    required
                  />
                </div>
                <div className="editor-field">
                  <div className="editor-label">Business Name</div>
                  <input
                    type="text"
                    className="editor-input"
                    value={composeBusinessName}
                    onChange={(e) => setComposeBusinessName(e.target.value)}
                    placeholder="Company name"
                  />
                </div>
                <div className="editor-field">
                  <div className="editor-label">Subject</div>
                  <input
                    type="text"
                    className="editor-input"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    placeholder="Email subject"
                    required
                  />
                </div>
                <div className="editor-body">
                  <textarea
                    className="editor-textarea"
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    placeholder="Write your email here..."
                    required
                  />
                </div>
                <div className="editor-actions">
                  <div>
                    <button className="btn btn-outline" style={{marginRight:'12px'}} onClick={() => setComposeBody(`Hi there,\n\nI came across ${composeBusinessName || 'your company'} while researching ${composeLead?.location || 'your region'} prospects and wanted to share a quick idea on verified lead generation. I help teams like yours turn qualified connections into actual meetings with no extra tools needed.\n\nWould you be open to a short 10-minute call this week?\n\nBest,\nYour Name`)}>
                      Quick Draft
                    </button>
                    <button className="btn btn-outline" style={{marginRight:'12px'}} onClick={() => setShowTemplateModal(true)}>
                      Use Template
                    </button>
                    <button className="btn btn-outline" onClick={handleAddFollowUp}>Add Follow-up</button>
                  </div>
                  <button className="btn btn-primary" onClick={handleSendEmail}>Send Email →</button>
                </div>
              </div>
            </div>
            <div className="compose-sidebar">
              <div className="sidebar-card">
                <div className="sidebar-title">Lead Details</div>
                <div style={{fontWeight:600, color:'var(--tx)'}}>{composeLead?.title || 'Select a lead'}</div>
                <div style={{fontSize:'12px', color:'var(--tx2)', margin:'4px 0'}}>{composeLead ? `${composeLead.location}` : 'Lead location will appear here'}</div>
                <div style={{fontSize:'12px', color:'var(--tx2)'}}>{composeLead?.email || 'No email selected'}</div>
                <a href={composeLead?.site ? `https://${composeLead.site}` : '#'} target="_blank" rel="noreferrer" style={{fontSize:'12px', color:'var(--accent)', textDecoration:'none', marginTop:'4px', display:'inline-block'}}>{composeLead?.site || 'Website'}</a>
              </div>
              <div className="sidebar-card">
                <div className="sidebar-title">Personalization Tips</div>
                <ul style={{fontSize:'13px', color:'var(--tx2)', paddingLeft:'20px', display:'flex', flexDirection:'column', gap:'8px'}}>
                  <li>Mention their industry or niche specifically</li>
                  <li>Keep subject line under 9 words</li>
                  <li>End with one clear question</li>
                  <li>Follow up in 3-5 days if no reply</li>
                </ul>
              </div>
              <div className="sidebar-card">
                <div className="sidebar-title">Schedule Send</div>
                <select className="sidebar-select" value={sendMode} onChange={(e) => setSendMode(e.target.value)}>
                  <option value="now">Send Immediately</option>
                  <option value="later">Schedule for later</option>
                </select>
                {sendMode === 'later' && (
                  <input type="datetime-local" className="form-input" style={{marginTop:'12px'}} value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                )}
              </div>
            </div>
          </div>
          {showTemplateModal && (
            <div className="modal-backdrop">
              <div className="modal-card" style={{maxWidth: '800px'}}>
                <div className="modal-header">
                  <span className="modal-label">SELECT TEMPLATE</span>
                  <button className="modal-close" onClick={() => setShowTemplateModal(false)}>×</button>
                </div>
                <div className="modal-title">Choose an Email Template</div>
                <div className="modal-copy">Select a template to quickly draft your outreach email.</div>
                <div className="templates-grid" style={{marginTop: '20px'}}>
                  {templates.map((template, index) => (
                    <div key={`${template.title}-${index}`} className="template-card" onClick={() => handleSelectTemplate(template)} style={{cursor: 'pointer'}}>
                      <div className="category">{template.category}</div>
                      <div className="title">{template.title}</div>
                      <div className="description">{template.description}</div>
                      <div className="stats">{template.stats}</div>
                      <div className="actions"><button className="btn btn-primary">Use This</button></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- 5. TEMPLATES --- */}
        <div className={`page ${activePage === 'templates' ? 'active' : ''}`}>
          <div className="topbar shrink-0"> {/* Added shrink-0 */}
            <div className="page-title">Email Templates</div>
            <button className="btn btn-primary" onClick={() => setShowNewTemplateModal(true)}>+ New Template</button>
            <HeaderProfile />
          </div>
          <div className="body flex-1 overflow-y-auto custom-scrollbar"> {/* Added flex-1 overflow-y-auto custom-scrollbar */}
            <div className="templates-grid">
              {templates.map((template) => (
                <div key={`${template.title}-${template.category}`} className="template-card">
                  <div className="category">{template.category}</div>
                  <div className="title">{template.title}</div>
                  <div className="description">{template.description}</div>
                  <div className="stats">{template.stats}</div>
                  <div className="actions">
                    <button className="btn btn-outline" onClick={() => handleSelectTemplate(template)}>Use Template</button>
                  </div>
                </div>
              ))}
              <div className="new-template-card">
                <div style={{fontSize:'24px', marginBottom:'12px'}}>+</div>
                <div className="title" style={{marginBottom:'4px'}}>Create Custom Template</div>
                <div className="description" style={{flex:'none'}}>Write your own and track its performance</div>
                <button className="btn btn-outline" style={{marginTop:'16px'}} onClick={() => setShowNewTemplateModal(true)}>New Template</button>
              </div>
            </div>
          </div>
          {showNewTemplateModal && (
            <div className="modal-backdrop">
              <div className="modal-card" style={{maxWidth: '700px'}}>
                <div className="modal-header">
                  <span className="modal-label">NEW TEMPLATE</span>
                  <button className="modal-close" onClick={() => setShowNewTemplateModal(false)}>×</button>
                </div>
                <div className="modal-title">Create a new email template</div>
                <div className="modal-copy">Add a custom template name, category, and description for future outreach.</div>
                <div style={{display:'grid', gap:'14px', marginTop:'20px'}}>
                  <div>
                    <label style={{fontSize:'12px', fontWeight:600, color:'var(--tx2)'}}>Category</label>
                    <input className="field-input" value={newTemplateCategory} onChange={(e) => setNewTemplateCategory(e.target.value)} placeholder="e.g. FOLLOW-UP, INTRODUCTION" />
                  </div>
                  <div>
                    <label style={{fontSize:'12px', fontWeight:600, color:'var(--tx2)'}}>Template Name</label>
                    <input className="field-input" value={newTemplateTitle} onChange={(e) => setNewTemplateTitle(e.target.value)} placeholder="Example: 2nd Touch Email" />
                  </div>
                  <div>
                    <label style={{fontSize:'12px', fontWeight:600, color:'var(--tx2)'}}>Description</label>
                    <textarea className="field-input" style={{minHeight:'120px', resize:'vertical'}} value={newTemplateDescription} onChange={(e) => setNewTemplateDescription(e.target.value)} placeholder="Write the email template summary or body here." />
                  </div>
                  <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'10px'}}>
                    <button className="btn btn-outline" onClick={() => setShowNewTemplateModal(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleCreateTemplate}>Create Template</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- 6. EXPORTS --- */}
        <div className={`page ${activePage === 'exports' ? 'active' : ''}`}>
          <div className="topbar shrink-0"> {/* Added shrink-0 */}
            <div className="page-title">Export / CSV</div>
            <span style={{fontSize:'13px', color:'var(--tx2)'}}>47 leads available to export</span>
            <HeaderProfile />
          </div>
          <div className="body flex-1 overflow-y-auto custom-scrollbar"> {/* Added flex-1 overflow-y-auto custom-scrollbar */}
            <div className="export-section">
              <div className="title">Export Your Leads</div>
              <div className="subtitle">Choose which leads to export and what fields to include. Downloads as a .CSV file.</div>
              <div className="export-options">
                <div className="export-column">
                  <label style={{fontSize:'13px', fontWeight:500}}>WHICH LEADS</label>
                  <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    <label style={{display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer'}}>
                      <input type="radio" name="export-which" checked={exportLeadScope === 'all'} onChange={() => setExportLeadScope('all')} /> All leads
                    </label>
                    <label style={{display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer'}}>
                      <input type="radio" name="export-which" checked={exportLeadScope === 'recent'} onChange={() => setExportLeadScope('recent')} /> Recently found
                    </label>
                    <label style={{display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer'}}>
                      <input type="radio" name="export-which" checked={exportLeadScope === 'pipeline'} onChange={() => setExportLeadScope('pipeline')} /> In pipeline
                    </label>
                  </div>
                </div>
                <div className="export-column">
                  <label style={{fontSize:'13px', fontWeight:500}}>INCLUDE FIELDS</label>
                  <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    <label style={{display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer'}}>
                      <input type="checkbox" checked={exportIncludeEmail} onChange={() => setExportIncludeEmail(!exportIncludeEmail)} /> Email
                    </label>
                    <label style={{display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer'}}>
                      <input type="checkbox" checked={exportIncludePhone} onChange={() => setExportIncludePhone(!exportIncludePhone)} /> Phone
                    </label>
                    <label style={{display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer'}}>
                      <input type="checkbox" checked={exportIncludeWebsite} onChange={() => setExportIncludeWebsite(!exportIncludeWebsite)} /> Website
                    </label>
                    <label style={{display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer'}}>
                      <input type="checkbox" checked={exportIncludeScore} onChange={() => setExportIncludeScore(!exportIncludeScore)} /> Lead Score
                    </label>
                  </div>
                </div>
              </div>
              <button className="btn btn-primary" style={{marginTop:'24px'}} onClick={handleDownloadCSV}>Download CSV →</button>
            </div>
            <div className="export-section" style={{background:'transparent', border:'none', padding:0}}>
              <div className="title">Export History</div>
              <div>
                {exportHistory.length > 0 ? (
                  exportHistory.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="export-history-item">
                      <div>
                        <div style={{fontWeight: 600, color: 'var(--tx)'}}>{item.name}</div>
                        <div style={{fontSize: '12px', color: 'var(--tx2)', marginTop: '4px'}}>{item.date}</div>
                      </div>
                      <div style={{fontSize: '12px', color: 'var(--tx2)'}}>{item.count}</div>
                      <button className="btn btn-outline" onClick={handleDownloadCSV}>Re-download</button>
                    </div>
                  ))
                ) : (
                  <div className="empty-state" style={{padding:'40px 0', background:'transparent', border:'none'}}>
                    <div className="empty-icon">📭</div>
                    <div className="empty-title">No exports added yet</div>
                    <div className="empty-desc">Run a search or export leads to see your activity here.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- 7. PRICING/PLAN --- */}
        <div className={`page ${activePage === 'plan' ? 'active' : ''}`}>
          <div className="topbar shrink-0"><div className="page-title">Pricing</div><HeaderProfile /></div> {/* Added shrink-0 */}
          <div className="body flex-1 overflow-y-auto custom-scrollbar"> {/* Added flex-1 overflow-y-auto custom-scrollbar */}
            <div className="pricing-wrap">
              <div className="pricing-head">
                <div className="pricing-eyebrow">Simple pricing</div>
                <h1 className="pricing-headline">Find leads. Close clients.</h1>
                  <p style={{fontSize:'14px', color:'var(--tx3)', marginTop:'16px'}}>No hidden fees. Cancel anytime. Start free today. Current plan: <span style={{color:'var(--accent)', fontWeight:600}}>{currentPlan}</span></p>
                <div style={{fontSize:'13px', color:'var(--tx2)', marginTop:'6px'}}>{currentPlanPeriodRange}</div>
                <div style={{fontSize:'13px', color:'var(--tx2)', marginTop:'6px'}}>Plan upgrades are managed by your admin. Request changes from your account administrator.</div>
              </div>

              <div className="pricing-toggle-wrap">
                <span style={{fontSize:'14px', fontWeight:!isAnnual ? 700 : 400, color:!isAnnual ? 'var(--tx)' : 'var(--tx3)'}}>Monthly</span>
                <div className={`pill-toggle ${isAnnual ? 'an' : ''}`} onClick={() => setIsAnnual(!isAnnual)}>
                  <div className="pill-toggle-thumb"></div>
                </div>
                <span style={{fontSize:'14px', fontWeight:isAnnual ? 700 : 400, color:isAnnual ? 'var(--tx)' : 'var(--tx3)'}}>Annual</span>
                {isAnnual && <span className="save-badge">Save 25%</span>}
              </div>

              <div className="pricing-cards">
                {PRICING_PLANS.map((plan) => {
                  const planAmount = plan.price === '0' ? '0' : isAnnual ? (parseFloat(plan.price) * 9).toFixed(2) : plan.price;
                  return (
                    <div key={plan.name} className={`pricing-card ${plan.highlight ? 'featured' : ''}`}>
                      {plan.highlight && <div className="featured-badge">Most Popular</div>}
                      {plan.name === currentPlan && <div className="sidebar-badge">Current plan</div>}
                      <div className="text-xs">{plan.badge}</div>
                      <div style={{marginTop: '12px', marginBottom: '4px'}}>
                        <span className="price-num">${planAmount}</span>
                        <span style={{fontSize: '14px', color: 'var(--tx2)', marginLeft: '4px'}}>/ {isAnnual ? 'year' : plan.period}</span>
                      </div>
                    {plan.description && <p style={{fontSize: '13px', color: 'var(--tx2)', marginBottom: '20px'}}>{plan.description}</p>}
                    <ul style={{marginBottom: '24px', flex: 1}}>
                      {plan.features.map((feature, fIndex) => (
                        <li key={fIndex} className={feature.included ? '' : 'off'}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            {feature.included ? (
                              <polyline points="13.5 2 6 9.5 2.5 6" />
                            ) : (
                              <line x1="2" y1="8" x2="14" y2="8" />
                            )}
                          </svg>
                          {feature.text}
                        </li>
                      ))}
                    </ul>
                      {plan.name === currentPlan ? (
                        <button className="btn btn-outline" style={{width: '100%'}} disabled>Selected Plan</button>
                      ) : (
                        <button
                          className="btn btn-primary"
                          style={{width: '100%'}}
                          onClick={() => router.push(`/pricing/payment_process?plan=${encodeURIComponent(plan.name)}&period=${isAnnual ? 'year' : 'month'}`)}
                        >
                          Start Building
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* --- 8. SUPPORT --- */}
        <div className={`page ${activePage === 'support' ? 'active' : ''}`}>
          <div className="topbar shrink-0"><div className="page-title">Support</div><HeaderProfile /></div>
          <div className="body flex-1" style={{display: 'flex', flexDirection: 'column', padding: '24px', overflow: 'hidden'}}>
            <div className="card h-full" style={{flex: 1, display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden', marginBottom: '0', minHeight: 0}}>
              <div style={{padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0}}>
                <div>
                  <div style={{fontWeight: 700, fontSize: '15px', color: 'var(--tx)'}}>ARFA Live Support</div>
                  <div style={{fontSize: '11px', color: chatStatus === 'admin' ? 'var(--green)' : 'var(--tx3)'}}>
                    ● {chatStatus === 'ai' ? 'AI Assistant' : chatStatus === 'admin_pending' ? 'Waiting for Admin...' : 'Admin Online'}
                  </div>
                </div>
              </div>

              <div className="chat-log custom-scrollbar flex-1" style={{padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0, background: 'rgba(15, 23, 42, 0.4)'}}>
                {chatMessages.length === 0 && (
                  <div className="empty-state" style={{padding: '40px 0'}}>
                    <div style={{fontSize: '32px'}}>💬</div>
                    <div className="empty-title" style={{fontSize: '18px'}}>How can we help today?</div>
                    <div className="empty-desc">Describe your issue or ask a question about lead generation.</div>
                  </div>
                )}
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`chat-message ${msg.sender === 'user' ? 'user' : msg.sender === 'admin' ? 'admin' : 'ai'}`}>
                    <div className="chat-label">{msg.sender}</div>
                    {msg.type === 'image' && msg.fileUrl && (
                      <div className="mb-2">
                        <img src={msg.fileUrl} alt="attachment" className="max-w-full rounded-lg" />
                      </div>
                    )}
                    {msg.type === 'file' && msg.fileUrl && (
                      <div className="mb-2 p-2 bg-black/20 rounded flex items-center gap-2 border border-white/10">
                        <span className="text-lg">📁</span>
                        <a href={msg.fileUrl} download={msg.fileName} className="text-white hover:underline text-xs truncate max-w-[150px]">
                          {msg.fileName || 'Download File'}
                        </a>
                      </div>
                    )}
                    <div>{msg.text}</div>
                    {msg.sender === 'ai' && msg.text.includes("Talk to Human") && chatStatus === 'ai' && (
                      <button type="button" className="btn btn-primary" style={{marginTop: '10px', width: '100%', fontSize: '12px', padding: '6px'}}
                        onClick={handleRequestAdmin}>Talk to Human</button>
                    )}
                    <div className="chat-meta">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                ))}
                {isAdminTyping && (
                  <div className="chat-message admin">
                    <div className="chat-label">{chatStatus === 'ai' ? 'AI' : 'Support'}</div>
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="support-footer">
                <label style={{cursor: 'pointer', opacity: 0.7}}>
                   <input type="file" hidden onChange={(e) => {
                     const file = e.target.files?.[0];
                     if (file) {
                       const reader = new FileReader();
                       reader.onload = () => {
                         const base64 = reader.result as string;
                         const isImage = file.type.startsWith('image/');
                         handleSendChatMessage(isImage ? "Sent an image" : `Sent a file: ${file.name}`, isImage ? 'image' : 'file', base64, file.name);
                       };
                       reader.readAsDataURL(file);
                     }
                   }} />
                   <span style={{fontSize: '20px'}}>🖼️</span>
                </label>
                <textarea className="field-input" placeholder="Type your message..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChatMessage(chatInput); } }} style={{resize: 'none', minHeight: '44px', flex: 1}} rows={1} />
                <button type="button" className="btn btn-primary" onClick={() => handleSendChatMessage(chatInput)} style={{height: '44px'}}>Send</button>
              </div>
            </div>
          </div>
        </div>

        {/* --- 9. SETTINGS --- */}
        <div className={`page ${activePage === 'settings' ? 'active' : ''}`}>
          <div className="topbar shrink-0"><div className="page-title">Settings</div><HeaderProfile /></div>
          <div className="settings-layout flex-1 overflow-hidden"> {/* Added flex-1 overflow-hidden */}
            <div className="settings-nav">
              <div className={`nav-item ${settingsTab === 'profile' ? 'active' : ''}`} onClick={() => setSettingsTab('profile')} style={{marginBottom: '8px'}}>
                👤 Profile
              </div>
              <div className={`nav-item ${settingsTab === 'account' ? 'active' : ''}`} onClick={() => setSettingsTab('account')} style={{marginBottom: '8px'}}>
                🔐 Account
              </div>
              <div className={`nav-item ${settingsTab === 'billing' ? 'active' : ''}`} onClick={() => setSettingsTab('billing')} style={{marginBottom: '8px'}}>
                💳 Billing
              </div>
            </div>
            
            <div className="settings-content flex-1 overflow-y-auto custom-scrollbar"> {/* Added flex-1 overflow-y-auto custom-scrollbar */}
              {/* Profile Settings */}
              {settingsTab === 'profile' && (
                <>
                  {settingsMessage && (
                    <div className="settings-card" style={{borderColor: 'var(--accent)', background: 'rgba(108,99,255,0.06)'}}>
                      <div style={{fontSize:'14px', color:'var(--tx)', fontWeight:600}}>{settingsMessage}</div>
                    </div>
                  )}
                  <div className="settings-card">
                    <h3 style={{fontSize: '18px', fontWeight: 600, marginBottom: '20px'}}>Profile Information</h3>
                    <div className="profile-photo">
                      <div className="avatar">
                        {profileImagePreview ? (
                          <img src={profileImagePreview} alt="Profile preview" />
                        ) : (
                          <span>{(profileName || 'User').split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2)}</span>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/gif"
                          onChange={handleAvatarChange}
                          style={{ display: 'block', marginBottom: '10px' }}
                        />
                        <div style={{fontSize: '12px', color: 'var(--tx3)', marginTop: '8px'}}>JPG, PNG or GIF (max 4MB)</div>
                      </div>
                    </div>
                  </div>

                  <div className="settings-card">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-input" value={profileName} onChange={(e) => setProfileName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input type="email" className="form-input" value={profileEmail} readOnly />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company</label>
                      <input type="text" className="form-input" value={profileCompany} onChange={(e) => setProfileCompany(e.target.value)} required />
                    </div>
                    <button className="btn btn-primary" onClick={handleSaveProfile}>Save Changes</button>
                  </div>
                </>
              )}

              {/* Account Settings */}
              {settingsTab === 'account' && (
                <>
                  <div className="settings-card">
                    <h3 style={{fontSize: '18px', fontWeight: 600, marginBottom: '20px'}}>Password</h3>
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <input type="password" className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <input type="password" className="form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                    <button className="btn btn-primary" onClick={handleUpdatePassword}>Update Password</button>
                  </div>

                  <div className="settings-card">
                    <h3 style={{fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: 'var(--red)'}}>Delete Account</h3>
                    <p style={{fontSize: '14px', color: 'var(--tx2)', marginBottom: '16px'}}>Once you delete your account, there is no going back. Please be certain.</p>
                    <button className="btn btn-outline" style={{borderColor: 'var(--red)', color: 'var(--red)'}}>Delete My Account</button>
                  </div>
                </>
              )}

              {/* Billing Settings */}
              {settingsTab === 'billing' && (
                <>
                  <div className="settings-card">
                    <h3 style={{fontSize: '18px', fontWeight: 600, marginBottom: '20px'}}>Current Plan</h3>
                    <div style={{padding: '16px', background: 'var(--accent-glow)', border: '1px solid var(--accent)', borderRadius: '12px', marginBottom: '20px'}}>
                      <div style={{fontWeight: 600, color: 'var(--accent)', marginBottom: '8px'}}>{currentPlanDetails.name} Plan</div>
                      <div style={{fontSize: '14px', color: 'var(--tx2)', marginBottom: '8px'}}>{currentBillingLabel}</div>
                      <div style={{fontSize: '13px', color: 'var(--tx2)', marginBottom: '12px'}}>Plan period: {currentPlanStartLabel} — {currentPlanExpiryLabel}</div>
                      <button className="btn btn-primary" onClick={() => setActivePage('plan')}>Change plan</button>
                    </div>
                  </div>

                  <div className="settings-card">
                    <h3 style={{fontSize: '18px', fontWeight: 600, marginBottom: '20px'}}>Payment Method</h3>
                    <div style={{padding: '16px', background: 'var(--surface-light)', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                      <div style={{fontSize: '12px', color: 'var(--tx2)'}}>Payment processing is currently disabled.</div>
                    </div>
                  </div>

                  <div className="settings-card">
                    <h3 style={{fontSize: '18px', fontWeight: 600, marginBottom: '20px'}}>Billing History</h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                      {/* Removed billingHistory display */}
                      {/* {billingHistory.length > 0 ? (...) : ( */}
                      {/* Simplified to always show disabled message */}
                        <div className="empty-state" style={{padding:'32px 20px', background:'transparent', border:'none'}}>
                          <div className="empty-icon">📄</div>
                          <div className="empty-title">No billing records yet</div>
                          <div className="empty-desc">Your billing history will appear here once you complete a purchase.</div>
                        </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Alert Modal */}
      {modalAlert.show && (
        <div className="alert-backdrop" onClick={() => setModalAlert(prev => ({ ...prev, show: false }))}>
          <div className={`alert-card alert-${modalAlert.type}`} onClick={(e) => e.stopPropagation()}>
            <div className="alert-header">
              <div className="alert-title">{modalAlert.title}</div>
              <button className="alert-close" onClick={() => setModalAlert(prev => ({ ...prev, show: false }))}>×</button>
            </div>
            <div className="alert-message">{modalAlert.msg}</div>
          </div>
        </div>
      )}

      {/* Limit Modal - Shown when user runs out of lead credits */}
      {showLimitModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '440px', textAlign: 'center' }}>
            <div className="modal-header">
              <span className="modal-label">Lead Limit Reached</span>
              <button className="modal-close" onClick={() => setShowLimitModal(false)}>×</button>
            </div>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
            <div className="modal-title">Time to Upgrade!</div>
            <div className="modal-copy">
              {limitMessage || "You've used up your available lead credits. Upgrade your plan now to continue searching and unlocking high-quality verified leads."}
            </div>
            <div className="modal-actions" style={{ flexDirection: 'column', gap: '12px', width: '100%' }}>
              <button 
                className="modal-btn primary" 
                style={{ width: '100%' }} 
                onClick={() => { setShowLimitModal(false); setActivePage('plan'); }}
              >
                View Pricing & Upgrade
              </button>
              <button className="modal-btn outline" style={{ width: '100%' }} onClick={() => setShowLimitModal(false)}>Maybe Later</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}