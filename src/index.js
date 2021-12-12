import './styles/app.css'

let apiBase = 'https://api.jaxbot.co.uk:444/'

let showClips = localStorage.getItem('showClips') || true
let showLines = localStorage.getItem('showLines') || true

showClips = !JSON.parse(showClips)
showLines = !JSON.parse(showLines)

let urlToClips = apiBase + 'assets?file=scprp/clips/'

let data = {}

let audioCache = []

let queue = []

const vocalsDiv = document.getElementById('vocals')
const linesDiv = document.getElementById('voicelines')

const voiceLineFilter = document.getElementById('voiceLineClipFilter')

const selectedClipsDiv = document.getElementById('selectedClips')
const clipSelectionDiv = document.getElementById('ClipSelection')

const hideClipsBtn = document.getElementById('hideClips')
const hideLinesBtn = document.getElementById('hideLines')
const previewNewVoiceLineBtn = document.getElementById('voiceLineClipsPreview')
const voiceLineSubmitBtn = document.getElementById('voiceLineSubmit')

function preloadAudio (url) {
  audioCache[url] = new Audio()
  audioCache[url].src = url
}

async function postLine (data) {
  return fetch(apiBase + 'scprp/lines', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    body: JSON.stringify(data)
  })
}

async function getData () {
  let res = fetch(apiBase + 'scprp')
  let resData = await (await res).json()
  return resData.data
}

async function previewLine (clips) {
  await Promise.all(clips.map(async clip => {
    queue.push(urlToClips + clip)
  }))

  previewVocal({ useQueue: true })
}

function previewVocal ({ vocal, useQueue }) {
  if (useQueue) {
    if (queue[0]) {
      audioCache[queue[0]].play()
      audioCache[queue[0]].onended = () => {
        queue.splice(0, 1)
        previewVocal({ useQueue: true })
      }
    }
  } else {
    let cachedAudio = audioCache[urlToClips + vocal]
    if (!cachedAudio) {
      audioCache[urlToClips + vocal] = new Audio()
      audioCache[urlToClips + vocal].src = urlToClips + vocal

      cachedAudio = audioCache[urlToClips + vocal]
    }

    cachedAudio.play()
  }
}

getData().then(res => {
  data = res

  console.log(data)

  data.vocals.used.forEach(vocal => {
    preloadAudio(urlToClips + vocal)
  })

  data.vocals.used.forEach(vocal => {
    let newVocal = document.createElement('div')
    newVocal.innerText = vocal
    newVocal.classList.add('pill')

    let previewBtn = document.createElement('button')
    previewBtn.type = 'button'
    previewBtn.classList.add('dense')
    previewBtn.innerText = "▶"
    previewBtn.addEventListener('click', () => {
      previewVocal({ vocal })
    })
    newVocal.append(previewBtn)

    vocalsDiv.append(newVocal)
  })

  data.lines.forEach(line => {
    let newLine = document.createElement('div')
    newLine.classList.add('card', 'dense')

    let title = document.createElement('h5')
    title.innerText = line.name
    newLine.append(title)

    if (line.description) {
      let description = document.createElement('em')
      description.innerText = line.description
      newLine.append(description)
    }

    let clips = document.createElement('div')
    newLine.append(clips)

    line.clips.forEach(clip => {
      let clipDiv = document.createElement('div')
      clipDiv.innerText = clip
      clipDiv.classList.add('pill')
      clips.append(clipDiv)
    })

    let previewBtn = document.createElement('button')
    previewBtn.type = 'button'
    previewBtn.innerText = "▶ preview"
    previewBtn.addEventListener('click', () => {
      previewLine(line.clips)
    })
    newLine.append(previewBtn)


    linesDiv.append(newLine)
  })
})

hideClipsBtn.addEventListener('click', hideClips)

function hideClips () {
  if (showClips) {
    vocalsDiv.classList.add('hide')
    hideClipsBtn.innerText = "Show Clips"
  }
  else {
    vocalsDiv.classList.remove('hide')
    hideClipsBtn.innerText = "Hide Clips"
  }

  showClips = !showClips
  localStorage.setItem('showClips', showClips)
}

hideLinesBtn.addEventListener('click', hideLines)

function hideLines () {
  if (showLines) {
    linesDiv.classList.add('hide')
    hideLinesBtn.innerText = "Show Lines"
  }
  else {
    linesDiv.classList.remove('hide')
    hideLinesBtn.innerText = "Hide Lines"
  }

  showLines = !showLines
  localStorage.setItem('showLines', showLines)
}

hideClips()
hideLines()

// Code for creating a new line

let newLineClips = []

function UpdateSelectedClipsDiv () {
  voiceLineFilter.value = null

  while (selectedClipsDiv.firstChild) {
    selectedClipsDiv.removeChild(selectedClipsDiv.firstChild)
  }

  while (clipSelectionDiv.firstChild) {
    clipSelectionDiv.removeChild(clipSelectionDiv.firstChild)
  }

  if (newLineClips.length > 0) {
    previewNewVoiceLineBtn.disabled = false
  } else {
    previewNewVoiceLineBtn.disabled = true
  }

  newLineClips.forEach(clip => {
    let option = document.createElement('div')
    option.innerText = clip
    option.classList.add('pill')

    let previewBtn = document.createElement('button')
    previewBtn.type = 'button'
    previewBtn.classList.add('dense')
    previewBtn.innerText = "▶"
    previewBtn.addEventListener('click', () => {
      previewVocal({ vocal: clip })
    })
    option.append(previewBtn)

    let addBtn = document.createElement('button')
    addBtn.type = 'button'
    addBtn.classList.add('dense')
    addBtn.innerText = "-"
    addBtn.addEventListener('click', () => {
      const index = newLineClips.findIndex(val => val === clip)
      if (index > -1) newLineClips.splice(index, 1) 

      UpdateSelectedClipsDiv()
    })
    option.append(addBtn)

    selectedClipsDiv.append(option)
  })
}

voiceLineFilter.addEventListener('input', () => {
  let filterValue = voiceLineFilter.value
  if (filterValue.length < 1) return

  while (clipSelectionDiv.firstChild) {
    clipSelectionDiv.removeChild(clipSelectionDiv.firstChild)
  }

  const viableClips = data.vocals.all.filter(clip => clip.toLowerCase().includes(filterValue.toLowerCase()))

  viableClips.forEach(clip => {
    let option = document.createElement('div')
    option.innerText = clip
    option.classList.add('pill')

    let previewBtn = document.createElement('button')
    previewBtn.type = 'button'
    previewBtn.classList.add('dense')
    previewBtn.innerText = "▶"
    previewBtn.addEventListener('click', () => {
      previewVocal({ vocal: clip })
    })
    option.append(previewBtn)

    let addBtn = document.createElement('button')
    addBtn.type = 'button'
    addBtn.classList.add('dense')
    addBtn.innerText = "+"
    addBtn.addEventListener('click', () => {
      newLineClips.push(clip)

      UpdateSelectedClipsDiv()
    })
    option.append(addBtn)

    clipSelectionDiv.append(option)
  })
})

voiceLineSubmitBtn.addEventListener('click', () => {
  let line = {}

  line.name = document.getElementById('voiceLineName').value
  line.description = document.getElementById('voiceLineDescription').value
  line.clips = newLineClips

  postLine(line).then(async (res) => {
    newLineClips = []
    document.getElementById('voiceLineName').value = ""
    document.getElementById('voiceLineDescription').value = ""

    UpdateSelectedClipsDiv()

    let resData = await (await res).json()
    data.lines = resData.data.lines
  })
})


previewNewVoiceLineBtn.addEventListener('click', () => previewLine(newLineClips))