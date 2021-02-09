const getElementById = (id) => document.getElementById(id)

const statusImage = getElementById('statusImage')
const currentDomainHeader = getElementById('currentDomainHeader')
const footerTrackerOff = getElementById('footerTrackerOff')
const trackerOff = getElementById('trackerOff')
const isOriBlock = getElementById('isOriBlock')
const isNotOriBlock = getElementById('isNotOriBlock')
const isForbidden = getElementById('isForbidden')
const isNotForbidden = getElementById('isNotForbidden')
const footerTrackerOn = getElementById('footerTrackerOn')
const aboutOriButton = getElementById('aboutOriButton')
const textAboutOri = getElementById('textAboutOri')
const closeTextAboutOri = getElementById('closeTextAboutOri')
const btnAboutForbidden = getElementById('btnAboutForbidden')
const textAboutForbidden = getElementById('textAboutForbidden')
const closeTextAboutForbidden = getElementById('closeTextAboutForbidden')
const btnAboutNotForbidden = getElementById('btnAboutNotForbidden')
const textAboutNotForbidden = getElementById('textAboutNotForbidden')
const closeTextAboutNotForbidden = getElementById('closeTextAboutNotForbidden')
const btnAboutNotOri = getElementById('btnAboutNotOri')
const textAboutNotOri = getElementById('textAboutNotOri')
const closeTextAboutNotOri = getElementById('closeTextAboutNotOri')
const oriSiteInfo = getElementById('oriSiteInfo')
const currentDomainBlocks = document.querySelectorAll('.current-domain')
const popupShowTimeout = 60

browser.runtime.getBackgroundPage(async ({ censortracker: bgModules }) => {
  document.addEventListener('click', async (event) => {
    if (event.target.matches('#enableExtension')) {
      await bgModules.settings.enableExtension()
      window.location.reload()
    }

    if (event.target.matches('#disableExtension')) {
      await bgModules.settings.disableExtension()
      window.location.reload()
    }

    if (event.target.matches('#openOptionsPage')) {
      await browser.runtime.openOptionsPage()
    }
  })

  const { enableExtension } = await bgModules.storage.get({ enableExtension: true })

  const [{ url: currentUrl }] = await browser.tabs.query({
    active: true, lastFocusedWindow: true,
  })

  const currentHostname = bgModules.extractHostnameFromUrl(
    getAppropriateUrl(currentUrl),
  )

  interpolateCurrentDomain(currentHostname)

  if (enableExtension) {
    changeStatusImage('normal')
    renderCurrentDomain(currentHostname)
    footerTrackerOn.removeAttribute('hidden')

    const { domainFound } = await bgModules.registry.domainsContains(currentHostname)

    if (domainFound) {
      changeStatusImage('blocked')
      isForbidden.removeAttribute('hidden')
      isNotForbidden.remove()
    } else {
      isNotForbidden.removeAttribute('hidden')
      isForbidden.remove()
      changeStatusImage('normal')
    }

    const { url: distributorUrl, cooperationRefused } =
      await bgModules.registry.distributorsContains(currentHostname)

    if (distributorUrl) {
      currentDomainHeader.classList.add('title-ori')
      isOriBlock.removeAttribute('hidden')
      isNotOriBlock.remove()

      if (cooperationRefused) {
        showCooperationRefusedMessage()
      } else {
        changeStatusImage('ori')
        console.warn('Cooperation accepted!')
      }
    } else {
      isNotOriBlock.removeAttribute('hidden')
      isOriBlock.remove()
      console.log('Match not found at all')
    }

    if (domainFound && distributorUrl) {
      if (cooperationRefused === false) {
        changeStatusImage('ori_blocked')
      }
    }
  } else {
    hideControlElements()
  }

  const show = () => {
    document.documentElement.style.visibility = 'initial'
  }

  setTimeout(show, popupShowTimeout)
})

const changeStatusImage = (imageName) => {
  const imageSrc = browser.runtime.getURL(`images/icons/512x512/${imageName}.png`)

  statusImage.setAttribute('src', imageSrc)
}

const getAppropriateUrl = (currentUrl) => {
  const popupUrl = browser.runtime.getURL('popup.html')

  if (currentUrl.startsWith(popupUrl)) {
    const currentURLParams = currentUrl.split('?')[1]
    const searchParams = new URLSearchParams(currentURLParams)
    const encodedUrl = searchParams.get('loadFor')

    return window.atob(encodedUrl)
  }
  return currentUrl
}

const interpolateCurrentDomain = (domain) => {
  currentDomainBlocks.forEach((element) => {
    element.innerText = domain
  })
}

const renderCurrentDomain = ({ length }) => {
  if (length >= 22 && length < 25) {
    currentDomainHeader.style.fontSize = '17px'
  } else if (length >= 25) {
    currentDomainHeader.style.fontSize = '15px'
  }
  currentDomainHeader.classList.add('title-normal')
  currentDomainHeader.removeAttribute('hidden')
}

const showCooperationRefusedMessage = () => {
  oriSiteInfo.innerText = 'Сервис заявил, что они не передают трафик российским ' +
    'государственным органам в автоматическом режиме.'
  textAboutOri.classList.remove('text-warning')
  textAboutOri.classList.add('text-normal')
  currentDomainHeader.classList.remove('title-ori')
  currentDomainHeader.classList.add('title-normal')
}

const hideControlElements = () => {
  changeStatusImage('disabled')
  trackerOff.hidden = false
  footerTrackerOff.hidden = false
  isOriBlock.hidden = true
  isForbidden.hidden = true
  isNotOriBlock.hidden = true
  isNotForbidden.hidden = true
}

aboutOriButton.addEventListener('click', () => {
  textAboutOri.style.display = 'block'
  aboutOriButton.style.display = 'none'
  hideForbiddenDetails()
})

btnAboutNotOri.addEventListener('click', () => {
  textAboutNotOri.style.display = 'block'
  btnAboutNotOri.style.display = 'none'
  hideForbiddenDetails()
})

closeTextAboutNotOri.addEventListener('click', () => {
  textAboutNotOri.style.display = 'none'
  btnAboutNotOri.style.display = 'flex'
},
)

closeTextAboutOri.addEventListener('click', () => {
  textAboutOri.style.display = 'none'
  aboutOriButton.style.display = 'flex'
},
)

btnAboutForbidden.addEventListener('click', () => {
  textAboutForbidden.style.display = 'block'
  btnAboutForbidden.style.display = 'none'
  hideOriDetails()
},
)

btnAboutNotForbidden.addEventListener('click', () => {
  textAboutNotForbidden.style.display = 'block'
  btnAboutNotForbidden.style.display = 'none'
  hideOriDetails()
})

closeTextAboutForbidden.addEventListener('click', () => {
  textAboutForbidden.style.display = 'none'
  btnAboutForbidden.style.display = 'flex'
},
)

closeTextAboutNotForbidden.addEventListener('click', () => {
  textAboutNotForbidden.style.display = 'none'
  btnAboutNotForbidden.style.display = 'flex'
})

const hideOriDetails = () => {
  textAboutOri.style.display = 'none'
  aboutOriButton.style.display = 'flex'
  textAboutNotOri.style.display = 'none'
  btnAboutNotOri.style.display = 'flex'
}

const hideForbiddenDetails = () => {
  textAboutForbidden.style.display = 'none'
  btnAboutForbidden.style.display = 'flex'
  textAboutNotForbidden.style.display = 'none'
  btnAboutNotForbidden.style.display = 'flex'
}