loadEntries();
updateShuffleBtn();
showRandomEntry();
showAllTags();

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

  document.getElementById("displayEntryTitle").innerText = displayEntry.title;
  document.getElementById("displayEntryDescription").innerText = displayEntry.description;
  document.getElementById("displayEntryDate").innerText = displayEntry.ts;
  document.getElementById("displayEntryIndex").innerText = `[${index}]`;

  const displayedTagsDiv = document.getElementById("displayEntryTags");
  displayedTagsDiv.innerHTML = ""; // removes all children (buttons)

  displayEntry.tags?.forEach((tag) => {
    const button = getTagBtn(tag);
    displayedTagsDiv.appendChild(button);
  });

  const div = document.getElementById("displayEntry");
  div.style.display = "block";
}

function showAllTags() {
  const allTags = getTags().sort();
  console.log('showTags - ', allTags);
  const tagsDiv = document.getElementById("tagsDiv");
  tagsDiv.innerHTML = ""; // removes all children (buttons)
  allTags.forEach((tag) => {
    const button = getTagBtn(tag);
    tagsDiv.appendChild(button);
  });
}

function getTagBtn(tag) {
  // <button class="tag-button">example tag</button>
  const button = document.createElement("button");
  button.id = `tag-${tag}`;
  button.classList.add("tag-button");
  button.innerText = tag;
  button.addEventListener("click", () => {
    toggleTagBtn(button);
  });
  return button;
}

function toggleTagBtn(btn) {
  btn.classList.toggle("tag-button-selected");
}

function showAddEntryForm() {
  const dialog = document.getElementById("addEntryFormWrapper");
  dialog.style.display = "block";
}

function saveEntry() {
  const addEntryTitle = document.getElementById("addEntryTitle")?.value;
  const addEntryDescription = document.getElementById("addEntryDescription")?.value;
  const addEntryTags = document.getElementById("addEntryTags")?.value?.split(",");

  if (addEntryTitle && addEntryDescription) {
    const today = new Date().toISOString().slice(0, 10); // Get the current date in "YYYY-MM-DD" format
    let tags = [];
    if (addEntryTags.length) {
      tags.push(...addEntryTags.map((tag) => tag.trim()).filter((tag) => tag.length));
    }
    const newEntry = addEntry(today, addEntryTitle, addEntryDescription, "", tags);
    showAllTags();

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
  document.getElementById("btnShuffle").textContent = "Shuffle (" + getEntries().length + ")";
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
  fetchFromPublicGoogleSheet(sheetId)
    .then((newEntries) => {
      console.log(newEntries);
    })
    .catch((e) => {
      console.error("Failed to fetch GSheetData: ", e);
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
  entries.forEach((e) => {
    Object.keys(e).forEach((k) => {
      if (e[k].replace) {
        e[k] = e[k].replace(/,/g, "\\,");
      }
    });
  });
  console.log("pbCopyData - entries:", entries);
  const csv = jsonArrayToCsv(entries);
  console.log("pbCopyData - csv:", csv);
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
    console.log(`Fallback copying text command was ${successful ? "" : "un"}successful`);
    console.log("Copied text: " + text);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}
