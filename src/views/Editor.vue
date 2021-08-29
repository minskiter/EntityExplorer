<template>
    <div>
        <editor-content :editor="editor"></editor-content>
    </div>
</template>

<script>
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
export default {
    name: "EntityEditor",
    components: {
        EditorContent,
    },
    data() {
        return {
            editor: null,
        };
    },
    mounted() {
        this.initEditor();
    },
    beforeUnmount() {
        this.editor.destory();
    },
    methods: {
        initEditor() {
            this.editor = new Editor({
                content: "<div>test</div>",
                extensions: [
                    StarterKit
                ],
            });
        },
    },
};
</script>

<style lang="scss" scoped>
</style>