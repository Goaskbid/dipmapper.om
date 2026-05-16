# Meilen search audit - v20.2.0

The Meilen area was corrected after user testing showed that Ländeli and Steinrad were confused and Hallenbad Allmend Meilen was missing.

## Fixed local entities

- Hallenbad Allmend Meilen, Toggwilerstrasse 38, indoor municipal pool and sauna.
- Strandbad Dorfmeilen, Seestrasse 720.
- Strandbad Feldmeilen, Seestrasse 236.
- Badeanlage Ländeli / Dolliker Ländeli, Seestrasse 950.
- Badeanlage Steinrad, separated as Herrliberg, not Meilen.

## Search behavior

- Current-location searches around Meilen now seed the local pack immediately.
- The default radius remains 5 km.
- Live open-map search continues, but seeded official local venues remain visible and are not replaced by stale workplace results.
- Photo audit blocks non-swim media such as mosques, minarets, churches, documents, maps, logos and generic panoramas.
