export function parseMessMenuText(text: string) {
  const result: any = {};
  const daysRegex = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/i;
  const mealsRegex = /\b(breakfast|lunch|snacks|dinner|snack|supper|brunch)\b/i;

  const dayMap: Record<string, string> = {
      'mon': 'monday', 'tue': 'tuesday', 'wed': 'wednesday', 
      'thu': 'thursday', 'fri': 'friday', 'sat': 'saturday', 'sun': 'sunday'
  };

  const week = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (const d of week) {
     result[d] = { breakfast: ["Not Available"], lunch: ["Not Available"], snacks: ["Not Available"], dinner: ["Not Available"] };
  }

  // If text is empty, return defaults
  if (!text || text.trim().length === 0) {
      return result;
  }

  // Clear defaults for parsing
  for (const d of week) {
     result[d] = { breakfast: [], lunch: [], snacks: [], dinner: [] };
  }

  const lines = text.split('\n');
  let currentDay: string | null = null;
  let currentMeal: string | null = null;
  let totalItems = 0;
  let foundLunchOrDinner = false;

  for (let line of lines) {
    const cleanLine = line.trim().toLowerCase();
    
    // Check for days
    const dayMatch = cleanLine.match(daysRegex);
    if (dayMatch) {
       let matchedDay = dayMatch[1].toLowerCase();
       currentDay = dayMap[matchedDay] || matchedDay;
       currentMeal = null; // Reset meal when a new day starts if it's a row-based table
    }

    // Check for meals
    const mealMatch = cleanLine.match(mealsRegex);
    if (mealMatch) {
       let mealName = mealMatch[1].toLowerCase();
       if (mealName === 'snack') mealName = 'snacks';
       if (mealName === 'supper') mealName = 'dinner';
       if (mealName === 'brunch') mealName = 'breakfast';
       currentMeal = mealName;
       
       if (mealName === 'lunch' || mealName === 'dinner') foundLunchOrDinner = true;

       if (cleanLine.replace(mealsRegex, '').trim().length < 3) {
           continue; 
       }
    }

    // Assign text to the current day/meal bucket
    if (currentDay && currentMeal && cleanLine.length > 2 && !dayMatch && !mealMatch) {
       if (!cleanLine.match(/^[0-9\W]+$/)) {
           // Clean up OCR table borders like | or —
           const cleanedText = line.trim().replace(/[|\[\]_—]/g, '').trim();
           if (cleanedText.length > 2) {
               result[currentDay][currentMeal].push(cleanedText);
               totalItems++;
           }
       }
    }
  }

  // Fallback: If tabular alignment totally broke (missing lunch/dinner headers or too few items), 
  // dump ALL valid text into Monday's breakfast staging ground for easy copy-pasting.
  if (!foundLunchOrDinner || totalItems < 8) {
      // Erase any disjointed partial placements
      for (const d of week) {
         result[d] = { breakfast: [], lunch: [], snacks: [], dinner: [] };
      }

      const rawFoods = lines
          .map(l => l.trim().replace(/[|\[\]_—]/g, '').trim())
          .filter(l => l.length > 3 && !l.match(/^[0-9\W]+$/) && !l.match(daysRegex) && !l.match(mealsRegex));
      
      result['monday'].breakfast = rawFoods.slice(0, 40); // 40 lines is plenty for a full menu dump
  }

  // Fill empty fields with "Not Available"
  for (const d of week) {
      for (const m of ['breakfast', 'lunch', 'snacks', 'dinner']) {
          if (result[d][m].length === 0) {
              result[d][m] = ["Not Available"];
          }
      }
  }

  return result;
}
