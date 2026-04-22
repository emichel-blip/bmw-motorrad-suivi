#!/usr/bin/env node
// Récupère les tâches du kanban Notion BMW Motorrad et écrit notion-snapshot.json
// Utilisation :
//   NOTION_TOKEN=ntn_... node scripts/notion-sync.mjs
// Lancé par .github/workflows/notion-sync.yml sur un cron.

import { writeFileSync, readFileSync, existsSync } from "node:fs";

const TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = "2f4abe8b-9989-81b6-9d8d-e39662ac1789";
const OUTPUT = "notion-snapshot.json";
const HTML_PATH = "index.html";

if (!TOKEN) {
    console.error("NOTION_TOKEN manquant (variable d'environnement).");
    process.exit(1);
}

async function queryNotion() {
    const tasks = [];
    let hasMore = true;
    let startCursor;

    while (hasMore) {
        const body = { page_size: 100 };
        if (startCursor) body.start_cursor = startCursor;

        const resp = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + TOKEN,
                "Notion-Version": "2022-06-28",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!resp.ok) {
            const txt = await resp.text();
            throw new Error(`Notion API ${resp.status}: ${txt}`);
        }

        const data = await resp.json();
        for (const page of data.results) {
            const p = page.properties || {};
            const title =
                p["Action"]?.title?.[0]?.plain_text ||
                Object.values(p).find(v => v?.type === "title")?.title?.[0]?.plain_text ||
                "(sans titre)";
            const avancement = p["Etat"]?.status?.name || "—";
            const priorite = p["Priorité"]?.select?.name || "";
            const expertise = p["Expertise"]?.multi_select?.map(x => x.name).join(", ") || "";
            const echeance = p["Échéance"]?.date?.start || null;
            const referent = p["Référent client"]?.multi_select?.map(x => x.name).join(", ") || "";
            const assignation = p["Assignation"]?.people?.map(x => x.name || "").filter(Boolean).join(", ") || "";
            const lastEdit = p["Dernière modification"]?.last_edited_time || null;

            tasks.push({
                id: page.id,
                name: title,
                avancement,
                priorite,
                expertise,
                echeance,
                referent,
                assignation,
                lastEdit,
                url: page.url || ""
            });
        }
        hasMore = data.has_more;
        startCursor = data.next_cursor;
    }
    return tasks;
}

async function inspectSchema() {
    const resp = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + TOKEN,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ page_size: 1 })
    });
    const data = await resp.json();
    const first = data.results[0];
    if (!first) return;
    console.log("\n=== Schéma de la base (1ère page) ===");
    for (const [name, val] of Object.entries(first.properties)) {
        let sample = "";
        if (val.type === "title") sample = val.title?.[0]?.plain_text || "";
        else if (val.type === "status") sample = val.status?.name || "";
        else if (val.type === "select") sample = val.select?.name || "";
        else if (val.type === "multi_select") sample = val.multi_select?.map(x => x.name).join(", ");
        else if (val.type === "date") sample = val.date?.start || "";
        else if (val.type === "people") sample = val.people?.map(x => x.name || x.id).join(", ");
        else if (val.type === "rich_text") sample = val.rich_text?.[0]?.plain_text || "";
        else if (val.type === "checkbox") sample = String(val.checkbox);
        else if (val.type === "number") sample = String(val.number ?? "");
        else if (val.type === "url") sample = val.url || "";
        else sample = "(" + val.type + ")";
        console.log(`  ${name.padEnd(30)} type=${val.type.padEnd(15)} ex="${sample}"`);
    }
    console.log("");
}

function injectIntoHtml(tasks) {
    if (!existsSync(HTML_PATH)) return false;
    const html = readFileSync(HTML_PATH, "utf8");
    const block = "const NOTION_SNAPSHOT = " + JSON.stringify(tasks, null, 4) + ";";
    const re = /const NOTION_SNAPSHOT\s*=\s*\[[\s\S]*?\];/m;
    if (!re.test(html)) {
        console.warn("  ⚠️  Bloc NOTION_SNAPSHOT introuvable dans index.html, injection ignorée.");
        return false;
    }
    const newHtml = html.replace(re, block);
    writeFileSync(HTML_PATH, newHtml);
    return true;
}

try {
    if (process.env.NOTION_INSPECT === "1") await inspectSchema();
    const tasks = await queryNotion();
    const payload = {
        generatedAt: new Date().toISOString(),
        count: tasks.length,
        tasks
    };
    writeFileSync(OUTPUT, JSON.stringify(payload, null, 2));
    const injected = injectIntoHtml(tasks);
    console.log(`OK — ${tasks.length} tâche(s) écrites dans ${OUTPUT}${injected ? " + index.html" : ""}`);
} catch (err) {
    console.error("Erreur :", err.message);
    process.exit(1);
}
