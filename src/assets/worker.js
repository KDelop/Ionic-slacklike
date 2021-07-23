importScripts('https://cdnjs.cloudflare.com/ajax/libs/localforage/1.9.0/localforage.min.js');

localforage.config({
  driver: [localforage.INDEXEDDB],
  name: 'SPACE chat mobile',
  storeName: 'space_store',
})

onmessage = function (e) {
  if (e.data === 'remove') {
    localforage.clear().then(() => {
      postMessage('removed')
    })
    return;
  } else if (e && e.data && e.data.stateName && e.data.state) {
    localforage.setItem(e.data.stateName, e.data.state)
    postMessage('done')
  }
}