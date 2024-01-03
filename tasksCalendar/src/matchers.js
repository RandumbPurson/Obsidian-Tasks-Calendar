/**
 * All exports should be functions that generate additional task 
 * information and have the following structure
 * @param task: A task object such as those returned from dv.pages().file.tasks
 *      The function should in some way modify this task object
 * @param settings: The settings object exposed by dataview "dv.view". Contains
 *      settings and some functionality
 * @returns undefined. All the manipulations to the task object should be done
 *      in-place. 
 */

function momentToRegex(momentFormat) {
    console.log(momentFormat)
	momentFormat = momentFormat.replaceAll(".", "\\.");
	momentFormat = momentFormat.replaceAll(",", "\\,");
	momentFormat = momentFormat.replaceAll("-", "\\-");
	momentFormat = momentFormat.replaceAll(":", "\\:");
	momentFormat = momentFormat.replaceAll(" ", "\\s");
	
	momentFormat = momentFormat.replace("dddd", "\\w{1,}");
	momentFormat = momentFormat.replace("ddd", "\\w{1,3}");
	momentFormat = momentFormat.replace("dd", "\\w{2}");
	momentFormat = momentFormat.replace("d", "\\d{1}");
	
	momentFormat = momentFormat.replace("YYYY", "\\d{4}");
	momentFormat = momentFormat.replace("YY", "\\d{2}");
	
	momentFormat = momentFormat.replace("MMMM", "\\w{1,}");
	momentFormat = momentFormat.replace("MMM", "\\w{3}");
	momentFormat = momentFormat.replace("MM", "\\d{2}");
	
	momentFormat = momentFormat.replace("DDDD", "\\d{3}");
	momentFormat = momentFormat.replace("DDD", "\\d{1,3}");
	momentFormat = momentFormat.replace("DD", "\\d{2}");
	momentFormat = momentFormat.replace("D", "\\d{1,2}");
	
	momentFormat = momentFormat.replace("ww", "\\d{1,2}");
	
	regEx = "/^(" + momentFormat + ")$/";

	return regEx;
};

function getFilename(path) {
	var filename = path.match(/^(?:.*\/)?([^\/]+?|)(?=(?:\.[^\/.]*)?$)/)[1];
	return filename;
};

exports.filename = (task, settings) => {
    task.filename = getFilename(task.path);
}

/** 
 * Helper function to make simple find/replace matchers 
 * @param prop: The property to be set on the task
 * @param pattern: The pattern to find and replace
 * @returns: A function that meets the above requirements
 */

function getDateMatcher(prop, pattern) {
    return (task, settings) => {
        var match = task.text.match(pattern);
        if (match) {
            task[prop] = match[1]; // extract date (2nd capture group) from match (yyyy-mm-dd)
            task.text = task.text.replace(match[0], ""); // remove full match (📅 yyyy-mm-dd) from text
        };
    }
}

exports.due = getDateMatcher("due", /\📅\W(\d{4}\-\d{2}\-\d{2})/) 
exports.start = getDateMatcher("start", /\🛫\W(\d{4}\-\d{2}\-\d{2})/)
exports.scheduled = getDateMatcher("scheduled", /\⏳\W(\d{4}\-\d{2}\-\d{2})/)
exports.completion = getDateMatcher("completion", /\✅\W(\d{4}\-\d{2}\-\d{2})/)

function getPriorityMatcher(token, priority){
    return (task, settings) => {
        var lowMatch = task.text.includes(token);
        if (lowMatch) {
            task.priority = priority;
        };
    }
}

exports.priority = (task, settings) => {
    var high = task.text.includes()
    if (high) task.priority = "A"

    var med = task.text.includes()
    if (med) task.priority = "B"
    

    if (!low && !med && !high) {
        task.priority = "C"
    }

    var low = task.text.includes()
    if (low) task.priority = "D"
}

exports.dailyNote = (task, settings) => {
    var dailyNoteMatch = getFilename(task.path).match(
        eval(momentToRegex(settings.dailyNoteFormat))
    );
    var dailyTaskMatch = task.text.match(/(\d{4}\-\d{2}\-\d{2})/);
    if (dailyNoteMatch) {
        if(!dailyTaskMatch) {
            task.dailyNote = moment(dailyNoteMatch[1], settings.dailyNoteFormat).format("YYYY-MM-DD")
        };
    };
}

exports.recurrence = (task, settings) => {
    var repeatMatch = task.text.includes("🔁");
    if (repeatMatch) {
        task.recurrence = true;
        task.text = task.text.substring(0, task.text.indexOf("🔁"))
    };
}

exports.taskFilter = (task, settings) => {
    if (settings.globalTaskFilter) {
        task.text = task.text.replaceAll(settings.globalTaskFilter, "")
    } else {
        task.text = task.text.replaceAll("#task", "")
    }
}

exports.general = (task, settings) => {
    task.text = task.text.replaceAll("[[","");
    task.text = task.text.replaceAll("]]","");
    task.text = task.text.replace(/\[.*?\]/gm,"");
}
