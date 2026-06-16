-- Migration 005 : confirmations de présence aux événements

create table event_attendees (
  event_id  uuid  not null references events on delete cascade,
  user_id   uuid  not null references auth.users on delete cascade,
  status    text  not null check (status in ('confirmed', 'declined', 'pending')),
  primary key (event_id, user_id)
);

alter table event_attendees enable row level security;

-- Lecture : membres de l'organisation liée à l'événement
create policy "attendees_select_members" on event_attendees for select
using (
  event_id in (
    select id from events
    where organization_id in (
      select organization_id from organization_members
      where user_id = auth.uid()
    )
  )
);

-- Création : chaque membre confirme sa propre présence
-- Les admin/member_active peuvent également saisir pour d'autres membres
create policy "attendees_insert_member" on event_attendees for insert
with check (
  user_id = auth.uid()
  or exists (
    select 1 from events e
    join organization_members om on om.organization_id = e.organization_id
    where e.id = event_attendees.event_id
      and om.user_id = auth.uid()
      and om.role in ('admin', 'member_active')
  )
);

-- Modification : chacun modifie uniquement sa propre présence
create policy "attendees_update_own" on event_attendees for update
using (user_id = auth.uid());

-- Suppression : chacun peut retirer sa propre présence
create policy "attendees_delete_own" on event_attendees for delete
using (user_id = auth.uid());
