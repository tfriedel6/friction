let timeoutId = null;

chrome.tabs.onUpdated.addListener((tabId, info) => handleTab(tabId, info.url));
chrome.tabs.onActivated.addListener((info) => handleTab(info.tabId));
chrome.windows.onFocusChanged.addListener(() => handleTab());

async function handleTab(tabId, url) {
    if (tabId === undefined || tabId === null) {
        chrome.windows.getCurrent({}, (window) => {
            if (window && window.id !== null && window.id !== undefined) {
                chrome.tabs.query({active: true, windowId: window.id}, (tab) => {
                    if (tab.length !== 1) {
                        return;
                    }
                    tab = tab[0];
                    if (tab && tab.id !== null && tab.id !== undefined && tab.url) {
                        handleTab(tab.id, tab.url)
                    }
                });
            }
        });
        return;
    }

    if (!url) {
        chrome.tabs.get(tabId, (tab) => {
            if (tab && tab.url) {
                handleTab(tabId, tab.url)
            }
        });
        return;
    }

    let options = await getOptions();

    if (!isDiscouraged(url, options.blacklist)) {
        return;
    }

    if (options.schedule) {
        let now = new Date();

        let day = now.getDay();
        if (day == 0) {
            day += 7;
        }
        day--;
        let schedule = options.schedule[day];

        let timeOfDay = now.getHours() * 3600 * 1000;
        timeOfDay += now.getMinutes() * 60 * 1000;

        if (timeOfDay < schedule.from || timeOfDay >= schedule.to) {
            return;
        }
    }

    let unlockTime = options.lastUnlock;
    let now = Date.now() / 1000;
    if (unlockTime > now) {
        chrome.storage.sync.set({'lastunlock': 0});
        unlockTime = 0;
    }

    let midnight = new Date(options.lastUnlock * 1000);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0);
    midnight.setMinutes(0);
    midnight.setSeconds(0);
    midnight.setMilliseconds(0);
    if (new Date(now * 1000) >= midnight) {
        chrome.storage.sync.set({'remainingopens': Object.fromEntries(options.blacklist.map((key, _index) => [key, options.allowedOpens]))});
    }
    
    let unlocked = now - unlockTime <= options.siteTime;
    if (unlocked) {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => handleTab(tabId), (options.siteTime - (now - unlockTime)) * 1000);
        return;
    }

    lockTab(tabId, options.blacklist);
}

function lockTab(tabId, blacklist) {
    chrome.tabs.get(tabId, (tab) => {
        if (tab.active && tab.url && isDiscouraged(tab.url, blacklist)) {
            chrome.tabs.update(tabId, {url: chrome.runtime.getURL('unlock.html') + '?url=' + encodeURIComponent(tab.url)});
        }
    });
}

function isDiscouraged(url, blacklist) {
    let a = document.createElement('a');
    a.href = url;
    let host = a.hostname.toLowerCase();
    for (let i=0; i<blacklist.length; i++) {
        let entry = blacklist[i].trim();
        if (entry == "") {
            continue;
        }
        if (entry.length <= host.length && host.indexOf(entry) === host.length - entry.length) {
            let remaining = host.substring(0, host.length - entry.length);
            if (remaining.length === 0 || remaining[remaining.length-1] === '.') {
                return true;
            }
        }
    }
    return false;
}
