import { getJSONDataFiles } from "./craft.js";

async function getDataFiles () {
  const data = {}
  const src = await getJSONDataFiles();
  if(src.data) {
    for(const d of src.data.mpcDataFilesEntries) {
      data[d.dataFileQuality] = d.dataFileUrl;
    }
  }
  
  return data;
}

async function data() {
  const data = await getDataFiles();
  console.log(data);

  return data;
}

export default data();