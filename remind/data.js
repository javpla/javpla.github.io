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
  const entriesCsvBase64 = localStorage.getItem("entriesCsvBase64");
  console.log("entriesCsvBase64: " + entriesCsvBase64);
  if (entriesCsvBase64) {
    const entriesCsv = atob(entriesCsvBase64);
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
    localStorage.setItem("entriesCsvBase64", btoa(entriesCsv));
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

function importEntriesCsv(csv) {
  const entriesCsvHeaders = 'ts,title,description,link,tags,i';
  if (!csv.startsWith(entriesCsvHeaders)) {
    console.error(`Invalid CSV headers (${entriesCsvHeaders}): ${csv}`);
    return;
  }
  entries = csvToJsonArray(csv).push(...entries);
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
