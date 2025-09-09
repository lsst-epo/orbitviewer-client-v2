self.addEventListener('message', async event => {
	const src = event.data.items;
	const q = event.data.query;

  const items = [];
  const sample = [];
  const put_items = (arr) => {
      for(const item of arr) {
          if(sample.indexOf(item) === -1) sample.push(item);
      }
  }

  // create unique sample
  /* for(const arr of src) {
    put_items(arr);
  } */

  const searchInArray = (prompt, arr, found) => {
      for (let i = 0, len = arr.length; i < len; i++) {
          const item = arr[i];
          if (found.indexOf(item) > -1) continue;
          if (!item.fulldesignation) continue;
          const fd = item.fulldesignation.toLowerCase();
          if (fd.indexOf(prompt) > -1) found.push(item);
      }
  }
  
  // searchInArray(q, sample, items);
  for(const arr of src) {
    searchInArray(q, arr, items);
  }

	// Send the image data to the UI thread!
	self.postMessage({
		results: items,
    query: q
	})
})