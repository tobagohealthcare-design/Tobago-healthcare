import React, { useState, useEffect } from 'react';
import {
  Contact,
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  ExternalLink,
  MessageSquare,
  Building,
  Tag,
  FileText,
  Car,
  Bed,
  CalendarCheck,
  Download,
} from 'lucide-react';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from '../services/firebaseAuth';
import {
  listContacts,
  createGoogleContact,
  deleteGoogleContact,
  syncTransportRequestToContacts,
  syncRentalRequestToContacts,
  syncConsultationRequestToContacts,
  extractWhatsAppDigits,
  GoogleContactPerson,
  NewContactPayload,
} from '../services/contactsService';
import { operationsStore } from '../services/operationsStore';
import { CONFIRMED_BUSINESS_CONFIG } from '../data/rentalData';

export const GoogleContactsHub: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [contacts, setContacts] = useState<GoogleContactPerson[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // New Contact Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<NewContactPayload>({
    givenName: '',
    familyName: '',
    phone: '',
    email: '',
    streetAddress: '',
    city: 'Scarborough',
    organization: 'Tobago Healthcare Equipment & Supplies Client',
    jobTitle: '',
    notes: '',
    categoryTag: 'Medical Transport Client',
  });

  // Sync / Export Modal
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Delete Confirmation Modal
  const [contactToDelete, setContactToDelete] = useState<GoogleContactPerson | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setIsAuthenticated(true);
        setUserEmail(user.email);
        loadContacts();
      },
      () => {
        setIsAuthenticated(false);
        setUserEmail(null);
        setContacts([]);
      }
    );

    getAccessToken().then((token) => {
      if (token) {
        setIsAuthenticated(true);
        loadContacts();
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setIsAuthenticated(true);
        setUserEmail(res.user.email);
        setStatusMessage({
          type: 'success',
          text: `Signed in to Google Contacts as ${res.user.email}`,
        });
        await loadContacts();
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to sign in to Google.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setIsAuthenticated(false);
    setUserEmail(null);
    setContacts([]);
    setStatusMessage({
      type: 'info',
      text: 'Signed out of Google Workspace.',
    });
  };

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const list = await listContacts(100);
      setContacts(list);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: `Error fetching Google contacts: ${err.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.givenName.trim()) return;

    setIsSubmitting(true);
    try {
      await createGoogleContact(formData);
      setStatusMessage({
        type: 'success',
        text: `Successfully created contact for ${formData.givenName} ${formData.familyName || ''}`,
      });
      setIsCreateModalOpen(false);
      setFormData({
        givenName: '',
        familyName: '',
        phone: '',
        email: '',
        streetAddress: '',
        city: 'Scarborough',
        organization: 'Tobago Healthcare Equipment & Supplies Client',
        jobTitle: '',
        notes: '',
        categoryTag: 'Medical Transport Client',
      });
      await loadContacts();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Failed to create contact: ${err.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = (contact: GoogleContactPerson) => {
    setContactToDelete(contact);
  };

  const executeDeleteContact = async () => {
    if (!contactToDelete) return;
    setIsDeleting(true);
    try {
      await deleteGoogleContact(contactToDelete.resourceName);
      const name = contactToDelete.names?.[0]?.displayName || 'Contact';
      setStatusMessage({
        type: 'success',
        text: `Permanently removed "${name}" from Google Contacts.`,
      });
      setContactToDelete(null);
      await loadContacts();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Deletion failed: ${err.message}`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // 1-Click Operational Exports
  const handleSyncOperationalClient = async (
    type: 'transport' | 'rental' | 'consultation',
    item: any
  ) => {
    setIsSyncing(true);
    try {
      if (type === 'transport') {
        await syncTransportRequestToContacts(item);
        setStatusMessage({
          type: 'success',
          text: `Added transport client "${item.requesterName}" to Google Contacts.`,
        });
      } else if (type === 'rental') {
        await syncRentalRequestToContacts(item);
        setStatusMessage({
          type: 'success',
          text: `Added rental client "${item.customerName}" to Google Contacts.`,
        });
      } else if (type === 'consultation') {
        await syncConsultationRequestToContacts(item);
        setStatusMessage({
          type: 'success',
          text: `Added consultation client "${item.clientName}" to Google Contacts.`,
        });
      }
      await loadContacts();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Sync error: ${err.message}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Filtering
  const filteredContacts = contacts.filter((c) => {
    const displayName = c.names?.[0]?.displayName || '';
    const email = c.emailAddresses?.[0]?.value || '';
    const phone = c.phoneNumbers?.[0]?.value || '';
    const notes = c.biographies?.[0]?.value || '';
    const org = c.organizations?.[0]?.name || '';

    const matchesSearch =
      displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (categoryFilter !== 'all') {
      const catVal = c.userDefined?.find((u) => u.key === 'Category')?.value || '';
      return (
        catVal.toLowerCase().includes(categoryFilter.toLowerCase()) ||
        notes.toLowerCase().includes(categoryFilter.toLowerCase()) ||
        org.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    return true;
  });

  const operationalTransport = operationsStore.getTransportRequests();
  const operationalRentals = operationsStore.getRentalRequests();
  const operationalConsultations = operationsStore.getConsultationRequests();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Google Contacts Directory
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    People API Live
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Manage patient phone records, transport providers, equipment renters, and medical staff in Google Contacts.
                </p>
                <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                  <span>Location: Burnett Hill, Scarborough</span>
                  <span>•</span>
                  <span>Primary WhatsApp: {CONFIRMED_BUSINESS_CONFIG.phone}</span>
                </div>
              </div>
            </div>

            {/* Auth / Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-400">Connected as</p>
                    <p className="text-xs font-semibold text-emerald-300 truncate max-w-[200px]">
                      {userEmail}
                    </p>
                  </div>
                  <button
                    onClick={loadContacts}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition"
                    title="Refresh contacts"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button
                    onClick={() => setIsSyncModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-sky-700 hover:bg-sky-600 text-white text-xs font-medium rounded-lg shadow transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Sync Bookings
                  </button>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg shadow transition"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    New Contact
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="gsi-material-button flex items-center gap-3 px-4 py-2.5 bg-white text-slate-800 hover:bg-slate-100 rounded-xl font-medium text-sm shadow-md transition"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          </div>

          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`mt-4 p-3 rounded-xl flex items-center justify-between text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                  : statusMessage.type === 'error'
                  ? 'bg-red-950/40 text-red-300 border border-red-800'
                  : 'bg-sky-950/40 text-sky-300 border border-sky-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                {statusMessage.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{statusMessage.text}</span>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-slate-400 hover:text-slate-200 ml-4 font-bold"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Directory Controls: Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, email, notes..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Contacts' },
              { id: 'transport', label: 'Transport' },
              { id: 'rental', label: 'Rentals' },
              { id: 'consultation', label: 'Consultations' },
              { id: 'specialist', label: 'Specialists' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                  categoryFilter === cat.id
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-slate-700/70 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contact Cards Grid */}
        <div>
          {!isAuthenticated ? (
            <div className="py-20 text-center bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-200">Google Contacts Not Connected</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Sign in with your Google account above to load, search, and synchronize your patient directory directly with Google Contacts.
              </p>
            </div>
          ) : isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
              <span className="text-sm">Loading contacts from Google People API...</span>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="py-16 text-center bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">No contacts found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No contacts match "${searchQuery}". Try a different search.`
                  : 'Your Google Contacts directory is empty or contains no contacts in this category. Click "New Contact" or "Sync Bookings" to add patients.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredContacts.map((person) => {
                const displayName = person.names?.[0]?.displayName || 'Unnamed Contact';
                const email = person.emailAddresses?.[0]?.value;
                const phone = person.phoneNumbers?.[0]?.value;
                const address =
                  person.addresses?.[0]?.formattedValue ||
                  [person.addresses?.[0]?.streetAddress, person.addresses?.[0]?.city]
                    .filter(Boolean)
                    .join(', ');
                const org = person.organizations?.[0]?.name;
                const jobTitle = person.organizations?.[0]?.title;
                const notes = person.biographies?.[0]?.value;
                const photoUrl = person.photos?.[0]?.url;
                const categoryTag = person.userDefined?.find((u) => u.key === 'Category')?.value;
                const whatsAppDigits = extractWhatsAppDigits(phone);

                return (
                  <div
                    key={person.resourceName}
                    className="bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-5 flex flex-col justify-between transition shadow-md"
                  >
                    <div>
                      {/* Top Contact Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          {photoUrl && !photoUrl.includes('placeholder') ? (
                            <img
                              src={photoUrl}
                              alt={displayName}
                              className="w-10 h-10 rounded-full object-cover border border-slate-600"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold text-sm flex items-center justify-center shrink-0">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <h3 className="font-semibold text-sm text-slate-100 truncate">
                              {displayName}
                            </h3>
                            {jobTitle && (
                              <p className="text-[11px] text-emerald-400 truncate">{jobTitle}</p>
                            )}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleConfirmDelete(person)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition"
                          title="Delete contact (requires confirmation)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Badges / Organization */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        {categoryTag && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <Tag className="w-2.5 h-2.5" />
                            {categoryTag}
                          </span>
                        )}
                        {org && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700">
                            <Building className="w-2.5 h-2.5" />
                            {org}
                          </span>
                        )}
                      </div>

                      {/* Contact Channels */}
                      <div className="space-y-2 text-xs text-slate-300">
                        {phone && (
                          <div className="flex items-center justify-between gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="font-mono text-xs truncate">{phone}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <a
                                href={`tel:${phone}`}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium"
                                title="Call phone"
                              >
                                Call
                              </a>
                              {whatsAppDigits && (
                                <a
                                  href={`https://wa.me/${whatsAppDigits}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-medium inline-flex items-center gap-1"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageSquare className="w-2.5 h-2.5" />
                                  WA
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {email && (
                          <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                            <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <a
                              href={`mailto:${email}`}
                              className="text-xs truncate hover:text-sky-300"
                            >
                              {email}
                            </a>
                          </div>
                        )}

                        {address && (
                          <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-700/50 text-[11px] text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{address}</span>
                          </div>
                        )}
                      </div>

                      {/* Notes / Reference */}
                      {notes && (
                        <div className="mt-3 p-2.5 bg-slate-900/90 rounded-lg border border-slate-700/80 text-[11px] text-slate-400 font-mono whitespace-pre-line line-clamp-3">
                          {notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create New Contact */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-1">Add Google Contact</h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a patient, client, transport provider, or healthcare partner to Google Contacts.
            </p>

            <form onSubmit={handleCreateContact} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    First / Given Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.givenName}
                    onChange={(e) => setFormData({ ...formData, givenName: e.target.value })}
                    placeholder="e.g. Maria"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Last / Family Name
                  </label>
                  <input
                    type="text"
                    value={formData.familyName || ''}
                    onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                    placeholder="e.g. Williams"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1-868-495-9748"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="patient@example.com"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={formData.categoryTag || 'Medical Transport Client'}
                  onChange={(e) => setFormData({ ...formData, categoryTag: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Medical Transport Client">Non-Emergency Transport Client</option>
                  <option value="Medical Equipment Renter">Equipment Rental Client</option>
                  <option value="Consultation Client">Consultation Client</option>
                  <option value="Independent Transport Provider">Independent Transport Partner</option>
                  <option value="Healthcare Specialist">Doctor / Clinical Specialist</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Location / Address in Tobago
                </label>
                <input
                  type="text"
                  value={formData.streetAddress || ''}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                  placeholder="e.g. Burnett Hill, Scarborough"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Clinical or Service Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Oxygen concentrator user, wheelchair required, reference #..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition inline-flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Contact'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: 1-Click Operational Sync / Export */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-sky-400" />
                Sync Operational Clients to Google Contacts
              </h3>
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Select existing requests from Tobago Healthcare's operations queue to immediately export contact cards into your Google Contacts directory.
            </p>

            <div className="space-y-4">
              {/* Transport section */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-sky-400" />
                  Medical Transport Requesters ({operationalTransport.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {operationalTransport.map((t) => (
                    <div
                      key={t.reference}
                      className="p-2.5 bg-slate-900/70 border border-slate-700/70 rounded-lg flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-200">{t.contactName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {t.phone} • Ref: {t.reference}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSyncOperationalClient('transport', t)}
                        disabled={isSyncing}
                        className="px-2.5 py-1 bg-sky-700 hover:bg-sky-600 text-white rounded text-xs font-medium transition cursor-pointer"
                      >
                        Export to Contacts
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rentals section */}
              <div className="pt-2 border-t border-slate-700/70">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-amber-400" />
                  Equipment Renters ({operationalRentals.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {operationalRentals.map((r) => (
                    <div
                      key={r.reference}
                      className="p-2.5 bg-slate-900/70 border border-slate-700/70 rounded-lg flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-200">{r.customerName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {r.phone} • {r.equipmentCategory}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSyncOperationalClient('rental', r)}
                        disabled={isSyncing}
                        className="px-2.5 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded text-xs font-medium transition cursor-pointer"
                      >
                        Export to Contacts
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consultations section */}
              <div className="pt-2 border-t border-slate-700/70">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-purple-400" />
                  Consultation Clients ({operationalConsultations.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {operationalConsultations.map((c) => (
                    <div
                      key={c.reference}
                      className="p-2.5 bg-slate-900/70 border border-slate-700/70 rounded-lg flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-200">{c.contactName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {c.phone} • {c.consultationTopic}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSyncOperationalClient('consultation', c)}
                        disabled={isSyncing}
                        className="px-2.5 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded text-xs font-medium transition cursor-pointer"
                      >
                        Export to Contacts
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Destructive Action Confirmation Dialog */}
      {contactToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Delete Google Contact?</h3>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Are you sure you want to permanently delete{' '}
              <strong className="text-red-300">
                "{contactToDelete.names?.[0]?.displayName || 'this contact'}"
              </strong>{' '}
              from your Google Contacts directory?
            </p>
            <p className="text-[11px] text-slate-400 mb-5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700">
              This action will permanently remove this person's phone number, email, and address from Google Contacts via the People API. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setContactToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteContact}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg shadow transition inline-flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
