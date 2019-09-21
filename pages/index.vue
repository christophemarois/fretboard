<template>
  <main>
    <div class="container">
      <div class="columns">
        <div class="column col-8">
          <div style="display: flex; align-items: center; margin-bottom: 1rem">
            <img src="/icon.png" style="width: 45px; margin-right: 0.5rem; border-radius: 8px; box-shadow: 0 0 5px rgba(0, 0, 0, 0.25)" />
            <h1 style="margin: 0">Fretboard Diagram Builder</h1>
          </div>

          <div>
            <a class="github-button" href="https://github.com/christophemarois/fretboard" data-show-count="true" aria-label="Star christophemarois/fretboard on GitHub">Star</a>
            <a class="github-button" href="https://github.com/christophemarois/fretboard/issues" data-show-count="true" aria-label="Issue christophemarois/fretboard on GitHub">Issue</a>
          </div>

          <div v-if="!closedNewsIds.includes(5)" class="toast" style="margin-top: 1rem">
            <button class="btn btn-clear float-right" @click="closedNewsIds.push(5)"></button>
            <code>2019/09/21</code> WIP changes:
            <ul>
              <li>Chord catalog is now algorithmically populated with shapes only.</li>
              <li>Keyboard shortcuts for navigating chord catalog.</li>
              <li>Optional note names in chord catalog</li>
            </ul>
          </div>

          <ul class="tab" style="margin: 1rem 0">
            <li class="tab-item">
              <a href="#" :class="{ active: mode === 'catalog' }" @click.prevent="mode = 'catalog'">Automatic</a>
            </li>

            <li class="tab-item">
              <a href="#" :class="{ active: mode === 'manual' }" @click.prevent="mode = 'manual'">Manual</a>
            </li>
          </ul>

          <div v-if="mode === 'catalog'">
            <div>
              <div class="form-group form-inline">
                <label class="form-label"><b>Instrument</b></label>

                <div class="btn-group">
                  <button class="btn" :class="{ 'active': catalogInstrument === 'ukulele' }" @click="catalogInstrument = 'ukulele'">Ukulele</button>
                  <button class="btn" :class="{ 'active': catalogInstrument === 'guitar' }" @click="catalogInstrument = 'guitar'">Guitar</button>
                </div>
              </div>
              
              <div class="form-group form-inline" style="margin-left: 0.5rem">
                <label class="form-label" for="transposition"><b>Transposition</b></label>

                <select name="transposition" class="form-select form-input" v-model.number="transpositionI" style="width: auto;">
                  <option v-for="transposition in transpositions" :key="'transposition' + transposition.i" :value="transposition.i">
                    +{{ transposition.i }}: {{ transposition.name }}{{ transposition.alias && ` (${transposition.alias})` }}
                  </option>
                </select>
              </div>
            </div>

            <div style="margin-top: 0.5rem">
              <div class="form-group form-inline" >
                <label class="form-switch">
                  <input type="checkbox" v-model="isLeftHandedMode">
                  <i class="form-icon"></i> Left-handed
                </label>
              </div>
              
              <div class="form-group form-inline" style="margin-left: 0.5rem">
                <label class="form-switch">
                  <input type="checkbox" v-model="isShapeMode">
                  <i class="form-icon"></i> Chord Shapes only
                </label>
              </div>

              <div v-if="!isShapeMode" class="form-group form-inline" style="margin-left: 0.5rem">
                <label class="form-switch">
                  <input type="checkbox" v-model="sendNoteNames">
                  <i class="form-icon"></i> Display note names
                </label>
              </div>
            </div>

            <div class="divider" />

            <div v-if="isShapeMode" class="form-group form-inline">
              <label class="form-label" for="catalogChord"><b>Shape</b>&nbsp;&nbsp;<kbd>q</kbd> ↔ <kbd>w</kbd></label>

              <div class="btn-group">
                <button
                  class="btn"
                  :class="{ 'active': shape === 'closed' }"
                  @click="shape = 'closed'"
                >Closed</button>
                
                <button
                  class="btn"
                  :class="{ 'active': shape === 'open' }"
                  @click="shape = 'open'"
                >Open</button>
              </div>
            </div>
            
            <div v-else class="form-group form-inline">
              <label class="form-label" for="catalogChord"><b>Root</b>&nbsp;&nbsp;<kbd>q</kbd> ↔ <kbd>w</kbd></label>

              <div style="margin: -0.25rem 0 0 -0.25rem">
                <button
                  v-for="note in notes"
                  :key="'catalog-root-' + note.name"
                  class="btn"
                  :class="{ 'active': catalogRoot === note.name }"
                  @click="catalogRoot = note.name"
                  style="margin: 0.25rem 0 0 0.25rem"
                >
                  {{ note.name + (note.alt ? `/${note.alt}` : '') }}
                </button>
              </div>
            </div>

            <div class="divider" />
            
            <div class="form-group form-inline">
              <label class="form-label" for="catalogChord">
                <b>Quality</b>&nbsp;&nbsp;<kbd>a</kbd> ↔ <kbd>s</kbd>
              </label>
              
              <div style="margin-top: -0.5rem" />

              <div v-for="group in qualityGroups" :key="`catalog-quality-${group.name}`">
                <div style="margin-top: 0.5rem">{{ group.name }}</div>

                <div style="margin: 0 0 0 -0.25rem">
                  <button
                    v-for="quality in group.qualities"
                    :key="'catalog-quality-' + quality.name"
                    class="btn"
                    :class="{ 'active': catalogQuality === quality.name }"
                    @click="catalogQuality = quality.name"
                    style="margin: 0.25rem 0 0 0.25rem"
                  >
                    {{ quality.name + (quality.alt ? `, ${quality.alt.join(', ')}` : '') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="mode === 'manual'">
            <div v-if="catalogQuality" class="toast toast-primary" style="margin-bottom: 1rem">
              <i class="icon icon-message" />&nbsp;
              You are about to edit a catalog chord. Any changes made here will trigger manual mode.
            </div>
            
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
              <div class="form-group form-inline">
                <label class="form-label" for="noteNames"><b>Note names</b><br/>e.g. <span class="label">C,E,,A</span></label>
                <input id="noteNames" type="text" v-model="noteNames" class="form-input" pattern="[A-Z,b#]+" @input="clearCatalog" />
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
        </div>
        
        <div class="column col-4">
          <div v-if="catalogQuality" class="form-group" style=" text-align: center; margin-bottom: 2rem">
            <label class="form-label" for="catalogChord" style="margin-bottom: 0.5rem">
              <b>Variants</b>&nbsp;&nbsp;<kbd>z</kbd> &harr; <kbd>x</kbd> or <kbd>&larr;</kbd> &harr; <kbd>&rarr;</kbd>
            </label>

            <div style="display: flex; align-items: center; justify-content: space-between; max-width: 8rem; margin: 0 auto">
              <button class="btn btn-primary" @click="goToDiagram(-1)">
                <i class="icon icon-arrow-left" />
              </button>
              
              <span style="margin: 0 0.5rem; font-weight: bold; font-size: 1.25rem">
                {{ diagramI + 1 }}/{{ (isShapeMode ? shapeDiagrams : chordDiagrams).length }}
              </span>

              <button class="btn btn-primary" @click="goToDiagram(1)">
                <i class="icon icon-arrow-right" />
              </button>
            </div>
          </div>

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
              :noteNames="noteNames"
            ></vuekulele>
          </div>

          <div v-if="catalogQuality" style="text-align: center; margin: 0.5rem 0;">
            <a :href="currentGithubIssueURL" target="_blank" style="font-size: 0.75rem;">Report a problem with this chord</a>
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

import { placeShapeDiagram } from '@/data/chord-shape-to-diagram'

import { notes, qualityGroups, instruments } from '~/data/entries.json'
import shapes from '~/data/shapes.json'

const mod = (num, mod) => ((num % mod) + mod) % mod

export default {
  components: { Vuekulele },
  data () {
    return {
      notes,
      qualityGroups,
      instruments,

      mode: 'catalog',
      closedNewsIds: [5],

      catalogInstrument: 'ukulele',
      catalogRoot: 'C',
      catalogQuality: null,
      isShapeMode: false,
      sendNoteNames: true,
      shape: 'closed',
      diagramI: 0,
      isLeftHandedMode: false,
      transpositionI: 0,
      noteNames: '',

      strings: 4,
      name: 'C7',
      position: 0,
      frets: '0001',
      functions: '5,1,3,b7',
      fingerings: '0001',
      minimumFrets: 4,
      size: 'medium',
      svgMode: true,
      stringNames: 'G,C,E,A',
    }
  },
  computed: {
    mousetrap () {
      return [
        [['q'], () => this.goToRootOrShape(-1)],
        [['w'], () => this.goToRootOrShape(1)],
        [['a'], () => this.goToQuality(-1)],
        [['s'], () => this.goToQuality(1)],
        [['z', 'left'], () => this.goToDiagram(-1)],
        [['x', 'right'], () => this.goToDiagram(1)],
      ]
    },

    shapeDiagrams () {
      const quality = shapes[this.catalogInstrument].find(group => group.quality === this.catalogQuality)
      if (!quality) return null

      return quality.diagrams
    },

    transpositions () {
      return this.instruments[this.catalogInstrument].transpositions.map(([name, alias], i) => ({ i, name, alias }))
    },

    chordDiagrams () {
      if (!this.catalogQuality) return []

      return this.shapeDiagrams
        .map(diagram => {
          const [position, shape, functions] = diagram.split(':')

          return placeShapeDiagram({
            root: this.catalogRoot,
            shape: shape.split('').map(fret => fret === 'x' ? 'x' : parseInt(fret)),
            functions: functions.split(','),
            strings: this.transpositions[0].name.split(' '),
            transpositionOffset: this.transpositionI,
            maxFret: this.catalogInstrument === 'guitar' ? 30 : 18
          })
        })
        .filter(placedEl => !!placedEl)
        .sort((a, b) => a.position - b.position)
        .map(({ position, frets, functions, noteNames }) => {
          const diagram = [position, frets.join(''), functions.join(',')].join(':')
          return { diagram, noteNames: noteNames.join(',') }
        })
    },

    currentGithubIssueURL () {
      if (!this.catalogQuality) return '#'

      const diagram = this.isShapeMode
        ? this.shapeDiagrams[this.diagramI]
        : this.chordDiagrams[this.diagramI].diagram

      if (!diagram) return '#'

      const shape = diagram.split(':')[2]

      const url = new URL(`https://github.com/christophemarois/fretboard/issues/new`)

      url.searchParams.set('title', `Problem with ${this.catalogInstrument} ${this.catalogQuality} shape ${shape}`)
      url.searchParams.set('labels', ['invalid'])
      url.searchParams.set('body', [
        `[Describe the problem here]`,
        `---`,
        this.isShapeMode ? `Shape mode` : `Chord mode: ${this.catalogRoot} +${this.transpositionI}`,
      ].join('\n'))

      return url.toString()
    }
  },
  watch: {
    catalogInstrument (val) {
      this.transpositionI = 0
      this.diagramI = 0
      this.readFromCatalog()
    },
    catalogRoot () {
      this.diagramI = 0
      this.readFromCatalog()
    },
    catalogQuality () {
      this.diagramI = 0
      this.readFromCatalog()
    },
    diagramI () {
      this.readFromCatalog()
    },
    isLeftHandedMode () {
      this.readFromCatalog()
    },
    isShapeMode () {
      this.diagramI = 0
      this.readFromCatalog()
    },
    sendNoteNames () {
      this.readFromCatalog()
    },
    transpositionI () {
      this.diagramI = 0
      this.readFromCatalog()
    },
    shape () {
      this.readFromCatalog()
    },
    closedNewsIds (val) {
      window.localStorage.setItem('closedNewsIds', JSON.stringify(val))
    }
  },
  methods: {
    clearCatalog () {
      this.catalogQuality = null
    },

    readFromCatalog () {
      if (!this.shapeDiagrams) return

      let diagram
      let noteNames = ''

      if (this.isShapeMode) {
        diagram = this.shapeDiagrams[this.diagramI]
      } else {
        diagram = this.chordDiagrams[this.diagramI].diagram
        noteNames = this.chordDiagrams[this.diagramI].noteNames
      }

      if (!diagram) return

      let stringNames = this.transpositions[this.transpositionI].name.split(' ').join(',')

      let [position, frets, functions] = diagram.split(':')

      if (this.isLeftHandedMode) {
        frets = frets.split('').reverse().join('')
        functions = functions.split(',').reverse().join()
        stringNames = stringNames.split(',').reverse().join(',')
        noteNames = noteNames.split(',').reverse().join(',')
      }

      if (this.isShapeMode && this.shape === 'closed') {
        frets = frets.split('').map(fret => fret === 'x' ? 'x' : (parseInt(fret) + 1).toString()).join('')
      }

      this.name = this.isShapeMode ? this.catalogQuality : this.catalogRoot + this.catalogQuality
      this.position = parseInt(position)
      this.frets = frets
      this.functions = functions
      this.fingerings = ''
      this.strings = this.instruments[this.catalogInstrument].strings
      this.stringNames = stringNames

      if (this.sendNoteNames) {
        this.noteNames = noteNames
      } else {
        this.noteNames = ''
      }
    },

    goToDiagram (increment) {
      if (!this.catalogQuality) return

      const diagrams = this.isShapeMode ? this.shapeDiagrams : this.chordDiagrams
      let newI = this.diagramI + increment
      if (newI < 0) newI = diagrams.length - 1
      if (newI > diagrams.length - 1) newI = 0
      this.diagramI = newI
    },

    goToRootOrShape (increment) {
      if (this.mode !== 'catalog') return

      if (this.isShapeMode) {
        this.shape = { open: 'closed', closed: 'open' }[this.shape]
      } else {
        const currentI = this.notes.findIndex(note => note.name === this.catalogRoot)
        let newI = currentI + increment
        if (newI < 0) newI = this.notes.length - 1
        if (newI > this.notes.length - 1) newI = 0
        this.catalogRoot = this.notes[newI].name
      }
    },

    goToQuality (increment) {
      if (this.mode !== 'catalog') return
      
      let qualities = []
      for (const group of this.qualityGroups) qualities = qualities.concat(group.qualities)
      const currentI = qualities.findIndex(quality => quality.name === this.catalogQuality)
      let newI = currentI + increment
      if (newI < 0) newI = qualities.length - 1
      if (newI > qualities.length - 1) newI = 0
      this.catalogQuality = qualities[newI].name
    }
  },
  mounted () {
    try {
      const closedNewsIds = JSON.parse(window.localStorage.getItem('closedNewsIds'))
      this.closedNewsIds = Array.isArray(closedNewsIds) ? closedNewsIds : []
    } catch (err) {}

    for (const [keys, handler] of this.mousetrap) Mousetrap.bind(keys, handler)
  },
  beforeDestroy () {
    for (const [keys, handler] of this.mousetrap) Mousetrap.unbind(keys, handler)
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