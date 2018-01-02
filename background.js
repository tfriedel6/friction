let timeoutId = null;

chrome.tabs.onUpdated.addListener((tabId, info) => handleTab(tabId, info.url));
chrome.tabs.onActivated.addListener((info) => handleTab(info.tabId));

async function handleTab(tabId, url) {
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
        timeoutId = setTimeout(() => handleTab(tabId), (options.siteTime - (now - unlockTime)) * 1000);
        return;
    }

    lockTab(tabId, options.blacklist);
}

function lockTab(tabId, blacklist) {
    localStorage.removeItem('unlock');
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
