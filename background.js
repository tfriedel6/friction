let timeoutId = null;

chrome.tabs.onUpdated.addListener((tabId, info) => handleURL(tabId, info.url));
chrome.tabs.onActivated.addListener((info) => {
    chrome.tabs.get(info.tabId, (tab) => handleURL(info.tabId, tab.url));
});

async function handleURL(tabId, url) {
    if (!url) {
        return;
    }

    let options = await getOptions();

    if (!isDiscouraged(url, options.blacklist)) {
        return;
    }

    let unlockTime = Number(localStorage.getItem('unlock') || 0);
    let now = Date.now() / 1000;
    if (unlockTime > now) {
        localStorage.removeItem('unlock');
        unlockTime = 0;
    }
    let unlocked = now - unlockTime <= options.siteTime;
    if (unlocked) {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            chrome.tabs.get(tabId, (tab) => {
                if (tab.active && tab.url && isDiscouraged(tab.url, options.blacklist)) {
                    chrome.tabs.update(tabId, {url: chrome.runtime.getURL('unlock.html') + '?url=' + encodeURIComponent(tab.url)});
                }
            });
        }, (options.siteTime - (now - unlockTime)) * 1000);
        return;
    }

    localStorage.removeItem('unlock');
    chrome.tabs.get(tabId, (tab) => {
        if (tab.active) {
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
