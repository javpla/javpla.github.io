loadEntries();

// Function to display a random entry
function showRandomEntry() {
  const randomIndex = Math.floor(Math.random() * entries.length);
  showEntry(randomIndex);
}

function showEntry(index) {
  const displayEntry = entries[index];

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
  const title = document.getElementById("addEntryTitle")?.value;
  const description = document.getElementById("addEntryDescription")?.value;
  const tags = document
    .getElementById("addEntryTags")
    ?.value?.split(",")
    .map((tag) => tag.trim());

  if (title && description) {
    const today = new Date().toISOString().slice(0, 10); // Get the current date in "YYYY-MM-DD" format
    const newEntry = addEntry(today, title, description, tags);

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

function loadEntries() {
  try {
    console.log(jsonArrayToCsv(entries));
    console.log(entries);
    updateShuffleBtn();
    showRandomEntry();
  } catch (e) {
    console.error(e);
  }
}

function updateShuffleBtn() {
  document.getElementById("btnShuffle").textContent =
    "Shuffle (" + entries.length + ")";
}
