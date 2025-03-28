const { Command } = require("./Command");
const path = require("path");
const fs = require("fs");

class CdCommand extends Command {
    constructor(outputHandler) {
        super();
        this.outputHandler = outputHandler;
    }

    execute(args) {
        if (args.length !== 1) {
            this.outputHandler.write("cd: missing operand");
            return { shouldContinue: true };
        }

        let newPath = path.resolve(process.cwd(), args[0]);

        if (args[0] === "~") {
            args[0] = process.env.HOME || require("os").homedir();
            newPath = path.resolve(args[0]);
        } else if (!fs.existsSync(newPath)) {
            this.outputHandler.write(`cd: ${args[0]}: No such file or directory`);
            return { shouldContinue: true };
        }

        try {
            process.chdir(newPath);
        } catch (err) {
            this.outputHandler.write(`cd: ${err.message}`);
        }
        return { shouldContinue: true };
    }
}

module.exports = { CdCommand }