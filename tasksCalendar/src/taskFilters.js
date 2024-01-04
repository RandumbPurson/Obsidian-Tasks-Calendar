/** 
 *  All exports should follow the same structure as outlined below. They will be applyed as filters
 *
 * */

exports.done = (task, date) => { 
    var doneCompletion = task.completed && 
        task.checked && 
        task.completion && 
        moment(task.completion.toString()).isSame(date)
    
    var doneNoCompletion = task.completed &&
        task.checked &&
        !task.completion &&
        task.due &&
        moment(task.due.toString()).isSame(date)
    return doneCompletion || doneNoCompletion
    // .sort(t=>t.completion); 
}

exports.due = (task, date) => {
    return !task.completed &&
        !task.checked &&
        !task.recurrence &&
        task.due &&
        moment(task.due.toString()).isSame(date)
    //.sort(t=>t.due);
}
exports.recurrence = (task, date) => {
    return !task.completed &&
        !task.checked &&
        task.recurrence &&
        task.due &&
        moment(task.due.toString()).isSame(date)
    //.sort(t=>t.due); 
}
exports.overdue = (task, date) => {
    return !task.completed &&
        !task.checked &&
        task.due &&
        moment(task.due.toString()).isBefore(date)
    //.sort(t=>t.due); 
}
exports.start = (task, date) => {
    return !task.completed &&
        !task.checked &&
        task.start &&
        moment(task.start.toString()).isSame(date)
    //.sort(t=>t.start); 
}
exports.scheduled = (task, date) => {
    return !task.completed &&
        !task.checked &&
        task.scheduled &&
        moment(task.scheduled.toString()).isSame(date)
    //.sort(t=>t.scheduled); 
}
exports.process = (task, date) => {
    return !task.completed &&
        !task.checked &&
        task.due &&
        task.start &&
        moment(task.due.toString()).isAfter(date) &&
        moment(task.start.toString()).isBefore(date)
}
exports.cancelled = (task, date) => {
    return !task.completed &&
        task.checked &&
        task.due &&
        moment(task.due.toString()).isSame(date)
    //.sort(t=>t.due); 
}
exports.dailyNote = (task, date) => {
    return !task.completed &&
        !task.checked &&
        task.dailyNote &&
        moment(task.dailyNote.toString()).isSame(date)
    //.sort(t=>t.dailyNote); 
}
