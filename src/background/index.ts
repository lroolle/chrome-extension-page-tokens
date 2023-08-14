console.info('chrome-ext template-react-ts background script')

chrome.contextMenus.create({
  id: 'countTokens',
  title: 'Count tokens',
  contexts: ['selection'],
  onclick: function (info) {
    const text = info.selectionText
    const tokens = text?.split(/\s+/)
    const tokenCount = tokens?.length || 0
    alert(`The selected text contains ${tokenCount} tokens.`)
  },
})

export {}
