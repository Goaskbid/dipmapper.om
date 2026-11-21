CREATE TABLE IF NOT EXISTS sources (id TEXT PRIMARY KEY, url TEXT, name TEXT, checked_at INTEGER, status INTEGER, facts TEXT, etag TEXT, last_modified TEXT, note TEXT);
CREATE TABLE IF NOT EXISTS hosts (host TEXT PRIMARY KEY, robots TEXT, robots_at INTEGER, paused_until INTEGER);
CREATE TABLE IF NOT EXISTS review (rid INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT, name TEXT, url TEXT, found_at INTEGER, kind TEXT, detail TEXT, done INTEGER DEFAULT 0);
