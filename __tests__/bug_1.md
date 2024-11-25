2024-11-24, documenting previous bug, now corrected.

Current code handles this case, but I'm documenting it in anticipation of creating a unit test for it.

The test should be:
SLANT (BYBBB)
PROLE (BBBYY)

This leaves 76 words:
BEDEL, BELCH, BEVEL, BEZEL, BEZIL, BILED, CELEB, CHIEL, CULEX, DEBEL, DECYL, DELED, DEVEL, DEVIL, EXCEL, EXFIL, FELCH, FELID, FELIX, FILED, GELID, GEMEL, GIBEL, GIMEL, HELED, HELIX, HEVEL, HEXYL, HYDEL, HYLEG, IDLED, JEBEL, JEWEL, JHEEL, KELIM, KEVEL, KEVIL, KIDEL, KILEY, KUGEL, LECCY, LEDGY, LEDUM, LEECH, LEGGY, LEMED, LEMEL, LEUCH, LEUGH, LEVEL, LEZZY, LIBEL, LIFEY, LIKED, LIMED, LIMEY, LIVED, LUBED, LUGED, LUXED, MELCH, MELIC, MELIK, MULED, MULEY, UMBEL, VELUM, VEXIL, WEDEL, WELCH, WHEEL, WILED, WYLED, XYLEM, YCLED, ZIZEL

Then, we enter
JEWEL (BGBYY) 
after which the correct remaining list should be only LEECH. This requires both Es (the green one at 2, and the yellow one).

Before this bug was fixed, the remaining list after JEWEL was:

BELCH,FELCH,FELID,FELIX,GELID,HELIX,KELIM,LECCY,LEDGY,LEDUM,LEECH,LEGGY,LEUCH,LEUGH,LEZZY,MELCH,MELIC,MELIK,VELUM

So the filter wasn't learning that it should require two Es (too lenient).
