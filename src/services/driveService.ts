export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  owners?: Array<{ displayName: string; emailAddress: string }>;
  shared?: boolean;
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

/**
 * List files from Google Drive
 */
export async function listDriveFiles(
  accessToken: string,
  options: {
    folderId?: string;
    query?: string;
    pageSize?: number;
    orderBy?: string;
  } = {}
): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
  const { folderId, query, pageSize = 25, orderBy = 'folder,modifiedTime desc' } = options;

  let q = "trashed = false";
  if (folderId) {
    q += ` and '${folderId}' in parents`;
  }
  if (query && query.trim()) {
    const escaped = query.trim().replace(/'/g, "\\'");
    q += ` and (name contains '${escaped}' or fullText contains '${escaped}')`;
  }

  const params = new URLSearchParams({
    q,
    pageSize: pageSize.toString(),
    orderBy,
    fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink, iconLink, thumbnailLink, owners, shared)',
  });

  const res = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch files from Google Drive (${res.status})`);
  }

  return await res.json();
}

/**
 * Create a new folder in Google Drive
 */
export async function createDriveFolder(
  accessToken: string,
  folderName: string,
  parentId?: string
): Promise<DriveFile> {
  const metadata: { name: string; mimeType: string; parents?: string[] } = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentId) {
    metadata.parents = [parentId];
  }

  const res = await fetch(`${DRIVE_API_BASE}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create folder in Google Drive');
  }

  return await res.json();
}

/**
 * Upload a file (multipart upload)
 */
export async function uploadDriveFile(
  accessToken: string,
  name: string,
  content: Blob | string,
  mimeType: string,
  parentId?: string
): Promise<DriveFile> {
  const metadata: { name: string; mimeType: string; parents?: string[] } = {
    name,
    mimeType,
  };

  if (parentId) {
    metadata.parents = [parentId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const blobContent = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });

  // Read metadata as text
  const metadataText = await metadataBlob.text();
  const fileArrayBuffer = await blobContent.arrayBuffer();

  // Construct multipart body
  const bodyParts = [
    delimiter,
    'Content-Type: application/json; charset=UTF-8\r\n\r\n',
    metadataText,
    delimiter,
    `Content-Type: ${mimeType}\r\n\r\n`,
  ];

  const preBuffer = new TextEncoder().encode(bodyParts.join(''));
  const postBuffer = new TextEncoder().encode(closeDelimiter);

  const totalLength = preBuffer.byteLength + fileArrayBuffer.byteLength + postBuffer.byteLength;
  const mergedArray = new Uint8Array(totalLength);
  mergedArray.set(preBuffer, 0);
  mergedArray.set(new Uint8Array(fileArrayBuffer), preBuffer.byteLength);
  mergedArray.set(postBuffer, preBuffer.byteLength + fileArrayBuffer.byteLength);

  const res = await fetch(
    `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: mergedArray,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to upload file to Google Drive');
  }

  return await res.json();
}

/**
 * Delete a file or folder from Google Drive
 * Must be preceded by a user confirmation dialog in the UI!
 */
export async function deleteDriveFile(accessToken: string, fileId: string): Promise<void> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to delete file from Google Drive');
  }
}
