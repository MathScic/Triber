-- Crée automatiquement une ligne dans profiles quand un utilisateur s'inscrit
-- Backfille aussi les utilisateurs existants sans profil

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, updated_at)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill : insère un profil pour tous les utilisateurs existants sans profil
insert into public.profiles (id, full_name, updated_at)
select
  u.id,
  u.raw_user_meta_data->>'full_name',
  now()
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
)
on conflict (id) do nothing;
