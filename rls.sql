create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'super_admin'
  );
$$;

create or replace function public.is_follower(target_user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.follows
    where following_id = target_user_id
      and follower_id = auth.uid()
      and status = 'accepted'
  );
$$;

create or replace function public.is_post_visible(target_post_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.posts
    where id = target_post_id
      and (
        visibility = 'public'
        or user_id = auth.uid()
        or (visibility = 'followers' and public.is_follower(user_id))
        or public.is_admin()
      )
  );
$$;

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.follows enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.notifications enable row level security;
alter table public.vault_media enable row level security;
alter table public.points_ledger enable row level security;
alter table public.rewards enable row level security;
alter table public.redemptions enable row level security;
alter table public.reports enable row level security;
alter table public.admin_audit_log enable row level security;
alter table storage.objects enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles
  for select
  using (true);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can manage profiles"
  on public.profiles
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Posts are visible by audience"
  on public.posts
  for select
  using (
    visibility = 'public'
    or user_id = auth.uid()
    or (visibility = 'followers' and public.is_follower(user_id))
    or public.is_admin()
  );

create policy "Users can create posts"
  on public.posts
  for insert
  with check (auth.uid() = user_id or public.is_admin());

create policy "Users can update own posts"
  on public.posts
  for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "Users can delete own posts"
  on public.posts
  for delete
  using (auth.uid() = user_id or public.is_admin());

create policy "Post media visible with post"
  on public.post_media
  for select
  using (public.is_post_visible(post_id) or public.is_admin());

create policy "Users can add post media"
  on public.post_media
  for insert
  with check (auth.uid() = user_id and public.is_post_visible(post_id));

create policy "Users can update post media"
  on public.post_media
  for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "Users can delete post media"
  on public.post_media
  for delete
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can view follow relationships"
  on public.follows
  for select
  using (auth.uid() in (follower_id, following_id) or public.is_admin());

create policy "Users can follow"
  on public.follows
  for insert
  with check (auth.uid() = follower_id);

create policy "Users can update follow status"
  on public.follows
  for update
  using (auth.uid() in (follower_id, following_id) or public.is_admin())
  with check (auth.uid() in (follower_id, following_id) or public.is_admin());

create policy "Users can delete follows"
  on public.follows
  for delete
  using (auth.uid() in (follower_id, following_id) or public.is_admin());

create policy "Likes readable with post"
  on public.likes
  for select
  using (public.is_post_visible(post_id) or public.is_admin());

create policy "Users can like posts"
  on public.likes
  for insert
  with check (auth.uid() = user_id and public.is_post_visible(post_id));

create policy "Users can delete own likes"
  on public.likes
  for delete
  using (auth.uid() = user_id or public.is_admin());

create policy "Comments readable with post"
  on public.comments
  for select
  using (public.is_post_visible(post_id) or public.is_admin());

create policy "Users can comment"
  on public.comments
  for insert
  with check (auth.uid() = user_id and public.is_post_visible(post_id));

create policy "Users can update own comments"
  on public.comments
  for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "Users can delete own comments"
  on public.comments
  for delete
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can view notifications"
  on public.notifications
  for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can create notifications"
  on public.notifications
  for insert
  with check (auth.uid() = actor_id or public.is_admin());

create policy "Users can update notifications"
  on public.notifications
  for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "Users can delete notifications"
  on public.notifications
  for delete
  using (auth.uid() = user_id or public.is_admin());

create policy "Vault media visible to owner or admin"
  on public.vault_media
  for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can upload vault media"
  on public.vault_media
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update vault media"
  on public.vault_media
  for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "Users can delete vault media"
  on public.vault_media
  for delete
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can view own points"
  on public.points_ledger
  for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can create points entries"
  on public.points_ledger
  for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage points"
  on public.points_ledger
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete points"
  on public.points_ledger
  for delete
  using (public.is_admin());

create policy "Rewards are readable"
  on public.rewards
  for select
  using (true);

create policy "Admins can manage rewards"
  on public.rewards
  for insert
  with check (public.is_admin());

create policy "Admins can update rewards"
  on public.rewards
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete rewards"
  on public.rewards
  for delete
  using (public.is_admin());

create policy "Users can view own redemptions"
  on public.redemptions
  for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can create redemptions"
  on public.redemptions
  for insert
  with check (auth.uid() = user_id);

create policy "Admins can update redemptions"
  on public.redemptions
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete redemptions"
  on public.redemptions
  for delete
  using (public.is_admin());

create policy "Users can view own reports"
  on public.reports
  for select
  using (auth.uid() = reporter_id or public.is_admin());

create policy "Users can create reports"
  on public.reports
  for insert
  with check (auth.uid() = reporter_id);

create policy "Admins can update reports"
  on public.reports
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete reports"
  on public.reports
  for delete
  using (public.is_admin());

create policy "Admins can view audit log"
  on public.admin_audit_log
  for select
  using (public.is_admin());

create policy "Admins can create audit log"
  on public.admin_audit_log
  for insert
  with check (public.is_admin());

create policy "Admins can update audit log"
  on public.admin_audit_log
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete audit log"
  on public.admin_audit_log
  for delete
  using (public.is_admin());

insert into storage.buckets (id, name, public)
values ('vault', 'vault', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('posts', 'posts', false)
on conflict (id) do nothing;

create policy "Vault objects readable by owner"
  on storage.objects
  for select
  using (
    bucket_id = 'vault'
    and (owner = auth.uid() or public.is_admin())
  );

create policy "Vault objects insertable by owner"
  on storage.objects
  for insert
  with check (
    bucket_id = 'vault'
    and owner = auth.uid()
  );

create policy "Vault objects updatable by owner"
  on storage.objects
  for update
  using (
    bucket_id = 'vault'
    and (owner = auth.uid() or public.is_admin())
  )
  with check (
    bucket_id = 'vault'
    and (owner = auth.uid() or public.is_admin())
  );

create policy "Vault objects deletable by owner"
  on storage.objects
  for delete
  using (
    bucket_id = 'vault'
    and (owner = auth.uid() or public.is_admin())
  );

create policy "Post objects readable by owner"
  on storage.objects
  for select
  using (
    bucket_id = 'posts'
    and (owner = auth.uid() or public.is_admin())
  );

create policy "Post objects insertable by owner"
  on storage.objects
  for insert
  with check (
    bucket_id = 'posts'
    and owner = auth.uid()
  );

create policy "Post objects updatable by owner"
  on storage.objects
  for update
  using (
    bucket_id = 'posts'
    and (owner = auth.uid() or public.is_admin())
  )
  with check (
    bucket_id = 'posts'
    and (owner = auth.uid() or public.is_admin())
  );

create policy "Post objects deletable by owner"
  on storage.objects
  for delete
  using (
    bucket_id = 'posts'
    and (owner = auth.uid() or public.is_admin())
  );
