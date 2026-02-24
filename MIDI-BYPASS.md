# Sending Bypass CC to Empress Echosystem

## Prerequisites

- Node.js installed
- `easymidi` package installed (`npm install easymidi`)
- A MIDI interface connected to the Echosystem (e.g. USB Uno MIDI Interface)
- Echosystem MIDI channel configured (in this example, channel 6)

## List Available MIDI Ports

```js
const easymidi = require('easymidi');

console.log('Outputs:', easymidi.getOutputs());
console.log('Inputs:', easymidi.getInputs());
```

## Send Bypass CC

The Empress Echosystem uses **CC 37** for bypass control.

- **Value 0** = bypass (effect off)
- **Value 127** = engage (effect on)

> Note: MIDI channels are 1-indexed in the real world but 0-indexed in `easymidi`. Channel 6 = `channel: 5` in code.

```js
const easymidi = require('easymidi');
const output = new easymidi.Output('USB Uno MIDI Interface');

output.send('cc', {
  controller: 37,
  value: 127,
  channel: 5, // MIDI channel 6 (0-indexed)
});

setTimeout(() => output.close(), 100);
```

### One-liner (from terminal)

```bash
node -e "const m=require('easymidi');const o=new m.Output('USB Uno MIDI Interface');o.send('cc',{controller:37,value:127,channel:5});setTimeout(()=>o.close(),100)"
```

## Other Useful Echosystem CCs

| CC  | Function         |
| --- | ---------------- |
| 35  | Tap              |
| 36  | Scroll           |
| 37  | Bypass           |
| 38  | Shift            |
| 39  | Save Preset      |
| 40  | Engine Order     |
| 41  | A Solo Engine    |
| 42  | B Solo Engine    |
| 51  | A MIDI Clock     |
| 52  | B MIDI Clock     |
| 60  | Engage Bypass    |
