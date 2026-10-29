/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/*
 * Derived from Adobe React Spectrum: packages/react-stately/src/datepicker/placeholders.ts.
 * Modified for Solid Aria: adapted reactive state, getters, imports, and APIs for Solid 2.
 * Licensed under Apache-2.0. See LICENSES/Apache-2.0.txt and NOTICE.txt at the repository root.
 */

import { LocalizedStringDictionary } from "@internationalized/string";

// These placeholders are based on the strings used by the <input type="date">
// implementations in Chrome and Firefox. Additional languages are supported
// here than React Spectrum's typical translations.
const placeholders = new LocalizedStringDictionary(
  {
    ach: { day: "nino", month: "dwe", year: "mwaka" },
    af: { day: "dd", month: "mm", year: "jjjj" },
    am: { day: "ቀቀ", month: "ሚሜ", year: "ዓዓዓዓ" },
    an: { day: "dd", month: "mm", year: "aaaa" },
    ar: { day: "يوم", month: "شهر", year: "سنة" },
    ast: { day: "dd", month: "mm", year: "aaaa" },
    az: { day: "gg", month: "aa", year: "iiii" },
    be: { day: "дд", month: "мм", year: "гггг" },
    bg: { day: "дд", month: "мм", year: "гггг" },
    bn: { day: "dd", month: "মিমি", year: "yyyy" },
    br: { day: "dd", month: "mm", year: "bbbb" },
    bs: { day: "dd", month: "mm", year: "gggg" },
    ca: { day: "dd", month: "mm", year: "aaaa" },
    cak: { day: "q'q'", month: "ii", year: "jjjj" },
    ckb: { day: "ڕۆژ", month: "مانگ", year: "ساڵ" },
    cs: { day: "dd", month: "mm", year: "rrrr" },
    cy: { day: "dd", month: "mm", year: "bbbb" },
    da: { day: "dd", month: "mm", year: "åååå" },
    de: { day: "tt", month: "mm", year: "jjjj" },
    dsb: { day: "źź", month: "mm", year: "llll" },
    el: { day: "ηη", month: "μμ", year: "εεεε" },
    en: { day: "dd", month: "mm", year: "yyyy" },
    eo: { day: "tt", month: "mm", year: "jjjj" },
    es: { day: "dd", month: "mm", year: "aaaa" },
    et: { day: "pp", month: "kk", year: "aaaa" },
    eu: { day: "ee", month: "hh", year: "uuuu" },
    fa: { day: "روز", month: "ماه", year: "سال" },
    ff: { day: "ññ", month: "ll", year: "hhhh" },
    fi: { day: "pp", month: "kk", year: "vvvv" },
    fr: { day: "jj", month: "mm", year: "aaaa" },
    fy: { day: "dd", month: "mm", year: "jjjj" },
    ga: { day: "ll", month: "mm", year: "bbbb" },
    gd: { day: "ll", month: "mm", year: "bbbb" },
    gl: { day: "dd", month: "mm", year: "aaaa" },
    he: { day: "יום", month: "חודש", year: "שנה" },
    hr: { day: "dd", month: "mm", year: "gggg" },
    hsb: { day: "dd", month: "mm", year: "llll" },
    hu: { day: "nn", month: "hh", year: "éééé" },
    ia: { day: "dd", month: "mm", year: "aaaa" },
    id: { day: "hh", month: "bb", year: "tttt" },
    is: { day: "dd", month: "mm", year: "áááá" },
    it: { day: "gg", month: "mm", year: "aaaa" },
    ja: { day: "日", month: "月", year: "年" },
    ka: { day: "რრ", month: "თთ", year: "წწწწ" },
    kk: { day: "кк", month: "аа", year: "жжжж" },
    kn: { day: "ದಿದಿ", month: "ಮಿಮೀ", year: "ವವವವ" },
    ko: { day: "일", month: "월", year: "연도" },
    lb: { day: "dd", month: "mm", year: "jjjj" },
    lo: { day: "ວວ", month: "ດດ", year: "ປປປປ" },
    lt: { day: "dd", month: "mm", year: "mmmm" },
    lv: { day: "dd", month: "mm", year: "gggg" },
    meh: { day: "dd", month: "mm", year: "aaaa" },
    ml: { day: "തീയതി", month: "മാസം", year: "വർഷം" },
    ms: { day: "hh", month: "mm", year: "tttt" },
    nb: { day: "dd", month: "mm", year: "åååå" },
    nl: { day: "dd", month: "mm", year: "jjjj" },
    nn: { day: "dd", month: "mm", year: "åååå" },
    no: { day: "dd", month: "mm", year: "åååå" },
    oc: { day: "jj", month: "mm", year: "aaaa" },
    pl: { day: "dd", month: "mm", year: "rrrr" },
    pt: { day: "dd", month: "mm", year: "aaaa" },
    rm: { day: "dd", month: "mm", year: "oooo" },
    ro: { day: "zz", month: "ll", year: "aaaa" },
    ru: { day: "дд", month: "мм", year: "гггг" },
    sc: { day: "dd", month: "mm", year: "aaaa" },
    scn: { day: "jj", month: "mm", year: "aaaa" },
    sk: { day: "dd", month: "mm", year: "rrrr" },
    sl: { day: "dd", month: "mm", year: "llll" },
    sr: { day: "дд", month: "мм", year: "гггг" },
    "sr-Latn": { day: "dd", month: "mm", year: "gggg" },
    sv: { day: "dd", month: "mm", year: "åååå" },
    szl: { day: "dd", month: "mm", year: "rrrr" },
    tg: { day: "рр", month: "мм", year: "сссс" },
    th: { day: "วว", month: "ดด", year: "ปปปป" },
    tr: { day: "gg", month: "aa", year: "yyyy" },
    uk: { day: "дд", month: "мм", year: "рррр" },
    "zh-CN": { day: "日", month: "月", year: "年" },
    "zh-TW": { day: "日", month: "月", year: "年" },
  },
  "en"
);

export function getPlaceholder(
  field: string,
  value: string,
  locale: string
): string {
  // Use the actual placeholder value for the era and day period fields.
  if (field === "era" || field === "dayPeriod") {
    return value;
  }

  if (field === "year" || field === "month" || field === "day") {
    return placeholders.getStringForLocale(field, locale);
  }

  // For time fields (e.g. hour, minute, etc.), use two dashes as the placeholder.
  return "––";
}
