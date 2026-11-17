import React, { useState, useEffect } from 'react';
import {
  Folder,
  FileText,
  Upload,
  FolderPlus,
  Trash2,
  ExternalLink,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  LogOut,
  HardDrive,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  File,
  Download,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  logout,
  getAccessToken,
  initAuth,
} from '../services/firebaseAuth';
import {
  listDriveFiles,
  createDriveFolder,
  uploadDriveFile,
  deleteDriveFile,
  DriveFile,
} from '../services/driveService';

interface GoogleDriveHubProps {
  onNotify?: (msg: string) => void;
}

export const GoogleDriveHub: React.FC<GoogleDriveHubProps> = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Folder creation modal state
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Destructive delete confirmation modal state (MANDATORY)
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);

  // Initialize auth listener
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

  // Fetch files when token is available
  useEffect(() => {
    if (accessToken) {
      loadFiles(accessToken);
    } else {
      setFiles([]);
    }
  }, [accessToken]);

  const loadFiles = async (token: string, query?: string) => {
    setLoadingFiles(true);
    setErrorMsg(null);
    try {
      const result = await listDriveFiles(token, { query });
      setFiles(result.files || []);
    } catch (err: any) {
      console.error('Error fetching Drive files:', err);
      setErrorMsg(err.message || 'Unable to load files from Google Drive.');
    } finally {
      setLoadingFiles(false);
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
        setStatusMsg('Successfully connected to Google Drive.');
        setTimeout(() => setStatusMsg(null), 3500);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
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
      setFiles([]);
      setStatusMsg('Disconnected from Google Drive.');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg('Error signing out.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessToken) {
      loadFiles(accessToken, searchQuery);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newFolderName.trim()) return;

    setCreatingFolder(true);
    try {
      await createDriveFolder(accessToken, newFolderName.trim());
      setNewFolderName('');
      setIsFolderModalOpen(false);
      setStatusMsg(`Folder "${newFolderName.trim()}" created successfully.`);
      setTimeout(() => setStatusMsg(null), 3500);
      loadFiles(accessToken, searchQuery);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create folder.');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0 || !accessToken) return;

    const file = fileList[0];
    setIsUploading(true);
    setErrorMsg(null);
    try {
      await uploadDriveFile(accessToken, file.name, file, file.type || 'application/octet-stream');
      setStatusMsg(`File "${file.name}" uploaded to Google Drive successfully.`);
      setTimeout(() => setStatusMsg(null), 3500);
      loadFiles(accessToken, searchQuery);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload file to Google Drive.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Export current inquiries log as a report to Google Drive
  const handleExportEnquiriesToDrive = async () => {
    if (!accessToken) return;
    setIsUploading(true);
    try {
      const enquiries = JSON.parse(localStorage.getItem('thc_enquiries') || '[]');
      const reportDate = new Date().toISOString().split('T')[0];
      const fileName = `Tobago_Healthcare_Enquiries_${reportDate}.txt`;

      let content = `TOBAGO HEALTHCARE EQUIPMENT & SUPPLIES — ENQUIRIES REPORT\n`;
      content += `Generated: ${new Date().toLocaleString()}\n`;
      content += `Total Enquiries Logged: ${enquiries.length}\n\n`;
      content += `--------------------------------------------------------\n\n`;

      if (enquiries.length === 0) {
        content += `No customer enquiries currently stored in local browser registry.\n`;
      } else {
        enquiries.forEach((enq: any, idx: number) => {
          content += `[#${idx + 1}] Reference: ${enq.referenceCode}\n`;
          content += `Date: ${enq.submittedAt}\n`;
          content += `Client: ${enq.fullName} (${enq.email}${enq.telephone ? `, Tel: ${enq.telephone}` : ''})\n`;
          content += `Enquiry Type: ${enq.enquiryType}\n`;
          if (enq.productName) content += `Product: ${enq.productName}\n`;
          content += `Details:\n${enq.message}\n\n`;
          content += `--------------------------------------------------------\n\n`;
        });
      }

      await uploadDriveFile(accessToken, fileName, content, 'text/plain');
      setStatusMsg(`Enquiries report saved directly to Google Drive as "${fileName}".`);
      setTimeout(() => setStatusMsg(null), 4000);
      loadFiles(accessToken, searchQuery);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to export enquiries to Google Drive.');
    } finally {
      setIsUploading(false);
    }
  };

  // Explicit confirmation before executing destructive deletion
  const confirmDeleteFile = async () => {
    if (!fileToDelete || !accessToken) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      setStatusMsg(`Deleted "${fileToDelete.name}" from Google Drive.`);
      setTimeout(() => setStatusMsg(null), 3500);
      setFileToDelete(null);
      loadFiles(accessToken, searchQuery);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete file.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) return <Folder className="w-5 h-5 text-amber-500" />;
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-rose-500" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('sheet') || mimeType.includes('excel'))
      return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    if (mimeType.includes('image')) return <ImageIcon className="w-5 h-5 text-sky-500" />;
    if (mimeType.includes('text') || mimeType.includes('document'))
      return <FileText className="w-5 h-5 text-blue-600" />;
    return <File className="w-5 h-5 text-slate-400" />;
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
              Google Drive Records & Equipment Hub
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              Access equipment user manuals, warranty certificates, formal quotations, and customer enquiries directly through your connected Google Drive storage.
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
                title="Disconnect Google Drive"
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
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mx-auto">
              <HardDrive className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">
                Connect Your Google Drive
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Sign in with Google to view, organize, and store equipment manuals, customer quotations, and healthcare supply documents in your Google Drive with your explicit permission.
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
          /* Authenticated Google Drive View */
          <div className="space-y-6">
            
            {/* Action Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search files and folders in your Google Drive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white"
                />
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsFolderModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4 text-sky-700" />
                  <span>New Folder</span>
                </button>

                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
                  <Upload className="w-4 h-4 text-sky-700" />
                  <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>

                <button
                  onClick={handleExportEnquiriesToDrive}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  title="Export customer inquiries log as a report to Google Drive"
                >
                  <FileText className="w-4 h-4" />
                  <span>Save Inquiries Report</span>
                </button>

                <button
                  onClick={() => accessToken && loadFiles(accessToken, searchQuery)}
                  disabled={loadingFiles}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Refresh files"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingFiles ? 'animate-spin' : ''}`} />
                </button>
              </div>

            </div>

            {/* Files List Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Files & Folders ({files.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  Google Drive Cloud Storage
                </span>
              </div>

              {loadingFiles ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
                  <span>Loading Google Drive files...</span>
                </div>
              ) : files.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                        <th className="px-6 py-3 font-semibold">Name</th>
                        <th className="px-6 py-3 font-semibold hidden sm:table-cell">Type</th>
                        <th className="px-6 py-3 font-semibold hidden md:table-cell">Last Modified</th>
                        <th className="px-6 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {files.map((file) => (
                        <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              {getFileIcon(file.mimeType)}
                              <div>
                                <span className="font-semibold text-slate-900 block hover:text-sky-700 transition-colors">
                                  {file.name}
                                </span>
                                {file.size && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {(parseInt(file.size, 10) / 1024).toFixed(1)} KB
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-3.5 text-slate-500 hidden sm:table-cell">
                            {file.mimeType.split('.').pop() || 'File'}
                          </td>

                          <td className="px-6 py-3.5 text-slate-500 hidden md:table-cell font-mono">
                            {new Date(file.modifiedTime).toLocaleDateString()}
                          </td>

                          <td className="px-6 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                                  title="Open in Google Drive"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {/* Delete Action triggers confirmation modal (MANDATORY SAFEGUARD) */}
                              <button
                                onClick={() => setFileToDelete(file)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete from Google Drive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-xs text-slate-500 space-y-2">
                  <HardDrive className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>No files found in Google Drive matching current view.</p>
                  <p className="text-[11px] text-slate-400">
                    Use "New Folder", "Upload File", or save a product specification sheet to populate your drive.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* New Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Create New Folder in Google Drive
            </h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                type="text"
                placeholder="e.g. Equipment Manuals"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingFolder || !newFolderName.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 disabled:opacity-50 rounded-lg cursor-pointer"
                >
                  {creatingFolder ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY DESTRUCTIVE CONFIRMATION MODAL */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Confirm Deletion from Google Drive
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong>"{fileToDelete.name}"</strong> from your Google Drive? This operation cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete File'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
