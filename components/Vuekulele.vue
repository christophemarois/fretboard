<template>
  <div class="vuekulele">
    <img
      v-if="!svgMode && pngDataUrl"
      ref="img"
      :src="pngDataUrl"
      @click="$emit('click', $event)"
    /><img
      v-if="svgMode && svgDataUrl"
      ref="img"
      :src="svgDataUrl"
      @click="$emit('click', $event)"
    /><svg
      name="vuekulele"
      ref="svg"
      :width="svgWidth"
      :height="svgHeight"
      :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
      style="font-size: 11px;"
      :style="{
        'display': isSVGDev ? 'block' : 'none',
        'font-family': fontFamily,
      }"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      <text
        class="chord-name"
        :x="svgWidth / 2"
        :y="fontSize"
        text-anchor="middle"
        :style="`font-size: ${fontSize}px; font-weight: bold`"
        :font-family="fontFamily"
        v-html="formatChord(chord || '')"
      ></text>

      <g
        class="chord"
        :transform="svgTransform"
      >
        <text
          v-show="position"
          class="position"
          :x="-1 * caseSize * elScale * 1.1"
          :y="caseSize / 2 + (fontSize * fontScale) * 0.5"
          :style="`font-size: ${fontSize * fontScale}px;`"
          text-anchor="middle"
          :font-family="fontFamily"
        >
          {{ position }}
        </text>

        <rect
          class="nut"
          v-show="position === 0"
          :height="strokeWidth * 3"
          :width="fretsWidth"
          fill="black"
        />

        <g class="strings" :transform="`translate(0,${strokeWidth})`">
          <rect
            v-for="(_, i) in Array(strings)"
            :key="'strings' + i"
            :height="caseSize * fretsCount"
            :x="i * caseSize"
            :width="strokeWidth"
            fill="black"
          />
        </g>

        <g class="frets" :transform="`translate(0,${strokeWidth})`">
          <rect
            v-for="(_, i) in Array(fretsCount + 1)"
            :key="'frets' + i"
            :width="fretsWidth"
            :y="i * caseSize"
            :height="strokeWidth"
            fill="black"
          />
        </g>

        <g class="notes">
          <template v-for="(fret, i) in _frets">
            <g
              class="note"
              :key="'note' + fret + i"
              :transform="generateNoteTransform(i, fret, caseSize * elScale)"
              :style="fret === 0 ? 'fill: none; stroke-width: 1; stroke: black;' : ''"
            >
              <text
                v-if="fret === 'x'"
                :style="`font-size: ${fontSize}px;`"
                :transform="`translate(${-1 * fontSize * 0.3}, ${fontSize * 0.3})`"
                :font-family="fontFamily"
              >×</text>

              <rect
                v-else-if="(root === i + 1) || (!root && parseInt(_functions[i]) === 1)"
                :width="caseSize * elScale * (fret === 0 ? 0.6 : 1)"
                :height="caseSize * elScale * (fret === 0 ? 0.6 : 1)"
                :transform="`translate(
                  ${-1 * caseSize * elScale / 2 * (fret === 0 ? 0.6 : 1)},
                  ${-1 * caseSize * elScale / 2 * 1.1 * (fret === 0 ? 0.6 : 1)})
                `"
              ></rect>

              <circle
                v-else
                :r="caseSize * elScale / 2 * (fret === 0 ? 0.7 : 1)"
              ></circle>

              <text
                v-if="fret > 0"
                fill="white"
                class="fingering"
                :y="{ small: 3, medium: 4, large: 6, giant: 7 }[size]"
                text-anchor="middle"
                :style="`font-size: ${fontSize * fontScale}px; font-weight: bold`"
                :font-family="fontFamily"
              >{{ _fingerings[i] }}</text>
            </g>
          </template>
        </g>

        <g
          class="stringNames"
          :transform="`translate(1,${fretsCount * caseSize + fontSize * (this.size === 'small' ? 1.1 : 0.9)})`"
          :style="`font-size: ${fontSize * (this.size === 'small' ? 0.75 : 0.5)}px; font-weight: bold;`"
        >
          <text
            v-for="(name, i) in _stringNames"
            :key="'stringname' + i"
            :x="i * caseSize"
            text-anchor="middle"
            v-text="name"
            :font-family="fontFamily"
          ></text>
        </g>

        <g
          class="subText"
          :transform="`translate(1,${fretsCount * caseSize + fontSize * (_stringNames.length > 0 ? 2 : 1.5)})`"
          :style="`font-size: ${fontSize}px; font-weight: 600`"
        >
          <text
            v-for="(_, i) in Array(strings)"
            :key="'text' + i"
            :x="i * caseSize"
            text-anchor="middle"
            v-html="formatInterval(_functions[i] || '')"
            :font-family="fontFamily"
          ></text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
  const alterations = {
    '#': '♯',
    '##': '♯♯',
    'x': '♯♯',
    'b': '♭',
    'bb': '♭♭',
  }

  export default {
    name: 'vuekulele',

    props: {
      svgMode: {
        type: Boolean,
        default: true
      },

      chord: {
        type: String,
        default: ''
      },

      strings: {
        type: Number,
        default: 4,
        validator (val) {
          return Number.isInteger(val) && val > 0
        }
      },

      position: {
        type: Number,
        default: 0,
        validator (val) {
          return Number.isInteger(val) && val >= 0
        }
      },

      frets: {
        type: String,
        required: true
      },

      functions: {
        type: String
      },

      fingerings: {
        type: String
      },

      root: {
        type: Number,
        validator (val) {
          return Number.isInteger(val) && val >= 1
        }
      },

      minimumFrets: {
        type: Number,
        default: 4,
        validator (val) {
          return Number.isInteger(val) && val >= 1
        }
      },

      size: {
        type: String,
        default: 'medium',
        validator (val) {
          return ['small', 'medium', 'large', 'giant'].includes(val)
        }
      },

      stringNames: {
        type: String,
        default: '',
        validator (val) {
          return /^[A-Zb#,]*$/.test(val)
        }
      },

      fontFamily: {
        type: String,
        default: `-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`,
      },

      isSVGDev: {
        type: Boolean,
        default: false,
      }
    },

    watch: {
      mergedWatcher () {
        this.$nextTick(function () {
          this.refresh()
        })
      }
    },

    data () {
      return {
        strokeWidth: 2,
        elScale: 0.5,
        fontScale: 0.75,
        pngDataUrl: null,
        svgDataUrl: null,
      }
    },

    computed: {
      caseSize () {
        return { small: 20, medium: 30, large: 40, giant: 50 }[this.size]
      },

      fontSize () {
        return { small: 10, medium: 16, large: 21, giant: 26 }[this.size]
      },

      mergedWatcher () {
        return this.size, this.chord, this.strings, this.position, this.frets,
          this.functions, this.fingerings, this.root, this.minimumFrets, this.stringNames, Date.now()
      },

      svgWidth () {
        return this.fretsWidth + this.caseSize * 2
      },

      svgHeight () {
        return (
          (this.caseSize * this.fretsCount) +
          (this.fontSize * 3) +
          (this.strokeWidth * 2) +
          (this.fontSize * 1.5) +
          (this._stringNames.length > 0 ? this.fontSize * 0.5 : 0)
        )
      },

      fretsWidth () {
        return (this.strings - 1) * this.caseSize + 2
      },

      svgTransform () {
        const x = (this.svgWidth - ((this.strings - 1) * this.caseSize + this.strokeWidth)) / 2
        const y = this.fontSize * 3

        return `translate(${x},${y})`
      },

      _frets () {
        return this.frets.split('').map(el => el === 'x' ? el : parseInt(el))
      },

      _functions () {
        return (this.functions || '').split(',')
      },

      _fingerings () {
        return (this.fingerings || '').split('')
      },

      _stringNames () {
        if (this.stringNames.trim() === '') return []
        
        return (this.stringNames || '').split(',').map(name => {
          return name.replace(/([A-G])(#|b)/g, (match, root, alteration) => `
            ${root}${alterations[alteration]}
          `)
        })
      },

      fretsCount () {
        const numberedFrets = this._frets.filter(fret => typeof fret === 'number')
        return Math.max(this.minimumFrets, [...numberedFrets].sort().reverse()[0])
      }
    },

    methods: {
      generateNoteTransform (string, fret, height) {
        if (fret === 'x') fret = 0

        const x = this.caseSize * string + this.strokeWidth / 2

        const y = (
          (this.caseSize * (fret - 1)) +
          (height / 2) +
          (this.strokeWidth * 2) +
          (this.caseSize - height) / 2
        )

        return `translate(${x},${y})`
      },

      formatChord (str) {
        str = str.replace(/([A-G])(#|b)/g, (match, root, alteration) => `
          ${root}${alterations[alteration]}
        `)

        return this.formatInterval(str)
      },

      formatInterval (str) {
        return str.replace(/(#|x|bb|b)([0-9]+)/g, (match, alteration, interval) => `
          <tspan letter-spacing="${-1 * this.fontSize * 0.5}px" dx="${-1 * this.fontSize * 0.3}">
            ${alterations[alteration]}
          </tspan>
          <tspan dx="${this.fontSize * 0.3 * 2}">
            ${interval}
          </tspan>
        `)
      },

      refresh () {
        const $svg = this.$refs.svg

        const stringified = new XMLSerializer().serializeToString($svg)
        const blobUrl = URL.createObjectURL(new Blob([stringified], { type: 'image/svg+xml;charset=utf-8'}))

        if (!window.VUEKULELE_CANVAS) {
          window.VUEKULELE_CANVAS = document.createElement('canvas')
        }

        const $canvas = window.VUEKULELE_CANVAS

        $canvas.width = this.svgWidth
        $canvas.height = this.svgHeight

        const ctx = $canvas.getContext('2d')

        const img = new Image()

        img.onload = () => {
          ctx.drawImage(img, 0, 0)
          this.pngDataUrl = $canvas.toDataURL('image/png')
          URL.revokeObjectURL(blobUrl)
        }

        img.src = blobUrl

        this.svgDataUrl = 'data:image/svg+xml;base64,' + window.btoa(window.unescape(
          window.encodeURIComponent($svg.outerHTML)
        ))
      },

      download () {
        const prefix = new Date().toJSON().split('.')[0].replace('T', ' ').replace(/[-:]/g, '').slice(2)

        const a = window.document.createElement('a')
        a.href = this.svgMode ? this.svgDataUrl : this.pngDataUrl
        a.download = `${prefix} ${this.chord}.${this.svgMode ? 'svg' : 'png'}`
        window.document.body.appendChild(a)
        a.click()
        a.remove()
      }
    },

    mounted () {
      this.refresh()
    }
  }
</script>

<style>
.vuekulele {
  display: inline-block;
  font-size: 0;
}
svg {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
}
</style>
