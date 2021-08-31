<template>
    <div class="container">
        <div class="panel">
            <div>
                <textarea
                    ref="i2e"
                    cols="30"
                    rows="10"
                    placeholder="i2e"
                    v-model="i2eText"
                    class="textarea"
                ></textarea>
                <textarea
                    v-model="e2iText"
                    ref="e2i"
                    cols="30"
                    rows="10"
                    placeholder="e2i"
                    class="textarea"
                ></textarea>
            </div>
            <div>
                <button @click="updateData" class="button">Update Data</button>
                <button @click="uploadData" class="button">Upload Data</button>
            </div>
            <div>
                <div v-if="cur.data">
                    <span>Count: </span> <span> {{ cur.data.length }} </span>
                </div>
                <div v-if="cur.data">
                    <span>Cur Line:</span> <span>{{ cur.line }}</span>
                </div>
            </div>
            <div>
                <button class="button" @click="nextLine">Next</button>
                <button class="button" @click="prevLine">Prev</button>
                <button class="button" @click="skipLine(cur.line)">Skip</button>
                <input
                    type="text"
                    class="text"
                    placeholder="Skip Line"
                    v-model="cur.line"
                />
            </div>
        </div>
        <div>
            <v-chart :option="options" class="chart" autoresize />
        </div>
    </div>
</template>

<script>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { TreeChart } from "echarts/charts";
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import "echarts/lib/component/tooltip"; // you need to import the tooltip component
import ClipboardJS from "clipboard";

use([
    CanvasRenderer,
    TreeChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
]);

export default {
    name: "VueTree",
    components: {
        VChart,
    },
    data() {
        return {
            chart: null,
            e2i: {},
            i2e: {},
            cur: {
                line: null,
                data: null,
            },
            i2eText: null,
            e2iText: null,
            options: {},
            initOptions: {},
        };
    },
    beforeMount() {
        // Init Empty Data
        this.initEchart();
        // Init Clipboard
        this.btn = new ClipboardJS(".clipboard");
    },
    methods: {
        /**
         * @summary Upload csv file
         */
        uploadData() {
            let input = document.createElement("input");
            input.accept = ".txt";
            input.style.display = "none";
            input.type = "file";
            input.onchange = ({ target: { files } }) => {
                let file = files[0];
                let reader = new FileReader();
                reader.onload = ({ target: { result } }) => {
                    let lines = result.split("\n");
                    let data = [];
                    for (let line of lines) {
                        let items = line.split("\t");
                        let e2i = items[0];
                        let i2e = items[1];
                        data.push({
                            e2i,
                            i2e,
                        });
                    }
                    this.cur.data = data;
                    this.cur.line = 1;
                    this.i2eText = data[0].i2e;
                    this.e2iText = data[0].e2i;
                    this.updateData();
                };
                reader.readAsText(file);
            };
            input.click();
        },
        /**
         * @summary Next line
         */
        nextLine() {
            this.skipLine(this.cur.line + 1);
        },
        /**
         * @summary Prev line
         */
        prevLine() {
            this.skipLine(this.cur.line - 1);
        },
        /**
         * @summary To special line
         * @param {int} line special line
         */
        skipLine(line) {
            if (line > 0 && line < this.cur.data.length) {
                this.cur.line = line;
                this.i2eText = this.cur.data[this.cur.line - 1].i2e;
                this.e2iText = this.cur.data[this.cur.line - 1].e2i;
                this.updateData();
            }
        },
        /**
         * @summary Update tree data
         */
        updateData() {
            let e2i = JSON.parse(this.e2iText);
            let i2e = JSON.parse(this.i2eText);
            let data = this.convertTreeData(e2i, i2e);
            this.initEchart(data);
        },
        /**
         * @summary Convert entities to tree
         * @param {object} e2i entity name to id
         * @param {object} i2e id to entity name
         * @returns {object} tree data
         */
        convertTreeData(e2i, i2e) {
            // build edges: {{}}
            let edges = {};
            for (let id in i2e) {
                for (let link of i2e[id].links) {
                    // build edge
                    let nextId = e2i[link];
                    if (!edges[id]) edges[id] = {};
                    edges[id][nextId] = true;
                    if (!edges[nextId]) edges[nextId] = {};
                    edges[nextId][id] = true;
                }
            }
            let tree = {
                id: 0,
                name: i2e[0].name,
                origin: i2e[0],
                children: [],
            };
            let vis = new Set();
            vis.add("0");
            let queue = [tree];
            let ptr = 0;
            while (ptr < queue.length) {
                let cur = queue[ptr++];
                for (let next in edges[cur.id]) {
                    if (!vis.has(next)) {
                        vis.add(next);
                        let name = i2e[next].name;
                        let node = {
                            id: next,
                            name,
                            origin: i2e[next],
                            children: [],
                        };
                        queue.push(node);
                        cur.children.push(node);
                    }
                }
            }
            return tree;
        },
        /**
         * @summary Init chart to show tree
         * @param {object} tree data
         */
        initEchart(data) {
            if (!data) return;
            this.options = {
                tooltip: {
                    trigger: "item",
                    triggerOn: "click",
                    formatter: (params) => {
                        let data = params.data.origin;
                        let dataString = JSON.stringify(data).replaceAll(
                            '"',
                            "&quot;"
                        );
                        return `<pre style="max-width:360px;overflow:auto;word-break:break-all;">${JSON.stringify(
                            data,
                            null,
                            4
                        )}</pre>
                        <button class="clipboard chart_copy_button" data-clipboard-text="${dataString}" >Copy</button>
                        `;
                    },
                },
                series: [
                    {
                        type: "tree",
                        data: [data],
                        top: "1%",
                        left: "14%",
                        bottom: "1%",
                        right: "20%",

                        symbolSize: 12,

                        label: {
                            position: "left",
                            verticalAlign: "middle",
                            align: "right",
                            fontSize: 18,
                        },

                        leaves: {
                            label: {
                                position: "right",
                                verticalAlign: "middle",
                                align: "left",
                            },
                        },

                        emphasis: {
                            focus: "descendant",
                        },

                        expandAndCollapse: true,
                        animationDuration: 550,
                        animationDurationUpdate: 750,
                    },
                ],
            };
        },
    },
    beforeUnmount() {
        if (this.btn) {
            this.btn.destroy();
        }
    },
};
</script>


<style lang="scss" scoped>
.container {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    display: flex;
    height: 100vh;
}
.panel {
    max-width: 400px;
    padding: 10px;
    div:not(:nth-child(1)) {
        margin-top: 10px;
    }
}
.chart {
    // min-width: 1024px;
    min-width: calc(100vw - 400px);
    width: 100%;
}
.textarea {
    font-size: 16px;
    height: 360px;
    width: 300px;
    margin-right: 20px;
    outline: none;
    border: 1px solid #30336b;
    resize: none;
    border-radius: 10px;
    padding: 10px 20px;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    &:not(:nth-child(1)) {
        margin-top: 10px;
    }
}
.text {
    border: none;
    border-bottom: 1px solid #30336b;
    font-size: 14px;
    padding: 4px;
    border-radius: 0px;
    outline: none;
    margin-top: 5px;
    margin-left: 10px;
}
.button {
    display: inline-block;
    width: 100px;
    outline: none;
    background: transparent;
    border: 1px solid #30336b;
    border-radius: 5px;
    padding: 5px;
    &:not(:nth-child(1)) {
        margin-left: 10px;
    }
    &:hover {
        border: 1px solid gray;
        cursor: pointer;
        opacity: 0.9;
    }
}
</style>

<style lang="scss">
.chart_copy_button {
    display: inline-block;
    width: 100px;
    outline: none;
    background: transparent;
    border: 1px solid #30336b;
    border-radius: 5px;
    padding: 5px;
    &:hover {
        border: 1px solid gray;
        cursor: pointer;
        opacity: 0.9;
    }
}
</style>