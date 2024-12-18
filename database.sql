-- Enable RLS (Row Level Security)
alter table if exists "public"."asn" enable row level security;
alter table if exists "public"."instansi" enable row level security;
alter table if exists "public"."vehicles" enable row level security;

-- Create instansi (departments) table
create table if not exists "public"."instansi" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text not null,
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint "instansi_pkey" primary key ("id")
);

-- Create asn (employees) table
create table if not exists "public"."asn" (
    "id" uuid not null default gen_random_uuid(),
    "nip" text not null unique,
    "name" text not null,
    "position" text not null,
    "instansi_id" uuid not null references "public"."instansi"("id") on delete restrict,
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint "asn_pkey" primary key ("id")
);

-- Create vehicles table
create table if not exists "public"."vehicles" (
    "id" uuid not null default gen_random_uuid(),
    "nopol" text not null unique,
    "wheel_count" integer not null check (wheel_count between 2 and 4),
    "brand" text not null,
    "type" text not null check (type in ('Sedan', 'SUV', 'Sepeda Motor')),
    "year" integer not null check (year between 1900 and extract(year from current_date)),
    "asn_id" uuid references "public"."asn"("id") on delete set null,
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint "vehicles_pkey" primary key ("id"),
    constraint "one_vehicle_per_asn" unique ("asn_id")
);

-- Create RLS policies
create policy "Enable read access for all users"
on "public"."instansi"
for select
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."instansi"
for insert
to authenticated
with check (true);

create policy "Enable update for authenticated users only"
on "public"."instansi"
for update
to authenticated
using (true);

create policy "Enable delete for authenticated users only"
on "public"."instansi"
for delete
to authenticated
using (true);

create policy "Enable read access for all users"
on "public"."asn"
for select
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."asn"
for insert
to authenticated
with check (true);

create policy "Enable update for authenticated users only"
on "public"."asn"
for update
to authenticated
using (true);

create policy "Enable delete for authenticated users only"
on "public"."asn"
for delete
to authenticated
using (true);

create policy "Enable read access for all users"
on "public"."vehicles"
for select
to authenticated
using (true);

create policy "Enable insert for authenticated users only"
on "public"."vehicles"
for insert
to authenticated
with check (true);

create policy "Enable update for authenticated users only"
on "public"."vehicles"
for update
to authenticated
using (true);

create policy "Enable delete for authenticated users only"
on "public"."vehicles"
for delete
to authenticated
using (true);

-- Create indexes for better query performance
create index if not exists "asn_instansi_id_idx" on "public"."asn" ("instansi_id");
create index if not exists "vehicles_asn_id_idx" on "public"."vehicles" ("asn_id");

-- Comments
comment on table "public"."instansi" is 'Table for storing department information';
comment on table "public"."asn" is 'Table for storing employee information';
comment on table "public"."vehicles" is 'Table for storing vehicle information';
