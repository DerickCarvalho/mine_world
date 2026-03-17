(function () {
    function goToPage(page) {
        window.location.href = window.ENV.DOMAIN + '/index.php?page=' + encodeURIComponent(page);
    }

    window.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('[data-nav-page]').forEach(function (button) {
            button.addEventListener('click', function () {
                goToPage(button.getAttribute('data-nav-page') || 'menu');
            });
        });
    });
})();
