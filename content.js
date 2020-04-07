const searchString = document.querySelector('input[name="q"]');
const googleResultsPanel = document.querySelector('#center_col');
const resultsPanelHeading = document.createElement('h3');
const resultsPanelPlaceholder = document.createElement('div');
const resultsPanel = document.createElement('div');

const styles = `
.bookmark-search-results {
  padding-bottom: 20px !important;
}

.bookmark-search-results h3 {
  font-size: 20px !important;
  line-height: 1.3 !important;
  padding-bottom: 15px !important;
}

.bookmark-search-results .round-borders {
  border: 1px solid #dfe1e5 !important;
  border-radius: 10px !important;
}

.bookmark-search-results a {
  display: block !important;
  font-size: 16px !important;
  border-bottom: 1px solid #dfe1e5 !important;
  padding: 15px !important;
  text-decoration: none !important;
}

.bookmark-search-results a div {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.bookmark-search-results a:last-child {
  border-bottom: 0 !important;
}

.bookmark-search-results a cite {
  display: block !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  font-size: 12px !important;
  text-decoration: none !important;
}

.bookmark-search-results a:hover {
  text-decoration: none !important;
}

.bookmark-search-results a:hover div {
  text-decoration: underline !important;
}

.bookmark-search-results a:hover cite {
  text-decoration: none !important;
}
`;

// sending message to background to get results
if (window.location.hostname.includes('google')) {
  try {
    chrome.runtime.sendMessage({
      action: 'search',
      query: searchString.value,
    });

  } catch (error) { }
}

// recieving message back
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action == 'search-results') {

    let matches = message.matches;
    console.log('all matches from your bookmarks:', message.matches);

    const css = document.createElement('style');
    css.type = 'text/css';
    css.appendChild(document.createTextNode(styles));
    document.getElementsByTagName('head')[0].appendChild(css);

    let maxResults = 5;

    matches.forEach(match => {
      if (match.item.url && maxResults > 0) {
        const itemLink = document.createElement('a');
        itemLink.href = match.item.url;
        itemLink.target = '_blank';

        const itemLinkTitle = document.createElement('div');
        itemLinkTitle.innerText = match.item.title;

        const itemLinkCite = document.createElement('cite');
        itemLinkCite.innerText = match.item.url;

        itemLink.append(itemLinkTitle);
        itemLink.append(itemLinkCite);
        resultsPanelPlaceholder.prepend(itemLink);

        maxResults--;
      }
    });

    resultsPanelHeading.innerText = 'Results from your bookmarks';
    resultsPanel.append(resultsPanelHeading);
    resultsPanel.append(resultsPanelPlaceholder);

    resultsPanelPlaceholder.classList.add('round-borders')
    resultsPanel.classList.add('bookmark-search-results');

    if (matches.length > 0) {
      googleResultsPanel.prepend(resultsPanel);
    }
  }
});
