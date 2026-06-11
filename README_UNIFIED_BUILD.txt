ROLLING WRENCH AI — UNIFIED MASTER BUILD

Built from the uploaded packages you removed/kept:
- rolling_cecil_ai_master_build(3) as the main frontend base
- Man(2) backend/vector/catalog pieces
- rolling_wrench_ai_vision_tested(1) Vision AI frontend + Supabase Edge Function
- phase19 Ask Cecil Procedure Genius
- phase18 Verified Fix Memory
- RWD Unified Fix Package Phase 20/21 Smart Repair Kits
- Master Search Hook / fallback / patch fixes

UPLOAD TO GITHUB PAGES ROOT:
index.html
style.css
app.js
manifest.json
service-worker.js
diesel_catalog.json

SUPABASE FILES INCLUDED:
supabase_master_schema.sql
supabase_vector_search_fix.sql
phase20_smart_repair_kit_backend.sql
phase21_repair_kit_sql_compatibility.sql
PHASE15_BACKEND_TESTS.sql
supabase/functions/rolling-wrench-vision-ai/index.ts

IMPORTANT SUPABASE STEP:
Deploy the Edge Function named rolling-wrench-vision-ai and set secret OPENAI_API_KEY.

WHAT IS MERGED:
1. Professional Rolling Wrench AI home/dashboard
2. VIN / truck active profile
3. Oracle parts lookup + universal diesel SQL search
4. Fault Doctor
5. Vision AI photo analyzer
6. Procedure Genius
7. Verified Fix Memory
8. Smart Repair Kit Builder
9. Invoice / quote builder
10. Voice and team screens kept ready

NOTES:
- Browser Supabase anon key is still in app.js because this is a static GitHub Pages app. Lock down RLS before storing customer data.
- Exact OEM part numbers, torque specs, and fluids still need VIN/ESN/CPL or verified OEM catalog data.
