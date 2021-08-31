<template>
  <div>
      <button @click="goto('./editor')" class="button">editor</button>
      <button @click="goto('./tree')" class="button">tree</button>
  </div>
</template>

<script>
export default {
    name:"Nav",
    methods:{
        goto(href){
            this.$router.push(href)
        }
    }
}
</script>

<style lang="scss" scoped>
.button{
    padding: 5px 10px;
    cursor: pointer;
    background: whitesmoke;
    outline: none;
    border-radius: 4px;
    margin:5px;
    border: 1px solid whitesmoke;
    &:hover{
        opacity: 0.6;
    }
}
</style>