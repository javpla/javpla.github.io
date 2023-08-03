loadEntries();
updateShuffleBtn();
showRandomEntry();

function importEntries() {
  const inputImport = document.getElementById("inputImport")?.value;
  importEntriesCsvBase64(inputImport);
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
  const addEntryDescription = document.getElementById("addEntryDescription")?.value;
  const addEntryTags = document
    .getElementById("addEntryTags")
    ?.value?.split(",");

  if (addEntryTitle && addEntryDescription) {
    const today = new Date().toISOString().slice(0, 10); // Get the current date in "YYYY-MM-DD" format
    let tags = [];
    if (addEntryTags.length) {
      tags.push(...addEntryTags.map((tag) => tag.trim()).filter(tag => tag.length));
    }
    const newEntry = addEntry(today, addEntryTitle, addEntryDescription, '', tags);

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
