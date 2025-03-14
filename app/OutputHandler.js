const fs = require('fs');
const path = require('path');

class OutputHandler {
    constructor(outputFile = null, isStderr = false) {
        this.outputFile = outputFile;
        this.isStderr = isStderr;
        
        if (outputFile) {
            const dir = path.dirname(outputFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            // Clear the file when creating the handler
            fs.writeFileSync(outputFile, '');
        }
    }

    write(message, newLine = true) {
        if (this.outputFile) {
            const content = newLine ? message + '\n' : message;
            fs.appendFileSync(this.outputFile, content);
        } else {
            const stream = this.isStderr ? process.stderr : process.stdout;
            if (newLine) {
                stream.write(message + '\n');
            } else {
                stream.write(message);
            }
        }
    }

    writeError(message, newLine = true) {
        // If this is a stderr handler with redirection, write to file
        if (this.isStderr && this.outputFile) {
            const content = newLine ? message + '\n' : message;
            fs.appendFileSync(this.outputFile, content);
        } else {
            if (newLine) {
                process.stderr.write(message + '\n');
            } else {
                process.stderr.write(message);
            }
        }
    }
}

module.exports = { OutputHandler };