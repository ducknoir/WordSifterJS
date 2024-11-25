2024-11-24
New bug with filtering, looks similar to previous.

Solution is JELLY.

Guess sequence:
SLANT (BYBBB)
LURCH (YBBBB)
VOWEL (BBBYY)

After VOWEL, the remaining words are

BELIE, BELLE, BELLI, BELLY, BIBLE, BIELD, BILGE, DEELY, DELLY, EDILE, EXILE, FEELY, FELID, FELIX, FELLY, FEYLY, FIELD, FILLE, FJELD, GELID, GELLY, GYELD, JEELY, JELLY, KELIM, KELLY, KELPY, KYLIE, MEDLE, MELIK, MILLE, PEELY, PEPLE

This is correct, it still includes JELLY.

Then we enter

EXILE (YBBGB)

After this, there are no words remaining (filter is too strict)!

This is most likely related to filtering yellows (again). With two Es in EXILE, one is yellow, and the other is black. Most likely this is resulting in all guesses containing any Es being filtered out. And since we already had a yellow E, then every word in the filtered list contains an E, and is being excluded.


