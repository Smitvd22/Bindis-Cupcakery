PGDMP      2                }            gwoc    17.2    17.2 |    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    16388    gwoc    DATABASE     w   CREATE DATABASE gwoc WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_India.1252';
    DROP DATABASE gwoc;
                     postgres    false                        3079    16423 	   uuid-ossp 	   EXTENSION     ?   CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
    DROP EXTENSION "uuid-ossp";
                        false            �           0    0    EXTENSION "uuid-ossp"    COMMENT     W   COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';
                             false    2                       1255    16778 7   create_custom_hamper(character varying, numeric, jsonb)    FUNCTION     ;  CREATE FUNCTION public.create_custom_hamper(p_name character varying, p_total_price numeric, p_items jsonb) RETURNS integer
    LANGUAGE plpgsql
    AS $$
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
$$;
 k   DROP FUNCTION public.create_custom_hamper(p_name character varying, p_total_price numeric, p_items jsonb);
       public               postgres    false                        1255    16697    create_pending_reviews()    FUNCTION     �  CREATE FUNCTION public.create_pending_reviews() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;
 /   DROP FUNCTION public.create_pending_reviews();
       public               postgres    false                       1255    16725    mark_review_as_later()    FUNCTION     $  CREATE FUNCTION public.mark_review_as_later() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE user_pending_reviews
    SET last_prompted_at = CURRENT_TIMESTAMP, dialog_shown = true
    WHERE user_id = NEW.user_id AND product_id = NEW.product_id;
    
    RETURN NEW;
END;
$$;
 -   DROP FUNCTION public.mark_review_as_later();
       public               postgres    false                       1255    16723    mark_review_completed()    FUNCTION       CREATE FUNCTION public.mark_review_completed() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE user_pending_reviews
    SET review_status = 'completed'
    WHERE user_id = NEW.user_id AND product_id = NEW.product_id;
    
    RETURN NEW;
END;
$$;
 .   DROP FUNCTION public.mark_review_completed();
       public               postgres    false                       1255    16791     update_review_prompt_on_pickup()    FUNCTION     w  CREATE FUNCTION public.update_review_prompt_on_pickup() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update pending reviews when an order is picked up
    UPDATE user_pending_reviews
    SET review_status = 'pending', last_prompted_at = NULL, dialog_shown = false
    WHERE order_id = NEW.order_id 
    AND review_status = 'pending';

    RETURN NEW;
END;
$$;
 7   DROP FUNCTION public.update_review_prompt_on_pickup();
       public               postgres    false            �            1255    16554    update_updated_at_column()    FUNCTION     �   CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;
 1   DROP FUNCTION public.update_updated_at_column();
       public               postgres    false            �            1259    16727    admins    TABLE       CREATE TABLE public.admins (
    admin_id integer NOT NULL,
    admin_name character varying(255) NOT NULL,
    admin_email character varying(255) NOT NULL,
    admin_password character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.admins;
       public         heap r       postgres    false            �            1259    16726    admins_admin_id_seq    SEQUENCE     �   CREATE SEQUENCE public.admins_admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.admins_admin_id_seq;
       public               postgres    false    240            �           0    0    admins_admin_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.admins_admin_id_seq OWNED BY public.admins.admin_id;
          public               postgres    false    239            �            1259    16542    cart_item_contents    TABLE     �   CREATE TABLE public.cart_item_contents (
    id integer NOT NULL,
    cart_item_id integer NOT NULL,
    content_name character varying(255) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL
);
 &   DROP TABLE public.cart_item_contents;
       public         heap r       postgres    false            �            1259    16541    cart_item_contents_id_seq    SEQUENCE     �   CREATE SEQUENCE public.cart_item_contents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.cart_item_contents_id_seq;
       public               postgres    false    232            �           0    0    cart_item_contents_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public.cart_item_contents_id_seq OWNED BY public.cart_item_contents.id;
          public               postgres    false    231            �            1259    16522 
   cart_items    TABLE     l  CREATE TABLE public.cart_items (
    id integer NOT NULL,
    cart_id integer NOT NULL,
    product_id integer,
    quantity integer DEFAULT 1 NOT NULL,
    price_at_time numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    customizations jsonb,
    hamper_id integer,
    custom_hamper_id text,
    is_custom boolean DEFAULT false,
    custom_items jsonb,
    CONSTRAINT cart_item_type_check CHECK ((((product_id IS NOT NULL) AND (hamper_id IS NULL)) OR ((product_id IS NULL) AND (hamper_id IS NOT NULL))))
);
    DROP TABLE public.cart_items;
       public         heap r       postgres    false            �            1259    16521    cart_items_id_seq    SEQUENCE     �   CREATE SEQUENCE public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.cart_items_id_seq;
       public               postgres    false    230            �           0    0    cart_items_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;
          public               postgres    false    229            �            1259    16508    carts    TABLE     �   CREATE TABLE public.carts (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.carts;
       public         heap r       postgres    false            �            1259    16507    carts_id_seq    SEQUENCE     �   CREATE SEQUENCE public.carts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.carts_id_seq;
       public               postgres    false    228            �           0    0    carts_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.carts_id_seq OWNED BY public.carts.id;
          public               postgres    false    227            �            1259    16443 
   categories    TABLE     �   CREATE TABLE public.categories (
    category_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true
);
    DROP TABLE public.categories;
       public         heap r       postgres    false            �            1259    16442    categories_category_id_seq    SEQUENCE     �   CREATE SEQUENCE public.categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.categories_category_id_seq;
       public               postgres    false    220            �           0    0    categories_category_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public.categories_category_id_seq OWNED BY public.categories.category_id;
          public               postgres    false    219            �            1259    16454    products    TABLE     m  CREATE TABLE public.products (
    product_id integer NOT NULL,
    category_id integer,
    name character varying(200) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    image_url character varying(500),
    is_bestseller boolean DEFAULT false,
    rating numeric(2,1),
    review_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true,
    is_eggless boolean DEFAULT false,
    shape character varying(50),
    type character varying(50),
    available_weights json,
    variants json,
    is_addon boolean DEFAULT false
);
    DROP TABLE public.products;
       public         heap r       postgres    false            �            1259    16492    category_preview    VIEW     w  CREATE VIEW public.category_preview AS
 SELECT category_id,
    name AS category_name,
    ( SELECT json_agg(p.*) AS json_agg
           FROM ( SELECT products.product_id,
                    products.name,
                    products.price,
                    products.image_url,
                    products.rating,
                    products.review_count
                   FROM public.products
                  WHERE ((products.category_id = c.category_id) AND (products.is_active = true))
                 LIMIT 4) p) AS preview_products
   FROM public.categories c
  WHERE (is_active = true)
  ORDER BY created_at DESC;
 #   DROP VIEW public.category_preview;
       public       v       postgres    false    222    222    220    222    222    222    222    220    220    220    222    222            �            1259    16487    category_products    VIEW     '  CREATE VIEW public.category_products AS
 SELECT c.category_id,
    c.name AS category_name,
    c.created_at AS category_created_at,
    array_agg(json_build_object('product_id', p.product_id, 'name', p.name, 'price', p.price, 'image_url', p.image_url, 'rating', p.rating, 'review_count', p.review_count)) AS products
   FROM (public.categories c
     LEFT JOIN public.products p ON ((c.category_id = p.category_id)))
  WHERE ((c.is_active = true) AND (p.is_active = true))
  GROUP BY c.category_id, c.name, c.created_at
  ORDER BY c.created_at DESC;
 $   DROP VIEW public.category_products;
       public       v       postgres    false    220    222    222    222    222    222    222    222    222    220    220    220            �            1259    16596    current_orders    TABLE     �  CREATE TABLE public.current_orders (
    order_id integer NOT NULL,
    user_id uuid NOT NULL,
    items jsonb NOT NULL,
    total numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    contact_phone character varying(20) NOT NULL,
    payment_mode character varying(20),
    order_status character varying(50) DEFAULT 'pending'::character varying,
    rejection_reason text,
    accepted_at timestamp without time zone,
    rejected_at timestamp without time zone,
    ready_at timestamp without time zone,
    ready_for_pickup boolean DEFAULT false,
    admin_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    pickup_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    CONSTRAINT current_orders_admin_status_check CHECK (((admin_status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'rejected'::character varying])::text[]))),
    CONSTRAINT current_orders_order_status_check CHECK (((order_status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'rejected'::character varying, 'preparing'::character varying, 'ready_for_pickup'::character varying, 'picked_up'::character varying])::text[]))),
    CONSTRAINT current_orders_payment_mode_check CHECK (((payment_mode)::text = ANY ((ARRAY['online'::character varying, 'takeaway'::character varying])::text[]))),
    CONSTRAINT current_orders_pickup_status_check CHECK (((pickup_status)::text = ANY ((ARRAY['pending'::character varying, 'preparing'::character varying, 'ready_for_pickup'::character varying, 'picked_up'::character varying])::text[])))
);
 "   DROP TABLE public.current_orders;
       public         heap r       postgres    false            �            1259    16595    current_orders_order_id_seq    SEQUENCE     �   CREATE SEQUENCE public.current_orders_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public.current_orders_order_id_seq;
       public               postgres    false    234            �           0    0    current_orders_order_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public.current_orders_order_id_seq OWNED BY public.current_orders.order_id;
          public               postgres    false    233            �            1259    16760    custom_hamper_items    TABLE       CREATE TABLE public.custom_hamper_items (
    id integer NOT NULL,
    hamper_id integer,
    product_id integer,
    quantity integer DEFAULT 1,
    price_at_time numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 '   DROP TABLE public.custom_hamper_items;
       public         heap r       postgres    false            �            1259    16759    custom_hamper_items_id_seq    SEQUENCE     �   CREATE SEQUENCE public.custom_hamper_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.custom_hamper_items_id_seq;
       public               postgres    false    244            �           0    0    custom_hamper_items_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public.custom_hamper_items_id_seq OWNED BY public.custom_hamper_items.id;
          public               postgres    false    243            �            1259    16739    hampers    TABLE       CREATE TABLE public.hampers (
    hamper_id integer NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    image_url character varying(500),
    is_bestseller boolean DEFAULT false,
    rating numeric(2,1),
    review_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true,
    contents jsonb NOT NULL,
    packaging_type character varying(50),
    occasion character varying(50),
    delivery_time character varying(50) DEFAULT '2-3 days'::character varying,
    hamper_type character varying(20),
    CONSTRAINT hampers_hamper_type_check CHECK (((hamper_type)::text = ANY ((ARRAY['pre-made'::character varying, 'custom'::character varying])::text[])))
);
    DROP TABLE public.hampers;
       public         heap r       postgres    false            �            1259    16738    hampers_hamper_id_seq    SEQUENCE     �   CREATE SEQUENCE public.hampers_hamper_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.hampers_hamper_id_seq;
       public               postgres    false    242            �           0    0    hampers_hamper_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.hampers_hamper_id_seq OWNED BY public.hampers.hamper_id;
          public               postgres    false    241            �            1259    16613    order_history    TABLE     �  CREATE TABLE public.order_history (
    order_id integer NOT NULL,
    user_id uuid NOT NULL,
    items jsonb NOT NULL,
    total numeric(10,2) NOT NULL,
    picked_up_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reviewed boolean DEFAULT false,
    review_request_sent boolean DEFAULT false,
    reviews_processed boolean DEFAULT false,
    contact_phone character varying(20),
    order_status character varying(50),
    rejection_reason text,
    accepted_at timestamp without time zone,
    rejected_at timestamp without time zone,
    ready_at timestamp without time zone,
    status character varying(20) DEFAULT 'completed'::character varying NOT NULL,
    admin_status character varying(20),
    CONSTRAINT order_history_status_check CHECK (((status)::text = ANY ((ARRAY['completed'::character varying, 'rejected'::character varying])::text[])))
);
 !   DROP TABLE public.order_history;
       public         heap r       postgres    false            �            1259    16612    order_history_order_id_seq    SEQUENCE     �   CREATE SEQUENCE public.order_history_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 1   DROP SEQUENCE public.order_history_order_id_seq;
       public               postgres    false    236            �           0    0    order_history_order_id_seq    SEQUENCE OWNED BY     Y   ALTER SEQUENCE public.order_history_order_id_seq OWNED BY public.order_history.order_id;
          public               postgres    false    235            �            1259    16453    products_product_id_seq    SEQUENCE     �   CREATE SEQUENCE public.products_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.products_product_id_seq;
       public               postgres    false    222            �           0    0    products_product_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.products_product_id_seq OWNED BY public.products.product_id;
          public               postgres    false    221            �            1259    16472    reviews    TABLE     T  CREATE TABLE public.reviews (
    review_id integer NOT NULL,
    product_id integer,
    rating integer,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id uuid,
    display_on_homepage boolean DEFAULT false,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);
    DROP TABLE public.reviews;
       public         heap r       postgres    false            �            1259    16471    reviews_review_id_seq    SEQUENCE     �   CREATE SEQUENCE public.reviews_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.reviews_review_id_seq;
       public               postgres    false    224            �           0    0    reviews_review_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.reviews_review_id_seq OWNED BY public.reviews.review_id;
          public               postgres    false    223            �            1259    16636    user_pending_reviews    TABLE     \  CREATE TABLE public.user_pending_reviews (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    product_id integer NOT NULL,
    order_id integer NOT NULL,
    review_status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_prompted_at timestamp without time zone,
    dialog_shown boolean DEFAULT false,
    CONSTRAINT user_pending_reviews_review_status_check CHECK (((review_status)::text = ANY ((ARRAY['pending'::character varying, 'completed'::character varying, 'skipped'::character varying])::text[])))
);
 (   DROP TABLE public.user_pending_reviews;
       public         heap r       postgres    false            �            1259    16635    user_pending_reviews_id_seq    SEQUENCE     �   CREATE SEQUENCE public.user_pending_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 2   DROP SEQUENCE public.user_pending_reviews_id_seq;
       public               postgres    false    238            �           0    0    user_pending_reviews_id_seq    SEQUENCE OWNED BY     [   ALTER SEQUENCE public.user_pending_reviews_id_seq OWNED BY public.user_pending_reviews.id;
          public               postgres    false    237            �            1259    16434    users    TABLE     �   CREATE TABLE public.users (
    user_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_name character varying(255) NOT NULL,
    user_email character varying(255) NOT NULL,
    user_password character varying(255) NOT NULL
);
    DROP TABLE public.users;
       public         heap r       postgres    false    2            �           2604    16730    admins admin_id    DEFAULT     r   ALTER TABLE ONLY public.admins ALTER COLUMN admin_id SET DEFAULT nextval('public.admins_admin_id_seq'::regclass);
 >   ALTER TABLE public.admins ALTER COLUMN admin_id DROP DEFAULT;
       public               postgres    false    239    240    240            �           2604    16545    cart_item_contents id    DEFAULT     ~   ALTER TABLE ONLY public.cart_item_contents ALTER COLUMN id SET DEFAULT nextval('public.cart_item_contents_id_seq'::regclass);
 D   ALTER TABLE public.cart_item_contents ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    231    232    232            �           2604    16525    cart_items id    DEFAULT     n   ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);
 <   ALTER TABLE public.cart_items ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    229    230    230            �           2604    16511    carts id    DEFAULT     d   ALTER TABLE ONLY public.carts ALTER COLUMN id SET DEFAULT nextval('public.carts_id_seq'::regclass);
 7   ALTER TABLE public.carts ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    227    228    228            �           2604    16446    categories category_id    DEFAULT     �   ALTER TABLE ONLY public.categories ALTER COLUMN category_id SET DEFAULT nextval('public.categories_category_id_seq'::regclass);
 E   ALTER TABLE public.categories ALTER COLUMN category_id DROP DEFAULT;
       public               postgres    false    220    219    220            �           2604    16699    current_orders order_id    DEFAULT     �   ALTER TABLE ONLY public.current_orders ALTER COLUMN order_id SET DEFAULT nextval('public.current_orders_order_id_seq'::regclass);
 F   ALTER TABLE public.current_orders ALTER COLUMN order_id DROP DEFAULT;
       public               postgres    false    234    233    234            �           2604    16763    custom_hamper_items id    DEFAULT     �   ALTER TABLE ONLY public.custom_hamper_items ALTER COLUMN id SET DEFAULT nextval('public.custom_hamper_items_id_seq'::regclass);
 E   ALTER TABLE public.custom_hamper_items ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    244    243    244            �           2604    16742    hampers hamper_id    DEFAULT     v   ALTER TABLE ONLY public.hampers ALTER COLUMN hamper_id SET DEFAULT nextval('public.hampers_hamper_id_seq'::regclass);
 @   ALTER TABLE public.hampers ALTER COLUMN hamper_id DROP DEFAULT;
       public               postgres    false    242    241    242            �           2604    16708    order_history order_id    DEFAULT     �   ALTER TABLE ONLY public.order_history ALTER COLUMN order_id SET DEFAULT nextval('public.order_history_order_id_seq'::regclass);
 E   ALTER TABLE public.order_history ALTER COLUMN order_id DROP DEFAULT;
       public               postgres    false    235    236    236            �           2604    16457    products product_id    DEFAULT     z   ALTER TABLE ONLY public.products ALTER COLUMN product_id SET DEFAULT nextval('public.products_product_id_seq'::regclass);
 B   ALTER TABLE public.products ALTER COLUMN product_id DROP DEFAULT;
       public               postgres    false    221    222    222            �           2604    16475    reviews review_id    DEFAULT     v   ALTER TABLE ONLY public.reviews ALTER COLUMN review_id SET DEFAULT nextval('public.reviews_review_id_seq'::regclass);
 @   ALTER TABLE public.reviews ALTER COLUMN review_id DROP DEFAULT;
       public               postgres    false    223    224    224            �           2604    16639    user_pending_reviews id    DEFAULT     �   ALTER TABLE ONLY public.user_pending_reviews ALTER COLUMN id SET DEFAULT nextval('public.user_pending_reviews_id_seq'::regclass);
 F   ALTER TABLE public.user_pending_reviews ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    237    238    238            �          0    16727    admins 
   TABLE DATA           _   COPY public.admins (admin_id, admin_name, admin_email, admin_password, created_at) FROM stdin;
    public               postgres    false    240   y�       �          0    16542    cart_item_contents 
   TABLE DATA           V   COPY public.cart_item_contents (id, cart_item_id, content_name, quantity) FROM stdin;
    public               postgres    false    232   �       �          0    16522 
   cart_items 
   TABLE DATA           �   COPY public.cart_items (id, cart_id, product_id, quantity, price_at_time, created_at, updated_at, customizations, hamper_id, custom_hamper_id, is_custom, custom_items) FROM stdin;
    public               postgres    false    230   $�       �          0    16508    carts 
   TABLE DATA           D   COPY public.carts (id, user_id, created_at, updated_at) FROM stdin;
    public               postgres    false    228   D�       �          0    16443 
   categories 
   TABLE DATA           [   COPY public.categories (category_id, name, description, created_at, is_active) FROM stdin;
    public               postgres    false    220   �       �          0    16596    current_orders 
   TABLE DATA           �   COPY public.current_orders (order_id, user_id, items, total, created_at, contact_phone, payment_mode, order_status, rejection_reason, accepted_at, rejected_at, ready_at, ready_for_pickup, admin_status, pickup_status) FROM stdin;
    public               postgres    false    234   q�       �          0    16760    custom_hamper_items 
   TABLE DATA           m   COPY public.custom_hamper_items (id, hamper_id, product_id, quantity, price_at_time, created_at) FROM stdin;
    public               postgres    false    244   ��       �          0    16739    hampers 
   TABLE DATA           �   COPY public.hampers (hamper_id, name, description, price, image_url, is_bestseller, rating, review_count, created_at, is_active, contents, packaging_type, occasion, delivery_time, hamper_type) FROM stdin;
    public               postgres    false    242   ��       �          0    16613    order_history 
   TABLE DATA           �   COPY public.order_history (order_id, user_id, items, total, picked_up_at, created_at, reviewed, review_request_sent, reviews_processed, contact_phone, order_status, rejection_reason, accepted_at, rejected_at, ready_at, status, admin_status) FROM stdin;
    public               postgres    false    236   ��       �          0    16454    products 
   TABLE DATA           �   COPY public.products (product_id, category_id, name, description, price, image_url, is_bestseller, rating, review_count, created_at, is_active, is_eggless, shape, type, available_weights, variants, is_addon) FROM stdin;
    public               postgres    false    222   �       �          0    16472    reviews 
   TABLE DATA           s   COPY public.reviews (review_id, product_id, rating, comment, created_at, user_id, display_on_homepage) FROM stdin;
    public               postgres    false    224   `�       �          0    16636    user_pending_reviews 
   TABLE DATA           �   COPY public.user_pending_reviews (id, user_id, product_id, order_id, review_status, created_at, last_prompted_at, dialog_shown) FROM stdin;
    public               postgres    false    238   |�       �          0    16434    users 
   TABLE DATA           N   COPY public.users (user_id, user_name, user_email, user_password) FROM stdin;
    public               postgres    false    218   �       �           0    0    admins_admin_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.admins_admin_id_seq', 2, true);
          public               postgres    false    239            �           0    0    cart_item_contents_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.cart_item_contents_id_seq', 1, false);
          public               postgres    false    231            �           0    0    cart_items_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.cart_items_id_seq', 65, true);
          public               postgres    false    229            �           0    0    carts_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.carts_id_seq', 8, true);
          public               postgres    false    227            �           0    0    categories_category_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.categories_category_id_seq', 11, true);
          public               postgres    false    219            �           0    0    current_orders_order_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public.current_orders_order_id_seq', 25, true);
          public               postgres    false    233            �           0    0    custom_hamper_items_id_seq    SEQUENCE SET     I   SELECT pg_catalog.setval('public.custom_hamper_items_id_seq', 1, false);
          public               postgres    false    243            �           0    0    hampers_hamper_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.hampers_hamper_id_seq', 19, true);
          public               postgres    false    241            �           0    0    order_history_order_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.order_history_order_id_seq', 2, true);
          public               postgres    false    235            �           0    0    products_product_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.products_product_id_seq', 24, true);
          public               postgres    false    221            �           0    0    reviews_review_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.reviews_review_id_seq', 51, true);
          public               postgres    false    223            �           0    0    user_pending_reviews_id_seq    SEQUENCE SET     J   SELECT pg_catalog.setval('public.user_pending_reviews_id_seq', 27, true);
          public               postgres    false    237                        2606    16737    admins admins_admin_email_key 
   CONSTRAINT     _   ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_admin_email_key UNIQUE (admin_email);
 G   ALTER TABLE ONLY public.admins DROP CONSTRAINT admins_admin_email_key;
       public                 postgres    false    240                       2606    16735    admins admins_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (admin_id);
 <   ALTER TABLE ONLY public.admins DROP CONSTRAINT admins_pkey;
       public                 postgres    false    240            �           2606    16548 *   cart_item_contents cart_item_contents_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.cart_item_contents
    ADD CONSTRAINT cart_item_contents_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public.cart_item_contents DROP CONSTRAINT cart_item_contents_pkey;
       public                 postgres    false    232            �           2606    16530    cart_items cart_items_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.cart_items DROP CONSTRAINT cart_items_pkey;
       public                 postgres    false    230            �           2606    16515    carts carts_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.carts DROP CONSTRAINT carts_pkey;
       public                 postgres    false    228            �           2606    16452    categories categories_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);
 D   ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_pkey;
       public                 postgres    false    220            �           2606    16701 "   current_orders current_orders_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.current_orders
    ADD CONSTRAINT current_orders_pkey PRIMARY KEY (order_id);
 L   ALTER TABLE ONLY public.current_orders DROP CONSTRAINT current_orders_pkey;
       public                 postgres    false    234                       2606    16767 ,   custom_hamper_items custom_hamper_items_pkey 
   CONSTRAINT     j   ALTER TABLE ONLY public.custom_hamper_items
    ADD CONSTRAINT custom_hamper_items_pkey PRIMARY KEY (id);
 V   ALTER TABLE ONLY public.custom_hamper_items DROP CONSTRAINT custom_hamper_items_pkey;
       public                 postgres    false    244                       2606    16751    hampers hampers_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.hampers
    ADD CONSTRAINT hampers_pkey PRIMARY KEY (hamper_id);
 >   ALTER TABLE ONLY public.hampers DROP CONSTRAINT hampers_pkey;
       public                 postgres    false    242            �           2606    16710     order_history order_history_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.order_history
    ADD CONSTRAINT order_history_pkey PRIMARY KEY (order_id);
 J   ALTER TABLE ONLY public.order_history DROP CONSTRAINT order_history_pkey;
       public                 postgres    false    236            �           2606    16465    products products_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);
 @   ALTER TABLE ONLY public.products DROP CONSTRAINT products_pkey;
       public                 postgres    false    222            �           2606    16481    reviews reviews_pkey 
   CONSTRAINT     Y   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);
 >   ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_pkey;
       public                 postgres    false    224            �           2606    16644 .   user_pending_reviews user_pending_reviews_pkey 
   CONSTRAINT     l   ALTER TABLE ONLY public.user_pending_reviews
    ADD CONSTRAINT user_pending_reviews_pkey PRIMARY KEY (id);
 X   ALTER TABLE ONLY public.user_pending_reviews DROP CONSTRAINT user_pending_reviews_pkey;
       public                 postgres    false    238            �           2606    16718 I   user_pending_reviews user_pending_reviews_user_id_product_id_order_id_key 
   CONSTRAINT     �   ALTER TABLE ONLY public.user_pending_reviews
    ADD CONSTRAINT user_pending_reviews_user_id_product_id_order_id_key UNIQUE (user_id, product_id, order_id);
 s   ALTER TABLE ONLY public.user_pending_reviews DROP CONSTRAINT user_pending_reviews_user_id_product_id_order_id_key;
       public                 postgres    false    238    238    238            �           2606    16441    users users_pkey 
   CONSTRAINT     S   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    218            �           1259    16795    idx_current_orders_status    INDEX     \   CREATE INDEX idx_current_orders_status ON public.current_orders USING btree (order_status);
 -   DROP INDEX public.idx_current_orders_status;
       public                 postgres    false    234            �           1259    16794    idx_current_orders_user_id    INDEX     X   CREATE INDEX idx_current_orders_user_id ON public.current_orders USING btree (user_id);
 .   DROP INDEX public.idx_current_orders_user_id;
       public                 postgres    false    234                       2620    16719 ,   order_history create_pending_reviews_trigger    TRIGGER     �   CREATE TRIGGER create_pending_reviews_trigger AFTER INSERT ON public.order_history FOR EACH ROW EXECUTE FUNCTION public.create_pending_reviews();
 E   DROP TRIGGER create_pending_reviews_trigger ON public.order_history;
       public               postgres    false    256    236                       2620    16724 %   reviews trigger_mark_review_completed    TRIGGER     �   CREATE TRIGGER trigger_mark_review_completed AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.mark_review_completed();
 >   DROP TRIGGER trigger_mark_review_completed ON public.reviews;
       public               postgres    false    257    224                       2620    16792 .   current_orders trigger_review_prompt_on_pickup    TRIGGER     �   CREATE TRIGGER trigger_review_prompt_on_pickup AFTER UPDATE OF order_status ON public.current_orders FOR EACH ROW WHEN (((new.order_status)::text = 'picked_up'::text)) EXECUTE FUNCTION public.update_review_prompt_on_pickup();
 G   DROP TRIGGER trigger_review_prompt_on_pickup ON public.current_orders;
       public               postgres    false    234    260    234    234                       2620    16556 &   cart_items update_cart_item_updated_at    TRIGGER     �   CREATE TRIGGER update_cart_item_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 ?   DROP TRIGGER update_cart_item_updated_at ON public.cart_items;
       public               postgres    false    255    230                       2620    16555    carts update_cart_updated_at    TRIGGER     �   CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 5   DROP TRIGGER update_cart_updated_at ON public.carts;
       public               postgres    false    255    228                       2606    16549 7   cart_item_contents cart_item_contents_cart_item_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cart_item_contents
    ADD CONSTRAINT cart_item_contents_cart_item_id_fkey FOREIGN KEY (cart_item_id) REFERENCES public.cart_items(id) ON DELETE CASCADE;
 a   ALTER TABLE ONLY public.cart_item_contents DROP CONSTRAINT cart_item_contents_cart_item_id_fkey;
       public               postgres    false    232    4850    230                       2606    16531 "   cart_items cart_items_cart_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE;
 L   ALTER TABLE ONLY public.cart_items DROP CONSTRAINT cart_items_cart_id_fkey;
       public               postgres    false    228    4848    230                       2606    16752 $   cart_items cart_items_hamper_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_hamper_id_fkey FOREIGN KEY (hamper_id) REFERENCES public.hampers(hamper_id);
 N   ALTER TABLE ONLY public.cart_items DROP CONSTRAINT cart_items_hamper_id_fkey;
       public               postgres    false    242    4868    230                       2606    16536 %   cart_items cart_items_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;
 O   ALTER TABLE ONLY public.cart_items DROP CONSTRAINT cart_items_product_id_fkey;
       public               postgres    false    230    4844    222            
           2606    16516    carts carts_user_id_fkey    FK CONSTRAINT     |   ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);
 B   ALTER TABLE ONLY public.carts DROP CONSTRAINT carts_user_id_fkey;
       public               postgres    false    218    228    4840                       2606    16607 *   current_orders current_orders_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.current_orders
    ADD CONSTRAINT current_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);
 T   ALTER TABLE ONLY public.current_orders DROP CONSTRAINT current_orders_user_id_fkey;
       public               postgres    false    234    4840    218                       2606    16768 6   custom_hamper_items custom_hamper_items_hamper_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.custom_hamper_items
    ADD CONSTRAINT custom_hamper_items_hamper_id_fkey FOREIGN KEY (hamper_id) REFERENCES public.hampers(hamper_id) ON DELETE CASCADE;
 `   ALTER TABLE ONLY public.custom_hamper_items DROP CONSTRAINT custom_hamper_items_hamper_id_fkey;
       public               postgres    false    242    244    4868                       2606    16773 7   custom_hamper_items custom_hamper_items_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.custom_hamper_items
    ADD CONSTRAINT custom_hamper_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id);
 a   ALTER TABLE ONLY public.custom_hamper_items DROP CONSTRAINT custom_hamper_items_product_id_fkey;
       public               postgres    false    244    222    4844                       2606    16624 (   order_history order_history_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.order_history
    ADD CONSTRAINT order_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);
 R   ALTER TABLE ONLY public.order_history DROP CONSTRAINT order_history_user_id_fkey;
       public               postgres    false    218    236    4840                       2606    16466 "   products products_category_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id);
 L   ALTER TABLE ONLY public.products DROP CONSTRAINT products_category_id_fkey;
       public               postgres    false    220    222    4842                       2606    16482    reviews reviews_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id);
 I   ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_product_id_fkey;
       public               postgres    false    222    224    4844            	           2606    16630    reviews reviews_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);
 F   ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_user_id_fkey;
       public               postgres    false    4840    224    218                       2606    16652 9   user_pending_reviews user_pending_reviews_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_pending_reviews
    ADD CONSTRAINT user_pending_reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id);
 c   ALTER TABLE ONLY public.user_pending_reviews DROP CONSTRAINT user_pending_reviews_product_id_fkey;
       public               postgres    false    238    222    4844                       2606    16647 6   user_pending_reviews user_pending_reviews_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_pending_reviews
    ADD CONSTRAINT user_pending_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);
 `   ALTER TABLE ONLY public.user_pending_reviews DROP CONSTRAINT user_pending_reviews_user_id_fkey;
       public               postgres    false    238    218    4840            �   ~   x�3�LL��̃�鹉�9z����*F�*�*����ia������^i&�z�i��~�Ŗy���ٞIN����N�9��Ή�FF��F��&
fVƆV�Fz�&��V�\1z\\\ "�"6      �      x������ � �      �     x��ԽN�0�9}��+�e'vbge����G>Ļ�۵�"E����d'�������e�~G�Eˬ�#� ��@�����sߺ�v�]��G�2�ӱrۿ�wsmꟇ��Jyz?���z^�ek|Q��J&+*˨�1����ULጉ�Z�M�i���Ϩ��̓Ж�4PE]r<�E�ɲW�*i��`V��*K������Hx��-Q�aOE�k�˝�2hJ1�UT��iU����na�,*1���0$#*!ZM����f7W      �   �   x����! �g���_���a�4``��2ʿ��t��ì�5�azE��7��F��%h�����M������OԖ�/��E}�O ����O��aV��=�=D�jc9+�\C�@�C�T��J�A��l�:b����#�q>��\oCW �Δ��C�      �   s  x���=O�0�kﯘ��"�8N���@Z��IfwM�x'����1-4׹�y�y_���8G�&��=E�<��}��t�K7��#M'��'�~%Uy!�" ��1��d��Z�y�ă�4�n�7��?P묇6�m���1�3BgO��r��hp��nx��]X�L���ж6�0��y%g��U�Hi
�P6k�iq�m�v&�����;��:7���H�,;�.01���9��"}rU�r#�y��D��������,w�+ ��9f��ֲ�Fll������{x޻�x��S�<���t:�R�:`\��׃�q�ɕc��+@ŧLY�
0�(�_]�p�����u�]{��q��n���ІkTU��*�>e����/��      �      x������ � �      �      x������ � �      �   �  x�͘�n�8���� r1W���%X,⤻�ӧ�3��=0e�MInR��Y�����O�EJ�%Kq;=ݻ8�<뫿�h˸���ܢ�T�쁢W,)Ѣx4.�+��J����F%+rT$h-hƪ�b�Q�R"��Hn(���yIc�r�QN�$/њ�+t��̛�����Z�/.X���|��bC��FEvaZ��7{�i��k)����l6��[Sߛ|ƾi��;˛�i{ش��"+������㸾����sV��|��/�,���,�-?�����>PC\�\��1A�I��i����[6�FT�'i/^Ɵ���F9v��\��p����Vߝ�����k��2-�K����I�
�$[S�JJ�/���>d�=�Ih�a$��Ro9�v�_���Nj�p\��pd\$q��f��/�h*��Vhؖy@���5T���i]���]� �߲�CozZ7��L������|
�7���Ǖ��(�]((p�lC8�as�P�l(J��#%\�4�͔Ӕ(І�i+�FI�SJ	/�m�#��N!%[ZP�U�q}AZ8	��+O�s�dI�� �Lx^�xC:y��������BJ:�c�J�K���ZT��H	C�E�	]AR�D'�:�A�&��P�LR�N�@>�xk�����)�8ԕ��"�/~�����԰�S���^8���Z�届����z1�c�!.�^K͵�C����J�5�T�פ��е��!��H�t����;}�Q~;�,�\�`Z�� zFO�]��$Z�&%���ݳ���Vo�J�x�N<i2&X�����h���f��XoP��#V�+|�Ҹ^����)���������4͡"�w#����c�;4,{�fƭ.J??A��
-�*TYcy\�[�v㞒
R*���`�׉1j3�d/^Xl��dj8�)��	ZP�*����g�#e�>][M^�[A� ��j0⼮��6�H�o;v�����O��EӒ���D��.�xKV�Z�7�:�:�l��]����\&��dWբBf�ã���z8'�Pќ��E8��KJ\o���a�&|��m�D�a�\Po��7Z� �Ŗʔ����e9����j-D%S���-���	�rחQ`|(��k	��Ӕ�� ����@?�XO1�5��þC����"M�(Ȓʋ���j��t����m�d��Bt��} rYqN`Ϋ��{�#ɪ|����h�����k�N��i��{�ݡ��1�w��N3�uZbPg�E�$Jw��K���$,�']u�����Ah��6���q�/�%���r(����hA���#�e�?����>ߢ>߭:�(���t�����>�4�3)��պU����x�-�B��,Bi���F�{`^B��9�Y+�}��h� ���+Z�Ls:���I7ʤ��+�O��������i3�p�P�CrM~���'��A0�F�琧�,�����jG�)�E�>�w�."J&	��U�5���D��[�0��߃�6to3��9鲵蚈��o'�|Ui����W����Þ�n�t�5�y�Tq%�_�-ۀh��*Ȣ��pj4��+�te U��e��ꓴ��?����T+8��}UT����C�x聀%;�p\R�@R��h}�#M��Ju���ɣ�V�18�*���?�37��D=u"�C�37��L]ӵw�TŰ�v��.}L*:At~(��1� 2�5,�4��*�Մ�fPH"��r!. �ԟ:X ���H[{f�C���v�ñ�3�1���N�n�Ң��(�	���m�l����͞��Q�}e�93�����֡��;�[��`�^R!�(`���>�t�s���f#���/8���a`9n�q���d{u��d�nX���������l�٠'������7|�g�o�sכ��cz��0�#������a�S�
���/J8Dо�� ��ۨ'���b��l���_�CmJJ��j��O�}��_����f�
���[*�
���[�s��'=F�ggg�
�B�      �   A  x��Y�n�F}����s�؝��c��4@�%1�Z�l$�)�n�����d��m��kс\�����=sf����RK'T�j"@��)Ka���4���t:z�y��.��%�~6�L^�>y>���ϒ��:K+�VJ������K\f�W��&-?d3\��n�2_fO�,_��y���>���>��p���:û���i��a-��zU=�%��b����h��P�
�J��NX� gw�������K���~�� ��gy�/�eN�L����Yr�܋�"[��MY�u��ez��&b�r�n����p*˛��Z�hC�w�z���η��|��V��kp��ie?w@W�if����.����[�j�U>�~�����L��kp!*��Eh �kG5QZp��tL8i��_<�ǳ��Cǳ3���#�#ZZ�6� ��~ 1��(���Pb��P���c�h���M�t�$"4������e�u���U|��;OX�p��C�d�H �t�DqG�|��{�O���!�Φ�s��BkFV�������q��^��K��~�W���G_���y����Ȯh6��M߮�-׶����Ɉ3a�!�8#T��P31'u���mp!�6���x}��k���Mq���2��Vg�7т!ЪU����;��.�}�a�����'��k�ԄV�MB ��z�����<tv�I��=P��>ܰg>�*����~	��2��(�-��g�qA�2����1�D򓎯��DH�
�:d�0�7�Ֆ[��ϿEwy�s�P!�B�I6�T��mӄ
�MU?�=tա�5W�m�#���W�v+3U���2�M�2�_��k�)�M&�0��P2��`�D� &J�Yd
b��	�D)��1��2CQ��0a�C��Oh��&z=^�I�}8��eLw�=h��to��/���>%��Rɻ�RHU�7��h��4M:�c���C�Cc+���a���0wa"�<���fB����t$�C||
Xa��P�s�;�@��qI$�l�!�<�M^\&�dE����7���e*=tSw@�Cc�0p�8��6RqY31��[TWV�^xh��>��(����vЎ︫<e��#�^OAo�1���ݧ�כ2��I�����̯ʢv]�n��`������Z��ķAD���t$��e��I���1)�|�b�P�D�A�$���z�\8�`bw>���y���Zl�#������أ���� �1\�渙�-Xl5*'1ռ�*t�(��n=�2a���DN��'�w\}S�v��󠚥e�1+A�NH�Y$V���*��𠚅��5sB8�t��yO����u �	      �   O  x��X[o�:~V�����B���(b��4iS���vQPe1�E�HYq�ߑ�8�s)�]�-����s�8����,�O���3��*��4g��s�]ò4S���脌�j���c�v=�X��-�c�0�����&��j
�@��H_�`�%�+�L�3�T��1��ZYn-���u�+��f�/3�5��/kR7iZ<X^�T%����i|',�X�̶�cQ*V*��
Ai�}lZ�y����O��bo�`__�/��&������ف>�{w�����;�B.�;.%Zs�|�u#USI�3�-�
�O#�S�˘,Y�4��/�i�}>�%C�F)V�X�8�w�����Q-ڲZ/z�|F�l9J���o��WlrH����(.���$ɪ����1���?���l���MQ��=��ː;�|d����>+���׶m�Ռ͸�(�1�Ii�LTfU����4��ƹ���I�w�	4A�ڷ�!�-?���Y�-OT6�L����C^��w�j2������C�z�"- ��O�_�Ā���_C' �wL�_"�8i{��i��\�>]�O��m��z�`�P�����j�`�rJ�����zڈ�{��\;A�(�P(/E�28U�%RTBEiز�u��ਂ)�Ԥ���YS^H�Ɗ���`��Q!"i�,�5����i<;�������<���3&��O'�I~:�ǣ-ϫ��o_���j��y6>m��'�����(�_I���8�un�q�ĉbD	�C⅌9pm17��0HM`���r��Y�j�eQAY�%��l H�y�JӴ���ص��j[�Ĥ�V-�2Aq��ui��^��H�h�OHV��2D;����!��?$����-	��jŬ`QM%*8(�(�� )Ѳ�ג֋׽��)e���Z,W��n�`pQ�nj:-PԜ֜����e��=�U�P�F�/����m��Ax��!�q^eB�%7$��A�:���m�3�X��a=.�dzS��Y�GP��މ}�ɡ�������͇�ڍ�7u@�&}�Sp����矪���|r��,�W�M}�<�%�-'VW��k����{���]�|/|�ڙӢa;�c��k�SЈ��ѻ��߯H�9��Ԗ>��>�!G���7��'��)���^�s���W���I'Q���k�K:�U��T5��)H����jEg<��*��F���Ƕsg���j�Z1~ ªZ�^ӼH�,󸤩�y�w������;�cZ���]�^�:�\�nq���?����;@1 ���o^W���L@�ky�e\�p{ۊ�ȡ�@\���M1WD��D#�����b�ӡ��q��`,�6�m���_&8vCgU����=}�k�#D;3��H����?����Q�s�QI-͋��%�e�&�N��q��ni��#Z�A�������έ�e�vt[-�����*����İ����~ �H��_Ce��%�q줛0��T��߲�J�j8����p��r5��^���䊌Z���\�?Ο�܎�0��m��º�wƥ�w�"��4/�n(�$��H��,�)����W�Хmbl��5�U�̢�ק\�`ϰ'��-��n�z����\�      �     x��UM��8=k~��Q�����6�CN[{H�^�"@�c���~[���YAq�����݊3�s:�|�i�m�ėq�x:��)��'�>p�J�
��Ҁ���/�~@��&�x�����߻tL�>�u{���/]�=��O:�!�?�����2d���N�:-�C�ٟ�4���,C��-u]�h����SW��2	�m�(�vu"ǋ��j_�~SS��5��x�\�
l��0������LǶ9����='JlS��G��~��_]Z��}����cώ�/m�z�j.�2P!匴z��3�	�')Hl(֍����DP��@� kws��$
�Ђ��!8
0*�E���V�q�����G,Ĺ}� �.j����7S������!UF�I�K="�d^;P�.��H�k$U �9�Jt;R<b�T�%Jp7�4nաR^�`����?n�iX�#8d= �R��C��V�
�Ri3}_1k@:�A�	#Y�x�����*Ӕq��8���]���7���f�Pq� 14:�Q���qn@T�P:k�d��d`^���v��ګ���;@��Ua��f@]���Mn�t�F�3�!(Wj�c�� �ց.)�A�3�����ރ,�Uf�w�V �TO"�shHO����0e���$h*��Bj~��J MHP��A��m5��8����@�e�C{4�L]�i�Ϋ����n����m�[ҲR>��IP�@0��>��@R���E�Z���M�n�a^Iǖ�4���	��8��B��h�e�j��a�}�[����qS󸠟�%�?����W'~��
�JRוur
lX��KZ���?N����|q�k���$E��{�o�t�ێvs�|5�.ek���lȻ��K����5��]m�n{E��D:+ڹP���Zo�"u����������悮0б�� �8��U��V!��TV���$����m�!7��RF�t����
�F�XĂ�u-� =�	�`|�?:'�
��?1 �9����Mq\ɼuh�gM�����o�W������^�      �   �   x��ν�0@��<E����<�I��h"
�D���^���xP���t�B.y�Ny��c����@�\��݁*i����ʭF#,~���Jq��#��}R-Ʈa_��4j��(��1D��~e��S��S�"����4���#�O�      �   �  x�m��r�: е���VF�%Y�5CB0`;fpB�F��3�1|�3y�����[ww�;`IU� ܗ-�Z[`|-|�s�|턻b����ΪI~ۛ����]�`����H�Qv��y0��N��Ĭ��UT��>k�����E�a���s'b7G¼��
� �� k&�$|������Xg�^�nVn�|��xn����z��u��p�[u]mug<+]�!eTZ }��gn���D85�/�����_G������}?���}�����gV8����댝ʊ��t�)����@�M���������@r�|�|�R�K�t����d���K���ف�]��˱#z{ӓ�3����2N�Qeg�P�f���$v	�� �78��qN5�}J��0�9�T��U�I����ǹGV^?;�x�>O���1��2���:�L'����إ$X �����2��VR:��v�+,����96�3�.�V״��$���dbW�1�Z,�����E��7�pz߶�q��2&�5��-o^@`΁�9T�j���#�~�g�'�����i�ի�T��'ٗ��Lnڴ����A�t��<���J�$�@ٴ[���ϩ������OxV�������~U%D-����6Ï�D=�'�.��槅o6�K}pu@y��"
@�f����F,���$WNm��,_��(η������}x��e=�n	^;��Iq�xQӠ�n��6s�x���|LEn     