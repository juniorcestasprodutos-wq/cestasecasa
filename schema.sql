-- Create Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT,
    username TEXT,
    password TEXT,
    active BOOLEAN DEFAULT true,
    sale_commission_rate NUMERIC,
    collection_commission_rate NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Clients Table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    neighborhood TEXT,
    phone TEXT,
    city TEXT,
    state TEXT,
    cpf TEXT,
    rg TEXT,
    rg_image TEXT,
    cpf_image TEXT,
    utility_bill_image TEXT,
    house_photo TEXT,
    referral_client_id UUID REFERENCES clients(id),
    lat NUMERIC,
    lng NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    stock_quantity NUMERIC DEFAULT 0,
    stock_control_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Sales Table
CREATE TABLE sales (
    id TEXT PRIMARY KEY,
    client_id UUID REFERENCES clients(id),
    collector_id UUID REFERENCES users(id),
    delivery_person_id UUID REFERENCES users(id),
    date TIMESTAMP WITH TIME ZONE,
    total_amount NUMERIC NOT NULL,
    down_payment NUMERIC DEFAULT 0,
    installments_count INTEGER NOT NULL,
    token_type TEXT,
    status TEXT,
    is_assembly BOOLEAN DEFAULT false,
    assembler_id UUID REFERENCES users(id),
    assembly_value NUMERIC,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Sale Items Table
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id TEXT REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity NUMERIC NOT NULL,
    description TEXT,
    unit_price NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Installments Table
CREATE TABLE installments (
    id TEXT PRIMARY KEY,
    sale_id TEXT REFERENCES sales(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    amount NUMERIC NOT NULL,
    paid_amount NUMERIC DEFAULT 0,
    status TEXT,
    payment_date TIMESTAMP WITH TIME ZONE,
    pix_sent BOOLEAN DEFAULT false,
    manual_adjustment NUMERIC DEFAULT 0,
    confirmed_by_master BOOLEAN DEFAULT false,
    original_due_date TIMESTAMP WITH TIME ZONE,
    reschedule_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Stock Movements Table
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    type TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    sale_id TEXT REFERENCES sales(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Config Table
CREATE TABLE config (
    id TEXT PRIMARY KEY,
    pf_token TEXT,
    pj_token TEXT,
    pj_threshold NUMERIC,
    infinity_pay_token TEXT,
    infinity_pay_enabled BOOLEAN,
    allocation_mode TEXT,
    n8n_webhook_url TEXT,
    auto_reassign_days INTEGER,
    pix_expiration_days INTEGER,
    google_sheet_id TEXT,
    google_api_key TEXT,
    whatsapp_api_token TEXT,
    whatsapp_phone_number_id TEXT,
    apps_script_url TEXT,
    credit_limit_enabled BOOLEAN,
    credit_limit_value NUMERIC,
    whatsapp_auto_reply_enabled BOOLEAN,
    whatsapp_auto_reply_message TEXT,
    whatsapp_forwarding_number TEXT,
    whatsapp_notification_enabled BOOLEAN
);

INSERT INTO config (id) VALUES ('default');

-- Create Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id),
    status TEXT,
    related_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Whatsapp Messages Table
CREATE TABLE whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    message TEXT,
    direction TEXT,
    media_url TEXT,
    media_type TEXT,
    client_id UUID REFERENCES clients(id),
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Disable Row Level Security (RLS) on all tables to allow anonymous access
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE installments DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE config DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages DISABLE ROW LEVEL SECURITY;
