// Global variable to store the MutationObserver instance
let observer = null;
let dynamicEnabled = false;

// Check if the extension is enabled for the current site
chrome.storage.sync.get(['colorMap', 'enabledSites', 'dynamicEnabledSites'], (data) => {
  const url = new URL(window.location.href);
  const hostname = url.hostname;

  const dynamicEnabled = data.dynamicEnabledSites.includes(hostname);
  if (dynamicEnabled) console.log('rainbow-text: Dynamic content enabled.');

  if (data.enabledSites && data.enabledSites.includes(hostname)) {
    applyCharacterColors(data.colorMap || {}, dynamicEnabled, false);
  } else {
    console.log('rainbow-text: Site not enabled.')
  }

});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'applyCharacterColors') {
    applyCharacterColors(request.colorMap, request.dynamicEnabled, request.blockModeEnabled);
    sendResponse({ success: true });
  }
});


// Function to apply character colors
function applyCharacterColors(colorMap, dynamicEnabled, blockModeEnabled) {
  console.log("rainbow-text: Applying character specific colors: dynamicContentEnabled=" + dynamicEnabled + ".");

  // Create a <style> element to hold the CSS rules
  const style = document.createElement('style');
  style.type = 'text/css';

  // Generate CSS rules for each character in the color map
  let css = '';
  for (const [char, color] of Object.entries(colorMap)) {
    css += `
      .char-color-${char} {
        color: ${color} !important;
      }
    `;
  }

  // Add the CSS rules to the <style> element
  style.textContent = css;

  // Remove any existing style element added by this extension
  const existingStyle = document.getElementById('character-color-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Add an ID to the style element for easy removal
  style.id = 'character-color-styles';

  // Append the <style> element to the document's <head>
  document.head.appendChild(style);

  // Function to recursively traverse and wrap characters with spans
  function wrapCharactersWithSpans(node) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
      // Split the text content into individual characters
      const characters = node.textContent.split('');

      // Create a document fragment to hold the wrapped characters
      const fragment = document.createDocumentFragment();

      characters.forEach(char => {
        // Check if the character is a letter (A-Z, case-insensitive) or a numeral (0-9)
        if (/[A-Za-z0-9]/.test(char)) {
          // Create a <span> element and add the appropriate class
          const spanElement = document.createElement('span');
          spanElement.classList.add(`char-color-${char.toLowerCase()}`);
          if (blockModeEnabled) {
            spanElement.textContent = '■'
          } else {
            spanElement.textContent = char;
          }
          fragment.appendChild(spanElement);
        } else {
          // Append non-letter/non-numeral characters as-is
          fragment.appendChild(document.createTextNode(char));
        }
      });

      // Replace the text node with the fragment
      node.replaceWith(fragment);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Recursively process child nodes
      Array.from(node.childNodes).forEach(childNode => {
        wrapCharactersWithSpans(childNode);
      });
    }
  }

  // Function to apply colors to the entire document
  function applyColorsToDocument() {
    if (observer) observer.disconnect();      
    wrapCharactersWithSpans(document.body);
    if (observer) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  // Apply colors to the document initially
  applyColorsToDocument();

  if (!dynamicEnabled && observer) {
    console.log('rainbow-text: Removing existing dynamic content observer.')
    observer.disconnect();
  } else if (dynamicEnabled && !observer) {
    observer = new MutationObserver((mutationsList) => {
      console.log('rainbow-text: Dynamic content mutation observed, applying colors.')
      if (observer) observer.disconnect();

      for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            wrapCharactersWithSpans(node);
          });
        }
      }

      if (observer) {
        // Reconnect the observer.
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      }
    });

    // Start observing the document for changes.
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

// Function to convert text to block symbols
function convertToBlockSymbols(node) {
  if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
    // Replace each character with the block symbol (■)
    const blockText = node.textContent
      .split('')
      .map(char => {
        if (char === ' ') {
          // Preserve spaces
          return ' ';
        } else if (char === '\n') {
          // Preserve line breaks
          return '\n';
        } else {
          // Replace all other characters with ■
          return '■';
        }
      })
      .join('');

    // Replace the text content with block symbols
    node.textContent = blockText;
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    // Recursively process child nodes
    Array.from(node.childNodes).forEach(childNode => {
      convertToBlockSymbols(childNode);
    });
  }
}

// Function to apply block symbols to the entire document
function applyBlockSymbols() {
  // Disconnect the observer temporarily to prevent infinite loops
  if (observer) {
    observer.disconnect();
  }

  // Convert all text nodes to block symbols
  convertToBlockSymbols(document.body);

  // Reconnect the observer
  if (observer) {
    observer.observe(document.body, {
      childList: true, // Observe added or removed child nodes
      subtree: true, // Observe all descendants of the target node
    });
  }
}

