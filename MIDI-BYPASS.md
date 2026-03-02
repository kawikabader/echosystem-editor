# Sending Bypass CC to Empress Echosystem

## Prerequisites

- Node.js installed
- `easymidi` package installed (`npm install easymidi`)
- A MIDI interface connected to the Echosystem (e.g. PirateMIDI Bridge4)
- Echosystem MIDI channel configured (in this example, channel 6)

## List Available MIDI Ports

```js
const easymidi = require('easymidi');

console.log('Outputs:', easymidi.getOutputs());
console.log('Inputs:', easymidi.getInputs());
```

## Send Bypass CC

The Empress Echosystem uses **CC 37** for bypass control. Sending **value 127** acts as a **toggle** — each send flips the bypass state on/off.

> Note: MIDI channels are 1-indexed in the real world but 0-indexed in `easymidi`. Channel 6 = `channel: 5` in code.

```js
const easymidi = require('easymidi');
const output = new easymidi.Output('Bridge4');

output.send('cc', {
  controller: 37,
  value: 127, // toggles bypass on/off
  channel: 5, // MIDI channel 6 (0-indexed)
});

setTimeout(() => output.close(), 100);
```

### One-liner (from terminal)

```bash
node -e "const m=require('easymidi');const o=new m.Output('Bridge4');o.send('cc',{controller:37,value:127,channel:5});setTimeout(()=>o.close(),100)"
```

## Bidirectional MIDI (Knob Feedback)

The Echosystem supports bidirectional MIDI but requires a **SysEx Identity Request handshake** before it will send CC feedback.

### How it works

1. The Echosystem periodically sends a **Universal SysEx Identity Request** (`F0 7E 7F 06 01 F7`)
2. You must respond with an **Identity Reply** — any valid reply unlocks CC output
3. Once the handshake completes, the Echosystem streams real-time CC values on its MIDI channel as knobs are turned

### Identity Reply example

```js
// Listen for Identity Request and respond
input.on('sysex', (msg) => {
  const hex = msg.bytes.map(b => b.toString(16)).join(' ');
  if (hex === 'f0 7e 7f 6 1 f7') {
    output.send('sysex', [
      0xF0, 0x7E, 0x00, 0x06, 0x02,
      0x00, 0x01, 0x00,  // manufacturer
      0x01, 0x00,        // family
      0x01, 0x00,        // model
      0x01, 0x00, 0x00, 0x00, // version
      0xF7
    ]);
  }
});
```

### Knob CC Feedback (channel 6, values 0-127)

| CC  | Knob        |
| --- | ----------- |
| 101 | Knob 1      |
| 102 | Knob 2      |
| 103 | Knob 3      |
| 104 | Knob 4      |
| 105 | Knob 5      |
| 106 | Knob 6      |
| 107 | Knob 7      |

> **Note**: With a Strymon Conduit, use the **GREEN (Tip Send)** jack configuration for Empress pedals. Send on Conduit Port 1, receive on Conduit Port 1. The Conduit's Port 6 is its internal USB management port.

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
