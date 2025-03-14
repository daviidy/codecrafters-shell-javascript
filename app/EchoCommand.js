const { Command } = require("./Command");

class EchoCommand extends Command {
    constructor(outputHandler) {
        super();
        this.outputHandler = outputHandler;
    }

    execute(args) {
        const output = args.join(' ');
        // Only write to stdout, never to stderr
        if (!this.outputHandler.isStderr) {
            this.outputHandler.write(output);
        } else {
            // If stderr is redirected, write to stdout anyway
            process.stdout.write(output + '\n');
        }
        return { shouldContinue: true };
    }
}

module.exports = { EchoCommand }