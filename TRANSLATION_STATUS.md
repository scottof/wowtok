# SEO Translation Status

Last updated: 2026-03-17

## Task
Translate 23 SEO namespaces from English to 7 languages and add them to each `messages/<lang>.json` file.

## Source
- English content: `messages/en.json` (all keys starting with `Seo*`)
- Reference export: `seo_en_content.json` (if it exists, otherwise read from `en.json`)

## 23 Namespaces to translate (in order)
1. SeoVoiceover
2. SeoNoFace
3. SeoCaptions
4. SeoAiVideoGenerator
5. SeoAiContentGenerator
6. SeoAiVideoTools
7. SeoHowToCreate
8. SeoMystery
9. SeoRomance
10. SeoThriller
11. SeoEducational
12. SeoMotivational
13. SeoTravel
14. SeoScience
15. SeoPet
16. SeoTrueCrime
17. SeoHorror
18. SeoComedy
19. SeoCooking
20. SeoFitness
21. SeoFantasy
22. SeoSciFi
23. SeoDrama

## Per-language status

| Language | File | Namespaces done | Remaining |
|----------|------|----------------|-----------|
| ES | messages/es.json | 4 (partial — check which ones) | ~19 |
| IT | messages/it.json | 0 | 23 |
| FR | messages/fr.json | 0 | 23 |
| KO | messages/ko.json | 0 | 23 |
| AR | messages/ar.json | 1 (SeoAiVideoGenerator) | 22 |
| ZH | messages/zh.json | 0 | 23 |
| DE | messages/de.json | 0 | 23 |

## How to resume

For each language, run this to check which namespaces are already done:
```bash
python3 -c "
import json
with open('messages/<lang>.json') as f:
    d = json.load(f)
done = [k for k in d if k.startswith('Seo')]
print('Done:', done)
all_seo = ['SeoVoiceover','SeoNoFace','SeoCaptions','SeoAiVideoGenerator','SeoAiContentGenerator','SeoAiVideoTools','SeoHowToCreate','SeoMystery','SeoRomance','SeoThriller','SeoEducational','SeoMotivational','SeoTravel','SeoScience','SeoPet','SeoTrueCrime','SeoHorror','SeoComedy','SeoCooking','SeoFitness','SeoFantasy','SeoSciFi','SeoDrama']
remaining = [k for k in all_seo if k not in done]
print('Remaining:', remaining)
"
```

## How to add a translated namespace

Use the Edit tool to insert before the closing `}` of the language file:
```json
  },
  "SeoNamespace": {
    "metaTitle": "...",
    ... (100 keys)
  }
```

## After completing a language
1. Validate JSON: `python3 -c "import json; json.load(open('messages/<lang>.json')); print('valid')"`
2. Commit: `git add messages/<lang>.json && git commit -m "Add <lang> SEO translations"`
3. Push: `git push`

## Agent instructions for resuming
When resuming translation for a language:
1. Read `messages/en.json` to get the English source values
2. Check which namespaces are already done in the target language file
3. Translate only the REMAINING namespaces
4. Use the Edit tool (not Bash) to append each namespace to the target file
5. Work in batches of 3-4 namespaces per Edit call
6. After finishing, validate JSON and update this file
