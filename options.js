async function getOptions() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['blacklist', 'sitetime', 'frictiontime'], (items) => {
            if (!items) {
                resolve({
                    blacklist: ['reddit.com', 'facebook.com', 'twitter.com'],
                    siteTime: 120,
                    frictionTime: 6
                });
                return;
            }
            let blacklist = items.blacklist || ['reddit.com', 'facebook.com', 'twitter.com'];
            if (typeof blacklist === 'string') {
                blacklist = blacklist.split('\n');
            }
            let siteTime = items.sitetime || 120;
            let frictionTime = items.frictiontime || 6;

            resolve({
                blacklist: blacklist,
                siteTime: siteTime,
                frictionTime: frictionTime
            });
        });
    });
}
