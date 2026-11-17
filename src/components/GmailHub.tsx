import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Trash2,
  ExternalLink,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  Car,
  Bed,
  CalendarCheck,
  PlusCircle,
  Inbox,
  UserCheck,
  Clock,
  Sparkles,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logout,
  getAccessToken,
  initAuth,
} from '../services/firebaseAuth';
import {
  listGmailMessages,
  getGmailMessage,
  sendGmailMessage,
  deleteGmailMessage,
  sendTransportEmailViaGmail,
  sendRentalEmailViaGmail,
  GmailMessageSummary,
  GmailMessageDetail,
} from '../services/gmailService';
import { operationsStore } from '../services/operationsStore';
import { TransportRequest, RentalRequest, ConsultationRequest } from '../types';
import { CONFIRMED_BUSINESS_CONFIG } from '../data/rentalData';

export const GmailHub: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Compose Modal State
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  // Mandatory Confirmation Modals
  // 1. Send Confirmation Modal
  const [pendingSend, setPendingSend] = useState<{ to: string; subject: string; body: string } | null>(null);
  const [isSending, setIsSending] = useState(false);

  // 2. Delete Confirmation Modal
  const [messageToDelete, setMessageToDelete] = useState<GmailMessageSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Operational requests for 1-click email preparation
  const [transportReqs, setTransportReqs] = useState<TransportRequest[]>(operationsStore.getTransportRequests());
  const [rentalReqs, setRentalReqs] = useState<RentalRequest[]>(operationsStore.getRentalRequests());

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch messages when access token is available
  useEffect(() => {
    if (accessToken) {
      loadMessages(accessToken);
    } else {
      setMessages([]);
      setSelectedMessage(null);
    }
  }, [accessToken]);

  // Operational store updates
  useEffect(() => {
    const unsub = operationsStore.subscribe(() => {
      setTransportReqs(operationsStore.getTransportRequests());
      setRentalReqs(operationsStore.getRentalRequests());
    });
    return () => unsub();
  }, []);

  const loadMessages = async (token: string, q?: string) => {
    setLoadingMessages(true);
    setErrorMsg(null);
    try {
      const result = await listGmailMessages(token, { query: q });
      setMessages(result.messages || []);
    } catch (err: any) {
      console.error('Error fetching Gmail messages:', err);
      setErrorMsg(err.message || 'Unable to load messages from Gmail.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        setStatusMsg('Successfully connected to Gmail.');
        setTimeout(() => setStatusMsg(null), 3500);
      }
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      setErrorMsg(err.message || 'Failed to sign in with Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setAccessToken(null);
      setMessages([]);
      setSelectedMessage(null);
      setStatusMsg('Disconnected from Gmail.');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch {
      setErrorMsg('Error signing out.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessToken) {
      loadMessages(accessToken, searchQuery);
    }
  };

  const handleSelectMessage = async (msgSummary: GmailMessageSummary) => {
    if (!accessToken) return;
    setLoadingDetail(true);
    setErrorMsg(null);
    try {
      const detail = await getGmailMessage(accessToken, msgSummary.id);
      setSelectedMessage(detail);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to open message body.');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Pre-fill composer from Transport request
  const handlePrepareTransportEmail = (req: TransportRequest) => {
    setComposeTo(req.email || '');
    setComposeSubject(`Tobago Healthcare — Medical Transport Update (${req.reference})`);
    setComposeBody(
      `<p>Dear <strong>${req.contactName}</strong>,</p>` +
      `<p>Regarding your medical transport enquiry (Reference: <strong>${req.reference}</strong>) for <strong>${req.requestedDate}</strong> (${req.origin} → ${req.destination}):</p>` +
      `<p>Our coordination team has assessed vehicle availability. We are pleased to provide you with the following dispatch details...</p>` +
      `<p>Best regards,<br/><strong>Tobago Healthcare Equipment & Supplies</strong><br/>Burnett Hill, Scarborough, Tobago<br/>WhatsApp: +1-868-495-9748</p>`
    );
    setIsComposeModalOpen(true);
  };

  // Pre-fill composer from Rental request
  const handlePrepareRentalEmail = (req: RentalRequest) => {
    setComposeTo(req.email || '');
    setComposeSubject(`Tobago Healthcare — Rental Quotation (${req.reference})`);
    setComposeBody(
      `<p>Dear <strong>${req.customerName}</strong>,</p>` +
      `<p>Thank you for enquiring about our medical equipment rentals (Reference: <strong>${req.reference}</strong>) for <strong>${req.equipmentCategory}</strong>.</p>` +
      `<p>Please find below the quotation for your requested rental duration of ${req.expectedDurationDays} days starting ${req.requestedStartDate}:</p>` +
      `<p>• Equipment: ${req.equipmentCategory} (Qty: ${req.quantityRequested})<br/>• Collection Point: Burnett Hill, Scarborough, Tobago (Next to Sports and Games)</p>` +
      `<p>Best regards,<br/><strong>Tobago Healthcare Equipment & Supplies</strong><br/>WhatsApp: +1-868-495-9748</p>`
    );
    setIsComposeModalOpen(true);
  };

  // When user clicks "Send" inside Compose Form: trigger MANDATORY confirmation modal
  const handleInitiateSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) return;

    setPendingSend({
      to: composeTo.trim(),
      subject: composeSubject.trim(),
      body: composeBody.trim(),
    });
  };

  // Execute Send after explicit confirmation
  const handleConfirmSend = async () => {
    if (!pendingSend || !accessToken) return;
    setIsSending(true);
    setErrorMsg(null);
    try {
      await sendGmailMessage(accessToken, pendingSend.to, pendingSend.subject, pendingSend.body);
      setStatusMsg(`Email sent to ${pendingSend.to} successfully!`);
      setTimeout(() => setStatusMsg(null), 4000);
      setPendingSend(null);
      setIsComposeModalOpen(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      loadMessages(accessToken, searchQuery);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send email via Gmail.');
    } finally {
      setIsSending(false);
    }
  };

  // Execute Delete after explicit confirmation (MANDATORY SAFEGUARD)
  const handleConfirmDelete = async () => {
    if (!messageToDelete || !accessToken) return;
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await deleteGmailMessage(accessToken, messageToDelete.id);
      setStatusMsg(`Deleted email "${messageToDelete.subject}" from Gmail.`);
      setTimeout(() => setStatusMsg(null), 3500);
      if (selectedMessage?.id === messageToDelete.id) {
        setSelectedMessage(null);
      }
      setMessageToDelete(null);
      loadMessages(accessToken, searchQuery);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete email message.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-sky-700 mb-1">
              Google Workspace Cloud Integration
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Gmail Communications & Quotations Hub
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Read incoming customer messages, compose formal quotations, send transport confirmation notices, and manage enquiries directly with your connected Gmail account.
            </p>
          </div>

          {currentUser && (
            <div className="flex items-center gap-3 bg-white p-2.5 px-4 rounded-xl border border-slate-200 shadow-xs">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Google Account'}
                  className="w-8 h-8 rounded-full border border-slate-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                  {currentUser.email ? currentUser.email[0].toUpperCase() : 'G'}
                </div>
              )}
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block truncate max-w-[140px]">
                  {currentUser.displayName || 'Google User'}
                </span>
                <span className="text-slate-500 block truncate max-w-[140px]">
                  {currentUser.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ml-1"
                title="Disconnect Gmail"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Status & Error Alerts */}
        {statusMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* If Not Authenticated: Official Styled Google Sign-In */}
        {!currentUser ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs text-center max-w-xl mx-auto space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">
                Connect Your Gmail Account
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Sign in with Google to send quotation emails, view customer replies, and coordinate healthcare logistics from your connected Gmail address with your explicit permission.
              </p>
            </div>

            {/* Official Google Sign-in Button */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-3 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-lg border border-slate-300 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
                <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400">
              Authentication and tokens are handled strictly in-memory per Google Workspace least-privilege security guidelines.
            </div>
          </div>
        ) : (
          /* Authenticated Gmail View */
          <div className="space-y-8">
            
            {/* Quick 1-Click Operational Dispatch Shortcuts */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Quick Operational Dispatch · 1-Click Email Quotations
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  Pre-populates formal quotations and updates from active bookings
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Transport Dispatch */}
                {transportReqs.filter(t => t.email).slice(0, 1).map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                          Transport
                        </span>
                        <span className="font-mono font-bold text-slate-700">{t.reference}</span>
                      </div>
                      <div className="font-semibold text-slate-900">{t.contactName} ({t.email})</div>
                      <div className="text-slate-500 text-[11px] truncate max-w-xs">{t.origin} → {t.destination}</div>
                    </div>

                    <button
                      onClick={() => handlePrepareTransportEmail(t)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Compose Email</span>
                    </button>
                  </div>
                ))}

                {/* Rental Dispatch */}
                {rentalReqs.filter(r => r.email).slice(0, 1).map((r) => (
                  <div key={r.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Rental
                        </span>
                        <span className="font-mono font-bold text-slate-700">{r.reference}</span>
                      </div>
                      <div className="font-semibold text-slate-900">{r.customerName} ({r.email})</div>
                      <div className="text-slate-500 text-[11px] truncate max-w-xs">{r.equipmentCategory} · {r.expectedDurationDays} days</div>
                    </div>

                    <button
                      onClick={() => handlePrepareRentalEmail(r)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Compose Quote</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              
              {/* Search */}
              <form onSubmit={handleSearch} className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search emails in your Gmail inbox (e.g. from, subject, reference code)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                />
              </form>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setComposeTo('');
                    setComposeSubject('');
                    setComposeBody('');
                    setIsComposeModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Compose Email</span>
                </button>

                <button
                  onClick={() => accessToken && loadMessages(accessToken, searchQuery)}
                  disabled={loadingMessages}
                  className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Refresh Gmail messages"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingMessages ? 'animate-spin' : ''}`} />
                </button>
              </div>

            </div>

            {/* Split Screen: Messages List & Message Reader */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Messages List Column */}
              <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden ${selectedMessage ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-sky-700" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Inbox ({messages.length})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Connected: {currentUser.email}
                  </span>
                </div>

                {loadingMessages ? (
                  <div className="p-12 text-center text-xs text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
                    <span>Loading messages from Gmail...</span>
                  </div>
                ) : messages.length > 0 ? (
                  <div className="divide-y divide-slate-100 max-h-[650px] overflow-y-auto">
                    {messages.map((msg) => {
                      const isSelected = selectedMessage?.id === msg.id;
                      return (
                        <div
                          key={msg.id}
                          onClick={() => handleSelectMessage(msg)}
                          className={`p-4 transition-colors cursor-pointer flex flex-col gap-1.5 ${
                            isSelected ? 'bg-sky-50/70 border-l-4 border-sky-600' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs truncate ${msg.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                              {msg.from || 'Unknown Sender'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {msg.date ? new Date(msg.date).toLocaleDateString() : ''}
                            </span>
                          </div>

                          <div className={`text-xs truncate ${msg.unread ? 'font-bold text-slate-900' : 'text-slate-800'}`}>
                            {msg.subject || '(No Subject)'}
                          </div>

                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {msg.snippet}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                    <Mail className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-700">No emails found in this view.</p>
                    <p className="text-slate-400">Use "Compose Email" to send a healthcare quotation or message.</p>
                  </div>
                )}
              </div>

              {/* Message Reader Column (when message selected) */}
              {selectedMessage && (
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                  {/* Reader Header */}
                  <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="text-base font-bold text-slate-900">
                        {selectedMessage.subject || '(No Subject)'}
                      </h2>
                      <div className="text-xs text-slate-600">
                        From: <span className="font-semibold text-slate-900">{selectedMessage.from}</span>
                      </div>
                      {selectedMessage.to && (
                        <div className="text-[11px] text-slate-500">
                          To: {selectedMessage.to}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 font-mono">
                        Date: {selectedMessage.date}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setComposeTo(selectedMessage.from.match(/<([^>]+)>/)?.[1] || selectedMessage.from);
                          setComposeSubject(`Re: ${selectedMessage.subject}`);
                          setComposeBody(`<p><br/><br/>--- On ${selectedMessage.date}, ${selectedMessage.from} wrote:<br/>${selectedMessage.snippet}</p>`);
                          setIsComposeModalOpen(true);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Reply
                      </button>

                      <button
                        onClick={() => setMessageToDelete(selectedMessage)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete email"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setSelectedMessage(null)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Reader Body */}
                  <div className="p-6 overflow-y-auto max-h-[550px] text-xs leading-relaxed text-slate-800">
                    {loadingDetail ? (
                      <div className="p-8 text-center text-slate-500">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto text-sky-600 mb-2" />
                        <span>Loading message content...</span>
                      </div>
                    ) : selectedMessage.bodyHtml ? (
                      <div
                        className="prose prose-xs max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                      />
                    ) : (
                      <div className="whitespace-pre-wrap font-sans">
                        {selectedMessage.bodyText || selectedMessage.snippet || 'No message content available.'}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>

      {/* COMPOSE EMAIL MODAL */}
      {isComposeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Compose Email (via Gmail)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsComposeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInitiateSend} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  required
                  placeholder="client@example.com"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  required
                  placeholder="e.g. Tobago Healthcare — Medical Equipment Quotation"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Content (HTML supported) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  rows={8}
                  required
                  placeholder="Write your email message, pricing breakdown, or transport logistics notes..."
                  className="w-full px-3.5 py-2 text-xs font-sans border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsComposeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:opacity-50 rounded-lg cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Review & Send Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY CONFIRMATION MODAL: SENDING EMAIL ON BEHALF OF USER */}
      {pendingSend && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Confirm Sending Email via Gmail
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Are you sure you want to send this email to <strong>"{pendingSend.to}"</strong> with subject <strong>"{pendingSend.subject}"</strong> from your connected Gmail address ({currentUser?.email})?
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
              <span className="block font-semibold text-slate-700">Recipient:</span>
              <span>{pendingSend.to}</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPendingSend(null)}
                disabled={isSending}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSend}
                disabled={isSending}
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer"
              >
                {isSending ? 'Sending via Gmail...' : 'Confirm & Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY CONFIRMATION MODAL: DELETING EMAIL (DESTRUCTIVE) */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Confirm Deletion from Gmail
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Are you sure you want to permanently delete the message <strong>"{messageToDelete.subject}"</strong> from your Gmail mailbox? This operation cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMessageToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete Email'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
