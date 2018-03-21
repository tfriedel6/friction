let countdown;
let running = true;
let query;
let timeout;

async function init() {
    let options = await getOptions();
    countdown = options.frictionTime;

    query = parseQuery(window.location.search);
    document.getElementById('url').innerText = query.url;
    document.getElementById('unlockbutton').addEventListener('click', () => unlock());
    document.getElementById('unlockbutton').disabled = true;
    document.getElementById('countdown').innerText = '' + countdown;
    window.addEventListener('blur', () => {
        countdown = options.frictionTime;
        document.getElementById('countdown').innerText = '' + countdown;
        document.getElementById('unlockbutton').disabled = true;
        running = false;
    });
    window.addEventListener('focus', () => {
        running = true;
        countdown = options.frictionTime;
        clearTimeout(timeout);
        timeout = setTimeout(() => doCountdown(), 1000);
    });
    timeout = setTimeout(() => doCountdown(), 1000);
}

async function doCountdown() {
    if (!running) {
        let options = await getOptions();
        countdown = options.frictionTime;
        document.getElementById('countdown').innerText = '' + countdown;
        document.getElementById('unlockbutton').disabled = true;
        return;
    }
    countdown--;
    if (countdown <= 0) {
        document.getElementById('countdown').innerText = '0';
        document.getElementById('unlockbutton').disabled = false;
    } else {
        document.getElementById('countdown').innerText = '' + countdown;
        setTimeout(() => doCountdown(), 1000);
    }
}

function unlock() {
    chrome.storage.sync.set({'lastunlock': Date.now() / 1000}, () => {
        getOptions().then((options) => {
            window.location = query.url;
        });
    });
}

function parseQuery(search) {
    let vars = search.substring(1).split('&');
    let result = {};
    for (let i=0; i<vars.length; i++) {
        let pair = vars[i].split('=');
        result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return result;
}

window.onload = () => init();
