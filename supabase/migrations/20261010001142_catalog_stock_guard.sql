-- Stock is only revealed for products visible in that country, or to the country's staff.
create or replace function public.get_available_stock(p_country_code text, p_variant_id uuid)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(greatest(il.on_hand - il.reserved, 0)), 0)::int
  from public.inventory_levels il
  join public.warehouses w on w.id = il.warehouse_id
  where w.country_code = p_country_code
    and w.is_active
    and il.variant_id = p_variant_id
    and (
      private.has_country_role(p_country_code, 'viewer')
      or exists (
        select 1
        from public.product_variants v
        join public.country_products cp on cp.product_id = v.product_id
        where v.id = p_variant_id and cp.country_code = p_country_code and cp.is_visible
      )
    );
$$;
