﻿﻿﻿﻿﻿﻿﻿'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link
import styles from './admin-dashboard.module.css'; // Correctly import as a CSS Module
interface User {
  name: string;
  username: string;
  password: string;
  profileImage?: string;
  createdAt: string;
  role: 'admin' | 'user';
  plan: string;
}

interface OverviewMetrics {
  trialsStarted: number;
  searchesCompleted: number;
  leadsGenerated: number;
  csvDownloads: number;
  emailExports: number;
  emailsCaptured: number;
  plansViewed: number;
  upgradeClicks: number;
  checkoutStarted: number;
  paidUsers: number;
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

interface ActivityRow {
  lastActivity: string;
  visitor: string;
  email: string;
  sessionId: string;
  userId: string;
  firstSeen: string;
  searches: number;
  leads: number;
  csv: number;
  emailExports: number;
  plans: number;
  upgrades: number;
}

const PLANS = ['Free', 'Starter', 'Outbound', 'Growth'];

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationStatus, setNotificationStatus] = useState(''); // Added missing state
  const [sendingNotification, setSendingNotification] = useState(false); // Already present
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'notifications' | 'billing' | 'chat'>('overview');
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [activeWindow, setActiveWindow] = useState('7 days');
  const [activeTab, setActiveTab] = useState('Users & Sessions');
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [adminReply, setAdminReply] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Multi-user chat system
  const [activeChats, setActiveChats] = useState<Array<{
    id: string;
    name: string;
    status: 'Idle' | 'Active' | 'Waiting' | 'Connected';
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount: number;
  }>>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [currentChatMessages, setCurrentChatMessages] = useState<ChatMessage[]>([]);
  const [currentChatStatus, setCurrentChatStatus] = useState<'ai' | 'admin_pending' | 'admin'>('ai');

  // Load all user chats
  const buildChatMeta = (userId: string, messages: ChatMessage[], status: 'ai' | 'admin_pending' | 'admin') => {
    const lastMsg = messages[messages.length - 1];
    const statusLabel = status === 'admin'
      ? 'Connected'
      : status === 'admin_pending'
      ? 'Waiting'
      : messages.some((m: ChatMessage) => m.sender === 'user')
      ? 'Active'
      : 'Idle';

    return {
      id: userId,
      name: userId.startsWith('arfa_support_chat_') ? userId.replace('arfa_support_chat_', '').replace(/_/g, '.') : `User ${userId}`,
      status: statusLabel as 'Idle' | 'Active' | 'Waiting' | 'Connected',
      lastMessage: lastMsg?.text,
      lastMessageTime: lastMsg?.timestamp,
      unreadCount: messages.filter((m: ChatMessage) => m.sender === 'user').length
    };
  };

  const updateActiveChatMetadata = (userId: string, messages: ChatMessage[], status: 'ai' | 'admin_pending' | 'admin') => {
    setActiveChats((prev) => {
      const meta = buildChatMeta(userId, messages, status);
      const found = prev.some((chat) => chat.id === userId);
      if (found) {
        return prev.map((chat) => (chat.id === userId ? meta : chat));
      }
      return [meta, ...prev.filter((chat) => chat.id !== 'default')];
    });
  };

  const buildChatIssueSummary = (messages: ChatMessage[]) => {
    const userProblems = messages
      .filter((msg) => msg.sender === 'user')
      .slice(-4)
      .map((msg) => msg.text.trim())
      .filter(Boolean);

    if (userProblems.length === 0) {
      return ['Waiting for the user to describe their issue.'];
    }

    return userProblems.map((text, index) => `${index + 1}. ${text}`);
  };

  const loadAllUserChats = async () => {
    try {
      const res = await fetch('/api/support/chat?list=true');
      if (res.ok) {
        const data = await res.json();
        const chats = data.chats.map((c: any) => buildChatMeta(c.userId, c.messages, c.status));
        setActiveChats(chats.length > 0 ? chats : [{ id: 'default', name: 'No Active Chats', status: 'Idle', unreadCount: 0 }]);
        return chats;
      }
    } catch (e) { console.error(e); }
    return [];
  };

  const loadUserChat = async (userId: string) => {
    try {
      const res = await fetch(`/api/support/chat?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentChatMessages(Array.isArray(data.messages) ? data.messages : []);
        setCurrentChatStatus(data.status || 'ai');
      }
    } catch (e) { console.error(e); }
    setSelectedChatId(userId);
  };

  const saveCurrentChat = async (messages: ChatMessage[], status: 'ai' | 'admin_pending' | 'admin') => {
    if (selectedChatId) {
      try {
        await fetch(`/api/support/chat?userId=${selectedChatId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: selectedChatId, messages, status })
        });
        updateActiveChatMetadata(selectedChatId, messages, status);
      } catch (e) { console.error(e); }
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch (error) {
      console.warn('Logout failed', error);
    } finally {
      setLogoutLoading(false);
      router.push('/authentication');
    }
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        if (!res.ok) {
          router.push('/authentication');
          return;
        }

        const data = await res.json();
        const user = data?.user;
        if (!user) {
          router.push('/authentication');
          return;
        }

        setCurrentUser(user);
        if (user.role !== 'admin') {
          router.push('/dashboard');
          return;
        }

        const usersRes = await fetch('/api/admin/users', { credentials: 'same-origin' });
        if (usersRes.ok) {
          setUsers(await usersRes.json());
        }

        // Load all user chats
        const chats = await loadAllUserChats(); // Await the promise
        if (chats.length > 0 && !selectedChatId && chats[0].id !== 'default') { // Ensure not to load default chat
          await loadUserChat(chats[0].id); // Await this call to ensure chat is loaded before proceeding
        }

        // Fetch overview data
        const overviewRes = await fetch('/api/admin/overview', { credentials: 'same-origin' });
        if (overviewRes.status === 401 || overviewRes.status === 403) {
          setNotificationStatus('Not authorized to view overview data.'); // Use existing notification for now
          // Or set a dedicated state for overview authorization
          return;
        }
        if (!overviewRes.ok) {
          throw new Error('Failed to load overview data.');
        }
        const overviewData = await overviewRes.json();
        setOverview(overviewData.overview);
        setRows(overviewData.rows);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        router.push('/authentication');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [router]);

  useEffect(() => {
    if (!selectedUsername && users.length > 0) {
      const firstUser = users.find((user) => user.role === 'user') || users[0];
      setSelectedUsername(firstUser?.username || '');
    }
  }, [users, selectedUsername]);

  const planCounts = useMemo(
    () =>
      users.reduce(
        (acc, user) => {
          acc.total += 1;
          if (Object.prototype.hasOwnProperty.call(acc.plans, user.plan)) {
            acc.plans[user.plan as keyof typeof acc.plans] += 1;
          }
          return acc;
        },
        {
          total: 0,
          plans: {
            Free: 0,
            Starter: 0,
            Outbound: 0,
            Growth: 0,
          },
        },
      ),
    [users],
  );

  const userActivityMap = useMemo(() => {
    const map: Record<string, ActivityRow> = {};
    rows.forEach(row => {
      if (row.userId) map[row.userId] = row;
      if (row.email) map[row.email] = row;
    });
    return map;
  }, [rows]);

  const isWithinWindow = (dateInput: string) => {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return true;
    const now = new Date();
    const diffInDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);

    if (activeWindow === 'Today') return diffInDays <= 1;
    if (activeWindow === '7 days') return diffInDays <= 7;
    if (activeWindow === '30 days') return diffInDays <= 30;
    return true;
  };

  const activeOverview = useMemo<OverviewMetrics>(() => {
    const filteredUsers = users.filter(u => isWithinWindow(u.createdAt));
    const filteredRows = rows.filter(r => isWithinWindow(r.lastActivity));

    return {
      trialsStarted: filteredUsers.filter(u => u.plan === 'Free').length,
      searchesCompleted: filteredRows.reduce((sum, r) => sum + (r.searches || 0), 0),
      leadsGenerated: filteredRows.reduce((sum, r) => sum + (r.leads || 0), 0),
      csvDownloads: filteredRows.reduce((sum, r) => sum + (r.csv || 0), 0),
      emailExports: filteredRows.reduce((sum, r) => sum + (r.emailExports || 0), 0),
      emailsCaptured: filteredRows.reduce((sum, r) => sum + (r.leads || 0), 0),
      plansViewed: filteredRows.length,
      upgradeClicks: filteredRows.reduce((sum, r) => sum + (r.upgrades || 0), 0),
      checkoutStarted: filteredRows.filter(r => r.upgrades > 0).length,
      paidUsers: filteredUsers.filter(u => u.plan !== 'Free').length,
    };
  }, [rows, users, activeWindow]);

  const filteredTableRows = useMemo(() => {
    let r = rows.filter(row => isWithinWindow(row.lastActivity));

    switch (activeTab) {
      case 'Warm / Hot Leads':
        return r.filter(row => row.leads > 0);
      case 'Search Behavior':
        return r.filter(row => row.searches > 0);
      case 'Repeat Usage':
        return r.filter(row => row.searches > 5);
      case 'Activity Feed':
        return r;
      default: // Users & Sessions
        return r;
    }
  }, [rows, activeTab, activeWindow]);

  useEffect(() => {
    // Periodically poll for new chat messages and list updates
    const interval = setInterval(async () => {
      if (activeSection === 'chat') {
        await loadAllUserChats();
        if (selectedChatId) {
          const res = await fetch(`/api/support/chat?userId=${selectedChatId}`);
          if (res.ok) {
            const data = await res.json();
            setCurrentChatMessages(data.messages || []);
            setCurrentChatStatus(data.status || 'ai');
          }
        }
      }
    }, 4000); // Check every 4 seconds

    return () => clearInterval(interval);
  }, [activeSection, selectedChatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentChatMessages]);

  const sendAdminReply = () => {
    if (!adminReply.trim() || !selectedChatId) return;
    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'admin',
      text: adminReply,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    const updated = [...currentChatMessages, newMsg];
    setCurrentChatMessages(updated);
    setCurrentChatStatus('admin');
    setAdminReply("");
    saveCurrentChat(updated, 'admin');
  };

  const acceptChatRequest = () => {
    if (!selectedChatId) return;
    setCurrentChatStatus('admin');
    saveCurrentChat(currentChatMessages, 'admin');
  };

  const updateUserPlan = async (username: string, newPlan: string) => {
    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, plan: newPlan }),
        credentials: 'same-origin',
      });

      if (res.ok) {
        setUsers((current) =>
          current.map((user) =>
            user.username === username ? { ...user, plan: newPlan } : user,
          ),
        );
      } else {
        const error = await res.json();
        console.error('Failed to update plan:', error);
        setNotificationStatus('Failed to update plan.');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      setNotificationStatus('Unable to update plan.');
    }
  };

  const sendNotification = async () => {
    if (!selectedUsername || !notificationMessage.trim()) {
      setNotificationStatus('Please select a user and enter a message.');
      return;
    }

    setSendingNotification(true);
    setNotificationStatus('');

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username: selectedUsername, message: notificationMessage.trim() }),
      });

      if (res.ok) {
        setNotificationMessage('');
        setNotificationStatus('Notification sent successfully.');
      } else {
        let errorMessage = 'Failed to send notification.';
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          errorMessage = data?.error || data?.message || errorMessage;
        } else {
          errorMessage = `Server error: ${res.status} ${res.statusText}`;
        }
        setNotificationStatus(errorMessage);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setNotificationStatus('Unable to send notification right now.');
    } finally {
      setSendingNotification(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0A0F1E] text-white flex items-center justify-center">Loading...</div>;
  }

  if (!currentUser || currentUser.role !== 'admin') {
    // This case should ideally be caught by the initial fetchAdminData redirect
    // but as a fallback, it ensures non-admins don't see the page.
    // If the overview API specifically failed with 401/403, we might want a different message
    if (notificationStatus.includes('Not authorized to view overview data.')) {
      return (
        <div className="min-h-screen bg-[#0A0F1E] text-white flex items-center justify-center p-6">
          <div className="bg-[#0B1229] rounded-2xl p-6 max-w-md text-center border border-slate-700">
            <div className="text-xs uppercase tracking-[0.15em] text-slate-500 mb-1">Admin access required</div>
            <div className="text-2xl font-bold text-white tracking-tight">Please sign in</div>
            <div className="text-sm text-slate-400 mt-2">Log in with an admin account to view analytics.</div>
            <div className="mt-6">
              <Link href="/authentication?tab=login" className="inline-block px-4 py-2 rounded-full border border-slate-700 text-sky-400 text-sm hover:bg-slate-800 transition">Go to login</Link>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="h-screen bg-[#0A0F1E] text-white overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --surface-light: #0F172A;
          --border-hover: #2A5A8A;
        }
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
      ` }} />
      <div className="flex h-full">
        <aside className="hidden xl:flex w-72 flex-col border-r border-slate-800 bg-[#0B1229] p-6 shrink-0">
          <div className="mb-10">
            <div className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-4">Admin</div>
            <nav className="space-y-2">
              <button
                type="button"
                onClick={() => setActiveSection('overview')}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${activeSection === 'overview' ? 'text-white bg-slate-950/80' : 'text-slate-300 border border-slate-800 bg-[#0F172A] hover:bg-slate-900'}`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('users')}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${activeSection === 'users' ? 'text-white bg-slate-950/80' : 'text-slate-300 border border-slate-800 bg-[#0F172A] hover:bg-slate-900'}`}
              >
                Users
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('notifications')}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${activeSection === 'notifications' ? 'text-white bg-slate-950/80' : 'text-slate-300 border border-slate-800 bg-[#0F172A] hover:bg-slate-900'}`}
              >
                Notifications
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('chat')}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${activeSection === 'chat' ? 'text-white bg-slate-950/80' : 'text-slate-300 border border-slate-800 bg-[#0F172A] hover:bg-slate-900'}`}
              >
                Live Support
              </button>
            </nav>
          </div>
          <div className="rounded-3xl border border-slate-700 bg-[#111827] p-5">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-3">Quick actions</div>
            <div className="space-y-3 text-sm text-slate-300">
              <p>Review metrics and manage user sessions.</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="p-4 md:p-6 pb-0 shrink-0">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-xs text-slate-400 mt-1">Manage user plans, notifications, and monitor usage.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="rounded-3xl bg-[#111827] border border-slate-700 px-4 py-2 text-xs text-slate-300 shadow-sm">
                  Signed in as <span className="font-semibold text-white">{currentUser.username}</span>
                </div>
                <button
                  type="button"
                  disabled={logoutLoading}
                  onClick={handleLogout}
                  className="rounded-3xl bg-red-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-400 disabled:opacity-60"
                >
                  {logoutLoading ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>

          <div className={`flex-1 p-6 md:p-10 pt-4 custom-scrollbar ${activeSection === 'chat' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            <div className={`max-w-[1400px] mx-auto h-full flex flex-col ${activeSection !== 'chat' ? 'space-y-8' : ''}`}>
            {activeSection === 'overview' && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl bg-[#111827] border border-slate-700 p-6 shadow-sm">
                    <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Active Users</div>
                    <div className="mt-4 text-4xl font-semibold text-white">{planCounts.total}</div>
                    <div className="mt-2 text-slate-400">All registered users in the application.</div>
                  </div>
                  <div className="rounded-3xl bg-[#111827] border border-slate-700 p-6 shadow-sm">
                    <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Starter + Outbound</div>
                    <div className="mt-4 text-4xl font-semibold text-white">{planCounts.plans.Starter + planCounts.plans.Outbound}</div>
                    <div className="mt-2 text-slate-400">Users currently on premium growth plans.</div>
                  </div>
                  <div className="rounded-3xl bg-[#111827] border border-slate-700 p-6 shadow-sm">
                    <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Free plan users</div>
                    <div className="mt-4 text-4xl font-semibold text-white">{planCounts.plans.Free}</div>
                    <div className="mt-2 text-slate-400">Users who can be upgraded with one click.</div>
                  </div>
                </div>
                <div className="rounded-3xl bg-[#111827] border border-slate-700 p-6 shadow-sm">
                  <h2 className="text-2xl font-semibold text-white mb-3">Overview</h2>
                  <p className="text-sm text-slate-400">This overview highlights active users, plan distribution, and admin actions available from the sidebar.</p>
                </div>

              {/* NEW DASHBOARD OVERVIEW */}
              {overview && rows.length > 0 ? (
                  <div className={`${styles.dash} mt-8`}>

                    <div className={styles.adminLabel}>Admin</div>
                    <div className={styles.dashTitle}>Growth Dashboard</div>
                    <div className={styles.dashSub}>Product usage, conversion intent, and repeat free-trial behavior inside ALPA.</div>

                    <div className={styles.tabRow}>
                      {['Today', '7 days', '30 days'].map((window) => (
                        <button
                          key={`overview-tab-${window}`}
                          className={`${styles.tab} ${activeWindow === window ? styles.tabActive : ''}`}
                          onClick={() => setActiveWindow(window)}
                        >
                          {window}
                        </button>
                      ))}
                    </div>

                    <div className={styles.grid5}>
                      <div className={styles.mcard}>
                        <div className={styles.mlbl}>Trials Started</div>
                        <div className={styles.mval}>{activeOverview.trialsStarted}</div>
                      </div>
                      <div className={styles.mcard}>
                        <div className={styles.mlbl}>Searches Completed</div>
                        <div className={styles.mval}>{activeOverview.searchesCompleted}</div>
                      </div>
                      <div className={styles.mcard}>
                        <div className={styles.mlbl}>Leads Generated</div>
                        <div className={styles.mval}>{activeOverview.leadsGenerated}</div>
                      </div>
                      <div className={styles.mcard}>
                        <div className={styles.mlbl}>CSV Downloads</div>
                        <div className={styles.mval}>{activeOverview.csvDownloads}</div>
                      </div>
                      <div className={styles.mcard}>
                        <div className={styles.mlbl}>Email Exports</div>
                        <div className={styles.mval}>{activeOverview.emailExports}</div>
                      </div>
                    </div>

                    <div className={styles.grid5}>
                      <div className={styles.mcard}>
                        <div className={styles.mlbl}>Emails Captured</div>
                        <div className={styles.mval}>{activeOverview.emailsCaptured}</div>
                      </div>
                      <div className={styles.mcard}>
                        <div className={styles.mlbl}>Plans Viewed</div>
                        <div className={styles.mval}>{activeOverview.plansViewed}</div>
                      </div>
                      <div className={styles.mcard}>
                        <div className={styles.mlbl}>Upgrade Clicks</div>
                        <div className={styles.mval}>{activeOverview.upgradeClicks}</div>
                      </div>
                      <div className={styles.mcard}>
                        <div className={styles.mlbl}>Checkout Started</div>
                        <div className={styles.mval}>{activeOverview.checkoutStarted}</div>
                      </div>
                      <div className={styles.mcard}>
                        <div className={styles.mlbl}>Paid Users</div>
                        <div className={`${styles.mval} ${styles.dim}`}>{activeOverview.paidUsers}</div>
                      </div>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.navTabs}>
                      {['Users & Sessions', 'Warm / Hot Leads', 'Search Behavior', 'Activity Feed', 'Repeat Usage'].map((tab) => (
                        <button
                          key={`activity-tab-${tab}`}
                          className={`${styles.ntab} ${activeTab === tab ? styles.ntabActive : ''}`}
                          onClick={() => setActiveTab(tab)}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    <div className={styles.tblWrap}>
                      <table className={styles.dashboardTable}>
                        <thead>
                          <tr>
                            <th>Last Activity</th><th>Visitor</th>
                            <th className={styles.dashVal}>Email</th>
                            <th>Session ID</th>
                            <th className={styles.dashVal}>User ID</th>
                            <th>First Seen</th>
                            <th className={styles.num}>Searches</th>
                            <th className={styles.num}>Leads</th>
                            <th className={styles.num}>CSV</th>
                            <th className={styles.num}>Email Exports</th>
                            <th className={styles.num}>Plans</th>
                            <th className={styles.num}>Upgrades</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTableRows.map((row) => (
                            <tr key={row.sessionId}>
                              <td className={styles.date}>{row.lastActivity}</td>
                              <td className={styles.visitor}>{row.visitor}</td>
                              <td className={styles.dashVal}>{row.email}</td>
                              <td style={{ color: '#5a7a9a', fontSize: '10.5px' }}>{row.sessionId}</td>
                              <td className={styles.dashVal}>{row.userId}</td>
                              <td className={styles.date}>{row.firstSeen}</td>
                              <td className={styles.num}>{row.searches}</td>
                              <td className={styles.num}>{row.leads}</td>
                              <td className={styles.num}>{row.csv}</td>
                              <td className={styles.num}>{row.emailExports}</td>
                              <td className={styles.num}>{row.plans}</td>
                              <td className={styles.num}>{row.upgrades}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl bg-[#111827] border border-slate-700 p-6 shadow-sm mt-8"> {/* This fallback div should retain its Tailwind styles */}
                    <h2 className="text-2xl font-semibold text-white mb-3">Growth Dashboard Data</h2>
                    <p className="text-sm text-slate-400">Data is not available right now. Try refreshing or check your network connection.</p>
                  </div>
                )}
              </>
            )}

            {activeSection === 'users' && (
              <div className="rounded-3xl bg-[#111827] border border-slate-700 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold">User Management</h2>
                    <p className="text-sm text-slate-400">Update customer plans and review account details.</p>
                  </div>
                  <div className="rounded-full bg-slate-900 px-4 py-2 text-sm text-slate-300">{users.length} accounts</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-left text-slate-400">
                        <th className="py-3 pr-6">Name</th>
                        <th className="py-3 pr-6">Username</th>
                        <th className="py-3 pr-6">Role</th>
                        <th className="py-3 pr-6">Plan</th>
                        <th className="py-3 pr-6">Last Activity</th>
                        <th className="py-3 pr-6">Searches</th>
                        <th className="py-3 pr-6">Leads</th>
                        <th className="py-3 pl-6">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.username} className="border-b border-slate-800 hover:bg-slate-950/40">
                          <td className="py-4 pr-6 text-slate-200">{user.name}</td>
                          <td className="py-4 pr-6 text-slate-400">{user.username}</td>
                          <td className="py-4 pr-6 text-slate-400">{user.role}</td>
                          <td className="py-4 pr-6 text-slate-200">{user.plan}</td>
                          <td className="py-4 pr-6 text-slate-400">{userActivityMap[user.username]?.lastActivity || '—'}</td>
                          <td className="py-4 pr-6 text-slate-400">{userActivityMap[user.username]?.searches || 0}</td>
                          <td className="py-4 pr-6 text-slate-400">{userActivityMap[user.username]?.leads || 0}</td>
                          <td className="py-4 pl-6">
                            <select
                              value={user.plan}
                              onChange={(e) => updateUserPlan(user.username, e.target.value)}
                              className="w-full rounded-2xl border border-slate-700 bg-[#0F172A] px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                            >
                              {PLANS.map((plan) => (
                                <option key={plan} value={plan}>{plan}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="rounded-3xl bg-[#111827] border border-slate-700 p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-white mb-3">Notifications</h2>
                <p className="text-sm text-slate-400 mb-6">Send admin notifications to users and keep your team informed.</p>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Select recipient</label>
                    <select
                      value={selectedUsername}
                      onChange={(e) => setSelectedUsername(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-[#0F172A] px-3 py-3 text-sm text-white outline-none focus:border-sky-500"
                    >
                      {users
                        .filter((user) => user.role === 'user')
                        .map((user) => (
                          <option key={user.username} value={user.username}>
                            {user.name} — {user.username}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Message</label>
                    <textarea
                      rows={6}
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      placeholder="Enter a message for the user"
                      className="w-full resize-none rounded-3xl border border-slate-700 bg-[#0F172A] px-4 py-3 text-sm text-white outline-none focus:border-sky-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={sendNotification}
                    disabled={sendingNotification}
                    className="inline-flex items-center justify-center rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sendingNotification ? 'Sending...' : 'Send Notification'}
                  </button>

                  {notificationStatus ? (
                    <div className="rounded-2xl bg-slate-950/80 px-4 py-3 text-sm text-slate-200">{notificationStatus}</div>
                  ) : null}
                </div>
              </div>
            )}

            {activeSection === 'billing' && (
              <div className="rounded-3xl bg-[#111827] border border-slate-700 p-6 shadow-sm">
                <h2 className="text-2xl font-semibold text-white mb-3">Billing</h2>
                <p className="text-sm text-slate-400 mb-6">Review plan distribution and manage billing-related actions.</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl bg-[#0F172A] border border-slate-700 p-6">
                    <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Starter users</div>
                    <div className="mt-4 text-4xl font-semibold text-white">{planCounts.plans.Starter}</div>
                  </div>
                  <div className="rounded-3xl bg-[#0F172A] border border-slate-700 p-6">
                    <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Outbound users</div>
                    <div className="mt-4 text-4xl font-semibold text-white">{planCounts.plans.Outbound}</div>
                  </div>
                  <div className="rounded-3xl bg-[#0F172A] border border-slate-700 p-6">
                    <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Growth users</div>
                    <div className="mt-4 text-4xl font-semibold text-white">{planCounts.plans.Growth}</div>
                  </div>
                  <div className="rounded-3xl bg-[#0F172A] border border-slate-700 p-6">
                    <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Users to upgrade</div>
                    <div className="mt-4 text-4xl font-semibold text-white">{planCounts.plans.Free}</div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'chat' && (
              <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
                {/* Left: Chat List */}
                <div className="w-full lg:w-72 rounded-3xl bg-[#111827] border border-slate-700 p-4 flex flex-col h-full">
                  <h3 className="text-lg font-semibold mb-4 px-2 text-white">Active Chats</h3>
                  <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                    {activeChats.map(chat => (
                      <button
                        key={chat.id}
                        onClick={() => loadUserChat(chat.id)}
                        className={`w-full text-left p-4 rounded-2xl transition border relative ${selectedChatId === chat.id ? 'bg-sky-500/10 border-sky-500/50 text-sky-400' : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800 text-slate-400'}`}
                      >
                        <div className="font-semibold text-sm">{chat.name}</div>
                        {chat.lastMessage && (
                          <div className="text-xs mt-1 text-slate-500 truncate">{chat.lastMessage}</div>
                        )}
                        <div className="text-[10px] mt-1 flex items-center gap-1.5 uppercase tracking-wider">
                          <span className={`w-1.5 h-1.5 rounded-full ${chat.status === 'Active' || chat.status === 'Waiting' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : chat.status === 'Connected' ? 'bg-sky-500' : 'bg-slate-500'}`}></span>
                          {chat.status}
                        </div>
                        {chat.unreadCount > 0 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {chat.unreadCount}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Chat Box */}
                <div className="flex-1 rounded-3xl bg-[#111827] border border-slate-700 p-6 shadow-sm flex flex-col h-full" style={{minHeight: 0}}>
                  {currentChatStatus === 'admin_pending' && (
                    <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-amber-400 font-semibold text-sm">New Chat Request</div>
                          <div className="text-slate-400 text-xs mt-1">User is waiting for admin assistance</div>
                        </div>
                        <button
                          onClick={acceptChatRequest}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition-all active:scale-95"
                        >
                          Accept Chat
                        </button>
                      </div>
                    </div>
                  )}
                  <div className={`${styles.chatPanel} flex-1 mb-6 p-4 bg-[#0F172A] rounded-2xl border border-slate-800 flex flex-col gap-4 custom-scrollbar`}>
                    {!selectedChatId ? (
                      <div className="text-center text-slate-500 mt-20">Select a chat to start messaging.</div>
                    ) : currentChatMessages.length === 0 ? (
                      <div className="text-center text-slate-500 mt-20">No messages yet. Waiting for user to start conversation.</div>
                    ) : (
                      <>
                        <div className="mb-4 p-4 bg-slate-900 border border-slate-700 rounded-2xl">
                          <div className="text-sm font-semibold text-slate-200 mb-2">Issue summary</div>
                          <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                            {buildChatIssueSummary(currentChatMessages).map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        {currentChatMessages.map(msg => (
                          <div key={msg.id} className={`${styles.chatMessage} ${msg.sender === 'user' ? styles.chatUser : msg.sender === 'ai' ? styles.chatAi : styles.chatAdmin}`}>
                            <div className="text-[10px] uppercase font-bold opacity-60 mb-1">{msg.sender}</div>
                            {msg.type === 'image' && msg.fileUrl && (
                              <div className="mb-2">
                                <img src={msg.fileUrl} alt="attachment" className="max-w-full rounded-lg border border-slate-700" />
                              </div>
                            )}
                            {msg.type === 'file' && msg.fileUrl && (
                              <div className="mb-2 p-2 bg-slate-800 rounded flex items-center gap-2">
                                <span className="text-lg">📁</span>
                                <a href={msg.fileUrl} download={msg.fileName} className="text-sky-400 hover:underline text-xs truncate max-w-[150px]">
                                  {msg.fileName || 'Download File'}
                                </a>
                              </div>
                            )}
                            {msg.text}
                            <div className="text-[9px] mt-2 opacity-50 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={adminReply}
                      onChange={(e) => setAdminReply(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && currentChatStatus === 'admin' && sendAdminReply()}
                      placeholder={currentChatStatus === 'admin' ? "Type your reply..." : "Accept the chat request to start messaging"}
                      disabled={currentChatStatus !== 'admin'}
                      className="flex-1 bg-[#0F172A] border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:border-sky-500 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={sendAdminReply}
                      disabled={currentChatStatus !== 'admin' || !adminReply.trim()}
                      className="bg-sky-500 hover:bg-sky-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-950 font-bold px-6 py-3 rounded-2xl text-sm transition-all active:scale-95"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
