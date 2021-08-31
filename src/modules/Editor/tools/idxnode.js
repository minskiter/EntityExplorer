import { Node, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

let global = {
  /**
   * @type {HTMLElement}
   */
  tooltip: null,
  /**
   * @type {HTMLElement}
   */
  target: null,
  events: {
    click: (evt) => {
      if (global.tooltip) {
        let node = evt.target
        while (node != global.tooltip && node != document.body.parentNode && node != global.target) {
          node = node.parentNode
        }
        if (node != global.tooltip && node != global.target) {
          global.unregister()
          global.tooltip.remove()
          global.tooltip = null
        }
      }
    },
  },
  register() {
    for (let event in this.events) {
      window.addEventListener(event, this.events[event])
    }
  },
  unregister() {
    for (let event in this.events) {
      window.removeEventListener(event, this.events[event])
    }
  }
}

const IdxNode = Node.create({
  name: "Idx",
  content: "text*",
  group: 'block',
  defaultOptions: {
    HTMLAttributes: {
      style: "display:inline-block",
      class: "idx-node",
      origin: "0",
      text: ""
    },
  },
  addAttributes() {
    return {
      origin: {
        default: this.options.HTMLAttributes.origin
      },
      text: {
        default: this.options.HTMLAttributes.text
      },
      tooltip: {
        default: null
      },
      /**
       * @summary tootlip node info
       */
      nodeinfo: {
        default: {
          bestnode: [],
          i2e: {}
        }
      }
    }
  },
  parseHTML() {
    return [
      {
        tag: "span"
      },
      {
        class: this.options.HTMLAttributes.class
      }
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("Idx"),
        props: {
          handleClickOn(view, pos, node, nodePos, event) {
            // find special node
            if (node.type.name === "Idx") {
              if (global.tooltip != null) {
                global.unregister();
                global.tooltip.remove()
              }
              // show tooltip node info
              let div = document.createElement("div");
              div.classList.add("node-info")
              let position = view.coordsAtPos(pos)
              div.style.left = `${position.left + 2}px`
              div.style.top = `${position.top + 42}px`
              // create best node
              let text = node.attrs.text.replace(' ', '');
              let rex = new RegExp(text,"ig")
              for (let bestnode of node.attrs.node_info.bestnode) {
                if (node.attrs.node_info.i2e[bestnode] != undefined) {
                  let child = document.createElement("div")
                  child.classList.add("node")
                  let entity = node.attrs.node_info.i2e[bestnode]
                  child.innerHTML = `<span class="name">${entity.name.replace(rex, `<span class="high-light">${text}</span>`)}</span>:<span class="content">${entity.context.replace(rex, `<span class="high-light">${text}</span>`)}</span>`
                  div.appendChild(child)
                }
              }
              global.tooltip = div
              global.target = event.target
              view.dom.parentNode.appendChild(div)
              global.register()
              return true
            }
            return false
          }
        }
      })
    ]
  }
})

export { IdxNode, global }

export default IdxNode