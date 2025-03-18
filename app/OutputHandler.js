const fs = require('fs');
const path = require('path');
const { stderr } = require('process');

class OutputHandler {
    constructor(outputFile = null, isStderr = false, append = false) {
        this.outputFile = outputFile;
        this.isStderr = isStderr;
        this.append = append;

        // Create directory and prepare file if needed
        if (outputFile) {
            const dir = path.dirname(outputFile);
            console.log('OutputHandler', stderr, append);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            // Clear file if not appending
            if (!append) {
                fs.writeFileSync(outputFile, '');
            }
        }
    }

    write(message, newLine = true) {
        if (this.outputFile) {
            const content = newLine ? message + '\n' : message;
            fs.appendFileSync(this.outputFile, content); // Always append
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