import { NextResponse } from 'next/server';

import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const xlsx = require('xlsx');
    const menuPath = path.join(process.cwd(), 'mess_menu.xlsx');
    const timingPath = path.join(process.cwd(), 'mess_timing.xlsx');

    const menuBuffer = fs.readFileSync(menuPath);
    const menuWb = xlsx.read(menuBuffer, { type: 'buffer' });
    const menuSheet = menuWb.Sheets[menuWb.SheetNames[0]];
    const menuRaw = xlsx.utils.sheet_to_json(menuSheet);

    const timingBuffer = fs.readFileSync(timingPath);
    const timingWb = xlsx.read(timingBuffer, { type: 'buffer' });
    const timingSheet = timingWb.Sheets[timingWb.SheetNames[0]];
    const timingRaw = xlsx.utils.sheet_to_json(timingSheet);

    const formattedMenu: any = {};
    menuRaw.forEach((row: any) => {
      if (row.Day) {
        formattedMenu[row.Day.toLowerCase()] = {
          breakfast: row.Breakfast ? String(row.Breakfast).split(',').map((i: string) => i.trim()) : [],
          lunch: row.Lunch ? String(row.Lunch).split(',').map((i: string) => i.trim()) : [],
          snacks: row.Snacks ? String(row.Snacks).split(',').map((i: string) => i.trim()) : [],
          dinner: row.Dinner ? String(row.Dinner).split(',').map((i: string) => i.trim()) : [],
        }
      }
    });

    const formattedTiming: any = {};
    timingRaw.forEach((row: any) => {
        if (row.Menu) {
            formattedTiming[row.Menu.toLowerCase()] = row.Timing;
        }
    });

    return NextResponse.json({ menu: formattedMenu, timing: formattedTiming });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
