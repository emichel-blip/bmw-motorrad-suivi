#!/usr/bin/env node
// Inspecte le schéma réel de la base BMW (noms + types de propriétés)
const TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = "2f4abe8b-9989-81b6-9d8d-e39662ac1789";

const resp = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: "POST",
    headers: {
        "Authorization": "Bearer " + TOKEN,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ page_size: 3 })
});
const data = await resp.json();

console.log("=== Propriétés de la 1ère page ===");
const first = data.results[0];
if (!first) { console.log("Aucune page."); process.exit(0); }
for (const [name, val] of Object.entries(first.properties)) {
    let sample = "";
    if (val.type === "title") sample = val.title?.[0]?.plain_text || "";
    else if (val.type === "status") sample = val.status?.name || "";
    else if (val.type === "select") sample = val.select?.name || "";
    else if (val.type === "multi_select") sample = val.multi_select?.map(x => x.name).join(", ");
    else if (val.type === "date") sample = val.date?.start || "";
    else if (val.type === "people") sample = val.people?.map(x => x.name || x.id).join(", ");
    else if (val.type === "rich_text") sample = val.rich_text?.[0]?.plain_text || "";
    else if (val.type === "checkbox") sample = val.checkbox;
    else sample = `(${val.type})`;
    console.log(`  - ${name.padEnd(30)} type=${val.type.padEnd(15)} valeur="${sample}"`);
}
