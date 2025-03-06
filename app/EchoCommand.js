const { Command } = require("./Command");

class EchoCommand extends Command {
    constructor(outputHandler) {
        super();
        this.outputHandler = outputHandler;
    }

    execute(args) {
        this.outputHandler.write(args.join(" "));
        return { shouldContinue: true };
    }
}

module.exports = { EchoCommand }