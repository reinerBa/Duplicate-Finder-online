import { formatBytes, AddHash, listAllFilesAndDirs } from './logic.js'

export default {
  name: 'Test',
  data () {
    return {
      processing: false,
      fileContents: [],
      foldersContent: [], // {}
      text: '',
      header: '',
      showModal: false,
      modalMedia: '',
      modalMessage: false
    }
  },
  computed: {
    replicasCount () {
      return this.fileContents.reduce((total, curr) => total + (curr.sizeEx ? 1 : 0), 0)
    },
    duplicates () {
      return this.fileContents.filter(el => el.hash)
    }
  },
  mounted () {
  },
  methods: {
    formatSize (sum) {
      return formatBytes(sum)
    },
    replicasSum () {
      const sum = this.fileContents.reduce((total, curr) => total + (curr.sizeEx ? curr.size : 0), 0)
      return formatBytes(sum)
    },
    async onClickHandler (e) {
      try {
        const directoryHandle = await window.showDirectoryPicker()
        this.processing = true
        const files = await listAllFilesAndDirs(directoryHandle)
        /* files.forEach(element => {
          const exists = this.fileContents.some((el) => el.handle.isSameEntry(element.handle))
          if (!exists) this.fileContents.push(element)
        }) */
        this.fileContents.push(...files)
        this.foldersContent.push({ folder: directoryHandle.name, files, handle: directoryHandle })
        console.log('files', files)
        console.log('store', this.fileContents)
        for (let i = 0; i < this.fileContents.length; i++) {
          const element = this.fileContents[i]
          this.fileContents[i].sizeEx = this.fileContents.filter((el) => el.size === element.size).length > 1
          if (element.sizeEx) await AddHash(element)
        }
      } catch (e) {
        console.log(e)
      } finally { this.processing = false }
    }
  },

  template: `
  <div>
  <progress v-if="processing" id="progress-2"></progress>
  <section>
    <button @click="onClickHandler">Read Folder</button>
  </section>
  <section id="accordions">
    <h2>Scanned Folders ({{foldersContent.length}})
      <span v-if="fileContents.length">, files ({{fileContents.length}})</span>
      <span v-if="fileContents.length">, duplicates ({{replicasCount}})</span>
    </h2>
    <details v-for="(dir, idx1) in foldersContent" :key="idx1 + 'tf'">
      <summary>#{{idx1}} {{dir.folder}}</summary>
      <p>
      <table>
        <tr><th>Name</th><th>Size</th><th>Duplicate</th></tr>
        <tr v-for="(fi, idx2) in dir.files" :key="idx2 + 'fi'">
          <td>{{fi.name}}</td><td>{{formatSize(fi.size)}}</td><td>{{fi.sizeEx ? 'Yes' : 'No'}}</td>
        </tr>
      </table>
      </p>
    </details>
  </section>


    <br/>
    <section>

    <table v-if="replicasCount" role="grid">
    <thead>
      <tr><th>Edit</th><th>Name</th><th>Size</th></tr>
    </thead>
    <tbody>
    <tr v-for="(fi, idx2) in duplicates" :key="idx2 + 'du'">
      <th scope="row"></th><td>{{fi.name}}</td><td>{{ formatSize(fi.size)}}</td>
    </tr>
    </tbody>
    </table>

    <strong>Sum: {{ replicasSum()}}</strong>
    </section>
  </div>
    `
}
