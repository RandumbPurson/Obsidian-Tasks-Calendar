var Path = require("path")

var quick_import = function(...path) {
    var pathBase = Path.join(this.app.vault.adapter.basePath, "extras", "Obsidian-Tasks-Calendar", "tasksCalendar")
    return require(Path.join(pathBase, Path.join(...path)))
}

let TaskFilters = quick_import("src", "taskFilters");

class FilterManager {
    #filtered;
    #counts;
    constructor(tasks) {
        this.tasks = tasks
        this.#reset()
    }

    #reset() {
        this.#filtered = {}
        this.#counts = {}
        for (var key of Object.keys(TaskFilters)) {
            this.#filtered[key] = [];
            this.#counts[key] = 0;
        }
    }

    filter(date) {
        this.#reset()
        for (var task of this.tasks) {
            this.#filterTask(task, date)
        }
        return self
    }

    #filterTask(task, date) {
        for (var filter in TaskFilters) {
            let matchesFilter = TaskFilters[filter]
            if (matchesFilter(task, date)) {
                this.#filtered[filter].push(task)
                this.#counts[filter] += 1
            }
        }
    }

    getFiltered() {return this.#filtered}
    getCounts() {return this.#counts}
}

module.exports = FilterManager
