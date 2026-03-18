export class ChatOverlay {
    constructor(root) {
        this.root = root;
        this.form = root ? root.querySelector('[data-chat-form]') : null;
        this.input = root ? root.querySelector('[data-chat-input]') : null;
        this.messages = root ? root.querySelector('[data-chat-messages]') : null;
        this.suggestions = root ? root.querySelector('[data-chat-suggestions]') : null;
        this.messageHistory = [];
        this.commandSuggestions = [];
        this.onSubmit = null;
        this.onInputChange = null;
        this.onCancel = null;

        if (this.form) {
            this.form.addEventListener('submit', (event) => {
                event.preventDefault();
                if (typeof this.onSubmit === 'function') {
                    this.onSubmit((this.input ? this.input.value : '').trim());
                }
            });
        }

        if (this.input) {
            this.input.addEventListener('input', () => {
                if (typeof this.onInputChange === 'function') {
                    this.onInputChange(this.input.value);
                }
            });

            this.input.addEventListener('keydown', (event) => {
                if (event.code === 'Escape') {
                    event.preventDefault();
                    if (typeof this.onCancel === 'function') {
                        this.onCancel();
                    }
                    return;
                }

                if (event.code === 'Tab' && this.commandSuggestions.length > 0) {
                    event.preventDefault();
                    this.applySuggestion(this.commandSuggestions[0]);
                }
            });
        }
    }

    show() {
        if (this.root) {
            this.root.hidden = false;
        }

        if (this.input) {
            this.input.focus();
            this.input.select();
        }
    }

    hide() {
        if (this.root) {
            this.root.hidden = true;
        }

        this.setSuggestions([]);
    }

    clearInput() {
        if (this.input) {
            this.input.value = '';
        }
    }

    setInputValue(value) {
        if (this.input) {
            this.input.value = value;
            this.input.focus();
            this.input.setSelectionRange(this.input.value.length, this.input.value.length);
        }
    }

    applySuggestion(command) {
        if (!command) {
            return;
        }

        this.setInputValue('/' + command.command_key + ' ');
        if (typeof this.onInputChange === 'function') {
            this.onInputChange(this.input.value);
        }
    }

    pushMessage(type, text) {
        this.messageHistory.push({
            type: type,
            text: text
        });

        if (this.messageHistory.length > 8) {
            this.messageHistory = this.messageHistory.slice(-8);
        }

        this.renderMessages();
    }

    setSuggestions(commands) {
        this.commandSuggestions = Array.isArray(commands) ? commands.slice(0, 6) : [];
        this.renderSuggestions();
    }

    renderMessages() {
        if (!this.messages) {
            return;
        }

        this.messages.innerHTML = '';

        this.messageHistory.forEach((message) => {
            const node = document.createElement('div');
            node.className = 'game-chat__message';
            node.dataset.type = message.type;
            node.textContent = message.text;
            this.messages.appendChild(node);
        });
    }

    renderSuggestions() {
        if (!this.suggestions) {
            return;
        }

        this.suggestions.innerHTML = '';
        this.suggestions.hidden = this.commandSuggestions.length === 0;

        this.commandSuggestions.forEach((command) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'game-chat__suggestion';
            button.textContent = '/' + command.command_key + ' - ' + (command.label || command.command_key);
            button.addEventListener('click', () => {
                this.applySuggestion(command);
            });
            this.suggestions.appendChild(button);
        });
    }
}
