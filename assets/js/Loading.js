(function () {
    class Loading {
        constructor() {
            this.overlay = null;
            this.messageNode = null;
            this.activeCount = 0;
            this.syncElements();
        }

        syncElements() {
            this.overlay = document.getElementById('global-loading');
            this.messageNode = document.getElementById('global-loading-message');
        }

        show(message) {
            this.syncElements();
            this.activeCount += 1;

            if (this.messageNode) {
                this.messageNode.textContent = message || 'Carregando...';
            }

            if (this.overlay) {
                this.overlay.hidden = false;
            }
        }

        hide() {
            this.syncElements();
            this.activeCount = Math.max(0, this.activeCount - 1);

            if (this.overlay && this.activeCount === 0) {
                this.overlay.hidden = true;
            }
        }

        reset() {
            this.activeCount = 0;
            this.syncElements();

            if (this.overlay) {
                this.overlay.hidden = true;
            }
        }
    }

    window.loading = new Loading();
})();
