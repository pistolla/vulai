/**
 * Shows a confirmation dialog using browser's confirm dialog
 * @param message - The confirmation message to display
 * @param title - The title of the dialog (optional, for future use)
 * @returns Promise<boolean> - true if confirmed, false otherwise
 */
export const confirmDelete = async (message: string, _title: string = 'Confirm'): Promise<boolean> => {
  return window.confirm(message);
};

/**
 * Shows a confirmation dialog for any action
 * @param message - The confirmation message to display
 * @param title - The title of the dialog (optional, for future use)
 * @param confirmText - The text for the confirm button (optional, for future use)
 * @param cancelText - The text for the cancel button (optional, for future use)
 * @returns Promise<boolean> - true if confirmed, false otherwise
 */
export const confirmAction = async (
  message: string,
  _title: string = 'Confirm',
  _confirmText: string = 'Yes',
  _cancelText: string = 'No'
): Promise<boolean> => {
  return window.confirm(message);
};
