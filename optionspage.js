let blacklistInput, siteTimeInput, frictionTimeInput;
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
}

function save() {
    chrome.storage.sync.set({
        'blacklist': blacklistInput.value,
        'sitetime': siteTimeInput.value,
        'frictiontime': frictionTimeInput.value
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
