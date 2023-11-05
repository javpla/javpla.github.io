loadEntries();
updateShuffleBtn();
showRandomEntry();

function importEntries() {
  const inputImport = document.getElementById("inputImport")?.value;
  importEntriesFromKey(inputImport);
  updateShuffleBtn();
  const importContainer = document.getElementById("importContainer");
  if (importContainer) {
    importContainer.style.display = "none";
  }
}

// Function to display a random entry
function showRandomEntry() {
  const randomIndex = Math.floor(Math.random() * getEntries().length);
  showEntry(randomIndex);
}

function showEntry(index) {
  const allEntries = getEntries();
  console.log(allEntries);
  const displayEntry = allEntries[index];
  console.log("displaying entry: " + JSON.stringify(displayEntry));

  const div = document.getElementById("displayEntry");
  div.style.display = "block";
  document.getElementById("displayEntryTitle").innerText = displayEntry.title;
  document.getElementById("displayEntryDescription").innerText =
    displayEntry.description;
  document.getElementById("displayEntryDate").innerText = displayEntry.ts;
  document.getElementById("displayEntryIndex").innerText = `[${index}]`;
}

// Function to show the Add Entry dialog
function showAddEntryForm() {
  const dialog = document.getElementById("addEntryFormWrapper");
  dialog.style.display = "block";
}

// Function to save the new entry
function saveEntry() {
  const addEntryTitle = document.getElementById("addEntryTitle")?.value;
  const addEntryDescription = document.getElementById(
    "addEntryDescription"
  )?.value;
  const addEntryTags = document
    .getElementById("addEntryTags")
    ?.value?.split(",");

  if (addEntryTitle && addEntryDescription) {
    const today = new Date().toISOString().slice(0, 10); // Get the current date in "YYYY-MM-DD" format
    let tags = [];
    if (addEntryTags.length) {
      tags.push(
        ...addEntryTags.map((tag) => tag.trim()).filter((tag) => tag.length)
      );
    }
    const newEntry = addEntry(
      today,
      addEntryTitle,
      addEntryDescription,
      "",
      tags
    );

    updateShuffleBtn();
    showEntry(newEntry.i);
    closeAddEntryForm();
  } else {
    alert("Title and description are required");
  }
}

// Function to close the Add Entry dialog
function closeAddEntryForm() {
  const dialog = document.getElementById("addEntryFormWrapper");
  dialog.style.display = "none";
  document.getElementById("addEntryTitle").value = "";
  document.getElementById("addEntryDescription").value = "";
  document.getElementById("addEntryTags").value = "";
}

function updateShuffleBtn() {
  document.getElementById("btnShuffle").textContent =
    "Shuffle (" + getEntries().length + ")";
}

function restoreFromGSheet() {
  const idOrUrl = document.getElementById("inputRestoreFromGSheet")?.value;
  console.log(idOrUrl);
  console.log(`restoreFromGSheet - ${idOrUrl}`);

  if (!idOrUrl) {
    alert("Input a Google Sheet ID or URL");
    document.getElementById("inputRestoreFromGSheet")?.focus();
    return;
  }

  const sheetId = getId(idOrUrl);
  console.log(`setGSheet - using sheet ID: ${sheetId}`);
  fetchFromPublicGoogleSheet(sheetId).then(newEntries => {
    console.log(newEntries);
  }).catch(e => {
    console.error('Failed to fetch GSheetData: ', e);
  });
}

function getId(idOrUrl) {
  if (!idOrUrl.startsWith("http")) {
    return idOrUrl;
  }
  const url = idOrUrl; // eg 'https://docs.google.com/spreadsheets/d/1lN5jqNBX_erxzM9UP_u9NU-BeCnLq4KiwD01hHCzkqg/edit?usp=sharing';
  const regex = /spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const match = url.match(regex);
  const sheetId = match?.[1];
  return sheetId;
}

function pbCopyData() {
  const entries = getEntries();
  // json to csv escaping commas in each field
  entries.forEach(e => {
    Object.keys(e).forEach(k => {
      e[k] = e[k].replace(/,/g, '\\,');
    });
  });
  console.log('pbCopyData: ', csv);
  console.log(csv);
  copyToClipboard(csv);
}

function copyToClipboard(csv) {
  navigator.clipboard.writeText(csv).then(
    function () {
      console.log("Copying to clipboard was successful!");
    },
    function (err) {
      console.error("Could not copy text: ", err);
      fallbackCopyTextToClipboard(csv);
    }
  );
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    console.log(
      `Fallback copying text command was ${successful ? "" : "un"}successful`
    );
    console.log("Copied text: " + text);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}
