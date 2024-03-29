# 🎼 Fretboard Diagram Builder

Fretboard Diagram Builder as a PWA, built with Vue.

[![Netlify Status](https://api.netlify.com/api/v1/badges/8e5b0285-62a9-43b4-ba38-3797434f6f7e/deploy-status)](https://app.netlify.com/sites/fretboarddiagrambuilder/deploys)

🖖 **If you want to suggest a feature, open an issue**

---

For a long time, I've wanted a fretboard diagram builder with extensive flexibility. I wanted it to work for all fretted instruments, to have a lot of customizability (so I could use it both for my own charts and for teaching), so I built one that supports:

### Features

* SVG or PNG output with size options (so it's useful in a multitude of scenarios)
* Nut support (when the position is 0, it shows the nut, otherwise it displays the position)
* Fingerings (optional, great for teaching)
* Note functions (optional, e.g. 1-3-♭7-5)
* Root display (optional, when a note function is marked as 1, the note will be displayed as a square)
* String names (optional, great to convey the tuning or transposition of a chord, or whether the chord is in left-handed mode)
* Variable string count
* Minimum frets per diagram
* Chord shape catalog for Ukulele and Guitar, with chord name functions precomputed + support for transposed tunings + shape tranposition to all roots.
* Compute chords based on shapes instead of catalog
* PWA with offline use
* Keyboard shortcuts for navigating catalog
* Note names from catalog

### Upcoming / Known bugs

* Manually verify playability of all shapes
* Bug in rootless note names (e.g. m7b59)
* Fix error when manual frets are empty
* Diagram font fixes + fixes to alterations (♯♭)
* Fix to guitar functions where it displays "B" instead of the function

### Roadmap

* Shadow root in Vuekulele
* Toggle root for enharmonic alternatives
* Mobile layout
* State preservation across refreshes

### Considered

* Mandolin
* Banjo (would require changes to Vuekulele)
