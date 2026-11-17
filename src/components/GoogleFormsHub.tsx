import React, { useState, useEffect } from 'react';
import {
  FileText,
  PlusCircle,
  ExternalLink,
  Copy,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  Users,
  Send,
  MessageSquare,
  ClipboardList,
  Sparkles,
  Search,
  Eye,
  Share2,
} from 'lucide-react';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from '../services/firebaseAuth';
import {
  listGoogleForms,
  getFormDetails,
  getFormResponses,
  deployFormTemplate,
  createGoogleForm,
  trashGoogleForm,
  TOBAGO_FORM_TEMPLATES,
  GoogleDriveFormFile,
  GoogleFormDetails,
  GoogleFormResponseItem,
  FormTemplatePreset,
} from '../services/formsService';
import { CONFIRMED_BUSINESS_CONFIG } from '../data/rentalData';

export const GoogleFormsHub: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [formsList, setFormsList] = useState<GoogleDriveFormFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Active form inspect/responses
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedFormDetails, setSelectedFormDetails] = useState<GoogleFormDetails | null>(null);
  const [responses, setResponses] = useState<GoogleFormResponseItem[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState<boolean>(false);

  // Deploying template
  const [isDeploying, setIsDeploying] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New custom form modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newFormTitle, setNewFormTitle] = useState<string>('');
  const [newFormCategory, setNewFormCategory] = useState<string>('Patient Care');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Deletion confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<GoogleDriveFormFile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Copy indicator
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Check auth on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setIsAuthenticated(true);
        setUserEmail(user.email);
        loadForms();
      },
      () => {
        setIsAuthenticated(false);
        setUserEmail(null);
        setFormsList([]);
      }
    );

    // Initial check for cached token
    getAccessToken().then((token) => {
      if (token) {
        setIsAuthenticated(true);
        loadForms();
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
          text: `Connected to Google as ${res.user.email}`,
        });
        await loadForms();
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to authenticate with Google.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setIsAuthenticated(false);
    setUserEmail(null);
    setFormsList([]);
    setSelectedFormId(null);
    setSelectedFormDetails(null);
    setResponses([]);
    setStatusMessage({
      type: 'info',
      text: 'Signed out of Google Workspace.',
    });
  };

  const loadForms = async () => {
    setIsLoading(true);
    try {
      const files = await listGoogleForms();
      setFormsList(files);
    } catch (err: any) {
      console.error('Failed to load forms:', err);
      setStatusMessage({
        type: 'error',
        text: `Error loading forms: ${err.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeployTemplate = async (template: FormTemplatePreset) => {
    setIsDeploying(template.id);
    setStatusMessage({
      type: 'info',
      text: `Deploying "${template.title}" to Google Forms...`,
    });
    try {
      const created = await deployFormTemplate(template);
      setStatusMessage({
        type: 'success',
        text: `Successfully created "${template.title}"!`,
      });
      await loadForms();
      // Auto-open newly deployed form
      await handleSelectForm(created.formId, created.info.title);
    } catch (err: any) {
      console.error('Deployment error:', err);
      setStatusMessage({
        type: 'error',
        text: `Failed to deploy template: ${err.message}`,
      });
    } finally {
      setIsDeploying(null);
    }
  };

  const handleSelectForm = async (formId: string, formTitle?: string) => {
    setSelectedFormId(formId);
    setIsLoadingResponses(true);
    try {
      const [details, formResponses] = await Promise.all([
        getFormDetails(formId).catch((e) => {
          console.warn('Could not fetch form schema:', e);
          return {
            formId,
            info: { title: formTitle || 'Google Form' },
          } as GoogleFormDetails;
        }),
        getFormResponses(formId).catch((e) => {
          console.warn('Could not fetch form responses:', e);
          return [] as GoogleFormResponseItem[];
        }),
      ]);
      setSelectedFormDetails(details);
      setResponses(formResponses);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: `Could not load form responses: ${err.message}`,
      });
    } finally {
      setIsLoadingResponses(false);
    }
  };

  const handleCreateCustomForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormTitle.trim()) return;

    setIsCreating(true);
    try {
      const created = await createGoogleForm(
        `Tobago Healthcare - ${newFormTitle.trim()}`,
        newFormTitle.trim()
      );
      setStatusMessage({
        type: 'success',
        text: `Created new form: "${created.info.title}"`,
      });
      setIsCreateModalOpen(false);
      setNewFormTitle('');
      await loadForms();
      await handleSelectForm(created.formId, created.info.title);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Creation failed: ${err.message}`,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDeleteForm = (form: GoogleDriveFormFile) => {
    setDeleteTarget(form);
  };

  const executeDeleteForm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await trashGoogleForm(deleteTarget.id);
      setStatusMessage({
        type: 'success',
        text: `Form "${deleteTarget.name}" deleted successfully.`,
      });
      if (selectedFormId === deleteTarget.id) {
        setSelectedFormId(null);
        setSelectedFormDetails(null);
        setResponses([]);
      }
      setDeleteTarget(null);
      await loadForms();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Failed to delete form: ${err.message}`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 3000);
  };

  const filteredForms = formsList.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 backdrop-blur shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl">
                <ClipboardList className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                    Google Forms Hub
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Workspace Connected
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Manage patient intake, transport pre-trip clearances, equipment rental agreements, and customer feedback for Tobago Healthcare.
                </p>
                <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                  <span>Location: Burnett Hill, Scarborough</span>
                  <span>•</span>
                  <span>WhatsApp: {CONFIRMED_BUSINESS_CONFIG.phone}</span>
                </div>
              </div>
            </div>

            {/* Auth / Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-400">Connected as</p>
                    <p className="text-xs font-semibold text-purple-300 truncate max-w-[200px]">
                      {userEmail}
                    </p>
                  </div>
                  <button
                    onClick={loadForms}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition"
                    title="Refresh list"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg shadow-md transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    New Form
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

          {/* Status Message */}
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

        {/* Templates Section: Clinical & Operational Presets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Clinic Form Presets & Operational Blueprints
              </h2>
              <p className="text-xs text-slate-400">
                Deploy ready-to-use clinical intake, transport clearance, and equipment rental forms straight to Google Forms in one click.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOBAGO_FORM_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 flex flex-col justify-between hover:border-purple-500/40 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                      {tmpl.category}
                    </span>
                    <span className="text-xs text-slate-400">{tmpl.items.length} questions</span>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-100 line-clamp-2 mb-2">
                    {tmpl.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 mb-4">{tmpl.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-700/60">
                  <button
                    onClick={() => handleDeployTemplate(tmpl)}
                    disabled={!isAuthenticated || isDeploying === tmpl.id}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-semibold rounded-lg shadow transition"
                  >
                    {isDeploying === tmpl.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Deploy to Google Forms
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid: Active Forms List & Form Response Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Listing */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Forms in Google Workspace ({formsList.length})
                </h2>
                <div className="relative w-40">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search forms..."
                    className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {!isAuthenticated ? (
                <div className="text-center py-10 px-4 bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
                  <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    Sign in with your Google account above to view and manage forms.
                  </p>
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                  <span className="text-xs">Fetching forms from Google Drive...</span>
                </div>
              ) : filteredForms.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    No Google Forms found. Click one of the clinical presets above or create a new form.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                  {filteredForms.map((form) => {
                    const isSelected = selectedFormId === form.id;
                    return (
                      <div
                        key={form.id}
                        className={`p-3.5 rounded-xl border transition flex flex-col gap-2 ${
                          isSelected
                            ? 'bg-purple-950/40 border-purple-500 text-white'
                            : 'bg-slate-900/60 border-slate-700/70 hover:border-slate-600 text-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() => handleSelectForm(form.id, form.name)}
                            className="text-left font-medium text-xs sm:text-sm hover:text-purple-300 line-clamp-2"
                          >
                            {form.name}
                          </button>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => confirmDeleteForm(form)}
                              className="p-1 text-slate-400 hover:text-red-400 rounded transition"
                              title="Delete form (requires confirmation)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-[11px] text-slate-400">
                          <span>
                            {form.modifiedTime
                              ? new Date(form.modifiedTime).toLocaleDateString()
                              : 'Recent'}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSelectForm(form.id, form.name)}
                              className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium"
                            >
                              <Eye className="w-3 h-3" />
                              Inspect
                            </button>
                            {form.webViewLink && (
                              <a
                                href={form.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200"
                                title="Open in Google Forms Editor"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Edit
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Active Form Inspection, Shareable Respondent Links & Responses */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-5">
              {!selectedFormId ? (
                <div className="py-20 text-center text-slate-400 space-y-3">
                  <ClipboardList className="w-12 h-12 mx-auto text-slate-600" />
                  <p className="text-sm font-medium">Select a form from the list to inspect</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    View submitted patient answers, retrieve the public patient response link, or share via WhatsApp with patients in Tobago.
                  </p>
                </div>
              ) : isLoadingResponses ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
                  <span className="text-sm">Loading form questions and patient submissions...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Form Header Info */}
                  <div className="border-b border-slate-700 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-white">
                          {selectedFormDetails?.info?.title || 'Selected Form'}
                        </h2>
                        {selectedFormDetails?.info?.description && (
                          <p className="text-xs text-slate-400 mt-1">
                            {selectedFormDetails.info.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSelectForm(selectedFormId)}
                          className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs rounded-lg text-slate-200 inline-flex items-center gap-1.5 transition"
                          title="Refresh submissions"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Sync
                        </button>
                      </div>
                    </div>

                    {/* Respondent Link & Sharing */}
                    {selectedFormDetails?.responderUri ? (
                      <div className="mt-4 p-3 bg-slate-900/80 border border-purple-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="overflow-hidden">
                          <p className="text-[11px] font-medium text-purple-300 uppercase tracking-wider">
                            Patient / Client Response Link
                          </p>
                          <p className="text-xs text-slate-300 font-mono truncate max-w-md">
                            {selectedFormDetails.responderUri}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleCopyLink(selectedFormDetails.responderUri!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            {copiedUrl === selectedFormDetails.responderUri ? 'Copied!' : 'Copy'}
                          </button>
                          <a
                            href={`https://wa.me/${CONFIRMED_BUSINESS_CONFIG.whatsAppDigits}?text=${encodeURIComponent(
                              `Please complete the Tobago Healthcare form here: ${selectedFormDetails.responderUri}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs rounded-lg transition"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                          <a
                            href={selectedFormDetails.responderUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Fill Form
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 text-xs text-slate-400">
                        <a
                          href={`https://docs.google.com/forms/d/${selectedFormId}/edit`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open in Google Forms to publish and generate respondent link
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Form Questions Overview */}
                  {selectedFormDetails?.items && selectedFormDetails.items.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Form Questions ({selectedFormDetails.items.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {selectedFormDetails.items.map((it, idx) => (
                          <div
                            key={it.itemId || idx}
                            className="p-2.5 bg-slate-900/60 border border-slate-700/60 rounded-lg"
                          >
                            <span className="text-purple-400 font-semibold mr-1.5">Q{idx + 1}.</span>
                            <span className="text-slate-200">{it.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submitted Responses List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        Submitted Responses ({responses.length})
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Live synced from Google Forms API
                      </span>
                    </div>

                    {responses.length === 0 ? (
                      <div className="py-8 text-center bg-slate-900/50 rounded-xl border border-dashed border-slate-700 text-slate-400 text-xs">
                        No responses submitted yet. Share the respondent link with patients or clients in Tobago to collect data.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                        {responses.map((resp, rIdx) => (
                          <div
                            key={resp.responseId || rIdx}
                            className="p-4 bg-slate-900/80 border border-slate-700/80 rounded-xl space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                              <span className="font-semibold text-slate-200">
                                Submission #{rIdx + 1}
                              </span>
                              <span>
                                {resp.lastSubmittedTime
                                  ? new Date(resp.lastSubmittedTime).toLocaleString()
                                  : 'Recently submitted'}
                              </span>
                            </div>

                            {/* Answers Breakdown */}
                            <div className="space-y-2 pt-1 text-xs">
                              {selectedFormDetails?.items?.map((item) => {
                                const qId = item.questionItem?.question?.questionId;
                                const ansObj = qId && resp.answers ? resp.answers[qId] : null;
                                const answerText =
                                  ansObj?.textAnswers?.answers?.map((a) => a.value).join(', ') ||
                                  '—';

                                return (
                                  <div key={item.itemId} className="flex flex-col">
                                    <span className="text-slate-400 text-[11px]">{item.title}:</span>
                                    <span className="text-slate-100 font-medium">{answerText}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create Blank/Custom Form */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Create New Google Form</h3>
            <p className="text-xs text-slate-400 mb-4">
              A new Google Form will be created under your Google Workspace account for Tobago Healthcare.
            </p>
            <form onSubmit={handleCreateCustomForm} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Form Title *
                </label>
                <input
                  type="text"
                  required
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                  placeholder="e.g., Post-Discharge Oxygen Monitoring Form"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Operational Category
                </label>
                <select
                  value={newFormCategory}
                  onChange={(e) => setNewFormCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  <option value="Patient Care">Patient Care & Clinical</option>
                  <option value="Medical Transport">Non-Emergency Transport & Travel</option>
                  <option value="Rental Equipment">Medical Equipment Rental</option>
                  <option value="Customer Feedback">Customer Feedback & Satisfaction</option>
                </select>
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
                  disabled={isCreating}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg shadow transition inline-flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Form'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory Destructive Action Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Delete Google Form?</h3>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Are you sure you want to permanently delete the form{' '}
              <strong className="text-red-300">"{deleteTarget.name}"</strong>?
            </p>
            <p className="text-[11px] text-slate-400 mb-5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700">
              This action will remove the form and its responses from Google Workspace via the Drive API. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteForm}
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
