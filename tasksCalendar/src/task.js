const Path = require("path");
var quick_import = function(...path) {
    let pathBase = Path.join(this.app.vault.adapter.basePath, "extras", "Obsidian-Tasks-Calendar", "tasksCalendar")
    return require(Path.join(pathBase, Path.join(...path)))
}

const TASK_KEYS = [
    "text",
    "path",
    "status",
    "link",
    "header"
]

class Task {
    constructor(taskData, settings) {
        for (var key of TASK_KEYS) {this[key] = taskData[key]}
        this.#getMeta(settings)
    }

    #getMeta(settings) {
        var matchers = quick_import("src", "matchers")
        for (var key in matchers) {
            matchers[key](this, settings) 
        }
    };
}

module.exports = Task
