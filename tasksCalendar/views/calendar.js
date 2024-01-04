var Path = require("path")
var quick_import = function(...path) {
    var pathBase = Path.join(this.app.vault.adapter.basePath, "extras", "Obsidian-Tasks-Calendar", "tasksCalendar")
    return require(Path.join(pathBase, Path.join(...path)))
}

var Icons = quick_import("resources", "icons")

function compareFn(a, b) {
    if (a.priority.toUpperCase() < b.priority.toUpperCase()) {
        return -1;
    };
    if (a.priority.toUpperCase() > b.priority.toUpperCase()) {
        return 1;
    };
    if (a.priority == b.priority) {
        if (a.text.toUpperCase() < b.text.toUpperCase()) {
            return -1;
        };
        if (a.text.toUpperCase() > b.text.toUpperCase()) {
            return 1;
        };
        return 0;
    };
};

function capitalize(str) {
	return str[0].toUpperCase() + str.slice(1);
};

class Calendar {
    constructor(filterManager, settings) {
        this.dv = settings.dv
        this.tasks = filterManager
        this.settings = settings
        this.now = {
            raw: moment(),
            tid: moment().toDate().getTime(),
            date: moment().format("YYYY-MM-DD"),
            day: moment().format("d"),
            month: moment().format("M"),
            year: moment().format("YYYY")
        }

        this.root = this.dv.el("div", "", {
            cls: "tasksCalendar "+this.settings.options, 
            attr: {
                id: "tasksCalendar"+this.now.tid,
                view: this.settings.view,
                style: 'position:relative;-webkit-user-select:none!important'
            }
        });
        this.buttons = document.createElement("div")
        var selectedMonth = moment(this.settings.startPosition, "YYYY-MM").date(1);
        var selectedList = moment(this.settings.startPosition, "YYYY-MM").date(1);
        var selectedWeek = moment(this.settings.startPosition, "YYYY-ww").startOf("week")
        this.selectedDate = eval("selected"+capitalize(this.settings.view));
        this.activeView = settings.view
        this.setButtons()
    }
    getCellContent(currentDate) {
        var content = ""
        function showTasks(tasksToShow, type) {
            const sorted = [...tasksToShow].sort(compareFn);
            for (var task of sorted) {
                content += task.render(type)
            };
        };

        var tasks = this.tasks.getFiltered()

        if (this.now.date == currentDate) {
            showTasks(tasks.overdue, "overdue");
        };
        showTasks(tasks.due, "due");
        showTasks(tasks.recurrence, "recurrence");
        showTasks(tasks.start, "start");
        showTasks(tasks.scheduled, "scheduled");
        showTasks(tasks.process, "process");
        showTasks(tasks.dailyNote, "dailyNote");
        showTasks(tasks.done, "done");
        showTasks(tasks.cancelled, "cancelled");
        return content
    };
    setButtons() {
        // var buttons = 
        //     // "<button class='filter'>"+icons.filterIcon+"</button>"+
        //     "<button class='listView' title='List'>"+icons.listIcon+"</button>"+
        //     "<button class='monthView' title='Month'>"+icons.monthIcon+"</button>"+
        //     "<button class='weekView' title='Week'>"+icons.weekIcon+"</button>"+
        //     "<button class='current'></button>"+
        //     "<button class='previous'>"+icons.arrowLeftIcon+"</button>"+
        //     "<button class='next'>"+icons.arrowRightIcon+"</button>"+
        //     "<button class='statistic' percentage=''></button>";
        // this.root.querySelector("span").appendChild(
        //     this.dv.el("div", buttons, {cls: "buttons", attr: {}})
        // );
        // setButtonEvents();
        this.addButton(
            Icons.filterIcon, {cls: "filter"}, 
        () => {
			this.root.classList.toggle("filter");
			this.root.querySelector('#statisticDone').classList.remove("active");
			this.root.classList.remove("focusDone");
        })
        this.addButton(
            Icons.listIcon, {cls: "listView", title: "List"}, 
        () => {
			if ( moment().format("ww-YYYY") == moment(this.selectedDate).format("ww-YYYY") ) {
				this.selectedDate = moment().date(1);
			} else {
				this.selectedDate = moment(this.selectedDate).date(1);
			};
			getList(this.tasks, this.selectedDate);
        })
        this.addButton(
            Icons.monthIcon, {cls: "monthView", title: "Month"}, 
        () => {
			if ( moment().format("ww-YYYY") == moment(this.selectedDate).format("ww-YYYY") ) {
				this.selectedDate = moment().date(1);
			} else {
				this.selectedDate = moment(this.selectedDate).date(1);
			};
			getMonth(this.tasks, this.selectedDate);
        })
        this.addButton(
            Icons.weekIcon,  {cls: "weekView", title: "Week"}, 
        () => {
			if (this.root.getAttribute("view") == "week") {
				var leftPos = this.root.querySelector("button.weekView").offsetLeft;
				this.root.querySelector(".weekViewContext").style.left = leftPos+"px";
				this.root.querySelector(".weekViewContext").classList.toggle("active");
				if (this.root.querySelector(".weekViewContext").classList.contains("active")) {
					var closeContextListener = function() {
						this.root.querySelector(".weekViewContext").classList.remove("active");
						this.root.removeEventListener("click", closeContextListener, false);
					};
					setTimeout(function() {
						this.root.addEventListener("click", closeContextListener, false);
					}, 100);
				};
			} else {
				if (moment().format("MM-YYYY") != moment(this.selectedDate).format("MM-YYYY")) {
					this.selectedDate = moment(this.selectedDate).startOf("month").startOf("week");
				} else {
					this.selectedDate = moment().startOf("week");
				};
				getWeek(this.tasks, this.selectedDate);
			};
        })
        this.addButton(
            "", {cls: "current"}, 
        () => {
			if (this.activeView == "month") {
				this.selectedDate = moment().date(1);
				getMonth(this.tasks, this.selectedDate);
			} else if (this.activeView == "week") {
				this.selectedDate = moment().startOf("week");
				getWeek(this.tasks, this.selectedDate);
			} else if (this.activeView == "list") {
				this.selectedDate = moment().date(1);
				getList(this.tasks, this.selectedDate);
			};
        })
        this.addButton(
            Icons.arrowLeftIcon, {cls: "previous"},
        () => {
			if (this.activeView == "month") {
				this.selectedDate = moment(this.selectedDate).subtract(1, "months");
				getMonth(this.tasks, this.selectedDate);
			} else if (this.activeView == "week") {
				this.selectedDate = moment(this.selectedDate).subtract(7, "days").startOf("week");
				getWeek(this.tasks, this.selectedDate);
			} else if (this.activeView == "list") {
				this.selectedDate = moment(this.selectedDate).subtract(1, "months");
				getList(this.tasks, this.selectedDate);
			}
        })
        this.addButton(
            Icons.arrowRightIcon, {cls: "next"},
        () => {
			if (this.activeView == "month") {
				this.selectedDate = moment(this.selectedDate).add(1, "months");
				getMonth(this.tasks, this.selectedDate);
			} else if (this.activeView == "week") {
				this.selectedDate = moment(this.selectedDate).add(7, "days").startOf("week");
				getWeek(this.tasks, this.selectedDate);
			} else if (this.activeView == "list") {
				this.selectedDate = moment(this.selectedDate).add(1, "months");
				getList(this.tasks, this.selectedDate);
			};
        })
        
        this.root.querySelector("span").appendChild(this.buttons)
    }
    addButton(text, properties, onClick=undefined) {
        var button = document.createElement("buttons")
        button.innerHTML = text;

        // Add properties
        for (var attr in properties) {
            if(attr == "cls") {
                button.className = properties[attr];
                continue;
            }
            button.setAttribute(attr, properties[attr])
        }

        if (onClick) {
            button.addEventListener("click", onClick.bind(this))
        }
        this.buttons.appendChild(button)
    }

    removeView() {
        if (this.root.querySelector(`#tasksCalendar${this.now.tid} .grid`)) {
            this.root.querySelector(`#tasksCalendar${this.now.tid} .grid`).remove();
        } else if (this.root.querySelector(`#tasksCalendar${this.now.tid} .list`)) {
            this.root.querySelector(`#tasksCalendar${this.now.tid} .list`).remove();
        };
    }
}


module.exports = Calendar
