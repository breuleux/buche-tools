
const {EventEmitter} = require('events');
const {div, script, link, style} = require('elementx');


class UnrecognizedCommandError extends Error {
    constructor(m, channel) {
        super(`Unrecognized command: ${m.command}`)
        this.command = m.command;
        this.channel = channel;
        this.messageObject = m;
    }
}


function makeResources(m) {
    const type = m.type;
    if (type === 'direct') {
        let node = div();
        node.innerHTML = m.contents;
        return node.childNodes;
    }
    else if (type === 'script') {
        if (m.source) {
            return [script({src: m.source})]
        }
        else {
            return [script(m.contents)]
        }
    }
    else if (type === 'style') {
        if (m.source) {
            return [link({type: 'text/css', rel: 'stylesheet', href: m.source})];
        }
        else {
            return [style(m.contents)];
        }
    }
    else {
        throw new Error(`Unrecognized resource type: ${type}`);
    }
}


class Channel extends EventEmitter {
    constructor(master, options) {
        super();
        this.master = master;
        this.options = options;
        this.path = this.options.path;
        this.element = this.makeElement();
        this.element.master = this.master;
        this.element.channel = this;
        this.subChannels = [];
        this.resources = [];
        this.setup();
    }

    setup() {
    }

    makeElement() {
        return div();
    }

    interceptedCommands() {
        return [];
    }

    intercepts(message) {
        return false;
    }

    dispatch(m) {
        let command = m.command;
        if (command === 'resource') {
            let resources = makeResources(m);
            for (let res of resources) {
                this.addResource(res);
            }
        }
        // else if (command === 'reprocess') {
        //     jq(m.selector).each(new Function(m.body))
        // }
        else {
            throw new UnrecognizedCommandError(m, this);
        }
    }

    addResource(res) {
        this.resources.push(res);
        this.element.appendChild(res);
        for (let ch of this.subChannels) {
            ch.addResource(res.cloneNode(true));
        }
    }

    registerChannel(subChannel) {
        this.subChannels.push(subChannel);
        for (let res of this.resources) {
            subChannel.addResource(res.cloneNode(true));
        }
    }

    addChannel(subChannel) {
        this.element.appendChild(subChannel.element);
        this.registerChannel(subChannel);
    }

    defaultChannelOptions(options) {
        return {type: 'log'};
    }

    forceChannelOptions() {
        return {};
    }

    openChannel(options) {
        options = Object.assign(
            {},
            this.defaultChannelOptions(options),
            options,
            this.forceChannelOptions(options)
        );
        return this.master.construct(this, options.type, options);
    }

    write(message) {
        const m = Object.assign({}, message, {path: this.sendPath || this.path});
        return this.master.send(m);
    }
}


module.exports = {
    UnrecognizedCommandError: UnrecognizedCommandError,
    makeResources: makeResources,
    Channel: Channel
};
