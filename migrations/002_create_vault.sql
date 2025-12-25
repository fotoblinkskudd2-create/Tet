-- Create vault categories table
CREATE TABLE vault_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    danger_level INTEGER DEFAULT 1 CHECK (danger_level BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create vault entries table
CREATE TABLE vault_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES vault_categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    tags TEXT[],
    danger_level INTEGER DEFAULT 1 CHECK (danger_level BETWEEN 1 AND 5),
    warning_text TEXT,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create vault access log table
CREATE TABLE vault_access_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    entry_id UUID REFERENCES vault_entries(id) ON DELETE CASCADE,
    accessed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create vault unlock sessions table
CREATE TABLE vault_unlock_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    session_token TEXT NOT NULL UNIQUE,
    puzzle_solved BOOLEAN DEFAULT FALSE,
    puzzle_type TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_vault_entries_category ON vault_entries(category_id);
CREATE INDEX idx_vault_access_user ON vault_access_log(user_id);
CREATE INDEX idx_vault_access_entry ON vault_access_log(entry_id);
CREATE INDEX idx_vault_unlock_token ON vault_unlock_sessions(session_token);
CREATE INDEX idx_vault_unlock_user ON vault_unlock_sessions(user_id);

-- Create trigger for updated_at on vault_categories
CREATE TRIGGER update_vault_categories_updated_at
    BEFORE UPDATE ON vault_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updated_at on vault_entries
CREATE TRIGGER update_vault_entries_updated_at
    BEFORE UPDATE ON vault_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial vault categories
INSERT INTO vault_categories (name, description, icon, danger_level) VALUES
    ('Konspirasjoner', 'Teorier som utfordrer det offisielle narrativet', '🕵️', 3),
    ('Okkultisme', 'Skjulte mysterier og esoterisk kunnskap', '🔮', 4),
    ('Ekstreme Filosofier', 'Radikale tankesystemer og ideologier', '🧠', 3),
    ('Forbudt Vitenskap', 'Eksperimenter og kunnskap samfunnet skjuler', '⚗️', 5),
    ('Gamle Hemmeligheter', 'Tapt kunnskap fra sivilisasjoner', '📜', 2);

-- Insert sample vault entries
INSERT INTO vault_entries (category_id, title, question, answer, tags, danger_level, warning_text) VALUES
    (
        (SELECT id FROM vault_categories WHERE name = 'Konspirasjoner' LIMIT 1),
        'Hvem kontrollerer egentlig økonomien?',
        'Hvilke skjulte krefter styrer det globale finanssystemet?',
        'Dette er et dypt spørsmål som har blitt diskutert i århundrer. Sentralbanker, store finansinstitusjoner og internasjonale organisasjoner spiller alle viktige roller i det globale økonomiske systemet. Mens noen hevder at demokratisk valgte myndigheter har kontroll, argumenterer kritikere for at uformelle nettverk av finanselite har uforholdsmessig innflytelse. Sannheten er sannsynligvis mer kompleks enn noen enkel konspirasjonsteori antyder - økonomisk makt er distribuert mellom mange aktører med både konkurrerende og overlappende interesser.',
        ARRAY['økonomi', 'sentralbanker', 'finanselite'],
        3,
        '⚠️ Dette innholdet presenterer alternative perspektiver som kan utfordre etablerte syn'
    ),
    (
        (SELECT id FROM vault_categories WHERE name = 'Okkultisme' LIMIT 1),
        'Hva er kaosmagi?',
        'Forklar prinsippene bak kaosmagi og dens praksis',
        'Kaosmagi er en moderne magisk tradisjon utviklet på 1970-tallet, særlig av Peter J. Carroll og Ray Sherwin. Den kombinerer elementer fra ulike okkulte tradisjoner med en pragmatisk, eksperimentell tilnærming. Hovedprinsippene inkluderer: belief as a tool (tro som et verktøy man kan skifte mellom), gnosis (endrede bevissthetsstater), sigilmagi (symbolsk manifestasjon av hensikt), og avvisning av dogmatiske systemer. Utøvere ser magi som en form for anvendt psykologi eller "nevroteknologi" heller enn bokstavelig overnaturlig kraft.',
        ARRAY['magi', 'okkultisme', 'kaos'],
        4,
        '⚠️ ADVARSEL: Innhold om okkulte praksiser. Kun for studieformål.'
    ),
    (
        (SELECT id FROM vault_categories WHERE name = 'Ekstreme Filosofier' LIMIT 1),
        'Hva er nihilisme egentlig?',
        'Utforsk de dypeste aspektene av nihilistisk filosofi',
        'Nihilisme er en filosofisk posisjon som hevder at livet mangler objektiv mening, formål eller iboende verdi. Utviklet av tenkere som Friedrich Nietzsche (som faktisk kritiserte nihilisme), hevder denne filosofien at tradisjonelle verdier og moralsystemer er grunnløse. Eksistensiell nihilisme antyder at individuelle liv mangler mening, mens moralsk nihilisme avviser objektiv moral. Men mange filosofer argumenterer for at erkjennelse av nihilisme kan være et utgangspunkt for å skape personlig mening heller enn å ende i fortvilelse - en posisjon Nietzsche fremmet gjennom konsepter som "Übermensch" og "evig gjenkomst".',
        ARRAY['filosofi', 'eksistensialisme', 'mening'],
        3,
        '⚠️ Dette innholdet utforsker mørke filosofiske konsepter'
    );
