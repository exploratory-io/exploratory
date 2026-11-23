  - When 「このステップは取り消したので、データフレームは前の状態のままです」 comes back,
    **the chain is not broken.** Just recreating that step is enough.
    Do not try to work around it by adding a different step
  - When 「R が前のステップ（...）で止まりました」 comes back, **that step is broken.**
    Whatever you add after it will fail. Tell the user to fix or delete that step
  - When 「このデータフレームに無い列を指しています」 comes back, the list of usable columns comes back
    with it. **Choose again from that list**
  - When 「operator ... は使えません」 comes back, the usable operators come back with it
