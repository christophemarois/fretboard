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

          <div v-if="!closedNewsIds.includes(4)" class="toast" style="margin-top: 1rem">
            <button class="btn btn-clear float-right" @click="closedNewsIds.push(4)"></button>
            <code>2019/08/22</code>
            Added option for displaying chord shapes regardless of root note.
          </div>
          
          <div v-if="!closedNewsIds.includes(3)" class="toast" style="margin-top: 1rem">
            <button class="btn btn-clear float-right" @click="closedNewsIds.push(3)"></button>
            <code>2019/08/20</code>
            Better chord catalog UI, better transposition enharmonics.
          </div>
          
          <div v-if="!closedNewsIds.includes(2)" class="toast" style="margin-top: 1rem">
            <button class="btn btn-clear float-right" @click="closedNewsIds.push(2)"></button>
            <code>2019/08/18</code>
            <a href="https://github.com/christophemarois/fretboard" target="_blank">Open-sourced</a>
            and now available as an offline PWA (can be installed and used offline on Chrome >=73,
            latest iOS Safari, and others). Also, fixed some fonts issues in the diagram.
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

              <div class="form-group form-inline" style="margin-left: 0.5rem">
                <label class="form-switch">
                  <input type="checkbox" v-model="isLeftHandedMode">
                  <i class="form-icon"></i> Left-handed
                </label>
              </div>
              
              <div class="form-group form-inline" style="margin-left: 0.5rem">
                <label class="form-switch">
                  <input type="checkbox" v-model="isShapeMode">
                  <i class="form-icon"></i> Chord Shape
                </label>
              </div>
            </div>

            <div class="divider" />

            <div v-if="isShapeMode" class="form-group form-inline">
              <label class="form-label" for="catalogChord"><b>Shape</b></label>

              <div style="margin: -0.25rem 0 0 -0.25rem">
                <button
                  class="btn"
                  :class="{ 'active': shape === 'closed' }"
                  @click="shape = 'closed'"
                  style="margin: 0.25rem 0 0 0.25rem"
                >Closed</button>
                
                <button
                  class="btn"
                  :class="{ 'active': shape === 'open' }"
                  @click="shape = 'open'"
                  style="margin: 0.25rem 0 0 0.25rem"
                >Open</button>
              </div>
            </div>
            
            <div v-else class="form-group form-inline">
              <label class="form-label" for="catalogChord"><b>Root</b></label>

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
            
            <div class="form-group form-inline">
              <label class="form-label" for="catalogChord">
                <b>Quality</b>
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

          <div v-if="catalogQuality" style="text-align: center; margin: 0.5rem 0;">
            <a :href="currentGithubIssueURL" target="_blank" style="font-size: 0.75rem;">Report a problem with this chord</a>
          </div>

          <div v-if="catalogQuality" class="form-group" style=" text-align: center;">
            <label class="form-label" for="catalogChord"><b>Variants</b></label>

            <div>
              <button
                v-for="(diagrams, i) in isShapeMode ? shapeDiagrams : transposedChord.diagrams"
                :key="'catalog-diagram-' + i"
                class="btn"
                :class="{ 'active': diagramI === i }"
                @click="diagramI = i"
                style="margin: 0.25rem 0 0 0.25rem"
              >{{ i + 1 }}</button>
            </div>
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

import { notes, qualityGroups, instruments } from '~/data/entries.json'
import chords from '~/data/chords2.json'
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
      closedNewsIds: [1, 2, 3, 4],

      catalogInstrument: 'ukulele',
      catalogRoot: 'C',
      catalogQuality: null,
      isShapeMode: false,
      shape: 'closed',
      diagramI: 0,
      isLeftHandedMode: false,
      transpositionI: 0,

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
    shapeDiagrams () {
      const quality = shapes[this.catalogInstrument].find(group => group.quality === this.catalogQuality)
      if (!quality) return null

      return quality.diagrams
    },  

    transpositions () {
      return this.instruments[this.catalogInstrument].transpositions
        .map(([name, alias], i) => ({ i, name, alias }))
    },

    transposedChord () {
      const quality = chords[this.catalogInstrument].find(group => group.quality === this.catalogQuality)
      if (!quality) return null

      const rootIndex = notes.findIndex(note => note.name === this.catalogRoot)
      const transposedRoot = notes[mod(rootIndex - this.transpositionI, 12)].name

      return quality.chords.find(chord => chord.root === transposedRoot)
    },

    currentGithubIssueURL () {
      const diagram = this.isShapeMode
        ? this.shapeDiagrams[this.diagramI]
        : this.transposedChord.diagrams[this.diagramI]
      
      if (!diagram) return '#'

      const url = new URL(`https://github.com/christophemarois/fretboard/issues/new`)
      url.searchParams.set('title', `Problem with diagram ${diagram}`)
      url.searchParams.set('labels', ['invalid'])
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
      if (this.isShapeMode) {
        if (!this.shapeDiagrams) return

        const diagram = this.shapeDiagrams[this.diagramI]
        if (!diagram) return

        let stringNames = this.transpositions[this.transpositionI].name.split(' ').join(',')
  
        let [position, frets, functions] = diagram.split(':')
  
        if (this.isLeftHandedMode) {
          frets = frets.split('').reverse().join('')
          functions = functions.split(',').reverse().join()
          stringNames = stringNames.split(',').reverse().join(',')
        }

        if (this.shape === 'closed') {
          frets = frets.split('').map(fret => fret === 'x' ? 'x' : (parseInt(fret) + 1).toString()).join('')
        }

        this.name = this.catalogQuality
        this.position = parseInt(position)
        this.frets = frets
        this.functions = functions
        this.fingerings = ''
        this.strings = this.instruments[this.catalogInstrument].strings
        this.stringNames = stringNames
      } else {
        if (!this.transposedChord) return
  
        const diagram = this.transposedChord.diagrams[this.diagramI]
        if (!diagram) return
  
        let stringNames = this.transpositions[this.transpositionI].name.split(' ').join(',')
  
        let [position, frets, functions] = diagram.split(':')
  
        if (this.isLeftHandedMode) {
          frets = frets.split('').reverse().join('')
          functions = functions.split(',').reverse().join()
          stringNames = stringNames.split(',').reverse().join(',')
        }
  
        this.name = `${this.catalogRoot}${this.catalogQuality}`
        this.position = parseInt(position)
        this.frets = frets
        this.functions = functions
        this.fingerings = ''
        this.strings = this.instruments[this.catalogInstrument].strings
        this.stringNames = stringNames
      }
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