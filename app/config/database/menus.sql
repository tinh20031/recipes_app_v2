create table public.menus (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  recipes uuid[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null
);

-- Enable RLS
alter table public.menus enable row level security;

-- Create policies
create policy "Users can view their own menus" on menus for select
  using (auth.uid() = user_id);

create policy "Users can create their own menus" on menus for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own menus" on menus for update
  using (auth.uid() = user_id);

create policy "Users can delete their own menus" on menus for delete
  using (auth.uid() = user_id); 