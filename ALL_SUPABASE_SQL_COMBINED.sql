

-- ===== supabase_master_schema.sql =====
-- Rolling Cecil AI Master Backend Schema + Universal Search
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists manufacturers (
  id uuid primary key default gen_random_uuid(),
  name text unique not null
);

create table if not exists parts (
  id uuid primary key default gen_random_uuid(),
  part_number text not null,
  manufacturer_id uuid references manufacturers(id),
  description text,
  category text,
  created_at timestamptz default now(),
  unique(part_number, manufacturer_id)
);

create table if not exists part_cross_refs (
  id uuid primary key default gen_random_uuid(),
  part_id uuid references parts(id) on delete cascade,
  cross_ref_id uuid references parts(id) on delete cascade,
  confidence_score float default 1.0,
  source_name text,
  notes text,
  created_at timestamptz default now(),
  unique(part_id, cross_ref_id)
);

create table if not exists repair_kits (
  id bigint generated always as identity primary key,
  component_name text,
  engine_family text,
  oem_part_number text,
  gasket_set text,
  seals text,
  o_rings text,
  bearings text,
  hardware text,
  labor_hours numeric,
  torque_specs text,
  repair_notes text,
  created_at timestamptz default now()
);

create table if not exists labor_times (
  id bigint generated always as identity primary key,
  component_name text,
  engine_family text,
  labor_hours numeric,
  labor_operation text,
  difficulty text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists torque_specs (
  id bigint generated always as identity primary key,
  engine_family text,
  component_name text,
  fastener text,
  torque_value text,
  sequence_notes text,
  created_at timestamptz default now()
);

create table if not exists common_failures (
  id bigint generated always as identity primary key,
  fault_code text,
  symptom text,
  engine_family text,
  likely_causes text,
  common_fix text,
  tech_notes text,
  created_at timestamptz default now()
);

create table if not exists fluids_filters (
  id bigint generated always as identity primary key,
  engine_family text,
  service_type text,
  oil_filter text,
  fuel_filter text,
  water_separator text,
  air_filter text,
  coolant_filter text,
  oil_capacity text,
  coolant_capacity text,
  recommended_oil text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists diagnostic_tests (
  id bigint generated always as identity primary key,
  engine_family text,
  fault_code text,
  symptom text,
  test_name text,
  test_steps text,
  pass_fail_specs text,
  next_step_if_failed text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists supplier_links (
  id bigint generated always as identity primary key,
  part_number text,
  supplier_name text,
  search_url text,
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_parts_number on parts(part_number);
create index if not exists idx_parts_description on parts using gin(to_tsvector('english', coalesce(description,'') || ' ' || coalesce(category,'')));
create index if not exists idx_repair_kits_search on repair_kits(component_name, engine_family, oem_part_number);
create index if not exists idx_cross_part_id on part_cross_refs(part_id);
create index if not exists idx_cross_ref_id on part_cross_refs(cross_ref_id);

create or replace function universal_diesel_search(search_text text)
returns jsonb
language plpgsql
stable
as $$
declare
  q text := trim(coalesce(search_text,''));
  result jsonb;
begin
  result := jsonb_build_object(
    'parts', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'part_number', p.part_number,
        'manufacturer', m.name,
        'description', p.description,
        'category', p.category
      )), '[]'::jsonb)
      from parts p
      left join manufacturers m on m.id = p.manufacturer_id
      where q <> '' and (
        p.part_number ilike '%' || q || '%'
        or p.description ilike '%' || q || '%'
        or p.category ilike '%' || q || '%'
        or m.name ilike '%' || q || '%'
      )
      limit 25
    ),
    'cross_refs', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'source_part', p1.part_number,
        'source_brand', m1.name,
        'cross_part', p2.part_number,
        'cross_brand', m2.name,
        'confidence_score', cr.confidence_score,
        'source_name', cr.source_name,
        'notes', cr.notes
      )), '[]'::jsonb)
      from part_cross_refs cr
      join parts p1 on p1.id = cr.part_id
      left join manufacturers m1 on m1.id = p1.manufacturer_id
      join parts p2 on p2.id = cr.cross_ref_id
      left join manufacturers m2 on m2.id = p2.manufacturer_id
      where q <> '' and (
        p1.part_number ilike '%' || q || '%'
        or p2.part_number ilike '%' || q || '%'
        or p1.description ilike '%' || q || '%'
        or p2.description ilike '%' || q || '%'
        or m1.name ilike '%' || q || '%'
        or m2.name ilike '%' || q || '%'
      )
      limit 25
    ),
    'repair_kits', (
      select coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb)
      from repair_kits r
      where q <> '' and (
        r.component_name ilike '%' || q || '%'
        or r.engine_family ilike '%' || q || '%'
        or r.oem_part_number ilike '%' || q || '%'
      )
      limit 10
    ),
    'labor_times', (
      select coalesce(jsonb_agg(to_jsonb(l)), '[]'::jsonb)
      from labor_times l
      where q <> '' and (
        l.component_name ilike '%' || q || '%'
        or l.engine_family ilike '%' || q || '%'
        or l.labor_operation ilike '%' || q || '%'
      )
      limit 10
    ),
    'torque_specs', (
      select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
      from torque_specs t
      where q <> '' and (
        t.component_name ilike '%' || q || '%'
        or t.engine_family ilike '%' || q || '%'
        or t.fastener ilike '%' || q || '%'
      )
      limit 10
    ),
    'common_failures', (
      select coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb)
      from common_failures c
      where q <> '' and (
        c.fault_code ilike '%' || q || '%'
        or c.symptom ilike '%' || q || '%'
        or c.engine_family ilike '%' || q || '%'
        or c.common_fix ilike '%' || q || '%'
      )
      limit 10
    ),
    'fluids_filters', (
      select coalesce(jsonb_agg(to_jsonb(f)), '[]'::jsonb)
      from fluids_filters f
      where q <> '' and (
        f.engine_family ilike '%' || q || '%'
        or f.service_type ilike '%' || q || '%'
        or f.oil_filter ilike '%' || q || '%'
        or f.fuel_filter ilike '%' || q || '%'
      )
      limit 10
    ),
    'diagnostic_tests', (
      select coalesce(jsonb_agg(to_jsonb(d)), '[]'::jsonb)
      from diagnostic_tests d
      where q <> '' and (
        d.engine_family ilike '%' || q || '%'
        or d.fault_code ilike '%' || q || '%'
        or d.symptom ilike '%' || q || '%'
        or d.test_name ilike '%' || q || '%'
      )
      limit 10
    ),
    'supplier_links', (
      select coalesce(jsonb_agg(to_jsonb(s)), '[]'::jsonb)
      from supplier_links s
      where q <> '' and (
        s.part_number ilike '%' || q || '%'
        or s.supplier_name ilike '%' || q || '%'
      )
      limit 10
    )
  );
  return result;
end;
$$;

-- Sample seed data. Safe to run multiple times because of ON CONFLICT on manufacturers/parts/cross refs.
insert into manufacturers (name) values
('Cummins'),('Detroit Diesel'),('Navistar'),('PACCAR'),('Fleetguard'),('Bendix'),('Baldwin'),('Donaldson'),('Nelson'),('REP')
on conflict (name) do nothing;

with m as (select id from manufacturers where name='Cummins')
insert into parts(part_number, manufacturer_id, description, category)
select '4353204', id, 'OEM primary air filter', 'Filtration' from m
on conflict do nothing;
with m as (select id from manufacturers where name='Fleetguard')
insert into parts(part_number, manufacturer_id, description, category)
select 'AF27844', id, 'Interchange air filter', 'Filtration' from m
on conflict do nothing;
with m as (select id from manufacturers where name='Navistar')
insert into parts(part_number, manufacturer_id, description, category)
select '2501022C92', id, 'OEM AD-IP air dryer', 'Braking' from m
on conflict do nothing;
with m as (select id from manufacturers where name='Bendix')
insert into parts(part_number, manufacturer_id, description, category)
select '800405', id, 'AD-IP air dryer interchange', 'Braking' from m
on conflict do nothing;

insert into part_cross_refs(part_id, cross_ref_id, confidence_score, source_name)
select p1.id, p2.id, 1.0, 'Manual_Seed'
from parts p1, parts p2
where (p1.part_number='4353204' and p2.part_number='AF27844')
   or (p1.part_number='2501022C92' and p2.part_number='800405')
on conflict do nothing;



-- ===== supabase_vector_search_fix.sql =====
drop function if exists match_knowledge_base_v2(vector, integer);

create or replace function match_knowledge_base_v2(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (
  id uuid,
  source_type text,
  source_name text,
  content text,
  similarity float
)
language sql
stable
as $$
  select
    k.id,
    k.source_type,
    k.source_name,
    k.content,
    1 - (k.embedding <=> query_embedding) as similarity
  from knowledge_base_embeddings k
  where k.embedding is not null
  order by k.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function match_knowledge_base_v2(vector, integer) to anon;
grant execute on function match_knowledge_base_v2(vector, integer) to authenticated;



-- ===== phase20_smart_repair_kit_backend.sql =====
-- =====================================================
-- ROLLING CECIL AI - PHASE 20
-- SMART REPAIR KIT LOGIC
-- Adds: related parts, labor hints, torque notes, while-you're-there checks
-- =====================================================

create extension if not exists "uuid-ossp";

-- Smart repair kit table
create table if not exists smart_repair_kits (
  id uuid primary key default uuid_generate_v4(),
  engine_canonical_id text,
  engine_family text,
  component text not null,
  primary_oem text,
  primary_alt text,
  kit_name text,
  gaskets text[],
  seals text[],
  o_rings text[],
  hardware text[],
  fluids text[],
  related_parts text[],
  while_there_checks text[],
  common_failures text[],
  labor_hours numeric,
  torque_notes text,
  repair_notes text,
  confidence numeric default 0.80,
  created_at timestamptz default now()
);

create index if not exists idx_smart_repair_kits_engine_component
on smart_repair_kits (engine_family, component);

create index if not exists idx_smart_repair_kits_oem
on smart_repair_kits (primary_oem);

-- Starter X15 water pump kit
insert into smart_repair_kits (
  engine_canonical_id,
  engine_family,
  component,
  primary_oem,
  primary_alt,
  kit_name,
  gaskets,
  seals,
  o_rings,
  hardware,
  fluids,
  related_parts,
  while_there_checks,
  common_failures,
  labor_hours,
  torque_notes,
  repair_notes,
  confidence
)
values (
  'CUM_X15',
  'X15',
  'water pump',
  '3692580',
  '3692580RX',
  'Cummins X15 / ISX15 Water Pump Repair Kit',
  array['Water pump gasket / mounting seal - verify by ESN/CPL'],
  array['Front coolant seal - verify by ESN/CPL'],
  array['Coolant O-ring set if pipe connections are removed'],
  array['Mounting bolts recommended if corroded or stretched'],
  array['Coolant refill - use OEM-approved coolant spec', 'Distilled water if concentrate is used'],
  array['Serpentine belt', 'Belt tensioner', 'Idler pulley', 'Thermostat housing gasket if disturbed'],
  array[
    'Inspect belt tensioner play',
    'Inspect idler pulley bearing',
    'Check coolant contamination',
    'Pressure test cooling system after repair',
    'Verify no fan hub / belt alignment issue'
  ],
  array[
    'Coolant leak at weep hole',
    'Bearing play / wobble',
    'Overheating under load',
    'Belt tracking issue causing pump wear'
  ],
  4.5,
  'Verify torque sequence and values by Cummins service information using ESN/CPL before final assembly.',
  'Drain coolant fully. Clean sealing surface. Do not reuse damaged gasket. Refill and bleed cooling system. Pressure test after repair.',
  0.92
)
on conflict do nothing;


-- Smart Repair Kit Lookup Function
create or replace function smart_repair_kit_lookup(
  part_query text,
  raw_engine_text text default null,
  oem_text text default null
)
returns json
language plpgsql
as $$
declare
  v_norm record;
  v_kit json;
  v_component text;
begin

  v_component := lower(coalesce(part_query, ''));

  -- normalize engine
  if raw_engine_text is not null and trim(raw_engine_text) <> '' then
    select *
    into v_norm
    from engine_normalization_map e
    where lower(e.raw_string) = lower(raw_engine_text)
       or lower(e.canonical_name) = lower(raw_engine_text)
    order by e.confidence desc
    limit 1;
  end if;

  -- First strict kit match
  select coalesce(json_agg(x), '[]'::json)
  into v_kit
  from (
    select *
    from smart_repair_kits k
    where
      (
        lower(k.component) ilike '%' || v_component || '%'
        or v_component ilike '%' || lower(k.component) || '%'
        or (oem_text is not null and (k.primary_oem = oem_text or k.primary_alt = oem_text))
      )
      and (
        v_norm is null
        or k.engine_canonical_id = v_norm.canonical_id
        or lower(k.engine_family) = lower(v_norm.canonical_name)
      )
    order by k.confidence desc
    limit 5
  ) x;

  -- Broad fallback
  if coalesce(json_array_length(v_kit), 0) = 0 then
    select coalesce(json_agg(y), '[]'::json)
    into v_kit
    from (
      select *
      from smart_repair_kits k
      where
        lower(k.component) ilike '%' || v_component || '%'
        or v_component ilike '%' || lower(k.component) || '%'
        or (oem_text is not null and (k.primary_oem = oem_text or k.primary_alt = oem_text))
      order by k.confidence desc
      limit 5
    ) y;
  end if;

  return json_build_object(
    'status','ok',
    'query',part_query,
    'engine',raw_engine_text,
    'oem',oem_text,
    'normalized_engine', case
      when v_norm is null then null
      else json_build_object(
        'canonical_id', v_norm.canonical_id,
        'canonical_name', v_norm.canonical_name,
        'manufacturer', v_norm.manufacturer,
        'epa_standard', v_norm.epa_standard
      )
    end,
    'repair_kits', v_kit,
    'answer_style', 'tech repair kit',
    'verify', 'Verify all gaskets, seals, torque specs, and fitment by VIN/ESN/CPL before ordering or final assembly.'
  );

end;
$$;


-- Combined parts + kit answer
create or replace function parts_tech_repair_answer(
  part_query text,
  raw_engine_text text default null
)
returns json
language plpgsql
as $$
declare
  v_parts json;
  v_kits json;
  v_oem text;
begin

  select parts_tech_answer(part_query, raw_engine_text)
  into v_parts;

  -- Pull first OEM from parts answer if present
  select (elem->>'oem_number')
  into v_oem
  from json_array_elements(coalesce(v_parts->'parts','[]'::json)) elem
  where elem ? 'oem_number'
  limit 1;

  select smart_repair_kit_lookup(part_query, raw_engine_text, v_oem)
  into v_kits;

  return json_build_object(
    'status','ok',
    'part_answer', v_parts,
    'repair_kit_answer', v_kits,
    'tech_rule','Return OEM part number first, then repair kit, labor, related parts, and verification warning.'
  );

end;
$$;


-- Tests
select parts_tech_repair_answer('water pump', 'X15');
select smart_repair_kit_lookup('water pump', 'X15', '3692580');


-- ===== phase21_repair_kit_sql_compatibility.sql =====

-- ============================================================
-- ROLLING CECIL AI - PHASE 21 SQL COMPATIBILITY PATCH
-- Makes repair_kits table work with both old and new frontend logic.
-- Run in Supabase SQL Editor.
-- ============================================================

alter table repair_kits
add column if not exists component text,
add column if not exists part_type text,
add column if not exists oem_part text,
add column if not exists alt_part text,
add column if not exists labor_hours numeric,
add column if not exists notes text;

-- Keep component and part_type synced for old/new code
update repair_kits
set component = coalesce(component, part_type)
where component is null and part_type is not null;

update repair_kits
set part_type = coalesce(part_type, component)
where part_type is null and component is not null;

-- Upsert X15 water pump kit
insert into repair_kits (
  engine_family,
  component,
  part_type,
  oem_part,
  alt_part,
  labor_hours,
  notes
)
values (
  'X15',
  'water pump',
  'water pump',
  '3692580',
  '3692580RX',
  4.5,
  'Replace thermostat seals if disturbed, inspect belt/tensioner/idlers, refill coolant, bleed system, pressure test after repair.'
);

-- Upsert DD15 water pump kit
insert into repair_kits (
  engine_family,
  component,
  part_type,
  oem_part,
  alt_part,
  labor_hours,
  notes
)
values (
  'DD15',
  'water pump',
  'water pump',
  'A4722001601',
  'A4722001601RX',
  5.2,
  'Inspect coolant manifold and pulley alignment. Prime and bleed cooling system after repair.'
);

-- Upsert MX13 water pump kit
insert into repair_kits (
  engine_family,
  component,
  part_type,
  oem_part,
  alt_part,
  labor_hours,
  notes
)
values (
  'MX13',
  'water pump',
  'water pump',
  '2267065PE',
  '2267065PEX',
  5.0,
  'Inspect idler pulley and fan hub for coolant contamination. Verify by VIN/engine serial.'
);

-- Test
select *
from repair_kits
where engine_family = 'X15'
and (
  component ilike '%water pump%'
  or part_type ilike '%water pump%'
);



-- ===== PHASE15_BACKEND_TESTS.sql =====
-- Phase 15 backend tests
select smart_workflow_engine('X15 water pump', null, 'Cummins X15');
select extract_vin_from_text('VIN 1XPBD49X1JD123456 UNIT 54');
select extract_part_numbers_from_text('Fleetguard LF14000NN Baldwin BF46129 PACCAR 2129791PE Qty 1', null, 'parts_photo');
select find_part_suppliers('LF14000NN');
