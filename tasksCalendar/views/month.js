
var cellTemplate = "<div class='cell {{class}}' data-weekday='{{weekday}}'><a class='internal-link cellName' href='{{dailyNote}}'>{{cellName}}</a><div class='cellContent'>{{cellContent}}</div></div>";

class MonthView {
    constructor(calendar) {
        this.calendar = calendar
        this.dv = this.calendar.dv
    }
    #reset() {
        this.calendar.removeView() 
    }
    #gridHeaders(month) {
        var firstDayOfMonth = moment(month).format("d");
        var gridHeads = "";
        for (
            var h=0-firstDayOfMonth+parseInt(this.calendar.settings.firstDayOfWeek);
            h<7-firstDayOfMonth+parseInt(this.calendar.settings.firstDayOfWeek);
            h++
        ) {
            var weekDayNr = moment(month).add(h, "days").format("d");
            var weekDayName = moment(month).add(h, "days").format("ddd");
            if ( 
                this.calendar.now.day == weekDayNr &&
                this.calendar.now.month == moment(month).format("M") &&
                this.calendar.now.year == moment(month).format("YYYY") 
            ) {
                gridHeads += "<div class='gridHead today' data-weekday='" + weekDayNr + "'>" + weekDayName + "</div>";
            } else {
                gridHeads += "<div class='gridHead' data-weekday='" + weekDayNr + "'>" + weekDayName + "</div>";
            };
        };
        return gridHeads;
    }

    getMonth(month) {
        this.#reset()
        var currentTitle = "<span>"+moment(month).format("MMMM")+"</span><span> "+moment(month).format("YYYY")+"</span>";
        this.calendar.root.querySelector('buttons.current').innerHTML = currentTitle;
        var gridContent = "";
        var firstDayOfMonth = moment(month).format("d");
        var firstDateOfMonth = moment(month).startOf("month").format("D");
        var lastDateOfMonth = moment(month).endOf("month").format("D");
        var monthName = moment(month).format("MMM").replace(".","").substring(0,3);

        // taskManager.getCounts()
        var dueCounter = 0;
        var doneCounter = 0;
        var overdueCounter = 0;
        var startCounter = 0;
        var scheduledCounter = 0;
        var recurrenceCounter = 0;
        var dailyNoteCounter = 0;
        
        // Move First Week Of Month To Second Week In Month View
        if (firstDayOfMonth == 0) { firstDayOfMonth = 7};
        
        // Set Grid Heads
        var gridHeads = this.#gridHeaders(month)
        
        // Set Wrappers
        var wrappers = this.#wrappers(month)
        gridContent += "<div class='gridHeads'><div class='gridHead'></div>"+gridHeads+"</div>";
        gridContent += "<div class='wrappers' data-month='"+monthName+"'>"+wrappers+"</div>";

        this.calendar.root.querySelector("span").appendChild(this.dv.el("div", gridContent, {cls: "grid"}));
        this.#setWrapperEvents();
        //setStatisticValues(dueCounter, doneCounter, overdueCounter, startCounter, scheduledCounter, recurrenceCounter, dailyNoteCounter);
        this.calendar.root.setAttribute("view", "month");
    }

    #wrappers(month) {
        var firstDayOfMonth = moment(month).format("d");
	    var lastDateOfMonth = moment(month).endOf("month").format("D");
        var wrappers = "";
        var starts = 0-firstDayOfMonth+parseInt(this.calendar.settings.firstDayOfWeek);
        for (var w=1; w<7; w++) {
            var wrapper = "";
            var weekNr = "";
            var yearNr = "";
            for (var i=starts;i<starts+7;i++) {
                if (i==starts) {
                    weekNr = moment(month).add(i, "days").format("w");
                    yearNr = moment(month).add(i, "days").format("YYYY");
                };
                var currentDate = moment(month).add(i, "days").format("YYYY-MM-DD");
                var dailyNotePath = this.calendar.settings.dailyNoteFolder+currentDate
                var weekDay = moment(month).add(i, "days").format("d");
                var shortDayName = moment(month).add(i, "days").format("D");
                var longDayName = moment(month).add(i, "days").format("D. MMM");
                var shortWeekday = moment(month).add(i, "days").format("ddd");

                // Filter Tasks
                this.calendar.tasks.filter(currentDate)
                
                // Count Events Only From Selected Month
                // if (moment(month).format("MM") == moment(month).add(i, "days").format("MM")) {
                //     dueCounter += due.length;
                //     dueCounter += recurrence.length;
                //     dueCounter += scheduled.length;
                //     dueCounter += dailyNote.length;
                //     doneCounter += done.length;
                //     startCounter += start.length;
                //     scheduledCounter += scheduled.length;
                //     recurrenceCounter += recurrence.length;
                //     dailyNoteCounter += dailyNote.length;
                //     // Get Overdue Count From Today
                //     if (moment().format("YYYY-MM-DD") == moment(month).add(i, "days").format("YYYY-MM-DD")) {
                //         overdueCounter = overdue.length;
                //     };
                // };
                
                // Set New Content Container
                var cellContent = this.calendar.getCellContent(currentDate);
            
                // Set Cell Name And Weekday
                if ( moment(month).add(i, "days").format("D") == 1 ) {
                    var cell = cellTemplate
                        .replace("{{date}}", currentDate)
                        .replace("{{cellName}}", longDayName)
                        .replace("{{cellContent}}", cellContent)
                        .replace("{{weekday}}", weekDay)
                        .replace("{{dailyNote}}", dailyNotePath);
                    cell = cell.replace("{{class}}", "{{class}} newMonth");
                } else {
                    var cell = cellTemplate
                        .replace("{{date}}", currentDate)
                        .replace("{{cellName}}", shortDayName)
                        .replace("{{cellContent}}", cellContent)
                        .replace("{{weekday}}", weekDay)
                        .replace("{{dailyNote}}", dailyNotePath);
                };
            
                // Set prevMonth, currentMonth, nextMonth
                if (i < 0) {
                    cell = cell.replace("{{class}}", "prevMonth");
                } else if (i >= 0 && i < lastDateOfMonth && this.calendar.now.date !== currentDate) {
                    cell = cell.replace("{{class}}", "currentMonth");
                } else if ( i >= 0 && i< lastDateOfMonth && this.calendar.now.date == currentDate) {
                    cell = cell.replace("{{class}}", "currentMonth today");
                } else if (i >= lastDateOfMonth) {
                    cell = cell.replace("{{class}}", "nextMonth");
                };
                wrapper += cell;
            };
            wrappers += "<div class='wrapper'>"+
                "<div class='wrapperButton' data-week='"+weekNr+"' data-year='"+yearNr+"'>"+
                    "W"+weekNr+
            "</div>"+wrapper+"</div>";
            starts += 7;
        };
        return wrappers
    }

    #setWrapperEvents() {
        this.calendar.root.querySelectorAll('.wrapperButton').forEach(
        wBtn => wBtn.addEventListener('click', (() => {
            var week = wBtn.getAttribute("data-week");
            var year = wBtn.getAttribute("data-year");
            this.calendar.selectedDate = moment(moment(year).add(week, "weeks")).startOf("week");
            this.calendar.root.querySelector(`#tasksCalendar${this.calendar.now.tid} .grid`).remove();
            getWeek(tasks, selectedDate);
        })));
    };
}

module.exports = MonthView
