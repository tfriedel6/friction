let countdown;
let running = true;
let query;
let timeout;
let remainingOpens;
let host;

async function init() {
    let options = await getOptions();
    countdown = options.frictionTime;
    remainingOpens = options.remainingOpens;

    query = parseQuery(window.location.search);
    
    let a = document.createElement('a');
    a.href = query.url;
    host = a.hostname.toLowerCase();
    for (let i=0; i<options.blacklist.length; i++) {
        let entry = options.blacklist[i].trim();
        if (entry == "") {
            continue;
        }
        if (entry.length <= host.length && host.indexOf(entry) === host.length - entry.length) {
            let remaining = host.substring(0, host.length - entry.length);
            if (remaining.length === 0 || remaining[remaining.length-1] === '.') {
                host = entry;
                break;
            }
        }
    }
    
    document.getElementById('url').innerText = query.url;
    document.getElementById('unlockbutton').addEventListener('click', () => unlock());
    document.getElementById('unlockbutton').disabled = true;
    if (options.allowedOpens >= 0) {
        document.getElementById('remaining').innerText = `Used: ${options.allowedOpens - remainingOpens[host]}/${options.allowedOpens}`;
    }
    if (remainingOpens[host] > 0 || options.allowedOpens < 0) {
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
    remainingOpens[host] -= 1;
    chrome.storage.sync.set({'lastunlock': Date.now() / 1000, 'remainingopens': remainingOpens}, () => {
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
