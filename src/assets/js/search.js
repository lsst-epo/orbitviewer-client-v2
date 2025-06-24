self.addEventListener('message', async event => {
	const sample = event.data.items;
	const q = event.data.query;

  const items = [];

  const searchInArray = (prompt, arr, found) => {
      for (let i = 0, len = arr.length; i < len; i++) {
          const item = arr[i];
          if (found.indexOf(item) > -1) continue;
          if (!item.fulldesignation) continue;
          const fd = item.fulldesignation.toLowerCase();
          if (fd.indexOf(prompt) > -1) found.push(item);
      }
  }
  
  searchInArray(q, sample, items);

	// Send the image data to the UI thread!
	self.postMessage({
		results: items
	})
})