// removed
// Actually we can't require TS directly like that
const fs = require('fs');

const ocrText = `MESS MENU (TAGORE/ JAWAHAR] VIVE
Le NY (a & VE TE
— W | pAY [BREAKFAST KANAND Ee LED) TT —
| CORN FLAKES, MILK B KALI MASOOR D 1 —
\ ; Ri S, MILK BREAD AL, ALOO
| MONDAY 5 TTER 1AM, FRUIT, TEA |BHUIYA ROTI, RICE, BOONDI Go saucy ore Eom
RAITA SALAD, A TEA i A RICE. BOONDI LADOO (2
\ Ta CHAR Pes). SALAD, ACHAR
\ ALOO PYAZ PARATHA, DAH [DHABA DAL(CHAN A, UR,
| av ; [RAI RAD DAL
TUESDAY [SAUCE, FRUIT. TEA Rice ahs ALOQO, ROTI, MIX PAKORA, SAUCE, |CHILKA), KALA CHANA ALOO, GHEE
| | 5 VEC + SALAD, ACHAR COFFEE ROTI, RICE. SUJI HALWA. SALAD.
| — ACHAR
1 | br MILK DALIA , POHA, FRUIT, [CHANA DAL, BESAN GUTTA,
WEDNESDAY | ROTI, RICE, SALAD, ACHAR, JEERA | ALOO TIKKICHAT  [JEERA RICE, CHHOLE. ALOO GOBH,
\ RAITA (2 Pes), TEA [PURI/ ROTI, KHEER. SALAD, ACHAR
\ J . KADI PAKODA, ALOO =
«pay [PURI JALEBI, ALO .
| THURSDAY Ly cree Ele i TEA [MATARJEERA ALOO, RICE, ROT, [BURGER (Pes), SAUCE, [PANEER DO PYAZA, MOONG DAL, RICE
| “ z 2 SALAD, ACHAR TEA, EE ROTI, SALAD ANCHAR
\
\ BREAD, BOILED EGG (2Pes)/ [LAL MASOOR DAL, ALOOKAR | voc on (11 [MIX VEG (GOBHL GAIAR, MATAR oc,
| FRIDAY {BREAD BUTTER JAM, PAYAZ, RICE. ROTI, BOONDI a [MIX DAL, JEERA RICE, GHEE ROTI,
bt | ELALAICHI MILK, FRUIT, TEA [RAITA SALAD, ACHAR /AL, SALAD, ACHAR
8\ | 2
je | cE, [KHICHDL, ALOO MATAR, ROTI, [MIX DAL, VEG KOFTA, GHEEROTI, RICE,
INO | SATURDAY [MIX PARATHA, DAHL, SAUCE, [yg RAITA, FRYUMS/PAPAD, POHA, SOUCE, TEA ~[GAJAR HALWA / MOONG DAL HBL WA,      
nneg | ACHAR, FRUIT, TEA XGiar SALAD, ACHAR
also | (CHHOLE BHATURE, VEG. BIRYANI TAMATAR CHATNI, FRUIT, ALO SANDWICH [BAD FRIEER/EGG KARE CHANA
| SUNDAY 3 SAUCE, COFFEE |AAL, RICE, GHEE ROTI GULAB
holar DAHI, TEA, SALAD, ACHAR [TAMUNG Ps), SALAD, ACHAR`;

// inline parser logic
function parse(text) {
  const result = {};
  const daysRegex = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/i;
  const mealsRegex = /\b(breakfast|lunch|snacks|dinner|snack|supper|brunch)\b/i;

  const dayMap = {
      'mon': 'monday', 'tue': 'tuesday', 'wed': 'wednesday', 
      'thu': 'thursday', 'fri': 'friday', 'sat': 'saturday', 'sun': 'sunday'
  };

  const week = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (const d of week) {
     result[d] = { breakfast: ["Not Available"], lunch: ["Not Available"], snacks: ["Not Available"], dinner: ["Not Available"] };
  }

  if (!text || text.trim().length === 0) return result;

  for (const d of week) {
     result[d] = { breakfast: [], lunch: [], snacks: [], dinner: [] };
  }

  const lines = text.split('\n');
  let currentDay = null;
  let currentMeal = null;
  let totalItems = 0;

  for (let line of lines) {
    const cleanLine = line.trim().toLowerCase();
    
    const dayMatch = cleanLine.match(daysRegex);
    if (dayMatch) {
       let matchedDay = dayMatch[1].toLowerCase();
       currentDay = dayMap[matchedDay] || matchedDay;
    }

    const mealMatch = cleanLine.match(mealsRegex);
    if (mealMatch) {
       let mealName = mealMatch[1].toLowerCase();
       if (mealName === 'snack') mealName = 'snacks';
       if (mealName === 'supper') mealName = 'dinner';
       if (mealName === 'brunch') mealName = 'breakfast';
       currentMeal = mealName;
       
       if (cleanLine.replace(mealsRegex, '').trim().length < 3) {
           continue; 
       }
    }

    if (currentDay && currentMeal && cleanLine.length > 2 && !dayMatch && !mealMatch) {
       if (!cleanLine.match(/^[0-9\W]+$/)) {
           result[currentDay][currentMeal].push(line.trim());
           totalItems++;
       }
    }
  }

  if (totalItems === 0) {
      const rawFoods = lines
          .map(l => l.trim())
          .filter(l => l.length > 2 && !l.match(/^[0-9\W]+$/) && !l.match(daysRegex) && !l.match(mealsRegex));
      
      result['monday'].breakfast = rawFoods.slice(0, 30);
  }

  for (const d of week) {
      for (const m of ['breakfast', 'lunch', 'snacks', 'dinner']) {
          if (result[d][m].length === 0) {
              result[d][m] = ["Not Available"];
          }
      }
  }
  return result;
}

console.log(JSON.stringify(parse(ocrText), null, 2));
