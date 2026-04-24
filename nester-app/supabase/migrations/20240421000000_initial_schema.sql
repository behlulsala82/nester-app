-- Create a table for public users that syncs with auth.users
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security for users
alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.users for update
  using ( auth.uid() = id );

-- Function to handle new user signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Orders table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  material text not null,
  board_width decimal(10,2) not null,
  board_height decimal(10,2) not null,
  total_sheets integer not null default 0,
  waste_percent decimal(5,2) not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security for orders
alter table public.orders enable row level security;

create policy "Users can view their own orders"
  on public.orders for select
  using ( auth.uid() = user_id );

create policy "Users can create their own orders"
  on public.orders for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own orders"
  on public.orders for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own orders"
  on public.orders for delete
  using ( auth.uid() = user_id );

-- Pieces table
create table public.pieces (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  width decimal(10,2) not null,
  height decimal(10,2) not null,
  quantity integer not null default 1,
  rotation boolean default false not null,
  edge_top boolean default false not null,
  edge_bottom boolean default false not null,
  edge_left boolean default false not null,
  edge_right boolean default false not null
);

-- Set up Row Level Security for pieces
alter table public.pieces enable row level security;

-- Pieces are accessible if the associated order belongs to the user
create policy "Users can view pieces of their orders"
  on public.pieces for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = pieces.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Users can manage pieces of their orders"
  on public.pieces for all
  using (
    exists (
      select 1 from public.orders
      where orders.id = pieces.order_id
      and orders.user_id = auth.uid()
    )
  );
