-- Ajoute le code d'invitation unique sur chaque profil
alter table profiles
  add column if not exists invite_code text unique;

-- Génère le code pour les profils existants
update profiles
  set invite_code = upper(substring(md5(id::text), 1, 8))
  where invite_code is null;

-- Fonction trigger : génère automatiquement le code à l'insertion
create or replace function generate_invite_code()
returns trigger as $$
begin
  new.invite_code := upper(substring(md5(new.id::text), 1, 8));
  return new;
end;
$$ language plpgsql;

create trigger set_invite_code
  before insert on profiles
  for each row execute function generate_invite_code();
