function getNewChordFormat (instrument) {
  return _.chain(instrument)
    .entries()
    .map(([quality, chords]) => {
      chords = _.chain(chords)
        .entries()
        .map(([name, diagrams]) => {
          const [, root] = name.match(/^([A-G][#b]?)/)
          return { name, diagrams, root }
        })
        .groupBy('root')
        .entries()
        .map(([root, chords]) => {
          const diagrams = _.chain(chords)
            .flatMap('diagrams')
            .map(diagram => {
              const [position, frets, functions] = diagram.split(':')
              return { position: parseInt(position), diagram }
            })
            .sortBy('position')
            .map('diagram')
            .value()

          return { root, diagrams }
        })
        .value()

      return { quality, chords }
    })
    .value()
}

function getChordShapes (instrumentChords) {
  return _.chain(instrumentChords)
    .entries()
    .map(([quality, identities]) => ({
      quality,
      diagrams: _.chain(identities).values().flatten().value()
    }))
    .map(({ quality, diagrams }) => {
      diagrams = _.chain(diagrams)
        .map(diagram => {
          const [position, frets, intervals] = diagram.split(':')

          return {
            frets: frets.split('').map(fret => fret === 'x' ? fret : parseInt(fret)),
            intervals
          }
        })
        .uniqBy('intervals')
        .map(({ frets, intervals }) => {
          const min = Math.min(...frets.filter(fret => fret !== 'x'))
          
          const openFrets = frets.map(fret => fret === 'x' ? 'x' : fret - min)
          const closedFrets = open.map(fret => fret === 'x' ? 'x' : fret + 1)

          return {
            open: `0:${openFrets.join('')}:${intervals}`,
            closed: `0:${closedFrets.join('')}:${intervals}`,
          }
        })
        .value()

      return { quality, diagrams }
    })
    .value()
}