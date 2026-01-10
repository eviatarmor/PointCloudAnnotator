import "./dialog.css";

/**
 * Configuration for the standard confirmation dialog.
 */
interface DialogOptions {
    title: string;            // Dialog header text
    message: string;          // Main body text/description
    confirmText?: string;     // Text for the primary action button (default: "Confirm")
    cancelText?: string;      // Text for the secondary action button (default: "Cancel")
    onConfirm: () => void;    // Callback executed when user confirms the action
    onCancel?: () => void;    // Optional callback executed when user cancels or closes
}

/**
 * Displays a modal confirmation window.
 * Re-themed to match the Potree Viewer's dark, technical aesthetic.
 */
export function showOrgConfirmDialog({
                                         title,
                                         message,
                                         confirmText = "Confirm",
                                         cancelText = "Cancel",
                                         onConfirm,
                                         onCancel
                                     }: DialogOptions) {
    $("#generic-confirm-dialog").remove();

    const dialogHtml = `
        <div id="generic-confirm-dialog" title="${title}" style="display: none;">
            <p class="dialog-message">${message}</p>
        </div>
    `;

    $("body").append(dialogHtml);

    const $dialog = $("#generic-confirm-dialog");

    $dialog.dialog({
        resizable: false,
        height: "auto",
        width: 380,
        modal: true,
        classes: {
            "ui-dialog": "potree-confirm-dialog",
            "ui-widget-overlay": "potree-overlay"
        },
        buttons: [
            {
                text: confirmText,
                class: "potree-btn-primary",
                click: function () {
                    onConfirm();
                    $(this).dialog("close");
                }
            },
            {
                text: cancelText,
                class: "potree-btn-secondary",
                click: function () {
                    if (onCancel) onCancel();
                    $(this).dialog("close");
                }
            }
        ],
        close: function () {
            $(this).dialog("destroy").remove();
        }
    });
};
