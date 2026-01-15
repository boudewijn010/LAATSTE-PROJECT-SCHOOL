# Task Manager - Taakbeheerder

Een eenvoudige maar krachtige taakmanager gebouwd met **Node.js + Express** en **SQLite** database.

## Functies

✅ **Taken toevoegen** - Voeg nieuwe taken toe met titel en beschrijving
✅ **Taken voltooien** - Markeer taken als voltooid/onvoltooid
✅ **Taken verwijderen** - Verwijder individuele taken
✅ **Filteren** - Toon alle, openstaande of voltooide taken
✅ **Statistieken** - Bekijk totaal, voltooid en openstaande taken
✅ **Persistent opslag** - Alles wordt opgeslagen in SQLite database
✅ **Mooie UI** - Modern design met gradient en animaties

## Installatie

1. **Installeer Node.js** (als je dit nog niet hebt gedaan)

   - Download van https://nodejs.org/

2. **Installeer afhankelijkheden:**

   ```bash
   npm install
   ```

3. **Start de server:**

   ```bash
   npm start
   ```

   Of voor development met auto-reload:

   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Ga naar http://localhost:3000

## Projectstructuur

```
.
├── server.js              # Express server en API endpoints
├── package.json          # Afhankelijkheden
├── tasks.db              # SQLite database (wordt automatisch aangemaakt)
└── public/
    ├── index.html        # Frontend HTML
    ├── style.css         # Styling
    └── app.js            # Frontend JavaScript
```

## API Endpoints

### GET /api/tasks

Haal alle taken op.

**Response:**

```json
[
  {
    "id": 1,
    "title": "Voorbeeld taak",
    "description": "Dit is een beschrijving",
    "completed": 0,
    "created_at": "2026-01-15T10:30:00.000Z"
  }
]
```

### POST /api/tasks

Voeg een nieuwe taak toe.

**Request body:**

```json
{
  "title": "Mijn taak",
  "description": "Optionele beschrijving"
}
```

### PUT /api/tasks/:id

Update een taak.

**Request body:**

```json
{
  "title": "Bijgewerkt",
  "description": "Bijgewerkte beschrijving",
  "completed": 1
}
```

### DELETE /api/tasks/:id

Verwijder een taak.

### DELETE /api/tasks/completed/all

Verwijder alle voltooide taken.

## Gebruikte Technologieën

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite3** - Embedded database
- **CORS** - Cross-Origin Resource Sharing
- **HTML5/CSS3/JavaScript** - Frontend

## Licentie

Gratis te gebruiken voor persoonlijke en educatieve doeleinden.
