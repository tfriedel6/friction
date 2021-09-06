let blacklistInput, siteTimeInput, frictionTimeInput;
let scheduleEnabledInput, scheduleFromInput, scheduleToInput;
let savedTimeout;

async function init() {
    let options = await getOptions();
    blacklistInput = document.getElementById('blacklist');
    blacklistInput.value = options.blacklist.join('\n');
    blacklistInput.addEventListener('change', () => save());
    blacklistInput.addEventListener('blur', () => save());
    siteTimeInput = document.getElementById('sitetime');
    siteTimeInput.value = options.siteTime;
    siteTimeInput.addEventListener('change', () => save());
    siteTimeInput.addEventListener('blur', () => save());
    frictionTimeInput = document.getElementById('frictiontime');
    frictionTimeInput.value = options.frictionTime;
    frictionTimeInput.addEventListener('change', () => save());
    frictionTimeInput.addEventListener('blur', () => save());
    scheduleEnabledInput = document.getElementById('scheduleenabled');
    scheduleEnabledInput.checked = options.schedule != null;
    scheduleEnabledInput.addEventListener('change', () => save());
    scheduleEnabledInput.addEventListener('blur', () => save());
    scheduleFromInput = document.getElementById('schedulefromtime');
    scheduleFromInput.addEventListener('change', () => save());
    scheduleFromInput.addEventListener('blur', () => save());
    scheduleToInput = document.getElementById('scheduletotime');
    scheduleToInput.addEventListener('change', () => save());
    scheduleToInput.addEventListener('blur', () => save());
    if (options.schedule) {
        scheduleFromInput.valueAsNumber = options.schedule[0].from;
        scheduleToInput.valueAsNumber = options.schedule[0].to;
    }
}

function save() {
    let schedule = null;
    if (scheduleEnabledInput.checked) {
        let from = scheduleFromInput.valueAsNumber;
        let to = scheduleToInput.valueAsNumber;
        schedule = [
            {from: from, to: to},
            {from: from, to: to},
            {from: from, to: to},
            {from: from, to: to},
            {from: from, to: to},
            {from: from, to: to},
            {from: from, to: to},
        ];
    }
    chrome.storage.sync.set({
        'blacklist': blacklistInput.value,
        'sitetime': siteTimeInput.value,
        'frictiontime': frictionTimeInput.value,
        'schedule': schedule
    }, () => showSavedMessage());
}

function showSavedMessage() {
    if (savedTimeout) {
        clearTimeout(savedTimeout);
    }
    document.getElementById('saved').style.display = 'block';
    savedTimeout = setTimeout(() => {
        document.getElementById('saved').style.display = 'none';
    }, 1000);
}

window.onload = () => init();
