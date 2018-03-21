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

    let unlockTime = options.lastUnlock;
    let now = Date.now() / 1000;
    if (unlockTime > now) {
        chrome.storage.sync.set({'lastunlock': 0});
        unlockTime = 0;
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
    chrome.storage.sync.set({'lastunlock': 0}, () => {
        chrome.tabs.get(tabId, (tab) => {
            if (tab.active && tab.url && isDiscouraged(tab.url, blacklist)) {
                chrome.tabs.update(tabId, {url: chrome.runtime.getURL('unlock.html') + '?url=' + encodeURIComponent(tab.url)});
            }
        });
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
