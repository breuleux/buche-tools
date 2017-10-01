
const {css} = require('./util');


function findChannel(element) {
    let curr = element;
    while (curr && !curr.channel) {
        curr = curr.getRootNode().host;
    }
    return curr && curr.channel;
}


class BucheElement extends HTMLElement {
    requiresShadow() {
        return false;
    }

    createdCallback() {
        if (this.requiresShadow()) {
            this.targetElement = this.attachShadow({mode: 'open'});
        }
    }

    attachedCallback() {
        if (!this.hasSetup) {
            this.hasSetup = true;
            this.setup();
            let children = [].slice.call(this.childNodes, 0);
            this.innerHTML = "";
            let tpl = this.template(children);
            if (!Array.isArray(tpl)) {
                tpl = [tpl];
            }
            for (let t of tpl) {
                this.appendChildInitial(t);
            }
            let styles = this.css();
            if (styles) {
                if (!Array.isArray(styles)) {
                    styles = [styles];
                }
                for (let style of styles) {
                    style = css(style);
                    if (style) {
                        this.addResource(style);
                    }
                }
            }
            this.setupEnd();
        }
    }

    getChannel() {
        return findChannel(this);
    }

    setup() {
    }

    setupEnd() {
    }

    template(children) {
        return children;
    }

    css() {
        return null;
    }

    appendChild(elem) {
        if (this.targetElement) {
            this.targetElement.appendChild(elem);
        }
        else {
            super.appendChild(elem);
        }
    }

    appendChildInitial(elem) {
        if (this.shadowRoot) {
            this.shadowRoot.appendChild(elem);
        }
        else {
            super.appendChild(elem);
        }
    }

    addResource(res) {
        this.appendChildInitial(res);
    }
}


class Custom extends HTMLElement {
    attachedCallback() {
        if (!this.hasSetup) {
            this.hasSetup = true;
            this.setup();
            let children = [].slice.call(this.childNodes, 0);
            this.innerHTML = "";
            let tpl = this.template(children);
            if (!Array.isArray(tpl)) {
                tpl = [tpl];
            }
            for (let t of tpl) {
                this.appendChildInitial(t);
            }
            let style = css(this.css());
            if (style) {
                this.appendChildInitial(style);
            }
        }
    }

    getChannel() {
        return findChannel(this);
    }

    setup() {
    }

    template(children) {
        return children;
    }

    css() {
        return {};
    }

    appendChildInitial(child) {
        this.appendChild(child);
    }
}


class CustomShadow extends Custom {
    attachedCallback() {
        if (!this.shadow) {
            this.shadow = this.attachShadow({mode: 'open'});
            super.attachedCallback();
        }
    }

    appendChildInitial(elem) {
        this.shadow.appendChild(elem);
    }

    appendChild(elem) {
        this.shadow.appendChild(elem);
    }

    addResource(res) {
        this.shadow.appendChild(res);
    }
}


class TabData {
    constructor(tabbedView) {
        this.tabbedView = tabbedView;
    }

    activate() {
        this.tab.classList.add('active');
        this.pane.classList.add('active');
        this.active = true;
        this.tabbedView.active.push(this);
    }

    deactivate() {
        this.tab.classList.remove('active');
        this.pane.classList.remove('active');
        this.active = false;
        this.tabbedView.active = this.tabbedView.active.filter(a => a !== this);
    }
}


module.exports = {
    findChannel: findChannel,
    BucheElement: BucheElement,
    Custom: Custom,
    CustomShadow: CustomShadow,
    TabData: TabData
}
