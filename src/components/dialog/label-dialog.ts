import "./dialog.css";
import "./label-dialog.css";

/**
 * Configuration for the Label Dialog.
 * Allows customization of labels, validation limits, and initial states.
 */
interface LabelDialogOptions {
    title?: string;           // Dialog header text
    labelText?: string;       // Label above the input field
    initialValue?: string;    // Pre-filled text in the input
    confirmText?: string;     // Text for the primary action button
    cancelText?: string;      // Text for the secondary action button
    placeholder?: string;     // Ghost text for empty input
    maxBytes?: number;        // Maximum data size (defaults to 256 for DB safety)
    onConfirm: (value: string) => void; // Callback returning the new string
    onCancel?: () => void;    // Optional callback for cancellation
}

/**
 * Opens a modal dialog containing a text input.
 * Includes validation for empty strings and byte-length limits.
 */
export function showOrgLabelDialog({
                                       title = "Edit Label",
                                       labelText = "Label Name",
                                       initialValue = "",
                                       confirmText = "Save",
                                       cancelText = "Cancel",
                                       placeholder = "",
                                       maxBytes = 256,
                                       onConfirm,
                                       onCancel
                                   }: LabelDialogOptions) {

    $("#label-dialog-wrapper").remove();

    const dialogHtml = `
        <div id="label-dialog-wrapper" title="${title}" style="display: none;">
            <div class="dialog-content">
                <div class="form-group">
                    <label for="potree-label-input">${labelText}</label>
                    <input type="text" 
                           id="potree-label-input" 
                           class="form-control" 
                           placeholder="${placeholder}"
                           autocomplete="off" />
                    <div id="label-error" class="error-message" style="display: none;"></div>
                </div>
            </div>
        </div>
    `;

    $("body").append(dialogHtml);

    const $dialog = $("#label-dialog-wrapper");
    const $input = $("#potree-label-input");
    const $error = $("#label-error");

    $input.val(initialValue);

    $dialog.dialog({
        modal: true,
        width: 350,
        resizable: false,
        classes: {
            "ui-dialog": "potree-confirm-dialog",
            "ui-widget-overlay": "potree-overlay"
        },
        buttons: [
            {
                text: confirmText,
                class: "potree-btn-confirm",
                click: function () {
                    const val = $input.val()?.toString().trim() || "";

                    // Validation
                    if (val.length === 0) {
                        $error.html(`${labelText} is required`).fadeIn(100);
                        return;
                    }

                    const byteSize = new Blob([val]).size;
                    if (byteSize > maxBytes) {
                        $error.html(`Exceeds limit (${byteSize}/${maxBytes} bytes)`).fadeIn(100);
                        return;
                    }

                    onConfirm(val);
                    $(this).dialog("close");
                }
            },
            {
                text: cancelText,
                class: "potree-btn-cancel",
                click: function () {
                    if (onCancel) onCancel();
                    $(this).dialog("close");
                }
            }
        ],
        open: function () {
            $input.focus().select();
            $input.on("input", () => $error.hide());
        },
        close: function () {
            $(this).dialog("destroy").remove();
        }
    });
};
