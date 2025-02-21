const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

// Default color mappings
const defaultColorMap = {
  // Vowels (Pastel Colors)
  a: '#FFB6C1', // Pastel Pink
  e: '#77DD77', // Pastel Green
  i: '#B19CD9', // Pastel Purple
  o: '#FFCC99', // Pastel Orange
  u: '#AEC6CF', // Pastel Blue

  // Consonants (Neon Colors)
  b: '#0000FF', // Neon Blue
  c: '#00FFFF', // Neon Cyan
  d: '#FF8C00', // Neon Orange
  f: '#FF00FF', // Neon Fuchsia
  g: '#39FF14', // Neon Green
  h: '#FF69B4', // Neon Hot Pink
  j: '#00A86B', // Neon Jade
  k: '#FFFF00', // Neon Yellow
  l: '#00FF00', // Neon Lime
  m: '#FF00FF', // Neon Magenta
  n: '#000080', // Neon Navy
  p: '#800080', // Neon Purple
  q: '#51484F', // Neon Quartz
  r: '#FF0000', // Neon Red
  s: '#FA8072', // Neon Salmon
  t: '#40E0D0', // Neon Turquoise
  v: '#8F00FF', // Neon Violet
  w: '#F5DEB3', // Neon Wheat
  x: '#EEED09', // Neon Xanthic
  y: '#FFFF00', // Neon Yellow
  z: '#0014A8', // Neon Zaffre

  // Numerals (Neon Colors)
  0: '#000000', // Neon Black
  1: '#FFFFFF', // Neon White
  2: '#FF0000', // Neon Red
  3: '#39FF14', // Neon Green
  4: '#0000FF', // Neon Blue
  5: '#FFFF00', // Neon Yellow
  6: '#FF00FF', // Neon Magenta
  7: '#00FFFF', // Neon Cyan
  8: '#FF8C00', // Neon Orange
  9: '#800080', // Neon Purple
};

const colorPickerContainer = document.getElementById('colorPicker');
const enableButton = document.getElementById('enableButton');
const disableButton = document.getElementById('disableButton');
const applyButton = document.getElementById('applyButton');
const enableDynamicButton = document.getElementById('enableDynamicButton');
const disableDynamicButton = document.getElementById('disableDynamicButton');
const hardcoreModeButton = document.getElementById('hardcoreModeButton');

const statusDiv = document.getElementById('status');
const dynamicStatusDiv = document.getElementById('dynamicStatus')

let colorMap = {};
let enabledSites = [];
let dynamicEnabledSites = [];

// Load saved colors and enabled sites from storage
chrome.storage.sync.get(['colorMap', 'enabledSites', 'dynamicEnabledSites'], (data) => {
  let savedColorMap = data.colorMap || {}; // Load saved colors (if any)

  colorMap = { ...defaultColorMap, ...savedColorMap };
  
  if (data.enabledSites) {
    enabledSites = data.enabledSites;
  }
  if (data.dynamicEnabledSites) {
    dynamicEnabledSites = data.dynamicEnabledSites
  }


  // Generate color pickers for each character
  characters.split('').forEach(char => {
    const label = document.createElement('label');
    label.textContent = char.toUpperCase();

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = colorMap[char] || '#000000'; // Default to black if no color is set

    // Update the color map when the color picker changes
    colorInput.addEventListener('input', () => {
      colorMap[char] = colorInput.value;

      // Save the color map to storage
      chrome.storage.sync.set({ colorMap }, () => {
        console.log('Colors saved:', colorMap);
      });

    });

    label.appendChild(colorInput);
    colorPickerContainer.appendChild(label);
  });

  // Update the UI based on whether the extension is enabled for the current site
  updateUI();
});

// Update the UI based on whether the extension is enabled for the current site
function updateUI() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;

    if (enabledSites.includes(hostname)) {
      enableButton.style.display = 'none';
      disableButton.style.display = 'block';
      hardcoreModeButton.style.display = 'block';
      statusDiv.textContent = 'Enabled for this site';
      setHardcoreModeText();

      if (dynamicEnabledSites.includes(hostname)) {
        enableDynamicButton.style.display = 'none';
        disableDynamicButton.style.display = 'block';
        dynamicStatusDiv.textContent = "Dynamic content is enabled for this site";
      } else {
        enableDynamicButton.style.display = 'block';
        disableDynamicButton.style.display = 'none';
        dynamicStatusDiv.textContent = 'Dynamic content is disabled for this site'
      }
    } else {
      enableButton.style.display = 'block';
      disableButton.style.display = 'none';
      statusDiv.textContent = 'Disabled for this site';

      enableDynamicButton.style.display = 'none';
      disableDynamicButton.style.display = 'none';
      dynamicStatusDiv.textContent.display = 'none';
      hardcoreModeButton.style.display = 'none';
    }
  });
}

function setHardcoreModeText() {
  hardcoreModeButton.textContent = '';
  hardcoreModeButton.innerHTML = '';
  const baseText = 'HARDCORE MODE!!!';

  const topText = baseText.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.color = colorMap[char.toLowerCase()] || '#000000'; // Use the corresponding color
    hardcoreModeButton.appendChild(span);
  });

  const linebreak = document.createElement('span')
  linebreak.textContent = '\n';
  hardcoreModeButton.appendChild(linebreak);

  const blockText = baseText.split('').forEach(char => {
    const span = document.createElement('span');
    if (/[A-Za-z0-9]/.test(char)) {
      span.style.color = colorMap[char.toLowerCase()] || '#000000'; // Use the corresponding color
      span.textContent = "\u25A0";
    } else {
      span.textContent = char;
    }
    hardcoreModeButton.appendChild(span);
  });
}

// Enable the extension for the current site
enableButton.addEventListener('click', () => {
  console.log("enableButton.click: ")

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;

    if (!enabledSites.includes(hostname)) {
      enabledSites.push(hostname);
      chrome.storage.sync.set({ enabledSites }, () => {
        console.log('Enabled for:', hostname);
        updateUI();
      });

      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'applyCharacterColors',
        colorMap: colorMap,
        dynamicEnabled: dynamicEnabledSites.includes(hostname),
        blockModeEnabled: false
      }, (response) => {
        if (response && response.success) {
          console.log('Colors applied successfully');
        }
      });
    }
  });
});

// Disable the extension for the current site
disableButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;

    enabledSites = enabledSites.filter(site => site !== hostname);
    chrome.storage.sync.set({ enabledSites }, () => {
      console.log('Disabled for:', hostname);
      updateUI();
    });
  });
});

// Apply changes to the current tab
applyButton.addEventListener('click', () => {
  // Save the updated color map to storage
  chrome.storage.sync.set({ colorMap }, () => {
    console.log('Colors saved:', colorMap);
  });

  // Apply the updated colors to the current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;

    if (enabledSites.includes(hostname)) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'applyCharacterColors',
        colorMap: colorMap,
        dynamicEnabled: dynamicEnabledSites.includes(hostname),
        blockModeEnabled: false
      }, (response) => {
        if (response && response.success) {
          console.log('Colors applied successfully');
        }
      });
    }
  });
});

enableDynamicButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;

    if (!dynamicEnabledSites.includes(hostname)) {
      dynamicEnabledSites.push(hostname);
      chrome.storage.sync.set({ dynamicEnabledSites }, () => {
        console.log('Dynamic content enabled for:', hostname);
        updateUI();
      });

      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'applyCharacterColors',
        colorMap: colorMap,
        dynamicEnabled: dynamicEnabledSites.includes(hostname),
        blockModeEnabled: false
      }, (response) => {
        if (response && response.success) {
          console.log('Colors applied successfully');
        }
      });
    }
  });
});

// Disable the extension for the current site
disableDynamicButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;

    dynamicEnabledSites = dynamicEnabledSites.filter(site => site !== hostname);
    chrome.storage.sync.set({ dynamicEnabledSites }, () => {
      console.log('Dynamic content disabled for:', hostname);
      updateUI();
    });

    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'applyCharacterColors',
      colorMap: colorMap,
      dynamicEnabled: dynamicEnabledSites.includes(hostname),
      blockModeEnabled: false
    }, (response) => {
      if (response && response.success) {
        console.log('Colors applied successfully');
      }
    });
  });
});

hardcoreModeButton.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const url = new URL(tabs[0].url);
  const hostname = url.hostname;

    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'applyCharacterColors',
      colorMap: colorMap,
      dynamicEnabled: dynamicEnabledSites.includes(hostname),
      blockModeEnabled: true
    }, (response) => {
      if (response && response.success) {
        console.log('Colors applied successfully');
      }
    });
  });
});

