// ==UserScript==
// @name         Cloudflare Email Free
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Make possible to use cloudflare workers to send emails from gmail interface, adds a button to the gmail compose interface
// @author       Fptbb/HasteD
// @match        *mail.google.com/*
// @icon         https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico
// @grant        GM_xmlhttpRequest
// ==/UserScript==

const Api = 'Api Defined in Cloudflare Workers'
const Authorization = 'Random Strong Authorization Key'

function GM_fetch(url, opt) {
  function blobTo(to, blob) {
    if (to == "arrayBuffer" && blob.arrayBuffer) return blob.arrayBuffer()
    return new Promise((resolve, reject) => {
      var fileReader = new FileReader()
      fileReader.onload = function (event) { if (to == "base64") resolve(event.target.result); else resolve(event.target.result) }
      if (to == "arrayBuffer") fileReader.readAsArrayBuffer(blob)
      else if (to == "base64") fileReader.readAsDataURL(blob) // "data:*/*;base64,......"
      else if (to == "text") fileReader.readAsText(blob, "utf-8")
      else reject("unknown to")
    })
  }
  return new Promise((resolve, reject) => {
    // https://www.tampermonkey.net/documentation.php?ext=dhdg#GM_xmlhttpRequest
    opt = opt || {}
    opt.url = url
    opt.data = opt.body
    opt.responseType = "blob"
    opt.onload = (resp) => {
      var blob = resp.response
      resp.blob = () => Promise.resolve(blob)
      resp.arrayBuffer = () => blobTo("arrayBuffer", blob)
      resp.text = () => blobTo("text", blob)
      resp.json = async () => JSON.parse(await blobTo("text", blob))
      resolve(resp)
    }
    opt.ontimeout = () => reject("fetch timeout")
    opt.onerror = (err) => reject(err)
    opt.onabort = () => reject("fetch abort")
    GM_xmlhttpRequest(opt)
  })
}

const hookButton = (button) => {
  if (button.getAttribute('__hooked__')) return
  button.setAttribute('__hooked__', true)

  const form =
    button.parentElement?.parentElement?.parentElement?.querySelector('form')

  if (!form) return alert('No form found')

  const newNode = button.cloneNode(true)
  newNode.setAttribute('selector', 'Webhook')

  newNode.setAttribute('id', '')
  newNode.style = 'user-select: none; cursor: pointer;'

  newNode.addEventListener('mouseover', () => {
    newNode.style.backgroundColor = '#f0f0f0'
  })

  newNode.addEventListener('mouseout', () => {
    newNode.style.backgroundColor = '#ffffff'
  })

  newNode.addEventListener('click', () => {
    const subjectBox = form.querySelector('input[name="subjectbox"]')
    const textArea = form.parentElement?.querySelector('div[role="textbox"]')

    const emailList = [
      ...new Set(
        [...form.querySelectorAll('input[value]')].map((e) => {
          console.log(e)
          if (e.getAttribute('name') === 'to' || e.getAttribute('name') === 'cc' || e.getAttribute('name') === 'bcc') {
            if (/(.*) \<([\w\.]+@[\w-]+\.+[\w-]{2,4})\>/g.test(e.getAttribute('value'))) {
              let regex = /(.*) \<([\w\.]+@[\w-]+\.+[\w-]{2,4})\>/g.exec(e.getAttribute('value'))
              return {
                email: regex[2],
                type: e.getAttribute('name'),
                name: regex[1]
              }
            } else {
              return {
                email: e.getAttribute('value'),
                type: 'normal'
              }
            }
          }
        })
      ),
    ]

    if (
      !subjectBox ||
      subjectBox.value === '' ||
      emailList.length <= 0 ||
      !textArea ||
      textArea.innerHTML === ''
    ) return alert('Invalid form')

    const deleteList = form.parentElement
      ?.querySelector('[command="Files"]')
      ?.closest('tr').lastElementChild

    const deleteButton =
      deleteList &&
      [...deleteList.querySelectorAll('[tabindex="1"][role="button"]')].pop()

    if (!deleteButton) return alert('No delete button found')
    var data = JSON.stringify({
      email: emailList.filter((el => el != undefined),
      subject: subjectBox.value,
    })
    GM_fetch(Api, {
      method: 'POST',
      body: textArea.innerHTML,
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'data': data,
        'Authorization': Authorization,
      }
    }).then(resp => resp.text()).then(resp => {
      deleteButton.click()
      alert('Email sent!')
    }).catch((e) => {
      console.log(e)
      alert(`Failed to send email: ${e.message}`)
    })
  })

  newNode.querySelector('img').parentElement.innerHTML = 'Webhook Send'

  button.parentElement.appendChild(newNode)
}

new MutationObserver((mutations) => {
  mutations.forEach(({ target }) => {
    const tweet = target.closest('[selector="scheduledSend"]')
    tweet && hookButton(tweet)
  })
}).observe(document.body, { childList: true, subtree: true })

document.querySelectorAll('[selector="scheduledSend"]').forEach(hookButton)