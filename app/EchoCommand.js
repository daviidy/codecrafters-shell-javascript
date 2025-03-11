const { Command } = require("./Command");

class EchoCommand extends Command {
    constructor(outputHandler) {
        super();
        this.outputHandler = outputHandler;
    }

    execute(args) {
        const output = args.join(' ');
        console.log('output', output);
        this.outputHandler.write(output);
        return { shouldContinue: true };
    }
}

module.exports = { EchoCommand }