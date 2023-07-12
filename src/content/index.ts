console.info('[ext]gpt-page-token: content script loaded')
import { encode } from 'gpt-tokenizer'
import { Readability } from '@mozilla/readability'

// Function to create the token counter div
function createTokenCounterDiv(articleTokens: number[], pageTokens: number[]) {
  const div = document.createElement('div')
  let tokens = articleTokens.length > 0 ? articleTokens.length : pageTokens.length
  div.textContent = `${tokens}`
  div.title = `Article tokens: ${articleTokens.length}, Webpage tokens: ${pageTokens.length}`
  div.id = 'token-counter' // Add an id for CSS targeting
  return div
}

// Function to create the article content modal
function createArticleContentModal(articleContent: string) {
  // Create the modal structure
  const modal = document.createElement('div')
  modal.id = 'article-content-modal'
  modal.style.display = 'none' // Initially hide the modal
  modal.style.position = 'fixed'
  modal.style.zIndex = '10001'
  modal.style.left = '0'
  modal.style.top = '0'
  modal.style.width = '100%'
  modal.style.height = '100%'
  modal.style.overflow = 'auto'
  modal.style.backgroundColor = 'rgba(0,0,0,0.4)' // Semi-transparent black background

  const modalContent = document.createElement('div')
  modalContent.style.backgroundColor = '#fefefe'
  modalContent.style.margin = '15% auto'
  modalContent.style.padding = '20px'
  modalContent.style.border = '1px solid #888'
  modalContent.style.width = '60%' // Limit width
  modalContent.style.maxHeight = '70%' // Limit height
  modalContent.style.overflowY = 'auto' // Add scrollbar if content is too long
  modalContent.style.fontFamily = 'Courier, monospace' // Set font to Courier

  // Create the close button
  const closeButton = document.createElement('button')
  closeButton.textContent = 'X'
  closeButton.style.position = 'absolute'
  closeButton.style.right = '20px'
  closeButton.style.top = '10px'
  closeButton.style.fontSize = '18px'
  closeButton.style.border = 'none'
  closeButton.style.background = 'none'
  closeButton.style.cursor = 'pointer'
  closeButton.onclick = () => {
    modal.style.display = 'none' // Hide the modal when the close button is clicked
  }

  // Insert the close button and article content into the modal
  modalContent.appendChild(closeButton)
  modalContent.innerHTML += articleContent
  modal.appendChild(modalContent)

  return modal
}

// Function to style the token counter div
function styleTokenCounterDiv(div: HTMLElement) {
  div.style.position = 'fixed'
  div.style.right = '0px'
  div.style.bottom = '42px'
  div.style.padding = '20px'
  div.style.backgroundColor = 'rgba(249, 249, 249, 0.5)' // More transparent background
  div.style.border = '0' // Remove border
  div.style.zIndex = '10000'
  div.style.borderRadius = '10px'
  div.style.fontFamily = 'Courier, monospace' // Set font to Courier
  div.style.fontSize = '24px'
  div.style.color = '#000000' // Initial font color
  div.style.transition = 'background-color 0.2s ease-in-out' // Add transition
}

// Function to handle mouseover event
function handleMouseOver(event: Event) {
  const div = event.target as HTMLElement
  div.style.backgroundColor = 'rgba(249, 249, 249, 0.8)' // Increase opacity on mouseover
  const modal = document.getElementById('article-content-modal')
  if (modal) {
    modal.style.display = 'block' // Show the modal
  }
}

// Function to handle mouseout event
function handleMouseOut(event: Event) {
  const div = event.target as HTMLElement
  div.style.backgroundColor = 'rgba(249, 249, 249, 0.5)' // Decrease opacity on mouseout
  const modal = document.getElementById('article-content-modal')
  if (modal) {
    modal.style.display = 'none' // Hide the modal
  }
}

// Function to handle click event
function handleClick(event: Event) {
  const div = event.target as HTMLElement
  const modal = document.getElementById('article-content-modal')
  if (modal) {
    if (modal.style.display === 'none') {
      modal.style.display = 'block' // Show the modal
    } else {
      modal.style.display = 'none' // Hide the modal
    }
  }
}

// Function to handle click event outside of modal
function handleOutsideClick(event: Event) {
  const modal = document.getElementById('article-content-modal')
  if (modal && event.target === modal) {
    modal.style.display = 'none' // Hide the modal
  }
}

// Extract the main content of the page
function extractArticleContent() {
  let documentClone = document.cloneNode(true) as Document
  let article = new Readability(documentClone).parse()
  return article
}

let article = extractArticleContent()
const articleText = article?.textContent || ''
const articleContent = article?.content || ''

// Get the whole page text
const pageText = document.body.textContent || ''

// Encode text into tokens
const articleTokens = encode(articleText)
const pageTokens = encode(pageText)

// Create and style the token counter div
const tokenCounterDiv = createTokenCounterDiv(articleTokens, pageTokens)
styleTokenCounterDiv(tokenCounterDiv)

// Create the article content modal
const articleContentModal = createArticleContentModal(articleContent)

// Add click event listener
tokenCounterDiv.addEventListener('click', handleClick)
window.addEventListener('click', handleOutsideClick)

// Append the divs to the body of the webpage
document.body.appendChild(tokenCounterDiv)
document.body.appendChild(articleContentModal)

// Get the maxTokens value from Chrome storage
chrome.storage.sync.get(['maxTokens'], function (result) {
  // Check if the token count exceeds the max tokens
  let tokens = articleTokens.length > pageTokens.length ? articleTokens : pageTokens
  if (tokens.length > result.maxTokens) {
    // Change the font color of the div
    tokenCounterDiv.style.color = '#FF6347' // Tomato color
  }
})
