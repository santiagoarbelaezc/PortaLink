const db = require('./src/config/db');

async function run() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(255),
          event_category VARCHAR(100) NOT NULL,
          event_label VARCHAR(255),
          event_value NUMERIC,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category);
      CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
      CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
    `);
    console.log('Analytics table created successfully');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
