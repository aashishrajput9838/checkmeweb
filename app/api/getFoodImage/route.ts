import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'public', 'images', 'food');
const DB_PATH = path.join(process.cwd(), 'data', 'food_images.json');

if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({}));

// Utility to wait
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(name: string, retryCount = 0): Promise<ArrayBuffer> {
    const maxRetries = 3;
    const apiKey = process.env.STABLE_DIFFUSION_API_KEY;

    if (!apiKey) throw new Error("No API Key");

    const payload = {
        key: apiKey,
        prompt: `Realistic Indian food dish: ${name}, high quality, natural lighting, restaurant style, clean background`,
        negative_prompt: "low resolution, terrible quality, deformed, ugly, person, hands, text",
        width: "512",
        height: "512",
        samples: "1",
        num_inference_steps: "20",
        safety_checker: "yes",
        enhance_prompt: "yes",
    };

    try {
        const response = await fetch("https://stablediffusionapi.com/api/v3/text2img", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            // If it's HTML, it's likely a 429 or 504 from SD API
            console.warn(`SD API returned non-JSON response for ${name}. Retrying...`);
            if (retryCount < maxRetries) {
                await sleep(3000 * (retryCount + 1)); // Wait longer each time
                return fetchWithRetry(name, retryCount + 1);
            }
            throw new Error("API Limit Reached");
        }

        if (data.status === "success" && data.output && data.output[0]) {
            const imgRes = await fetch(data.output[0]);
            return await imgRes.arrayBuffer();
        } else if (data.status === "processing" || (data.status === "error" && text.includes("busy"))) {
             if (retryCount < maxRetries) {
                console.log(`SD API busy/processing for ${name}, retry ${retryCount + 1}...`);
                await sleep(4000);
                return fetchWithRetry(name, retryCount + 1);
            }
        }
        throw new Error(data.message || "Unknown API Error");
    } catch (err: any) {
        if (retryCount < maxRetries && !err.message.includes("No API Key")) {
            await sleep(3000);
            return fetchWithRetry(name, retryCount + 1);
        }
        throw err;
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const cleanName = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');

    try {
        const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        if (db[cleanName]) return NextResponse.json({ url: db[cleanName] });

        // Fetch with our new retry logic
        const buffer = await fetchWithRetry(name);
        
        const fileName = `${cleanName}.jpg`;
        fs.writeFileSync(path.join(STORAGE_DIR, fileName), Buffer.from(buffer));

        db[cleanName] = `/images/food/${fileName}`;
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        return NextResponse.json({ url: db[cleanName] });
    } catch (error: any) {
        console.error(`Final failure for ${name}:`, error.message);
        return NextResponse.json({ 
            url: `https://placehold.co/512x512/18181b/eab308/png?text=${encodeURIComponent(name)}` 
        });
    }
}
