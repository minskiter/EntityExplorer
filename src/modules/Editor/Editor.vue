<template>
    <div>
        <div class="tool-bar">
            <button class="button" @click="readIdx">Upload Idx</button>
            <button class="button" @click="readIdx2text">
                Upload GPT2 Dictionary
            </button>
            <button class="button" @click="readEntity">Upload Entities</button>
            <button class="button" @click="readBestNode">
                Upload Best Node
            </button>
            <button class="button" @click="changePage(-1)">Prev</button>
            <button class="button" @click="changePage(1)">Next</button>
            <button
                class="button"
                @keyup.enter="selectItem(page.cur)"
                @click="selectItem(page.cur)"
            >
                Select
            </button>
            <button class="button">ItemNo.</button>
            <input type="text" class="button" v-model="page.cur" />
        </div>
        <editor-content class="editor" :editor="editor"></editor-content>
    </div>
</template>

<script>
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { IdxNode } from "./tools/idxnode.js";
import { EditorView } from "prosemirror-view";
import { EditorState } from "prosemirror-state";
import uploadData from "./tools/uploadData.js";
export default {
    name: "EntityEditor",
    components: {
        EditorContent,
    },
    mixins: [uploadData],
    data() {
        return {
            /**
             * @type {Editor}
             */
            editor: null,
            idx: [],
            entities: [],
            idxes: [],
            idxdicts: [],
            bestnodes: [],
            page: {
                cur: 0,
            },
        };
    },
    computed: {
        /**
         * true if data is ready ,otherwise false
         */
        dataReady() {
            if (this.idxes.length > 0) {
                return (
                    this.idxes.length == this.bestnodes.length &&
                    this.bestnodes.length == this.entities.length
                );
            }
            return false;
        },
        total() {
            if (this.dataReady) return this.idxes.length;
            return 0;
        },
    },
    mounted() {
        this.initEditor();
    },
    beforeUnmount() {
        if (this.editor != null) this.editor.destroy();
    },
    methods: {
        /**
         * Init Editor
         */
        initEditor() {
            this.editor = new Editor({
                editable: false,
                content: ``,
                extensions: [StarterKit, IdxNode],
                onCreate: ({ editor: { view, state } }) => {
                    this.initEncodingToolTip(view, state);
                    this.initBestNode(view, state);
                },
                onUpdate: ({ editor: { view, state } }) => {
                    this.initEncodingToolTip(view, state);
                    this.initBestNode(view, state);
                },
            });
        },
        /**
         * @param {EditorView} view
         * @param {EditorState} state
         */
        initEncodingToolTip(view, state) {
            // remove older idx
            for (let el of this.idx) {
                el.remove();
            }
            // add newer idx
            state.doc.descendants((node, pos) => {
                if (node.type.name == "Idx") {
                    let start = view.coordsAtPos(pos);
                    let div = document.createElement("div");
                    div.innerHTML = node.attrs.origin;
                    div.style.position = "absolute";
                    div.style.left = `${start.left}px`;
                    div.style.top = `${start.top + 18}px`;
                    div.style.color = `#e74c3c`;
                    view.dom.parentNode.appendChild(div);
                    this.idx.push(div);
                }
            });
        },
        initBestNode(view, state) {
            let index = 0;
            state.doc.descendants((node, pos) => {
                if (node.type.name == "Idx") {
                    node.attrs.node_info = {
                        bestnode: this.bestnodes[this.page.cur][index],
                        i2e: this.entities[this.page.cur].i2e,
                    };
                    ++index;
                }
            });
        },
        /**
         * Read entity from file
         */
        async readEntity() {
            this.entities = [];
            let lines = (await this.readFileAsString()).split("\n");
            // solve lines
            for (let line of lines) {
                // skip empty
                if (line.length == 0) continue;
                let arr = line.split("\t");
                let e2i = JSON.parse(arr[0]),
                    i2e = JSON.parse(arr[1]);
                this.entities.push({
                    e2i,
                    i2e,
                });
            }
        },
        /**
         * Read GPT2 encoding
         */
        async readIdx() {
            this.idxes = [];
            let lines = (await this.readFileAsString()).split("\n");
            for (let line of lines) {
                if (line.length == 0) continue;
                let idxes = JSON.parse(line);
                this.idxes.push(idxes);
            }
        },
        /**
         * Read GPT2 decode
         */
        async readIdx2text() {
            let token2id = JSON.parse(await this.readFileAsString());
            this.idxdicts = {};
            for (let token in token2id) {
                this.idxdicts[token2id[token]] = token;
            }
        },
        /**
         * Read best node
         */
        async readBestNode() {
            this.bestnodes = [];
            let lines = (await this.readFileAsString()).split("\n");
            for (let line of lines) {
                if (line.length == 0) continue;
                let bestnode = JSON.parse(line);
                this.bestnodes.push(bestnode);
            }
        },
        /**
         * @param {number} adds
         */
        changePage(adds) {
            this.page.cur += adds;
            if (this.page.cur < 0) this.page.cur = 0;
            if (this.page.cur >= this.total) this.page.cur = this.total - 1;
            this.selectItem(this.page.cur);
        },
        /**
         * @param {number} page
         */
        selectItem(page) {
            if (this.dataReady) {
                if (page >= 0 && page < this.total) {
                    this.editor.commands.setContent(
                        this.generateNodes(
                            this.idxes[page],
                            this.idxdicts
                        ),
                        true
                    );
                }
            } else {
                alert("Not ready!");
            }
        },
        /**
         * @param {Array<number>} idxes
         * @param {Object} dict
         */
        generateNodes(idxes, dict) {
            let text = [];
            for (let idx of idxes) {
                let token = unescape(dict[idx].replace(new RegExp("[\u00a1-\u0200]",'ig'),' '))
                text.push(
                    `<span class="idx-node" origin="${idx}" text="${token}">${token}</span>`
                );
            }
            return text.join("");
        },
    },
};
</script>

<style lang="scss" scoped>
.editor {
    margin: 10px;
    padding: 20px;
    background: whitesmoke;
    border-radius: 10px;
}
.tool-bar {
    margin: 10px;
}
.button {
    outline: none;
    cursor: pointer;
    background: whitesmoke;
    border: 1px solid rgba(0, 0, 0, 0.05);
    padding: 5px 20px;
    border-radius: 0;
    &:nth-child(1) {
        border-radius: 5px 0 0 5px;
    }
    &:not(:nth-child(1)) {
        border-left: none;
        border-right: none;
    }
    &:first-child {
        border-right: none;
    }
    &:last-child {
        border-right: 1px solid rgba(0, 0, 0, 0.05);
        border-radius: 0 5px 5px 0;
    }
    &:hover {
        opacity: 0.8;
        background: rgba(33, 33, 33, 0.15);
    }
}
</style>

<style lang="scss">
.idx-node {
    margin-left: 10px;
    min-width: 50px;
    padding-bottom: 16px;
    text-decoration: underline;
    cursor: pointer;
    &:hover {
        opacity: 0.9;
    }
}
.node-info {
    position: fixed;
    min-width: 250px;
    min-height: 200px;
    max-width: 500px;
    max-height: 500px;
    overflow: auto;
    padding: 10px;
    border-radius: 10px;
    z-index: 1;
    background: whitesmoke;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.15);
    .node {
        margin: 10px 5px;
        .name {
            display: inline-block;
            padding: 5px;
            border-radius: 5px;
            background: rgba(255, 193, 0, 1);
            // color: #d35400;
            font-weight: bold;
            color: black;
            margin: 4px 0;
            span.high-light {
                color: white;
            }
        }
        .content {
            display: inline-block;
            padding: 10px;
            border-radius: 5px;
            background: white;
            min-width: 10px;
            color: grey;
            margin: 2px 0;
            span.high-light {
                color: #f1c40f;
            }
        }
    }
}

</style>