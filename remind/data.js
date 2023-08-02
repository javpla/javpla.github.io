function getEntries() {
  console.log(jsonArrayToCsv(hardcodedEntries));
  return hardcodedEntries;
}

function addEntry(ts, title, description, link, tags) {
  hardcodedEntries.push({
    ts,
    title,
    description,
    link,
    tags,
    i: hardcodedEntries.length,
  });
  const newEntry = hardcodedEntries[hardcodedEntries.length - 1];
  console.log('added entry: ' + JSON.stringify(newEntry));
  return newEntry;
}

function jsonArrayToCsv(jsonArray) {
  if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
    return '';
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

const hardcodedEntries = [];
