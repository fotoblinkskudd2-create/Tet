# 🚀 Micro App Generator

En kraftfull generator för att skapa micro apps i Tet-projektet. Generatorn följer projektets etablerade mönster och skapar automatiskt CLI-verktyg, API-rutter, frontend-sidor och tester.

## 📋 Innehållsförteckning

- [Översikt](#översikt)
- [Installation](#installation)
- [Användning](#användning)
- [App-typer](#app-typer)
- [Exempel](#exempel)
- [Genererade filer](#genererade-filer)
- [Bästa praxis](#bästa-praxis)

## Översikt

Micro App Generator automatiserar skapandet av nya mikro-applikationer genom att:

- ✅ Generera Python CLI-verktyg med komplett struktur
- ✅ Skapa Express.js API-rutter med CRUD-operationer
- ✅ Bygga Next.js React-sidor med state management
- ✅ Generera pytest-testfiler
- ✅ Skapa PostgreSQL-migrationer
- ✅ Följa projektets kodkonventioner och mönster

## Installation

Ingen installation krävs! Verktyget är ett fristående Python-skript.

**Krav:**
- Python 3.7+
- Skrivbehörighet i Tet-projektkatalogen

**Gör skriptet körbart:**
```bash
chmod +x micro_app_generator.py
```

## Användning

### Grundläggande syntax

```bash
python micro_app_generator.py <type> <name> "<description>"
```

**Parametrar:**
- `type` - Typ av app: `cli`, `api`, `page`, eller `full`
- `name` - Appens namn (snake_case, t.ex. `my_cool_app`)
- `description` - Beskrivning av appen (använd citattecken)

**Valfria flaggor:**
- `--output-dir <path>` - Anpassad utdata-katalog (standard: aktuell katalog)
- `--help` - Visa hjälpmeddelande

### Namngivningsregler

✅ **Korrekt:**
- `calculator`
- `task_manager`
- `user_profile`

❌ **Inkorrekt:**
- `TaskManager` (PascalCase)
- `task-manager` (kebab-case)
- `2fast` (börjar med siffra)

## App-typer

### 1. CLI - Python Command Line App

Genererar ett fristående Python CLI-verktyg.

```bash
python micro_app_generator.py cli weather_checker "Check weather for a location"
```

**Genererade filer:**
- `weather_checker.py` - Huvudapplikation
- `tests/test_weather_checker.py` - Testfil

**Funktioner:**
- Argparse CLI-gränssnitt
- Dataclass-baserad resultathantering
- Formaterad utdata med emojis
- Körbar (chmod +x)

### 2. API - Express.js Backend Route

Genererar en RESTful API-rutt med CRUD-operationer.

```bash
python micro_app_generator.py api products "Product catalog management"
```

**Genererade filer:**
- `backend/src/routes/products.ts` - API-rutt

**Funktioner:**
- GET, POST, PUT, DELETE endpoints
- TypeScript-typer och gränssnitt
- Felhantering
- JSON-svar

**API-endpoints:**
- `GET /api/products` - Hämta alla
- `POST /api/products` - Skapa ny
- `PUT /api/products/:id` - Uppdatera
- `DELETE /api/products/:id` - Ta bort

### 3. Page - Next.js React Frontend

Genererar en komplett Next.js-sida.

```bash
python micro_app_generator.py page analytics "Analytics dashboard"
```

**Genererade filer:**
- `frontend/src/pages/analytics/index.tsx` - React-sida

**Funktioner:**
- React hooks (useState, useEffect)
- API-integration
- Formulärhantering
- Laddnings- och feltillstånd
- Responsiv styling
- Norsk UI-text

**URL:** `http://localhost:3000/analytics`

### 4. Full - Full Stack App

Genererar en komplett full-stack mikro-app med alla komponenter.

```bash
python micro_app_generator.py full blog "Personal blogging system"
```

**Genererade filer:**
- `blog.py` - CLI-verktyg
- `backend/src/routes/blog.ts` - API-rutt
- `frontend/src/pages/blog/index.tsx` - Frontend-sida
- `tests/test_blog.py` - Tester
- `migrations/00X_create_blog_table.sql` - Databasmigrering

**Komplett stack:**
- CLI för backend-operationer
- REST API för datahantering
- React UI för användarinteraktion
- Tester för kvalitetssäkring
- Databas för persistens

## Exempel

### Exempel 1: Enkel kalkylator-CLI

```bash
python micro_app_generator.py cli calculator "Simple calculator for basic math"
```

**Användning:**
```bash
python calculator.py "2 + 2"
python calculator.py --help
pytest tests/test_calculator.py
```

### Exempel 2: Todo API

```bash
python micro_app_generator.py api todos "Todo list management API"
```

**Integration i backend:**
```typescript
// backend/src/server.ts
import todoRoutes from './routes/todos';
app.use('/api/todos', todoRoutes);
```

**Testa:**
```bash
curl http://localhost:3000/api/todos
curl -X POST http://localhost:3000/api/todos -d '{"data":"Buy milk"}' -H "Content-Type: application/json"
```

### Exempel 3: Profil-sida

```bash
python micro_app_generator.py page profile "User profile management"
```

**Starta frontend:**
```bash
cd frontend
npm run dev
# Besök: http://localhost:3000/profile
```

### Exempel 4: Komplett e-handel

```bash
python micro_app_generator.py full shop "E-commerce shopping system"
```

**Komplett arbetsflöde:**
```bash
# 1. Kör CLI
python shop.py "List products"

# 2. Tillämpa migrering
psql -d mydb -f migrations/00X_create_shop_table.sql

# 3. Starta backend (lägg till route först)
cd backend && npm start

# 4. Starta frontend
cd frontend && npm run dev

# 5. Kör tester
pytest tests/test_shop.py
```

## Genererade filer

### CLI App Structure (`.py`)

```python
#!/usr/bin/env python3
"""Docstring med beskrivning"""

import argparse
from dataclasses import dataclass

@dataclass
class AppNameResult:
    success: bool
    message: str
    details: Optional[List[str]]

    def format(self) -> str:
        """Formaterad utdata"""

class AppName:
    def process(self, input_data: str) -> AppNameResult:
        """Huvudlogik"""

def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser()
    # ...

if __name__ == "__main__":
    exit(main())
```

### API Route Structure (`.ts`)

```typescript
import { Router, Request, Response } from 'express';

const router = Router();

interface AppNameRequest { /* ... */ }
interface AppNameResponse { /* ... */ }

router.get('/', async (req, res) => { /* ... */ });
router.post('/', async (req, res) => { /* ... */ });
router.put('/:id', async (req, res) => { /* ... */ });
router.delete('/:id', async (req, res) => { /* ... */ });

export default router;
```

### Frontend Page Structure (`.tsx`)

```typescript
import React, { useState, useEffect } from 'react';

interface AppNameData { /* ... */ }

const AppNamePage: React.FC = () => {
    const [data, setData] = useState<AppNameData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => { /* ... */ };
    const handleSubmit = async () => { /* ... */ };

    return (
        <div>{/* JSX */}</div>
    );
};

export default AppNamePage;
```

### Test Structure (`test_*.py`)

```python
import pytest
from app_name import AppName, AppNameResult

class TestAppName:
    def setup_method(self):
        self.app = AppName()

    def test_initialization(self):
        assert self.app.name == "app_name"

    def test_process_basic_input(self):
        result = self.app.process("test")
        assert result.success is True
```

### Migration Structure (`*.sql`)

```sql
CREATE TABLE IF NOT EXISTS app_name (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER app_name_updated_at
    BEFORE UPDATE ON app_name
    FOR EACH ROW
    EXECUTE FUNCTION update_app_name_updated_at();
```

## Bästa praxis

### 1. Planering

✅ **Gör:**
- Definiera tydlig app-beskrivning
- Välj rätt app-typ för användningsfallet
- Använd beskrivande namn i snake_case

❌ **Undvik:**
- Vaga beskrivningar som "Test app"
- Generiska namn som "app1" eller "temp"

### 2. Efter generering

**Checklista:**

CLI:
- [ ] Implementera faktisk logik i `process()`-metoden
- [ ] Lägg till fler CLI-argument om nödvändigt
- [ ] Skriv fler tester för edge cases
- [ ] Kör `python app_name.py --help` för verifiering

API:
- [ ] Implementera faktisk databaslogik
- [ ] Lägg till autentisering/auktorisering vid behov
- [ ] Validera input-data
- [ ] Importera rutten i huvudservern
- [ ] Testa endpoints med curl/Postman

Frontend:
- [ ] Anpassa UI-design
- [ ] Lägg till formvalidering
- [ ] Implementera felhantering
- [ ] Testa i olika webbläsare

Full stack:
- [ ] Kör alla individuella checklistor ovan
- [ ] Tillämpa databasmigrering
- [ ] Testa hela flödet end-to-end

### 3. Kodstandard

Genererade filer följer projektets konventioner:
- **Python:** PEP 8, type hints, dataclasses
- **TypeScript:** Strict mode, async/await, explicit types
- **React:** Functional components, hooks, TypeScript
- **SQL:** PostgreSQL-syntax, triggers, indexes

### 4. Testing

```bash
# Kör specifik testfil
pytest tests/test_app_name.py -v

# Kör alla tester
pytest tests/ -v

# Med coverage
pytest tests/ --cov=. --cov-report=html
```

### 5. Git workflow

```bash
# Efter generering
git add .
git commit -m "Add app_name micro app"
git push origin your-branch
```

## Felsökning

### Problem: "Permission denied"

```bash
chmod +x micro_app_generator.py
```

### Problem: "Name must be lowercase snake_case"

Använd endast små bokstäver och understreck:
```bash
# Fel
python micro_app_generator.py cli MyApp "..."

# Rätt
python micro_app_generator.py cli my_app "..."
```

### Problem: Import errors i genererad API-rutt

Kontrollera att nödvändiga paket är installerade:
```bash
cd backend
npm install express
```

### Problem: Frontend-sidan syns inte

1. Kontrollera att Next.js-servern körs
2. Verifiera att filen finns i rätt katalog
3. Kontrollera filnamn och mappstruktur

## Avancerad användning

### Anpassa templates

Redigera mallar i `micro_app_generator.py`:

```python
# Hitta template-variabeln (t.ex. CLI-template)
template = '''...'''

# Modifiera enligt behov
```

### Skapa egna app-typer

Lägg till ny metod i `MicroAppGenerator`-klassen:

```python
def _generate_custom_app(self):
    """Generate custom app type"""
    # Implementering här
```

Uppdatera `generate()`-metoden:

```python
elif self.config.app_type == "custom":
    self._generate_custom_app()
```

## Support och bidrag

- **Rapportera buggar:** Skapa issue i projektet
- **Föreslå funktioner:** Öppna diskussion
- **Bidra:** Fork, branch, implementera, PR

## Licens

Följer huvudprojektets licens.

---

**Skapad med ❤️ för Tet-projektet**

Generera fantastiska micro apps! 🚀
