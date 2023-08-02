// Sample data source for demonstration purposes
let entries = [
  {
    ts: new Date().toISOString().substring("YYYY-MM-DD".length),
    title: "Remind",
    description: "",
    link: "",
    tags: "",
  },
];

loadEntries();

// Function to display a random entry
function showRandomEntry() {
  const randomIndex = Math.floor(Math.random() * entries.length);
  showEntry(randomIndex);
}

function showEntry(index) {
  const displayEntry = entries[index];

  document.getElementById("displayEntryTitle").innerText = displayEntry.title;
  document.getElementById("displayEntryDescription").innerText =
    displayEntry.description;
  document.getElementById("displayEntryDate").innerText =
    displayEntry.ts + ` [${index}]\n`;
}

// Function to show the Add Entry dialog
function showAddEntryForm() {
  const dialog = document.getElementById("addEntryForm");
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

    entries.push(newEntry);
    updateShuffleBtn();
    showEntry(newEntry.i);
    closeAddEntryForm();
  } else {
    alert("Title and description are required");
  }
}

// Function to close the Add Entry dialog
function closeAddEntryForm() {
  const dialog = document.getElementById("addEntryForm");
  dialog.style.display = "none";
  document.getElementById("addEntryTitle").value = "";
  document.getElementById("addEntryDescription").value = "";
  document.getElementById("addEntryDescription").value = "";
}

function loadEntries() {
  try {
    entries = getEntries();
    console.log(entries);
    updateShuffleBtn();
  } catch (e) {
    console.error(e);
  }
}

function updateShuffleBtn() {
  document.getElementById("btnShuffle").textContent =
    "Shuffle (" + entries.length + ")";
}
