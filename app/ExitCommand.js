const { Command } = require("./Command");

class ExitCommand extends Command {
    constructor(readline) {
        super();
        this.readline = readline;
    }

    execute() {
        this.readline.close();
        return { shouldContinue: false };
    }
}

module.exports = { ExitCommand }