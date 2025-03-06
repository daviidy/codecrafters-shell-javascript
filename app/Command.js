// Command interface
class Command {
    execute(args) {
        throw new Error('Method not implemented');
    }
}

module.exports = { Command }