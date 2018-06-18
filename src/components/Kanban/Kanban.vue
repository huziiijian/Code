<template>
  <div class="drag-container">
    <el-row class="drag-list">
      <el-col  v-for="stage in stages" class="drag-column" 
      	:class="{['drag-column-' + stage]: true}" :key="stage">
    			<span class="drag-column-header">
    				<h2>{{ stage }}</h2>
    			</span>
        <div class="drag-options"></div>
        <ul class="drag-inner-list" ref="list" :data-status="stage">
          <li class="drag-item" v-for="block in getBlocks(stage)" 
          	:data-block-id="block.reference_id" :key="block.reference_id">
            <slot :name="block.reference_id">
            </slot>
          </li>
        </ul>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  import dragula from 'dragula';
  export default {

      name: "kanban",
      props: {
        stages: {},
        blocks: {},
      },
      data() {
        return {
        };
      },
      computed: {
        localBlocks() {
          return this.blocks;
        },
      },
      methods: {
        getBlocks(status) {
          return this.localBlocks.filter(block => block.status === status);
        },
      },
      mounted() {
        dragula(this.$refs.list,{
          moves: function (el, source, handle, sibling) {
            console.log(el.children)
            let containClass = el.children[0].classList.contains('notMine');
            console.log(containClass)
            if(containClass==true)return false;
            return true; // elements are always draggable by default
          },
          invalid: function (el, handle) {

            return false; // don't prevent any drags from initiating by default
          },
        })
          .on('drag', (el) => {
            el.classList.add('is-moving');
          })
          .on('drop', (block, list) => {
            let index = 0;
            for (index = 0; index < list.children.length; index += 1) {
              if (list.children[index].classList.contains('is-moving')) break;
            }
            this.$emit('update-block', block.dataset.blockId, list.dataset.status, index);
          })
          .on('dragend', (el) => {
            el.classList.remove('is-moving');
            window.setTimeout(() => {
              el.classList.add('is-moved');
              window.setTimeout(() => {
                el.classList.remove('is-moved');
              }, 600);
            }, 100);
          });
      },
    };
</script>

<style>
  ul.drag-list, ul.drag-inner-list {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
  .drag-column{
    list-style:none;
    height: 650px;
    overflow-y: auto;
    width: 100%;
    margin-right: 10px;
    padding: 10px;
    background-color: #EEEEEE;
    float:left;
    /*overflow: hidden;*/
  }
  .drag-column-header{
    text-indent: 24px;
    font-size: 16px;
    font-weight: 600;
    height: 40px;
    line-height: 40px;
  }
  .drag-inner-list {
    min-height: 50px;
    color: white;
  }

  .drag-item {
    padding: 5px;
    margin: 10px;
    height: 100%;
    background: rgba(0,0,0, 0.05);


  }
  drag-options {
    position: absolute;
    top: 44px;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 10px;
    transform: translateX(100%);
    opacity: 0;
  }
</style>
