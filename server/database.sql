
-- download extension
CREATE TABLE users (
    user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL
);

-- Categories table to store different product categories
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Products table to store individual items
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(category_id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    is_bestseller BOOLEAN DEFAULT false,
    rating DECIMAL(2,1),
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    is_eggless BOOLEAN DEFAULT false,
    shape VARCHAR(50),
    type VARCHAR(50),
    available_weights JSON,
    variants JSON
);

-- Reviews table to store product reviews
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(product_id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example queries to retrieve data for the UI
-- Get all categories ordered by newest first with their products
CREATE VIEW category_products AS
SELECT 
    c.category_id,
    c.name as category_name,
    c.created_at as category_created_at,
    ARRAY_AGG(
        json_build_object(
            'product_id', p.product_id,
            'name', p.name,
            'price', p.price,
            'image_url', p.image_url,
            'rating', p.rating,
            'review_count', p.review_count
        )
    ) as products
FROM categories c
LEFT JOIN products p ON c.category_id = p.category_id
WHERE c.is_active = true AND p.is_active = true
GROUP BY c.category_id, c.name, c.created_at
ORDER BY c.created_at DESC;

-- Get first 4 products for a category
CREATE VIEW category_preview AS
SELECT 
    c.category_id,
    c.name as category_name,
    (
        SELECT json_agg(p.*)
        FROM (
            SELECT 
                product_id,
                name,
                price,
                image_url,
                rating,
                review_count
            FROM products
            WHERE category_id = c.category_id
                AND is_active = true
            LIMIT 4
        ) p
    ) as preview_products
FROM categories c
WHERE c.is_active = true
ORDER BY c.created_at DESC;



 
-- Cart table to store the main cart information
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cart items table to store individual items in the cart
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time DECIMAL(10,2) NOT NULL, -- Price when added to cart
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- For hamper/bundle products, we need to track their contents
CREATE TABLE cart_item_contents (
    id SERIAL PRIMARY KEY,
    cart_item_id INTEGER NOT NULL REFERENCES cart_items(id) ON DELETE CASCADE,
    content_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1
);

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cart_updated_at
    BEFORE UPDATE ON carts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_item_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE cart_items ADD COLUMN customizations JSONB;
ALTER TABLE products ADD COLUMN is_addon BOOLEAN DEFAULT false;

-- Current Orders Table (For Active Orders)
CREATE TABLE current_orders (
    order_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id),
    items JSONB NOT NULL,  -- Stores cart items with product details
    total DECIMAL(10,2) NOT NULL,
    pickup_status VARCHAR(20) DEFAULT 'pending' 
        CHECK (pickup_status IN ('pending', 'preparing', 'ready_for_pickup', 'picked_up')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contact_phone VARCHAR(20) NOT NULL
);

-- Order History Table (For Completed Orders)
CREATE TABLE order_history (
    order_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id),
    items JSONB NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    picked_up_at TIMESTAMP NOT NULL,  -- Updated field for pick-up completion
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed BOOLEAN DEFAULT false,
    review_request_sent BOOLEAN DEFAULT false
);

ALTER TABLE reviews
ADD COLUMN user_id UUID REFERENCES users(user_id),
ADD COLUMN display_on_homepage BOOLEAN DEFAULT false;

-- Table to track user's pending reviews
CREATE TABLE user_pending_reviews (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id),
    product_id INTEGER NOT NULL REFERENCES products(product_id),
    order_id INTEGER NOT NULL,
    review_status VARCHAR(20) DEFAULT 'pending' 
        CHECK (review_status IN ('pending', 'completed', 'skipped')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_prompted_at TIMESTAMP,
    UNIQUE(user_id, product_id, order_id)
);

-- Update order_history table to include review tracking
ALTER TABLE order_history 
ADD COLUMN reviews_processed BOOLEAN DEFAULT false;

-- Function to automatically create pending reviews after order completion
CREATE OR REPLACE FUNCTION create_pending_reviews()
RETURNS TRIGGER AS $$
BEGIN
    -- Extract products from the JSONB items array and create pending reviews
    WITH order_products AS (
        SELECT DISTINCT 
            (json_array_elements(NEW.items)->>'product_id')::integer as product_id
        FROM (SELECT NEW.items) i
    )
    INSERT INTO user_pending_reviews (user_id, product_id, order_id)
    SELECT 
        NEW.user_id,
        op.product_id,
        NEW.order_id
    FROM order_products op;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create pending reviews when order is completed
CREATE TRIGGER create_pending_reviews_trigger
    AFTER INSERT ON order_history
    FOR EACH ROW
    EXECUTE FUNCTION create_pending_reviews();



-- Fix order_id type in user_pending_reviews to match order_history
ALTER TABLE user_pending_reviews 
ALTER COLUMN order_id TYPE BIGINT;

-- Drop and recreate the trigger function with JSONB fixes
DROP TRIGGER IF EXISTS create_pending_reviews_trigger ON order_history;
DROP FUNCTION IF EXISTS create_pending_reviews();

CREATE OR REPLACE FUNCTION create_pending_reviews()
RETURNS TRIGGER AS $$
BEGIN
    WITH order_products AS (
        SELECT DISTINCT 
            (jsonb_array_elements(NEW.items)->>'product_id')::integer as product_id
    )
    INSERT INTO user_pending_reviews (user_id, product_id, order_id)
    SELECT 
        NEW.user_id,
        op.product_id,
        NEW.order_id
    FROM order_products op;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER create_pending_reviews_trigger
    AFTER INSERT ON order_history
    FOR EACH ROW
    EXECUTE FUNCTION create_pending_reviews();

-- Make sure order_id types match across tables
ALTER TABLE current_orders 
ALTER COLUMN order_id TYPE BIGINT;

ALTER TABLE order_history 
ALTER COLUMN order_id TYPE BIGINT;

ALTER TABLE user_pending_reviews 
ALTER COLUMN order_id TYPE BIGINT;

CREATE OR REPLACE FUNCTION create_pending_reviews()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_pending_reviews (user_id, product_id, order_id)
    SELECT 
        NEW.user_id,
        (jsonb_array_elements(NEW.items)->>'product_id')::integer,
        NEW.order_id
    FROM jsonb_array_elements(NEW.items)
    GROUP BY 1,2,3;  -- Prevent duplicates
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- revert back code
-- Revert order_id type change in user_pending_reviews
ALTER TABLE user_pending_reviews 
ALTER COLUMN order_id TYPE INTEGER;

-- Drop the trigger and function to revert to the previous state
DROP TRIGGER IF EXISTS create_pending_reviews_trigger ON order_history;
DROP FUNCTION IF EXISTS create_pending_reviews();

-- Restore the previous function if available (Replace this with the previous logic if known)
CREATE OR REPLACE FUNCTION create_pending_reviews()
RETURNS TRIGGER AS $$  
BEGIN  
    -- Assuming the previous logic, update this accordingly
    INSERT INTO user_pending_reviews (user_id, product_id, order_id)
    VALUES (NEW.user_id, (NEW.items->>'product_id')::integer, NEW.order_id);
    
    RETURN NEW;  
END;  
$$ LANGUAGE plpgsql;

-- Restore the previous trigger
CREATE TRIGGER create_pending_reviews_trigger  
    AFTER INSERT ON order_history  
    FOR EACH ROW  
    EXECUTE FUNCTION create_pending_reviews();

-- Revert order_id type changes in related tables  
ALTER TABLE current_orders  
ALTER COLUMN order_id TYPE INTEGER;

ALTER TABLE order_history  
ALTER COLUMN order_id TYPE INTEGER;

ALTER TABLE user_pending_reviews  
ALTER COLUMN order_id TYPE INTEGER;

-- First, let's fix the trigger function to properly handle the JSONB array
CREATE OR REPLACE FUNCTION create_pending_reviews()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert pending reviews for each product in the items array
    INSERT INTO user_pending_reviews (user_id, product_id, order_id)
    SELECT 
        NEW.user_id,
        (elem->>'product_id')::integer,
        NEW.order_id
    FROM jsonb_array_elements(NEW.items) AS elem
    WHERE (elem->>'product_id') IS NOT NULL;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger and recreate it
DROP TRIGGER IF EXISTS create_pending_reviews_trigger ON order_history;

CREATE TRIGGER create_pending_reviews_trigger
    AFTER INSERT ON order_history
    FOR EACH ROW
    EXECUTE FUNCTION create_pending_reviews();



ALTER TABLE user_pending_reviews 
ADD COLUMN IF NOT EXISTS dialog_shown BOOLEAN DEFAULT false;

CREATE OR REPLACE FUNCTION update_review_prompt_on_pickup()
RETURNS TRIGGER AS $$
BEGIN
    -- Update pending reviews when an order is picked up
    UPDATE user_pending_reviews
    SET review_status = 'pending', last_prompted_at = NULL, dialog_shown = false
    WHERE order_id = NEW.order_id 
    AND review_status = 'pending';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to activate the function when an order is picked up
CREATE TRIGGER trigger_review_prompt_on_pickup
AFTER UPDATE OF pickup_status ON current_orders
FOR EACH ROW
WHEN (NEW.pickup_status = 'picked_up')
EXECUTE FUNCTION update_review_prompt_on_pickup();

ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS display_on_homepage BOOLEAN DEFAULT false;

CREATE OR REPLACE FUNCTION mark_review_completed()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_pending_reviews
    SET review_status = 'completed'
    WHERE user_id = NEW.user_id AND product_id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mark_review_completed
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION mark_review_completed();

CREATE OR REPLACE FUNCTION mark_review_as_later()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_pending_reviews
    SET last_prompted_at = CURRENT_TIMESTAMP, dialog_shown = true
    WHERE user_id = NEW.user_id AND product_id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    admin_name VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255) NOT NULL UNIQUE,
    admin_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Create hampers table
CREATE TABLE hampers (Q
    hamper_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    is_bestseller BOOLEAN DEFAULT false,
    rating DECIMAL(2,1),
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    contents JSONB NOT NULL, -- Store items included in the hamper
    packaging_type VARCHAR(50), -- e.g., 'Box', 'Basket', 'Luxury Box'
    occasion VARCHAR(50), -- e.g., 'Festival', 'Birthday', 'Anniversary'
    delivery_time VARCHAR(50) DEFAULT '2-3 days'
);


-- Add a hamper_id column to cart_items table
ALTER TABLE cart_items 
ADD COLUMN hamper_id INTEGER REFERENCES hampers(hamper_id),
ALTER COLUMN product_id DROP NOT NULL;

-- Add a check constraint to ensure either product_id or hamper_id is provided
ALTER TABLE cart_items
ADD CONSTRAINT cart_item_type_check 
CHECK (
    (product_id IS NOT NULL AND hamper_id IS NULL) OR 
    (product_id IS NULL AND hamper_id IS NOT NULL)
);


-- Add a type column to hampers table to distinguish between pre-made and custom hampers
ALTER TABLE hampers 
ADD COLUMN IF NOT EXISTS hamper_type VARCHAR(20) 
CHECK (hamper_type IN ('pre-made', 'custom'));

-- Add a table to store custom hamper items
CREATE TABLE custom_hamper_items (
    id SERIAL PRIMARY KEY,
    hamper_id INTEGER REFERENCES hampers(hamper_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id),
    quantity INTEGER DEFAULT 1,
    price_at_time DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add an API endpoint to create custom hampers
CREATE OR REPLACE FUNCTION create_custom_hamper(
    p_name VARCHAR(200),
    p_total_price DECIMAL(10,2),
    p_items JSONB
) RETURNS INTEGER AS $$
DECLARE
    v_hamper_id INTEGER;
BEGIN
    -- Insert the main hamper record
    INSERT INTO hampers (
        name,
        price,
        hamper_type,
        contents,
        created_at
    ) VALUES (
        p_name,
        p_total_price,
        'custom',
        p_items,
        CURRENT_TIMESTAMP
    ) RETURNING hamper_id INTO v_hamper_id;

    -- Insert individual items
    INSERT INTO custom_hamper_items (
        hamper_id,
        product_id,
        price_at_time
    )
    SELECT 
        v_hamper_id,
        (item->>'id')::INTEGER,
        (item->>'price')::DECIMAL(10,2)
    FROM jsonb_array_elements(p_items) AS item;

    RETURN v_hamper_id;
END;
$$ LANGUAGE plpgsql;

-- Modify the cart_items table to handle custom hamper IDs as text
ALTER TABLE cart_items 
ADD COLUMN custom_hamper_id TEXT,
ALTER COLUMN hamper_id DROP NOT NULL;

-- Update the constraint to include custom_hamper_id
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_item_type_check;
ALTER TABLE cart_items
ADD CONSTRAINT cart_item_type_check 
CHECK (
    (product_id IS NOT NULL AND hamper_id IS NULL AND custom_hamper_id IS NULL) OR 
    (product_id IS NULL AND hamper_id IS NOT NULL AND custom_hamper_id IS NULL) OR
    (product_id IS NULL AND hamper_id IS NULL AND custom_hamper_id IS NOT NULL)
);

-- Add new columns to cart_items table for custom hampers
ALTER TABLE cart_items 
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_items JSONB;

-- Update the constraint
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_item_type_check;
ALTER TABLE cart_items
ADD CONSTRAINT cart_item_type_check 
CHECK (
    (product_id IS NOT NULL AND hamper_id IS NULL) OR 
    (product_id IS NULL AND hamper_id IS NOT NULL)
);

ALTER TABLE current_orders
ADD COLUMN admin_status VARCHAR(20) NOT NULL DEFAULT 'pending'
  CHECK (admin_status IN ('pending', 'accepted', 'rejected'));

-- Allow NULL for rejected orders
ALTER TABLE order_history 
ALTER COLUMN picked_up_at DROP NOT NULL;

-- Add status field to track completion/rejection
ALTER TABLE order_history
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'completed'
  CHECK (status IN ('completed', 'rejected'));

-- Add payment_mode column to current_orders
ALTER TABLE current_orders 
ADD COLUMN payment_mode VARCHAR(20) NOT NULL DEFAULT 'takeaway'
CHECK (payment_mode IN ('takeaway', 'online'));

-- Add admin_status to order_history
ALTER TABLE order_history 
ADD COLUMN admin_status VARCHAR(20);

-- Add pickup_status column to current_orders if it doesn't exist
ALTER TABLE current_orders ADD COLUMN IF NOT EXISTS pickup_status VARCHAR(20) NOT NULL 
DEFAULT 'pending' 
CHECK (pickup_status IN ('pending', 'preparing', 'ready_for_pickup', 'picked_up'));

ALTER TABLE order_history
ADD COLUMN payment_mode VARCHAR(50);

-- Add transaction_id column to current_orders table
ALTER TABLE current_orders
ADD COLUMN transaction_id VARCHAR(255);

-- Add an index on transaction_id for better query performance
CREATE INDEX idx_current_orders_transaction_id 
ON current_orders(transaction_id);

-- Optional: Add a comment to document the column
COMMENT ON COLUMN current_orders.transaction_id IS 'PhonePe transaction ID for online payments';

-- Add phone number column to users table
ALTER TABLE users ADD COLUMN user_phone VARCHAR(15);

ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS order_id INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS unique_user_product_order_review 
ON reviews(user_id, product_id, order_id);