
const decamelize = require('decamelize');
const {style} = require('elementx');


function css(sheet) {
    let rval = [];
    for (sel in sheet) {
        let sty = sheet[sel];
        let converted = [];
        for (prop in sty) {
            let value = sty[prop];
            let prop2 = decamelize(prop, '-');
            let line = `${prop2}: ${value};`
            converted.push(line);
        }
        rval.push(`${sel} {\n  ${converted.join("\n  ")}\n}`);
    }
    if (rval.length > 0) {
        return style(rval.join('\n'));
    }
    else {
        return null;
    }
}


class BucheError extends Error {
    constructor(message, data, others) {
        super(message);
        this.data = data;
        Object.assign(this, others)
        if (!this.fields) {
            this.fields = [];
        }
    }
}


module.exports = {
    css: css,
    BucheError: BucheError
}
