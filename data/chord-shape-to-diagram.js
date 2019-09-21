// Modulo that supports negative numbers
const mod = (num, mod) => ((num % mod) + mod) % mod

const EMPTY_FRET = 'x'
const EMPTY_INTERVAL = ''

const rootToSemitonesFromC = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 }
const accidentalToSemitoneOffsets = { 'bb': -2, 'b': -1, '#': 1, '##': 2, 'x': 2 }
const semitoneOffsetsToAccidentals = { '-2': 'bb', '-1': 'b', '0': '', '1': '#', '2': '##' }
const degreeIndexToSemitones = [0, 2, 4, 5, 7, 9, 11]

const scales = {
  'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
  'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
  'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
  'A': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
  'E': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
  'B': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
  'F#': ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#'],
  'Db': ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
  'Ab': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
  'Eb': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
  'Bb': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
  'F': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
}

export function convertFunctionIntervalsToNoteNames (functions, root) {
  const scale = scales[root]

  if (!scale) {
    throw new Error(`No scale found for root ${root}`)
  }

  if (!functions.every(interval => typeof interval === 'string')) {
    throw new Error(`Invalid functions array ${JSON.stringify(functions)}`)
  }

  const parsed = functions.map(interval => {
    if (interval === EMPTY_INTERVAL) return null

    const match = interval.trim().match(/^([^\d]{0,2})(\d+)$/i)

    if (!match) {
      throw new Error(`Invalid interval ${interval}`)
    }

    const accidental = match[1]

    if (accidental !== EMPTY_INTERVAL && !(accidental in accidentalToSemitoneOffsets)) {
      throw new Error(`Invalid interval accidental "${accidental}" for interval "${interval}"`)
    }

    const degree = parseInt(match[2])

    if (!(Number.isInteger(degree) && degree >= 1)) {
      throw new Error(`Invalid interval degree "${degree}" for interval "${interval}"`)
    }

    let [, scaleNoteName, scaleNoteAccidental] = scale[mod(degree - 1, 7)].match(/^([A-G])(#|b)?$/)
    
    const scaleNoteOffset = accidentalToSemitoneOffsets[scaleNoteAccidental] || 0
    const intervalOffset = accidental === EMPTY_INTERVAL ? 0 : accidentalToSemitoneOffsets[accidental]

    const finalAccidental = semitoneOffsetsToAccidentals[scaleNoteOffset + intervalOffset]

    return `${scaleNoteName}${finalAccidental}`
  })

  return parsed
}

export function noteNameToSemitonesFromC (root) {
  if (typeof root !== 'string') {
    throw new Error(`Invalid root: "${root}". Should be a string`)
  }

  const match = root.match(/^([A-G])([b#]?)$/i)
  if (!match) {
    throw new Error(`Invalid root: "${root}"`)
  }

  const semitonesFromC = rootToSemitonesFromC[match[1]]
  if (!match) {
    throw new Error(`Invalid note name in root: "${root}"`)
  }

  const accidental = match[2]
  const offset = accidental === '' ? 0 : accidentalToSemitoneOffsets[accidental]
  if (typeof offset === 'undefined') {
    throw new Error(`Invalid accidental in root "${root}"`)
  }

  return mod(semitonesFromC + offset, 12)
}

export function convertDiatonicIntervalToSemitones (interval) {
  if (typeof interval !== 'string') {
    throw new Error(`Invalid interval: "${interval}". Should be a string`)
  }

  const match = interval.trim().match(/^([^\d]{0,2})(\d+)$/i)
  if (!match) {
    throw new Error(`Invalid interval: "${interval}"`)
  }

  const accidental = match[1]
  const offset = accidental === '' ? 0 : accidentalToSemitoneOffsets[accidental]
  if (typeof offset === 'undefined') {
    throw new Error(`Invalid accidental in interval "${interval}"`)
  }

  const degreeIndex = parseInt(match[2]) - 1
  if (!(degreeIndex >= 0)) {
    throw new Error(`Invalid degree in interval "${interval}"`)
  }

  const semitones = degreeIndexToSemitones[mod(degreeIndex, 7)] + (Math.floor(degreeIndex / 7) * 12)

  return semitones + offset
}

export function placeShapeDiagram ({ root, shape, functions, strings, transpositionOffset = 0, maxFret = 30 }) {
  if (!(Number.isInteger(transpositionOffset) && transpositionOffset >= 0 && transpositionOffset <= 11)) {
    throw new Error(`Invalid transpositionOffset ${transpositionOffset}. Must be a 0..11 integer`)
  }

  if (!(Number.isInteger(maxFret) && maxFret >= 0 && maxFret <= 100)) {
    throw new Error(`Invalid maxFret ${maxFret}. Must be a 0..100 integer`)
  }

  if (maxFret < transpositionOffset) {
    throw new Error(`Invalid maxFret ${maxFret} should be higher than transpositionOffset ${transpositionOffset}`)
  }

  if (!shape.every(fret => fret >= 0 || fret === EMPTY_FRET)) {
    throw new Error(`Invalid shape ${JSON.stringify(shape)}. Fret must be a positive integer or 'x'`)
  }

  // DEV: until guitar intervals with 'B' are fixed
  functions = functions.map(interval => interval === 'B' ? EMPTY_INTERVAL : interval)

  if (functions.every(interval => interval === EMPTY_INTERVAL)) {
    throw new Error(`Invalid chord functions: all function intervals are empty`)
  }

  try {
    // Parse the root note and convert it to a integer from 0-12
    // representing its distance in semitones from C 
    var rootOffsetFromC = noteNameToSemitonesFromC(root)
  
    // Also convert the strings array to an array of semitones from C, plus transpositionOffset
    var tuningOffsetsFromC = strings.map(name => mod(noteNameToSemitonesFromC(name) + transpositionOffset, 12))
    
    // Convert the diatonic function intervals array into an array of semitones
    // representing their distance from the root note
    var semitoneIntervals = functions.map(interval => {
      return interval === EMPTY_INTERVAL ? EMPTY_INTERVAL : convertDiatonicIntervalToSemitones(interval)
    })
  } catch (err) {
    throw new Error(`Error parsing chord ${root} with functions ${functions.join(',')} on strings ${strings.join(',')}: ${err.message}`)
  }

  // Get the index of the string with the lowest interval played.
  // It might not be a 1 (tonic interval, 0 in semitones) in case of rootless voicings
  const { minStringI } = semitoneIntervals.reduce(({ min, minStringI }, semitones, stringI) => {
    if (semitones !== EMPTY_INTERVAL && semitones < min) {
      min = semitones
      minStringI = stringI
    }

    return { min, minStringI }
  }, { min: Infinity, minStringI: -1 })

  // For that lowest string:
  // 1. Get the string semitones from C
  // 2. Add the fret played in the shape
  // 3. Add the interval in semitones
  // This gives the true root of the shape in semitones, if it was played as-is.
  const shapeRootOffsetFromC = mod(tuningOffsetsFromC[minStringI] - semitoneIntervals[minStringI] + shape[minStringI], 12)

  // Make transposed frets by
  // 1. Substracting 12 so we start with negative frets and build up from there
  // 2. Substracting the shape root offset. This transposes the shape to have a C rootç
  // 3. Adding the target root offset from C. This finally gives the notes we are looking for
  let frets = shape.map(fret => {
    if (fret === EMPTY_FRET) return fret
    return -12 + fret - shapeRootOffsetFromC + rootOffsetFromC
  })

  // The chord might be lower than what's playable. If it is, add an octave
  // until it is playable, but stop at a maximum fret that is too high to be playable
  while (
    (Math.min(...frets.filter(fret => fret !== EMPTY_FRET)) < 0) &&
    (Math.max(...frets.filter(fret => fret !== EMPTY_FRET)) <= (maxFret - transpositionOffset))
  ) {
    frets = frets.map(fret => {
      if (fret === EMPTY_FRET) return fret
      return fret + 12
    })
  }

  // If the last iteration brought us too high, this shape is unplayable
  // with this root note.
  if (Math.max(...frets.filter(fret => fret !== EMPTY_FRET)) > (maxFret - transpositionOffset)) {
    return null
  }
  
  // If all frets are higher than 2, push back up and store position
  const min = Math.min(...frets.filter(fret => fret !== EMPTY_FRET))
  const position = min > 2 ? min : 0

  if (min > 2) {
    frets = frets.map(fret => {
      if (fret === EMPTY_FRET) return fret
      return fret - position + 1
    })
  }

  const noteNames = convertFunctionIntervalsToNoteNames(functions, root)

  // console.log(shape.join(','), { root, shape, functions, strings, transpositionOffset, maxFret, rootOffsetFromC, tuningOffsetsFromC, semitoneIntervals, minStringI, shapeRootOffsetFromC, position, frets, functions })
  return { position, frets, functions, noteNames }
}