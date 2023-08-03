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
