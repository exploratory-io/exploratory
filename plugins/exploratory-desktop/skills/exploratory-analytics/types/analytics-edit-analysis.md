**If you merely chose the wrong slots or settings, fix it with update_analytics without deleting.**
The id does not change, so saved references can still be used as they are.
However **the way of passing differs from update_chart.** The slots and settings of an analysis depend on each other, so
**pass the same content as create_analytics to rebuild (slots you did not pass disappear).**
The type of the analysis cannot be changed. Only when changing the type, delete and recreate.

**Use delete_analytics when the analysis itself is no longer needed.**
Do not delete on your own an analysis you built at the user's request, even when the result is not what you expected.
Tell them what differed and how, and let the user decide whether to fix or rebuild.
(An analysis the user already had will not be deleted even if you pass its id)
