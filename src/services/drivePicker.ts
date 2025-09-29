/* add to public/index.html
<script src="https://apis.google.com/js/api.js"></script>
*/

declare global {
  interface Window { google: any; gapi: any; }
}

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
let tokenClient: any;

export const initDrivePicker = () =>
  new Promise<void>((resolve) => {
    window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      scope: SCOPES,
      callback: () => resolve(),
    });
  });

export const pickDriveVideo = (): Promise<{ fileId: string; webViewLink: string }> =>
  new Promise((resolve, reject) => {
    const view = new window.google.picker.View(window.google.picker.ViewId.VIDEOS);
    const picker = new window.google.picker.PickerBuilder()
      .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
      .setAppId(process.env.NEXT_PUBLIC_GOOGLE_APP_ID!)
      .setOAuthToken(gapi.client.getToken().access_token)
      .addView(view)
      .setCallback((data: any) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const doc = data.docs[0];
          resolve({ fileId: doc.id, webViewLink: doc.url });
        }
        if (data.action === window.google.picker.Action.CANCEL) reject('cancelled');
      })
      .build();
    picker.setVisible(true);
  });
