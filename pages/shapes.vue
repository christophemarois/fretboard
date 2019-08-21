<template>
  <main>
    <div class="container">
      <div class="columns">
        <div class="column">
          <h1>Fretboard Chord Shapes</h1>

          <div>
            <div class="form-group form-inline">
              <label class="form-label"><b>Instrument</b></label>

              <div class="btn-group">
                <button class="btn" :class="{ 'active': instrument === 'ukulele' }" @click="instrument = 'ukulele'">Ukulele</button>
                <button class="btn" :class="{ 'active': instrument === 'guitar' }" @click="instrument = 'guitar'">Guitar</button>
              </div>
            </div>

            <label class="form-switch form-inline">
              <input type="checkbox" v-model="openPosition">
              <i class="form-icon"></i> Open position
            </label>
          </div>

          <div class="shapes" v-for="quality in shapes[instrument]" :key="`${instrument}-quality-${quality.quality}`">
            <h3>{{ quality.quality }}</h3>

            <div class="shape__chords">
              <vuekulele
                v-for="({ position, frets, intervals }, diagramI) of quality.diagrams"
                :key="`${instrument}-quality-${quality.quality}-diagram-${diagramI}`"
                :chord="quality.quality"
                :strings="{ ukulele: 4, guitar: 6 }[instrument]"
                :position="position"
                :frets="openPosition ? frets : frets.split('').map(fret => fret === 'x' ? 'x' : parseInt(fret) + 1).join('')"
                :functions="intervals"
                :minimumFrets="4"
                size="medium"
                :svgMode="true"
                :stringNames="{ ukulele: 'G,C,E,A', guitar: 'E,A,D,G,B,E' }[instrument]"
              ></vuekulele>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import Vuekulele from '~/components/Vuekulele'
import shapes from '~/data/shapes.json'

function getParsedShapes (instrument) {
  return Array.from(instrument).map(qualities => {
    qualities.diagrams = qualities.diagrams
      .filter(diagram => typeof diagram === 'string')
      .map(diagram => {
        const [position, frets, intervals] = diagram.split(':')
        return { position: parseInt(position), frets, intervals } 
      })

    return qualities
  })
}

export default {
  components: { Vuekulele },

  data () {
    return {
      shapes: {
        ukulele: getParsedShapes(shapes.ukulele),
        guitar: getParsedShapes(shapes.guitar)
      },
      instrument: 'ukulele',
      openPosition: false,
    }
  },
}
</script>

<style>
main {
  padding: 2rem;
}

.shapes h3 {
  margin-top: 2rem;
}
</style>