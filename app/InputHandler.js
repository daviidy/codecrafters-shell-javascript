class InputHandler {
    constructor(readline) {
        this.readline = readline;
        this.inputBuffer = '';
    }

    async getInput(prompt) {
        return new Promise((resolve) => {
            this.readline.setPrompt(prompt);
            this.readline.prompt();

            const onKeypress = (char, key) => { 
                if (key.name === 'return' || key.name === 'enter') {
                    this.readline.input.removeListener('keypress', onKeypress);
                    resolve(this.inputBuffer);
                    this.inputBuffer = '';
                } else if (key.name === 'tab') {
                    // Handle Tab key for autocompletion
                    const suggestions = this.getSuggestions(this.inputBuffer);
                    if (suggestions.length === 1) {
                        // Autocomplete if there's only one suggestion
                        this.inputBuffer = suggestions[0] + ' ';
                        this.readline.write(null, { ctrl: true, name: 'u' }); // Clear the current line
                        this.readline.write(this.inputBuffer); // Write the autocompleted input
                    } else if (suggestions.length > 1) {
                        console.log('\n' + suggestions.join(' '));
                        this.readline.prompt();
                        this.readline.write(this.inputBuffer); // Reprint the current input
                    }
                } else if (key.name === 'backspace') {
                    console.log('dave return');
                    // Handle Backspace
                    this.inputBuffer = this.inputBuffer.slice(0, -1);
                    this.readline.write(null, { ctrl: true, name: 'u' }); // Clear the current line
                    this.readline.write(this.inputBuffer);
                } else {
                    // Add the normal character pressed, to the input buffer
                    this.inputBuffer += char;
                }
            };
            this.readline.input.on('keypress', onKeypress);
        });
    }

    getSuggestions(input) {
        const suggestions = [];

        const commands = ['echo', 'exit', 'pwd', 'cd', 'type'];
        suggestions.push(...commands.filter((cmd) => cmd.startsWith(input)));

        return suggestions;
    }
}

module.exports = { InputHandler }