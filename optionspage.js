let blacklistInput, siteTimeInput, frictionTimeInput, allowedOpensInput;
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
    allowedOpensInput = document.getElementById('allowedopens');
    allowedOpensInput.value = options.allowedOpens;
    allowedOpensInput.addEventListener('change', () => save());
    allowedOpensInput.addEventListener('blur', () => save());
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

async function save() {
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
    let options = await getOptions();
    let remainingOpens;
    if (allowedOpensInput.value !== options.allowedOpens) {
        remainingOpens = Object.fromEntries(Object.entries(options.remainingOpens).map((item, index) => [item[0], allowedOpensInput.value]));
    } else {
        remainingOpens = options.remainingOpens;
    }
    
    chrome.storage.sync.set({
        'blacklist': blacklistInput.value,
        'sitetime': siteTimeInput.value,
        'frictiontime': frictionTimeInput.value,
        'allowedopens': allowedOpensInput.value,
        'remainingopens': remainingOpens,
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
