(function () {
    function createToast(type, title, message) {
        const stack = document.getElementById('toast-stack');
        if (!stack) {
            return;
        }

        const toast = document.createElement('article');
        toast.className = 'toast toast--' + type;
        toast.innerHTML = '<strong class="toast__title"></strong><div class="toast__message"></div>';
        toast.querySelector('.toast__title').textContent = title;
        toast.querySelector('.toast__message').textContent = message;
        stack.appendChild(toast);

        window.setTimeout(function () {
            toast.remove();
        }, 4200);
    }

    window.showSuccess = function (message, title) {
        createToast('success', title || 'Sucesso', message);
    };

    window.showError = function (message, title) {
        createToast('error', title || 'Erro', message);
    };

    window.showAlert = function (message, title) {
        createToast('info', title || 'Atencao', message);
    };

    window.showConfirm = function (title, message, buttonText, confirmCallback, cancelCallback) {
        const confirmed = window.confirm(title + '\n\n' + message + '\n\n[' + buttonText + ']');

        if (confirmed) {
            if (typeof confirmCallback === 'function') {
                confirmCallback();
            }
            return;
        }

        if (typeof cancelCallback === 'function') {
            cancelCallback();
        }
    };
})();
