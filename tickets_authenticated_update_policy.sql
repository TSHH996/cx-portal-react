do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'tickets'
      and policyname = 'update_tickets_authenticated'
  ) then
    create policy update_tickets_authenticated
      on public.tickets
      for update
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;
