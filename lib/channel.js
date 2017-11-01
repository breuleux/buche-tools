
const {EventEmitter} = require('events');
const {div, script, link, style} = require('elementx');
const {BucheError} = require('./util')


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
            return [link({type: 'text/css',
                          rel: 'stylesheet',
                          href: m.source})];
        }
        else {
            return [style(m.contents)];
        }
    }
    else {
        throw new BucheError(
            `Unrecognized resource type: ${type}`,
            m,
            {fields: ['type']}
        );
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
        let method = this[`dispatch_${command}`];
        if (method) {
            return method.call(this, m);
        }
        else {
            return this.missing_command(m);
        }
    }

    // dispatch_reprocess(m) {
    //     jq(m.selector).each(new Function(m.body))
    // }

    dispatch_resource(m) {
        let resources = makeResources(m);
        for (let res of resources) {
            this.addResource(res);
        }
    }

    missing_command(m) {
        throw new BucheError(
            `Unrecognized command: '${m.command}'`,
            m,
            {channel: this,
             fields: ['command']}
        );
    }

    addResource(res) {
        this.resources.push(res);
        if (this.element.addResource) {
            this.element.addResource(res);
        }
        else {
            this.element.appendChild(res);
        }
        for (let ch of this.subChannels) {
            ch.addResource(res.cloneNode(true));
        }
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
        let ch = this.master.construct(this, options.type, options);
        this.addChannel(ch, options)
        return ch
    }

    addChannel(subChannel, options) {
        this.element.appendChild(subChannel.element);
        this.registerChannel(subChannel);
    }

    registerChannel(subChannel) {
        this.subChannels.push(subChannel);
        for (let res of this.resources) {
            subChannel.addResource(res.cloneNode(true));
        }
    }

    write(message) {
        const m = Object.assign(
            {},
            message,
            {path: this.sendPath || this.path}
        );
        return this.master.send(m);
    }
}


module.exports = {
    makeResources: makeResources,
    Channel: Channel
};

