// Placeholder copy. Swap any of this for the real thing; each entry becomes one scroll stop,
// and each stop has a matching camera pose in src/scene/cameraKeys.js (same order).
// `side` is the side of the screen the text sits on at desktop width.
// `theme: 'warm'` switches the text to the amber palette used in the ant scenes.
export const STOPS = [
  {
    id: 'hero',
    nav: 'Genome',
    buttons: ['cell0', 'cell1', 'cell2', 'cell3'],
    side: 'left',
    title: 'Everything you are is written in four letters.',
    body: 'A, T, G and C. Strung together, they hold the instructions for every cell in your body.',
    hint: 'Drag the helix to turn it. Scroll to follow it down.',
  },
  {
    id: 'pairs',
    side: 'right',
    title: 'Two strands, one ladder.',
    body: 'Each rung is a pair of bases. A always meets T, and G always meets C. That rule is how a cell copies itself without losing the message.',
  },
  {
    id: 'length',
    side: 'left',
    title: 'Three billion pairs, folded small.',
    body: 'The human genome runs to roughly three billion pairs. Stretched out, the DNA from a single cell would measure about two metres.',
  },
  {
    id: 'coil',
    side: 'right',
    title: 'One turn every ten pairs.',
    body: 'The ladder twists as it goes, about ten pairs to a turn. Look down the axis and the whole molecule becomes a tunnel.',
  },
  {
    id: 'inside',
    side: 'center',
    title: 'This is the inside of the code.',
    body: 'Stay with it. The lights are about to go out.',
  },
  {
    // The blackout. Each beat lights up word by word as you scroll, then gives way to the next.
    id: 'dark',
    kind: 'dark',
    beats: [
      'DNA is a long chain of nucleotides. Each one is a sugar, a phosphate and one of four bases: adenine, thymine, guanine or cytosine.',
      'Two chains face each other with the bases pointing in. Hydrogen bonds hold each pair together, two between A and T, three between G and C.',
      'Read three bases at a time and the sequence spells out the amino acids that build a protein. Before a cell divides, the ladder unzips and each half rebuilds its partner.',
    ],
  },
  {
    id: 'ant-top',
    nav: 'The Ant',
    side: 'left',
    theme: 'warm',
    title: 'The same four letters run an ant.',
    body: 'Queens and workers in a colony read the same genome. What separates them is which genes are switched on, and when.',
  },
  {
    id: 'ant-mid',
    side: 'right',
    theme: 'warm',
    title: 'Small body, same machinery.',
    body: 'Every cell in this ant carries a copy of the ladder you just flew through, copied again and again from a single fertilised egg.',
  },
  {
    id: 'ant-side',
    side: 'left',
    theme: 'warm',
    title: 'Written once, read everywhere.',
    body: 'Antennae, legs and jaws grow where they do because genes switch on in the right place and the right order.',
  },
  {
    id: 'ant-head',
    side: 'left',
    theme: 'warm',
    title: 'Closer: the head.',
    body: 'Compound eyes, jaws and antennae are built from the same instructions, switched on in a different pattern.',
  },
  {
    id: 'ant-body',
    side: 'right',
    theme: 'warm',
    title: 'Closer still: the body.',
    body: 'Trillions of copies of one molecule, each reading only the pages it needs.',
  },
  {
    id: 'earth-near',
    theme: 'earth',
    nav: 'Earth',
    side: 'left',
    title: 'Every living thing shares this code.',
    body: 'From an ant to the ground it walks on, life on this planet reads the same four letters.',
  },
  {
    id: 'earth-mid',
    theme: 'earth',
    side: 'right',
    title: 'Now step back.',
    body: 'Billions of people, each carrying a genome of their own, and each one a reason to ask how we should use what we have learned.',
  },
  {
    id: 'ending',
    theme: 'earth',
    side: 'left',
    title: 'The code is ours to read, and to answer for.',
    body: 'Gene therapy and stem cell research can heal. Who decides how far they go is a question for everyone on this planet.',
    action: 'Back to the start',
  },
]
