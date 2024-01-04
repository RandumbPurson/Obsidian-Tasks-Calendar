const Path = require("path");
var quick_import = function(...path) {
    let pathBase = Path.join(this.app.vault.adapter.basePath, "extras", "Obsidian-Tasks-Calendar", "tasksCalendar")
    return require(Path.join(pathBase, Path.join(...path)))
}

function transColor(color, percent) {
	var num = parseInt(color.replace("#",""),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, B = (num >> 8 & 0x00FF) + amt, G = (num & 0x0000FF) + amt;
	return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
};

var taskTemplate = "<a class='internal-link' href='{{path}}'><div class='task {{class}}' style='{{style}}' title='{{title}}'><div class='inner'><div class='note'>{{note}}</div><div class='icon'>{{icon}}</div><div class='description' data-relative='{{relative}}'>{{taskContent}}</div></div></div></a>";

const TASK_KEYS = [
    "text",
    "path", "link",
    "header",

    "completed", "checked", "status",
    "completion", "due", "scheduled",
]
const PARENT_KEYS = [
    "color",
    "textColor",
    "icon"
]

class Task {
    constructor(taskData, settings) {
        for (var key of TASK_KEYS) {this[key] = taskData[key]}
        this.#getMeta(settings)
        this.#getParentMeta(settings)
    }

    #getMeta(settings) {
        var matchers = quick_import("src", "matchers")
        for (var key in matchers) {
            matchers[key](this, settings) 
        }
    };

    #getParentMeta(settings) {
        for (var key of PARENT_KEYS) {
	        var meta = settings.dv.pages('"'+this.path+'"');
            this[key] = meta[key][0]
        }
    }

    /** #TODO
     * Reimplement correct filename/icon concatentation
     * */
    render(cls) {
        var relative = this.due ? moment(this.due).fromNow() : ""
	    if (this.icon) { 
            this.filename = this.icon+"&nbsp;"+this.filename 
        }
        var renderedTask = taskTemplate
        .replace("{{taskContent}}", this.text)
        .replace("{{class}}", cls)
        .replace("{{path}}", this.path)
        .replace("{{due}}","done")
        .replaceAll("{{style}}", this.#getStyle())
        .replace("{{title}}", this.filename + ": " + this.text)
        .replace("{{note}}", this.filename)
        .replace("{{icon}}", this.icon)
        .replace("{{relative}}", relative);
        return renderedTask 
    }

    #getStyle() {
        var lighter = 25;
        var darker = -40;
        if (this.color && this.textColor) {
            var style = "--task-background:"+this.color+"33;--task-color:"+this.color+";--dark-task-text-color:"+this.textColor+";--light-task-text-color:"+this.textColor;
        } else if (this.color && !this.textColor){
            var style = "--task-background:"+this.color+"33;--task-color:"+this.color+";--dark-task-text-color:"+transColor(this.color, darker)+";--light-task-text-color:"+transColor(this.color, lighter);
            var style = "--task-background:"+this.color+"33;--task-color:"+this.color+";--dark-task-text-color:"+transColor(this.color, darker)+";--light-task-text-color:"+transColor(this.color, lighter);
        } else if (!this.color && this.textColor ){
            var style = "--task-background:#7D7D7D33;--task-color:#7D7D7D;--dark-task-text-color:"+transColor(this.textColor, darker)+";--light-task-text-color:"+transColor(this.textColor, lighter);
        } else {
            var style = "--task-background:#7D7D7D33;--task-color:#7D7D7D;--dark-task-text-color:"+transColor("#7D7D7D", darker)+";--light-task-text-color:"+transColor("#7D7D7D", lighter);
        };
        return style;
    }
}

module.exports = Task
