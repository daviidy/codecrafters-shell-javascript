const { Command } = require("./Command");

class PwdCommand extends Command {
    constructor(outputHandler) {
        super();
        this.outputHandler = outputHandler;
    }

    execute(args) {
        const currentDirectory = process.cwd();
        this.outputHandler.write(currentDirectory);
        return { shouldContinue: true };
    }
}

module.exports = { PwdCommand }