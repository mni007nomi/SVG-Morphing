const btnMale = document.getElementById("btn-male")
const btnFemale = document.getElementById("btn-female")

const from = document.getElementById("from")
const to = document.getElementById("to")
const face = document.getElementById("face")
const legs = document.getElementById("legs")
const morph = document.getElementById("morph")

const maleColor = window.getComputedStyle(document.documentElement).getPropertyValue('--male-color')
const femaleColor = window.getComputedStyle(document.documentElement).getPropertyValue('--female-color')

const fromColor = hexToRgb(maleColor)
const toColor   = hexToRgb(femaleColor)

const SAMPLES = 1000
const DURATION = 900
let startTime = null
let isMorphing = false
let direction = 1 // 1 = A→B, -1 = B→A

function samplePath(path, samples) {
    const len = path.getTotalLength()
    const pts = []
    for (let i = 0; i <= samples; i++) {
        const p = path.getPointAtLength((len * i) / samples)
        pts.push([p.x, p.y])
    }
    return pts
}

const fromPts = samplePath(from, SAMPLES)
const toPts   = samplePath(to, SAMPLES)

function hexToRgb(hex) {
    return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(m, r, g, b) => '#' + r + r + g + g + b + b)
              .substring(1).match(/.{2}/g)
              .map(x => parseInt(x, 16))
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

function interpolatePoints(a, b, t) {
    return a.map(([x1, y1], i) => {
        const [x2, y2] = b[i]
        return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]
    })
}

function interpolateColor(c1, c2, t) {
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * t)
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * t)
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * t)
    return `rgb(${r},${g},${b})`
}

function toPathString(pts) {
    return 'M' + pts.map(p => p.join(',')).join(' L') + ' Z'
}

function animate(ts) {
    if (!startTime) startTime = ts
    let t = (ts - startTime) / DURATION
    if (t > 1) t = 1

    let ease = easeInOutQuad(t)

    const progress = direction === 1 ? ease : 1 - ease

    const interpolated = interpolatePoints(fromPts, toPts, progress)
    morph.setAttribute("d", toPathString(interpolated))

    const color = interpolateColor(fromColor, toColor, progress)
    morph.setAttribute("fill", color)
    face.setAttribute("fill", color)
    legs.setAttribute("fill", color)

    if (t < 1) {
        requestAnimationFrame(animate)
    } else {
        isMorphing = false
        btnMale.disabled = false
        btnFemale.disabled = false
    }
}

function callAnimation() {
    if (!isMorphing) {
        isMorphing = true
        btnMale.disabled = true
        btnFemale.disabled = true
        startTime = null
        requestAnimationFrame(animate)
    }
}

btnFemale.addEventListener("click", () => {
    btnFemale.classList.add("selected")
    btnMale.classList.remove("selected")
    direction = 1
    callAnimation()
})

btnMale.addEventListener("click", () => {
    btnMale.classList.add("selected")
    btnFemale.classList.remove("selected")
    direction = -1
    callAnimation()
})