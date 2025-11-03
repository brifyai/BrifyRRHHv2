-- Crear tabla para borradores de mensajes
CREATE TABLE IF NOT EXISTS message_drafts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    selected_employee_ids JSONB DEFAULT '[]'::jsonb,
    filters JSONB DEFAULT '{}'::jsonb,
    company_id INTEGER REFERENCES companies(id),
    media_url TEXT,
    media_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, sent
    scheduled_at TIMESTAMP WITH TIME ZONE,
    channel VARCHAR(20) DEFAULT 'whatsapp', -- whatsapp, telegram
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_message_drafts_status ON message_drafts(status);
CREATE INDEX IF NOT EXISTS idx_message_drafts_created_by ON message_drafts(created_by);
CREATE INDEX IF NOT EXISTS idx_message_drafts_company_id ON message_drafts(company_id);
CREATE INDEX IF NOT EXISTS idx_message_drafts_scheduled_at ON message_drafts(scheduled_at);

-- Crear tabla para el historial de envíos de borradores
CREATE TABLE IF NOT EXISTS draft_send_history (
    id SERIAL PRIMARY KEY,
    draft_id INTEGER REFERENCES message_drafts(id) ON DELETE CASCADE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recipient_count INTEGER DEFAULT 0,
    channel VARCHAR(20),
    status VARCHAR(20) DEFAULT 'sent', -- sent, failed
    error_message TEXT
);

-- Políticas RLS para borradores
ALTER TABLE message_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_send_history ENABLE ROW LEVEL SECURITY;

-- Políticas para message_drafts
CREATE POLICY "Users can view their own drafts" ON message_drafts
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own drafts" ON message_drafts
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own drafts" ON message_drafts
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own drafts" ON message_drafts
    FOR DELETE USING (created_by = auth.uid());

-- Políticas para draft_send_history
CREATE POLICY "Users can view history of their drafts" ON draft_send_history
    FOR SELECT USING (
        draft_id IN (
            SELECT id FROM message_drafts WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Users can insert history for their drafts" ON draft_send_history
    FOR INSERT WITH CHECK (
        draft_id IN (
            SELECT id FROM message_drafts WHERE created_by = auth.uid()
        )
    );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_message_drafts_updated_at
    BEFORE UPDATE ON message_drafts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();