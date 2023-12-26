async function getOptions() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['blacklist', 'sitetime', 'frictiontime', 'allowedopens', 'remainingopens', 'lastunlock', 'schedule'], (items) => {
            if (!items) {
                let defaults = ['reddit.com', 'facebook.com', 'twitter.com'];
                resolve({
                    blacklist: defaults,
                    siteTime: 1,
                    frictionTime: 6,
                    allowedOpens: -1,
                    remainingOpens: Object.fromEntries(defaults.map((key, _index) => [key, 0]))
                });
                return;
            }
            let blacklist = items.blacklist || ['reddit.com', 'facebook.com', 'twitter.com'];
            if (typeof blacklist === 'string') {
                blacklist = blacklist.split('\n');
            }
            let siteTime = items.sitetime || 120;
            let frictionTime = items.frictiontime || 6;
            let allowedOpens = items.allowedopens || -1;
            let remainingOpens = items.remainingopens || Object.fromEntries(blacklist.map((key, _index) => [key, 0]));
            let lastUnlock = items.lastunlock || 0;
            let schedule = items.schedule || null;

            resolve({
                blacklist: blacklist,
                siteTime: siteTime,
                frictionTime: frictionTime,
                allowedOpens: allowedOpens,
                remainingOpens: remainingOpens,
                lastUnlock: lastUnlock,
                schedule: schedule,
            });
        });
    });
}
