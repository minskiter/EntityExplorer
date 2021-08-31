export default {
  methods: {
    /**
     * Open file and read content as string
     * @returns {Promise<string>} file content
     */
    async readFileAsString() {
      return new Promise((resolve, reject) => {
        let input = document.createElement("input")
        input.accept = ".txt,.csv"
        input.type = "file"
        input.onchange = ({ target: { files } }) => {
          let file = files[0];
          let reader = new FileReader();
          reader.onload = ({ target: { result } }) => {
            input.remove()
            resolve(result)
          };
          let error = (...args) => {
            input.remove()
            reject(args)
          }
          reader.onerror = error
          reader.onabort = error
          reader.readAsText(file);
        }
        input.click()
      })
    }
  }
}