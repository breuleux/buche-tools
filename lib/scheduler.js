
const {BucheError} = require('./util');
const {EventEmitter} = require('events');


class Scheduler extends EventEmitter {
    constructor(channel) {
        super();
        this.channel = channel;
        this.master = channel.master;
        this.hasWork = false;
    }

    declareWork(priority) {
        if (!this.hasWork) {
            this.hasWork = true;
            this.emit('has-work', true, priority);
        }
    }

    declareDone() {
        if (this.hasWork) {
            this.hasWork = false;
            this.emit('has-work', false, null);
        }
    }
}


class TrivialScheduler extends Scheduler {
    constructor(channel) {
        super(channel);
        this.messages = [];
    }

    schedule(message) {
        this.messages.push(message);
        this.declareWork(null);
    }

    work() {
        if (this.messages.length > 0) {
            let message = this.messages.shift();
            try {
                this.channel.dispatch(message);
            }
            catch (e) {
                throw new BucheError(e.message, message, {origError: e});
            }
            finally {
                if (this.messages.length == 0) {
                    this.declareDone();
                }
                else {
                    this.declareWork(null);
                }
            }
        }
    }
}


module.exports = {
    Scheduler: Scheduler,
    TrivialScheduler: TrivialScheduler
}
