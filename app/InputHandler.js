class InputHandler {
    constructor(readline) {
        this.readline = readline;
    }

    async getInput(prompt) {
        return new Promise((resolve) => {
            this.readline.question(prompt, (input) => {
                resolve(input);
            });
        });
    }
}

module.exports = { InputHandler }