const fs = require('fs');
const path = require('path');

class OutputHandler {
    constructor(outputFile = null, isStderr = false, append = false) {
        this.outputFile = outputFile;
        this.isStderr = isStderr;
        this.append = append;

        if (outputFile && !append) {
            const dir = path.dirname(outputFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(outputFile, '');
        }
    }

    write(message, newLine = true) {
        if (this.outputFile) {
            try {
                // Create directory structure only when there's actual output to write
                const dir = path.dirname(this.outputFile);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                
                const content = newLine ? message + '\n' : message;
                fs.appendFileSync(this.outputFile, content);
            } catch (error) {
                // Fall back to console
                process.stdout.write(newLine ? message + '\n' : message);
            }
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