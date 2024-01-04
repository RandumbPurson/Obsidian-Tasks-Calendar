const Path = require("path");
var quick_import = function(...path) {
    let pathBase = Path.join(this.app.vault.adapter.basePath, "extras", "Obsidian-Tasks-Calendar", "tasksCalendar")
    return require(Path.join(pathBase, Path.join(...path)))
}

const Task = quick_import("src", "task");

const SETTINGS_KEYS = [
    "pages",
    "view",
    "firstDayOfWeek",
    "globalTaskFilter",
    "dailyNoteFolder",
    "dailyNoteFormat",
    "startPosition",
    "upcomingDays",
    "css",
    "options"
];

class Settings {
    constructor(dv) {
        this.dv = dv;
    }

    /** Check for malformed input from the dv.view call
     * @returns False if an error occured, True otherwise
     * */
    handle_errors() {
        // Error Handling
        if (!this.pages && this.pages!="") { this.dv.span('> [!ERROR] Missing pages parameter\n> \n> Please set the pages parameter like\n> \n> `pages: ""`'); return false };
        if (!this.view) { this.dv.span('> [!ERROR] Missing view parameter\n> \n> Please set a default view inside view parameter like\n> \n> `view: "month"`'); return false };
        if (this.firstDayOfWeek) { 
            if (this.firstDayOfWeek.match(/[|\\0123456]/g) == null) { 
                this.dv.span('> [!ERROR] Wrong value inside firstDayOfWeek parameter\n> \n> Please choose a number between 0 and 6');
                return false
            };
        } else {
            this.dv.span('> [!ERROR] Missing firstDayOfWeek parameter\n> \n> Please set the first day of the week inside firstDayOfWeek parameter like\n> \n> `firstDayOfWeek: "1"`'); 
            return false 
        };
        if (this.dailyNoteFormat) { if (this.dailyNoteFormat.match(/[|\\YMDWwd.,-: \[\]]/g).length != this.dailyNoteFormat.length) { this.dv.span('> [!ERROR] The `dailyNoteFormat` contains invalid characters'); return false }};
        if (this.startPosition) { if (!this.startPosition.match(/\d{4}\-\d{1,2}/gm)) { this.dv.span('> [!ERROR] Wrong startPosition format\n> \n> Please set a startPosition with the following format\n> \n> Month: `YYYY-MM` | Week: `YYYY-ww`'); return false }};
        if (!this.options.includes("style")) { this.dv.span('> [!ERROR] Missing style parameter\n> \n> Please set a style inside options parameter like\n> \n> `options: "style1"`'); return false };
        return true
    }

    load(input) {
        // import all the settings from "input"
        for (var key of SETTINGS_KEYS) {
            this[key] = input[key]
        }

        if (!this.handle_errors()) return false;
        this.#defaults();
        return true
    }

    #defaults() {
        if (!this.dailyNoteFormat) this.dailyNoteFormat = "YYYY-MM-DD";
        this.dailyNoteFolder = (this.dailyNoteFolder)? this.dailyNoteFolder+"/" : "";
    }

    getTasks() {
        // Get, Set, Eval Pages
        if (this.pages == "") {
          var taskData = this.dv.pages().file.tasks;
        } else if (typeof this.pages === "string" && this.pages.startsWith("dv.pages")) {
          var taskData = eval(this.pages);
        } else if (typeof this.pages && this.pages.every(p => p.task)) {
          var taskData = this.pages;
        } else {
          var taskData = this.dv.pages(this.pages).file.tasks;
        }

        var tasks = []
        for (var task of taskData) {
            tasks.push(new Task(task, this))
        }
        return tasks;
    }
}

module.exports = Settings;
