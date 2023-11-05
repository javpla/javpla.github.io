let entries = [
  {
    ts: "2023-01-01",
    title: "Remind",
    description: "This is a reminder",
    link: "",
    tags: ["tag1", "tag2", "tag3, with commas", "tag 4"],
    i: 0,
  },
];

function storeEntries() {
  if (entries?.length) {
    localStorage.setItem("entries", JSON.stringify(entries));
    // old way using binary
    const entriesCsv = jsonArrayToCsv(entries);
    localStorage.setItem("entriesKey", toBinary(entriesCsv));
  }
}

function loadEntries() {
  const jsonArrayStr = localStorage.getItem("entries");
  console.log('loadEntries - jsonArrayStr: ', jsonArrayStr);
  const jsonArray = JSON.parse(jsonArrayStr);
  console.log('loadEntries - jsonArray: ', jsonArray);
  console.log('loadEntries - isArray = ', Array.isArray(jsonArray));
  if (Array.isArray(jsonArray)) {
    entries = jsonArray;
    return;
  }

  // old way using binary
  const entriesKey = localStorage.getItem("entriesKey");
  console.log("loadEntries - entriesKey: " + entriesKey);

  if (!entriesKey) {
    console.warn("loadEntries - No entries found in localStorage");
    return;
  }

  const entriesCsv = fromBinary(entriesKey);
  console.log("loadEntries - entriesCsv: " + entriesCsv);
  entries = csvToJsonArray(entriesCsv);
}

function getEntries() {
  return entries;
}

function getTags() {
  const tags = new Set();
  entries.forEach((entry) => {
    entry.tags?.forEach((tag) => {
      tags.add(tag);
    });
  });
  return [...tags];
}

function addEntry(ts, title, description, link, tags) {
  entries.push({
    ts,
    title,
    description,
    link,
    tags,
    i: entries.length,
  });
  const newEntry = entries[entries.length - 1];
  console.log("added entry: " + JSON.stringify(newEntry));
  storeEntries();
  return newEntry;
}

function importEntriesFromKey(key) {
  if (!key) {
    console.error(`Invalid import key: ${key}`);
    return;
  }
  const csv = fromBinary(key);
  const entriesCsvHeaders = "ts,title,description,link,tags,i";
  if (!csv.startsWith(entriesCsvHeaders)) {
    console.error(`Invalid CSV headers (${entriesCsvHeaders}): ${csv}`);
    return;
  }
  entries = csvToJsonArray(csv);
  storeEntries();
}

function csvToJsonArray(csv) {
  const lines = csv.split("\n");
  const keys = lines[0].split(",");
  const jsonArray = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(",");
    const entry = {};
    for (let k = 0; k < keys.length; k++) {
      const key = keys[k];
      if (key === "tags") {
        entry[key] = values[k].split(";");
        continue;
      }
      entry[key] = values[k];
    }
    jsonArray.push(entry);
  }
  return jsonArray;
}

function jsonArrayToCsv(jsonArray, separator = "\t") {
  if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
    return "";
  }
  const keys = Object.keys(jsonArray[0]);
  const csv =
    keys.join(separator) +
    "\n" +
    jsonArray
      .map((entry) =>
        keys
          .map((key) => {
            if (key === "tags") {
              return entry[key].join(";");
            }
            return entry[key];
          })
          .join(separator)
      )
      .join("\n");
  return csv;
}

// convert a UTF-8 string to a string in which
// each 16-bit unit occupies only one byte
function toBinary(string) {
  const codeUnits = new Uint16Array(string.length);
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = string.charCodeAt(i);
  }
  return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)));
}

function fromBinary(encoded) {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return String.fromCharCode(...new Uint16Array(bytes.buffer));
}

async function fetchFromPublicGoogleSheet(spreadsheetId) {
  // const response = await fetch(`https://spreadsheets.google.com/feeds/cells/${spreadsheetId}/${sheetId}/public/full?alt=json`);
  // const response = await fetch(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?exportFormat=csv`);
  const response = await fetch(
    `https://spreadsheets.google.com/feeds/list/${spreadsheetId}/od6/public/values?alt=json`
  );
  const json = await response.json();
  return json;
}
