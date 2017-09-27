
const {css} = require('./util');


function findChannel(element) {
    let curr = element;
    while (curr && !curr.channel) {
        curr = curr.getRootNode().host;
    }
    return curr && curr.channel;
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
            if (css) {
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
    Custom: Custom,
    CustomShadow: CustomShadow,
    TabData: TabData
}
