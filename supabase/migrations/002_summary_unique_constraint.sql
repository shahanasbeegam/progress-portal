-- Ensures upsert by student+term works in summaries/generate
alter table public.ai_summaries
  add constraint ai_summaries_student_term_unique unique (student_id, term);
