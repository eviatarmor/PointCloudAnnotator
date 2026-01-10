import "./snackbar.css";

/**
 * Displays a temporary toast notification (snackbar) at the bottom of the screen.
 * * @param message - The text content to display to the user.
 */
export function showErrorSnackbar(message: string) {
    let $container = $("#snackbar-container");
    if ($container.length === 0) {
        $container = $('<div id="snackbar-container"></div>').appendTo("body");
    }

    const $snackbar = $(`<div class="snackbar">${message}</div>`);

    $container.append($snackbar);

    setTimeout(() => {
        $snackbar.fadeOut(400, function () {
            $(this).remove();
        });
    }, 4000);
}
