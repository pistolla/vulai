/* Google Drive Picker for PDFs and Images */

declare global {
  interface Window { google: any; gapi: any; }
}

const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly';
let tokenClient: any;
let currentAccessToken: string | null = null;

export const initDrivePicker = () =>
  new Promise<void>((resolve) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      scope: SCOPES,
      callback: () => resolve(),
    });
  });

export const getAccessToken = () => currentAccessToken;

export const pickDriveFile = (): Promise<{ fileId: string; webViewLink: string; mimeType: string }> =>
  new Promise((resolve, reject) => {
    tokenClient.requestAccessToken({
      callback: (response: any) => {
        if (response.error) {
          reject(response.error);
          return;
        }
        const accessToken = response.access_token;
        currentAccessToken = accessToken;
        const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
        view.setMimeTypes('application/pdf,image/jpeg,image/png,image/gif,image/webp');
        const picker = new window.google.picker.PickerBuilder()
          .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
          .setAppId(process.env.NEXT_PUBLIC_GOOGLE_APP_ID!)
          .setOAuthToken(accessToken)
          .addView(view)
          .setCallback((data: any) => {
            if (data.action === window.google.picker.Action.PICKED) {
              const doc = data.docs[0];
              resolve({ fileId: doc.id, webViewLink: doc.url, mimeType: doc.mimeType });
            }
            if (data.action === window.google.picker.Action.CANCEL) reject('cancelled');
          })
          .build();
        picker.setVisible(true);
      }
    });
  });

export const getDriveFileContent = async (fileId: string, accessToken: string): Promise<ArrayBuffer> => {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }
  return response.arrayBuffer();
};
