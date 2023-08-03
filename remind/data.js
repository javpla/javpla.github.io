let entries = [
  {
    ts: "2023-01-01",
    title: "Remind",
    description: "This is a reminder",
    link: "",
    tags: [],
    i: 0,
  },
];

function loadEntries() {
  localStorage.removeItem("entriesCsvBase64");
  const entriesKey = localStorage.getItem("entriesKey");
  console.log("entriesKey: " + entriesKey);
  if (entriesKey) {
    const entriesCsv = fromBinary(entriesKey);
    console.log("entriesCsv: " + entriesCsv);
    if (entriesCsv?.length) {
      entries = csvToJsonArray(entriesCsv);
      return;
    }
  }

  console.warn("No entries found in localStorage");
}

function getEntries() {
  return entries;
}

function storeEntries() {
  if (entries?.length) {
    const entriesCsv = jsonArrayToCsv(entries);
    localStorage.setItem("entriesKey", toBinary(entriesCsv));
  }
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
  const entriesCsvHeaders = 'ts,title,description,link,tags,i';
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

function jsonArrayToCsv(jsonArray) {
  if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
    return "";
  }
  const keys = Object.keys(jsonArray[0]);
  const csv =
    keys.join(",") +
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
          .join(",")
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
