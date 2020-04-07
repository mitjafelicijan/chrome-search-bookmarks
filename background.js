let activeTabId = 0;

const flatten = (obj) => {
  const array = Array.isArray(obj) ? obj : [obj];
  return array.reduce((acc, value) => {
    acc.push(value);
    if (value.children) {
      acc = acc.concat(flatten(value.children));
      delete value.children;
    }
    return acc;
  }, []);
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  activeTabId = tabId;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action == 'search') {
    chrome.bookmarks.getTree((result) => {
      const options = {
        includeScore: true,
        threshold: 0.50,
        distance: 300,
        keys: ['title']
      }

      const fuse = new Fuse(flatten(result), options)
      const matches = fuse.search(message.query)

      chrome.tabs.sendMessage(activeTabId, {
        action: 'search-results',
        originalMessage: message,
        matches: matches
      });
    });
  }
});
