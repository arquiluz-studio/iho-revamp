-- Venezuela sells in bolívares. The copied Mexico amounts stay; only the currency label changes.

update public.variant_prices dst
set currency = 'VES'
from public.product_variants v
join public.products p on p.id = v.product_id
where dst.variant_id = v.id
  and p.country_code = 've'
  and dst.currency is distinct from 'VES';
