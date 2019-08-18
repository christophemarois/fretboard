<template>
  <main>
    <div class="container">
      <div class="columns">
        <div class="column col-8">
          <h1>Fretboard Diagram Builder</h1>

          <div>
            <a class="github-button" href="https://github.com/christophemarois/fretboard" data-show-count="true" aria-label="Star christophemarois/fretboard on GitHub">Star</a>
            <a class="github-button" href="https://github.com/christophemarois/fretboard/issues" data-show-count="true" aria-label="Issue christophemarois/fretboard on GitHub">Issue</a>
          </div>

          <div v-if="!closedNewsIds.includes(2)" class="toast toast-success" style="margin-top: 1rem">
            <button class="btn btn-clear float-right" @click="closedNewsIds.push(2)"></button>
            <code>2019/08/18</code>
            <a href="https://github.com/christophemarois/fretboard" target="_blank">Open-sourced</a>
            and now available as an offline PWA (can be installed and used offline on Chrome >=73,
            latest iOS Safari, and others). Also, fixed some fonts issues in the diagram.
          </div>

          <div class="divider" style="margin: 1rem 0"></div>

          <h3>Catalog</h3>

          <div>
            <div class="form-group form-inline">
              <label class="form-label"><b>Instrument</b></label>

              <div class="btn-group">
                <button class="btn" :class="{ 'active': instrument === 'ukulele' }" @click="instrument = 'ukulele'">Ukulele</button>
                <button class="btn" :class="{ 'active': instrument === 'guitar' }" @click="instrument = 'guitar'">Guitar</button>
              </div>
            </div>
            
            <div class="form-group form-inline" style="margin-left: 0.5rem">
              <label class="form-label" for="transposition"><b>Transposition</b></label>

              <select name="transposition" class="form-select form-input" v-model.number="transpositionI" style="width: auto;" aria-placeholder="Select Chord">
                <option v-for="transposition in transpositions" :key="'transposition' + transposition.i" :value="transposition.i">
                  +{{ transposition.i }}: {{ transposition.name }}{{ transposition.alias && ` (${transposition.alias})` }}
                </option>
              </select>
            </div>
            
            <div class="form-group form-inline" style="margin-left: 0.5rem">
              <label class="form-label" for="catalogChord"><b>Chord</b></label>

              <select name="catalogChord" class="form-select form-input" v-model="catalogChordName" style="width: auto;" aria-placeholder="Select Chord">
                <option v-for="catalogChord in catalogChords" :key="catalogChord.name">{{ catalogChord.name }}</option>
              </select>
            </div>
            
            <div v-if="transposedChord" class="form-group form-inline" style="margin-left: 0.5rem">
              <label class="form-label" for="catalogChord"><b>Variants</b></label>

              <div class="btn-group">
                <button
                  v-for="(diagrams, i) in transposedChord.diagrams"
                  :key="'catalog-diagram-' + i"
                  class="btn"
                  :class="{ 'active': diagramI === i }"
                  @click="diagramI = i"
                >{{ i + 1 }}</button>
              </div>
            </div>

            <div class="form-group" style="margin-top: 0.5rem">
              <label class="form-switch">
                <input type="checkbox" v-model="leftHanded">
                <i class="form-icon"></i> Left-handed mode
              </label>
            </div>
          </div>

          <div class="divider" style="margin: 1rem 0"></div>

          <h3>Chord</h3>

          <div>
            <div class="form-group form-inline">
              <label class="form-label" for="name"><b>Name</b><br/>e.g. <span class="label">Bbmaj7</span></label>
              <input id="name" type="text" v-model="name" class="form-input" @input="clearCatalog" />
            </div>
            <div class="form-group form-inline">
              <label class="form-label" for="position"><b>Position</b><br/>e.g. <span class="label">1</span></label>
              <input id="position" type="number" v-model.number="position" class="form-input" min="0" step="1" @input="clearCatalog" />
            </div>
            <div class="form-group form-inline">
              <label class="form-label" for="frets"><b>Frets</b><br/>e.g. <span class="label">0001</span> or <span class="label">0x01</span></label>
              <input id="frets" type="text" v-model="frets" class="form-input" pattern="[\dx]+" @input="clearCatalog" />
            </div>
            <div class="form-group form-inline">
              <label class="form-label" for="functions"><b>Functions</b><br/>e.g. <span class="label">b7,5,3,1</span></label>
              <input id="functions" type="text" v-model="functions" class="form-input" @input="clearCatalog" />
            </div>
            <div class="form-group form-inline">
              <label class="form-label" for="fingerings"><b>Fingerings</b><br/>e.g. <span class="label">0001</span></label>
              <input id="fingerings" type="text" v-model="fingerings" class="form-input" pattern="\d+" @input="clearCatalog" />
            </div>
          </div>

          <div class="divider" style="margin: 1rem 0"></div>

          <h3>Fretboard</h3>

          <div>
            <div class="form-group form-inline">
              <label class="form-label" for="strings"><b>Strings</b><br/>e.g. <span class="label">4</span></label>
              <input id="strings" type="number" v-model.number="strings" class="form-input" min="0" step="1" @input="clearCatalog" />
            </div>
            <div class="form-group form-inline">
              <label class="form-label" for="minimumFrets"><b>Minimum frets</b><br/>e.g. <span class="label">4</span></label>
              <input id="minimumFrets" type="number" v-model.number="minimumFrets" class="form-input" min="0" step="1" @input="clearCatalog" />
            </div>
            <div class="form-group form-inline">
              <label class="form-label" for="stringNames"><b>String names</b><br/>e.g. <span class="label">G#,C#,E#,A#</span></label>
              <input id="stringNames" type="text" v-model.trim="stringNames" class="form-input" pattern="[A-Z,b#]+" @input="clearCatalog" />
            </div>
          </div>
        </div>
        
        <div class="column col-4">
          <div class="chord">
            <vuekulele
              ref="vuekulele"
              :chord="name"
              :strings="strings"
              :position="position"
              :frets="frets"
              :functions="functions"
              :fingerings="fingerings"
              :minimumFrets="minimumFrets"
              :size="size"
              :svgMode="svgMode"
              :stringNames="stringNames"
            ></vuekulele>
          </div>

          <div>
            <select class="form-select form-input" v-model="size" style="width: auto; margin: 1rem auto 0 auto;">
              <option value="small">Small, 20px case</option>
              <option value="medium">Medium, 30px case</option>
              <option value="large">Large, 40px case</option>
              <option value="giant">Giant, 50px case</option>
            </select>
          </div>

          <div style="text-align: center; margin-top: 1rem; display: flex; justify-content: center;">
            <div class="btn-group" style="width: 150px; margin-right: 1rem">
              <button class="btn" :class="{ 'active': svgMode }" @click="svgMode = true">SVG</button>
              <button class="btn" :class="{ 'active': !svgMode }" @click="svgMode = false">PNG</button>
            </div>

            <button class="btn btn-primary btn-action" @click="$refs.vuekulele.download()">
              <i class="icon icon-download" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import Vuekulele from '~/components/Vuekulele.vue'

import { notes, qualities, instruments } from '~/data/entries.json'
import chords from '~/data/chords.json'

const mod = (num, mod) => ((num % mod) + mod) % mod

export default {
  components: { Vuekulele },
  data () {
    return {
      strings: 4,
      name: 'C7',
      position: 0,
      frets: '0001',
      functions: '5,1,3,b7',
      fingerings: '0001',
      minimumFrets: 4,
      size: 'large',
      svgMode: true,
      instrument: 'ukulele',
      catalogChordName: '',
      diagramI: 0,
      leftHanded: false,
      stringNames: 'G,C,E,A',
      transpositionI: 0,
      closedNewsIds: [1, 2],
    }
  },
  computed: {
    catalogChords () {
      return Object.values(chords[this.instrument] || {}).flatMap(rootChords => {
        return Object.entries(rootChords).map(([name, diagrams]) => ({ name, diagrams }))
      })
    },
    catalogChord () {
      return this.catalogChords.find(catalogChord => catalogChord.name === this.catalogChordName)
    },
    transpositions () {
      const instrument = instruments.find(instrument => instrument.name === this.instrument)

      if (!instrument) return []

      const noteNames = notes.map(note => note.name)
      const semitones = instrument.semitones

      return Array(12).fill().map((_, i) => {
        const name = semitones.map(semitone => noteNames[(semitone + i) % 12]).join(' ')
        const alias = instrument.transpositions[i] || null

        return { i, name, alias }
      })
    },
    transposedChord () {
      if (!this.catalogChord) return
      if (this.transpositionI === 0) return this.catalogChord

      const [root, quality = ''] = this.catalogChord.name.trim().split(/^([A-G][b#]?)(.*)/).filter(part => part !== '')

      const rootIndex = notes.findIndex(note => note.name === root || (note.alt || []).includes(root))
      const transposedName = notes[mod(rootIndex - this.transpositionI, 12)].name + quality
      
      const transposedChord = this.catalogChords.find(catalogChord => catalogChord.name === transposedName)

      if (transposedChord) {
        return transposedChord
      } else {
        console.error(`Unknown chord transposition ${transposedName} (+${this.transpositionI}) for chord ${this.catalogChord.name}`)
      }
    }
  },
  watch: {
    instrument (val) {
      this.catalogChordName = null
      this.transpositionI = 0
    },
    catalogChordName () {
      this.diagramI = 0
      this.readFromCatalog()
    },
    diagramI () {
      this.readFromCatalog()
    },
    leftHanded () {
      this.readFromCatalog()
    },
    transpositionI () {
      this.diagramI = 0
      this.readFromCatalog()
    },
    closedNewsIds (val) {
      window.localStorage.setItem('closedNewsIds', JSON.stringify(val))
    }
  },
  methods: {
    clearCatalog () {
      this.catalogChordName = ''
    },
    readFromCatalog () {
      if (!this.transposedChord) return

      const diagram = this.transposedChord.diagrams[this.diagramI]
      if (!diagram) return

      this.stringNames = this.transpositions[this.transpositionI].name.split(' ').join(',')

      let [position, frets, functions] = diagram.split(':')

      if (this.leftHanded) {
        frets = frets.split('').reverse().join('')
        functions = functions.split(',').reverse().join()
        this.stringNames = this.stringNames.split(',').reverse().join(',')
      }

      this.name = this.catalogChord.name
      this.position = parseInt(position)
      this.frets = frets
      this.functions = functions
      this.fingerings = ''
      this.strings = { ukulele: 4, guitar: 6 }[this.instrument]
    },
  },
  mounted () {
    try {
      const closedNewsIds = JSON.parse(window.localStorage.getItem('closedNewsIds'))
      this.closedNewsIds = Array.isArray(closedNewsIds) ? closedNewsIds : []
    } catch (err) {}
  } 
}
</script>

<style>
main {
  max-width: 60rem;
  margin: 2rem auto;
  padding: 0 2rem;
}

.chord {
  text-align: center;
}
</style>