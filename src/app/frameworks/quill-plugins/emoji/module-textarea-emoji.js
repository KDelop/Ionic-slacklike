// import Quill from 'quill'
// import Fuse from 'fuse.js'
// import emojiList from './emoji-list.js'

// const Delta = Quill.import('delta')
// const Module = Quill.import('core/module')
// const FILE_UPLOAD_TRIGGER_INSIDE = 'inside-upload'
// const FILE_UPLOAD_TRIGGER_INSIDE_THREAD = 'inside-upload-thread'
// const FORMATTING_TRIGGER_INSIDE = 'inside-formatting'
// const SEND_MESSAGE_EVENT = 'send-message-event'

// class TextAreaEmoji extends Module {
//   constructor(quill, options) {
//     super(quill, options)
//     this.quill = quill
//     this.container = document.createElement('div')
//     this.container.classList.add('textarea-emoji-control')
//     this.container.style.position = 'absolute'

//     let classesToAdd = ['btn', 'btn-md', 'emoji-icon']

//     this.formattingBtn = document.createElement('button')
//     this.formattingBtn.classList.add(...classesToAdd, ['icon-bold'])
//     this.container.appendChild(this.formattingBtn)
//     // add childs
//     // this.mentionBtn = document.createElement('button')
//     // this.mentionBtn.classList.add(...classesToAdd, ['icon-at'])
//     // this.container.appendChild(this.mentionBtn)
//     // emoji
//     // this.emojiBtn = document.createElement('button')
//     // this.emojiBtn.classList.add(...classesToAdd, ['icon-smile'])
//     // this.container.appendChild(this.emojiBtn)
//     // file button
//     this.fileBtn = document.createElement('button')
//     this.fileBtn.classList.add('btn', 'btn-md', 'btn-margin')
//     this.fileBtnIcon = document.createElement('ion-icon')
//     this.fileBtnIcon.setAttribute('name', 'document-attach-outline')
//     this.fileBtn.appendChild(this.fileBtnIcon)
//     this.container.appendChild(this.fileBtn)
//     // Send Button
//     this.sendBtn = document.createElement('button')
//     this.sendBtn.classList.add(...classesToAdd, ['send-button'])
//     this.sendBtnIcon = document.createElement('ion-icon')
//     this.sendBtnIcon.setAttribute('name','send')
//     this.sendBtn.appendChild(this.sendBtnIcon)
//     this.container.appendChild(this.sendBtn)
//     // append to container
//     this.quill.container.appendChild(this.container)
//     // add events
//     // this.emojiBtn.addEventListener(
//     //   'click',
//     //   this.checkEmojiBoxExist.bind(this),
//     //   false
//     // )
//     // this.mentionBtn.addEventListener(
//     //   'click',
//     //   this.mentionErrands.bind(this),
//     //   false
//     // )
//     this.fileBtn.addEventListener('click', this.dispatchInfo.bind(this), false)
//     this.sendBtn.addEventListener(
//       'click',
//       this.dispatchSendMessage,
//       false
//     )
//     this.formattingBtn.addEventListener(
//       'click',
//       this.dispatchFormattingInfo,
//       false
//     )
//   }

//   dispatchInfo(quill) {
//     var event // The custom event that will be created
//     const eventType =
//       this.quill.options.placeholder === 'Reply To Thread'
//         ? FILE_UPLOAD_TRIGGER_INSIDE_THREAD
//         : FILE_UPLOAD_TRIGGER_INSIDE
//     if (document.createEvent) {
//       event = document.createEvent('HTMLEvents')
//       event.initEvent(eventType, true, true)
//     } else {
//       event = document.createEventObject()
//       event.eventType = eventType
//     }

//     event.eventName = eventType
//     const chatFooter = document.getElementsByClassName('ql-editor')[0];
//     if (document.createEvent) {
//       chatFooter.dispatchEvent(event)
//     } else {
//       chatFooter.fireEvent('on' + event.eventType, event)
//     }
//   }

//   dispatchFormattingInfo() {
//     var event // The custom event that will be created
//     if (document.createEvent) {
//       event = document.createEvent('HTMLEvents')
//       event.initEvent(FORMATTING_TRIGGER_INSIDE, true, true)
//     } else {
//       event = document.createEventObject()
//       event.eventType = FORMATTING_TRIGGER_INSIDE
//     }

//     event.eventName = FORMATTING_TRIGGER_INSIDE

//     const chatFooter = document.getElementsByClassName('ql-editor')[0];
//     if (document.createEvent) {
//       chatFooter.dispatchEvent(event)
//     } else {
//       chatFooter.fireEvent('on' + event.eventType, event)
//     }
//   }
//   dispatchSendMessage() {
//     var event // The custom event that will be created
//     if (document.createEvent) {
//       event = new KeyboardEvent('keypress',{'key': 13})
//       event.initEvent(SEND_MESSAGE_EVENT, true, true)
//     } else {
//       event = document.createEventObject()
//       event.eventType = SEND_MESSAGE_EVENT
//     }

//     event.eventName = SEND_MESSAGE_EVENT
//     const element = document.getElementsByClassName('ql-editor')[0]
//     if (document.createEvent) {
//       element.dispatchEvent(event)
//     } else {
//       element.fireEvent('on' + event.eventType, event)
//     }
//   }

//   mentionErrands() {
//     if (event) {
//       event.stopImmediatePropagation()
//     }
//     const range = this.quill.getSelection()
//     let cursorPos = range === null ? 0 : range.index
//     this.quill.updateContents(
//       new Delta().retain(cursorPos).delete(0).insert('@')
//     )
//     setTimeout(() => {
//       this.quill.setSelection(cursorPos + 2, Quill.sources.USER)
//       this.quill.focus()
//     }, 10)
//   }

//   checkEmojiBoxExist() {
//     if (event) {
//       event.stopImmediatePropagation()
//     }
//     let elementExists = document.getElementById('textarea-emoji')
//     if (elementExists) {
//       elementExists.remove()
//     } else {
//       let ele_emoji_area = document.createElement('div')
//       ele_emoji_area.id = 'textarea-emoji'
//       this.quill.container.appendChild(ele_emoji_area)
//       let tabToolbar = document.createElement('div')
//       tabToolbar.id = 'tab-toolbar'
//       ele_emoji_area.appendChild(tabToolbar)

//       var emojiType = [
//         { type: 'p', name: 'people', content: '<div class="i-people"></div>' },
//         { type: 'n', name: 'nature', content: '<div class="i-nature"></div>' },
//         { type: 'd', name: 'food', content: '<div class="i-food"></div>' },
//         {
//           type: 's',
//           name: 'symbols',
//           content: '<div class="i-symbols"></div>',
//         },
//         {
//           type: 'a',
//           name: 'activity',
//           content: '<div class="i-activity"></div>',
//         },
//         { type: 't', name: 'travel', content: '<div class="i-travel"></div>' },
//         {
//           type: 'o',
//           name: 'objects',
//           content: '<div class="i-objects"></div>',
//         },
//         { type: 'f', name: 'flags', content: '<div class="i-flags"></div>' },
//       ]

//       let tabElementHolder = document.createElement('ul')
//       tabToolbar.appendChild(tabElementHolder)

//       if (document.getElementById('emoji-close-div') === null) {
//         let closeDiv = document.createElement('div')
//         closeDiv.id = 'emoji-close-div'
//         closeDiv.addEventListener('click', fn_close, false)
//         document.getElementsByTagName('body')[0].appendChild(closeDiv)
//       } else {
//         document.getElementById('emoji-close-div').style.display = 'block'
//       }
//       let panel = document.createElement('div')
//       panel.id = 'tab-panel'
//       ele_emoji_area.appendChild(panel)
//       let innerQuill = this.quill
//       emojiType.map(function (emojiType) {
//         let tabElement = document.createElement('li')
//         tabElement.classList.add('emoji-tab')
//         tabElement.classList.add('filter-' + emojiType.name)
//         let tabValue = emojiType.content
//         tabElement.innerHTML = tabValue
//         tabElement.dataset.filter = emojiType.type
//         tabElementHolder.appendChild(tabElement)
//         let emojiFilter = document.querySelector('.filter-' + emojiType.name)
//         emojiFilter.addEventListener('click', function () {
//           const emojiContainer = document.getElementById('textarea-emoji')
//           const tab = emojiContainer && emojiContainer.querySelector('.active')

//           if (tab) {
//             tab.classList.remove('active')
//           }

//           emojiFilter.classList.toggle('active')

//           while (panel.firstChild) {
//             panel.removeChild(panel.firstChild)
//           }

//           let type = emojiFilter.dataset.filter
//           fn_emojiElementsToPanel(type, panel, innerQuill)
//         })
//       })

//       let windowHeight = window.innerHeight
//       let editorPos = this.quill.container.getBoundingClientRect().top
//       if (editorPos > windowHeight / 2) {
//         ele_emoji_area.style.top = '-267px'
//       }
//       fn_emojiPanelInit(panel, this.quill)
//     }
//   }
// }

// TextAreaEmoji.DEFAULTS = {
//   buttons:
//     '<button id="mention" class="btn btn-md emoji-icon"><span class="icon-at"></span></button><button id="emoji" class="btn btn-md emoji-icon"><span class="icon-smile"></span></button><button class="btn btn-sm btn-outline-primary" id="file"><span class="icon-plus_thick"></span></button>',
// }

// function fn_close() {
//   let ele_emoji_plate = document.getElementById('textarea-emoji')
//   document.getElementById('emoji-close-div').style.display = 'none'
//   if (ele_emoji_plate) {
//     ele_emoji_plate.remove()
//   }
// }

// function fn_updateRange(quill) {
//   let range = quill.getSelection()
//   return range
// }

// function fn_emojiPanelInit(panel, quill) {
//   fn_emojiElementsToPanel('p', panel, quill)
//   document.querySelector('.filter-people').classList.add('active')
// }

// function fn_emojiElementsToPanel(type, panel, quill) {
//   let fuseOptions = {
//     shouldSort: true,
//     matchAllTokens: true,
//     threshold: 0.3,
//     location: 0,
//     distance: 100,
//     maxPatternLength: 32,
//     minMatchCharLength: 3,
//     keys: ['category'],
//   }
//   let fuse = new Fuse(emojiList, fuseOptions)
//   let result = fuse.search(type)
//   result.sort(function (a, b) {
//     return a.emoji_order - b.emoji_order
//   })

//   quill.focus()
//   let range = fn_updateRange(quill)

//   result.map(function (emoji) {
//     emoji = emoji.item
//     let span = document.createElement('span')
//     let t = document.createTextNode(emoji.shortname)
//     span.appendChild(t)
//     span.classList.add('bem')
//     span.classList.add('bem-' + emoji.name)
//     span.classList.add('ap')
//     span.classList.add('ap-' + emoji.name)
//     let output = '' + emoji.code_decimal + ''
//     span.innerHTML = output + ' '
//     panel.appendChild(span)

//     let customButton = document.querySelector('.bem-' + emoji.name)
//     if (customButton) {
//       customButton.addEventListener('click', function () {
//         // quill.insertText(range.index, customButton.innerHTML);
//         // quill.setSelection(range.index + customButton.innerHTML.length, 0);
//         // range.index = range.index + customButton.innerHTML.length;
//         quill.insertEmbed(range.index, 'emoji', emoji, Quill.sources.USER)
//         setTimeout(() => quill.setSelection(range.index + 1), 0)
//         fn_close()
//       })
//     }
//   })
// }

// export default TextAreaEmoji
