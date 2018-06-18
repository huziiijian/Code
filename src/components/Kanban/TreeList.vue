<template>
  <div>
    <div v-if="model.name !== 'root'">
      <div class="border up" :class="{'active': isDragEnterUp}"
           @drop="dropUp"
           @dragenter="dragEnterUp"
           @dragover='dragOverUp'
           @dragleave="dragLeaveUp"></div>
      <div class='tree-node' :id='model.id' :class="{'active': isDragEnterNode}"
           :draggable="!model.dragDisabled"
           @dragstart='dragStart'
           @dragover='dragOver'
           @dragenter='dragEnter'
           @dragleave='dragLeave'
           @drop='drop'
           @dragend='dragEnd'
           @mouseover='mouseOver'
           @mouseout='mouseOut'
           @click.stop='click'>
        <span class="caret icon is-small" v-if="model.children && model.children.length > 0">
          <i class="vue-tree-icon" :class="caretClass" @click.prevent.stop="toggle"></i>
        </span>

        <span v-if="model.isLeaf">
          <slot name="leafNodeIcon">
            <i class="vue-tree-icon item-icon icon-file"></i>
          </slot>
        </span>
        <span v-else>
          <slot name="treeNodeIcon">
            <i class="vue-tree-icon item-icon icon-folder"></i>
          </slot>
        </span>

        <div class="node-content" v-if="!editable">
          {{model.name}}
        </div>
        <!--<input v-else class="vue-tree-input" type="text" ref="nodeInput" :value="model.name" @input="updateName" @blur="setUnEditable">-->
        <div class="operation" v-show="isHover">
          <span title="add tree node" @click.stop.prevent="promoteName(false)" v-if="!model.isLeaf && model.reference_id =='root'">
            <slot name="addTreeNode">
              <i class="vue-tree-icon icon-folder-plus-e"></i>
            </slot>
          </span>
          <span title="add tree node" @click.stop.prevent="promoteName(true)" v-if="!model.isLeaf && model.reference_id !='root'">
            <slot name="addLeafNode">
              <i class="vue-tree-icon icon-plus"></i>
            </slot>
          </span>
          <!--<span title="edit" @click.stop.prevent="setEditable">-->
            <!--<slot name="edit">-->
              <!--<i class="vue-tree-icon icon-edit"></i>-->
            <!--</slot>-->
          <!--</span>-->
          <span title="delete" @click.stop.prevent="delNode">
            <slot name="edit">
              <i class="vue-tree-icon icon-trash"></i>
            </slot>
          </span>
        </div>
      </div>

      <div v-if="model.children && model.children.length > 0 && expanded"
           class="border bottom"
           :class="{'active': isDragEnterBottom}"
           @drop="dropBottom"
           @dragenter="dragEnterBottom"
           @dragover='dragOverBottom'
           @dragleave="dragLeaveBottom"></div>
    </div>

    <div :class="{'tree-margin': model.name !== 'root'}" v-show="expanded" v-if="isFolder">
      <tree-list v-for="model in model.children"
                 :model="model"
                 :key='model.id'>
      </tree-list>
    </div>
  </div>
</template>

<script>
  import { Tree, TreeNode } from './Tree.js'
  import { addHandler, removeHandler } from './tools.js'

  let fromComp = null

  export default {
    name:"tree-list",
    props: {
      model: {
        type: Object
      },
      myInformation:{
        type:Object
      }
    },
    data() {
      return {
        isHover: false,
        editable: false,
        isDragEnterUp: false,
        isDragEnterBottom: false,
        isDragEnterNode: false,
        expanded: true,
        createItem:{},
        nameDialogShow:false,
      }
    },

    watch: {
      myInformation: function(value) {
        if(value!=undefined){
          this.my_info = value;
          console.log(this.my_info,"value");

        }

      }
    },

    computed: {
      itemIconClass () {
        return this.model.isLeaf ? 'icon-file' : 'icon-folder'
      },

      caretClass () {
        return this.expanded ? 'icon-caret-down' : 'icon-caret-right'
      },

      isFolder() {
        return this.model.children &&
          this.model.children.length
      },
    },

    created(){
      let that = this;

      setInterval(function () {
        that.$emit('refresh');
      },10000)
      // this.$store.commit('getMyInfo')

    },

    mounted () {
      const vm = this;
      addHandler(window, 'keyup', function (e) {
        // click enter
        if (e.keyCode === 13 && vm.editable) {
          vm.editable = false
        }
      });
    },

    beforeDestroy () {
      removeHandler(window, 'keyup')
    },

    methods: {

      promoteName(isLeaf){
        let that = this;

        let model =that.model;
        // let name=prompt("Enter the task name","Name");
        that.$prompt('请输入任务名称', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',

        }).then(({ value }) => {
          // this.$message({
          //   type: 'success',
          //   message: '你的邮箱是: ' + value
          // }
          console.log(value)
          this.addChild(isLeaf,model,value);
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消输入'
          });
        });

      },

      addChild(isLeaf,model,name) {

        let createItem = {
          "name": name,
          "isLeaf": isLeaf,
        }
        var node = new TreeNode(createItem)
        this.model.addChildren(node, true);
        this.expanded = true;

        let createDate = new Date().getTime();
        let reference_id = model.reference_id;
        let desc;
        if(model.reference_id == "root"){
          desc = "root";
        }else{
          desc = reference_id;
        }
        this.createItem = {
          "name": name,
          "createDate":createDate,
          "desc": desc,
          "isLeaf": isLeaf,
          "status": "todo",
          "startDate":"",
          "dueDate":"",
          "checked":false,
          "children":[],
          "modifyDateUTC": new Date().getTime(),
          "isread":true,
          "history_c":[],
          "attachment":[]
        }
        console.log(this.createItem)

        let url = "/api/asset/create/"+ model.project;

        postData(this,url,this.createItem,()=>{
          this.$emit('refresh');
        })
      },

      delNode () {
        const vm = this
        console.log(this.model)

        this.$confirm('此操作将永久删除该任务, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          vm.model.remove();

          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          let rid = this.model.reference_id;
          let pid = this.model.project;
          let children = vm.model.children;

          let result=[rid];
          if(children != null){
            for(let i=0;i<children.length;i++){
              result.push(children[i].reference_id);
            }
          }
          let url;
          for(let i=0;i<result.length;i++){
            url = "/api/asset/delete/"+result[i]+"/of/"+pid;
            postData(this,url,result[i])
            if(i==result.length-1) this.$emit('refresh');
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });

      },

      setEditable () {
        this.editable = true
        this.$nextTick(() => {
          this.$refs.nodeInput.focus()
//          fireFocusEvent(this.$refs.nodeInput)
        })
      },

      setUnEditable () {
        this.editable = false
      },

      toggle() {
        console.log(this.model);
        if (this.model.isLeaf ==false) {
          this.expanded = !this.expanded

          // if(this.expanded == true){
          //   this.$emit('')
          // }
        }
      },

      mouseOver(e) {
        this.isHover = true
      },

      mouseOut(e) {
        this.isHover = false
      },

      click() {
        var node = this.$parent
        var clickModel = this.model
        while (node._props.model.name !== 'root') {
          node = node.$parent
        }
        node.$emit('click', clickModel)
      },

      dragStart(e) {
        if (!this.model.dragDisabled) {
          fromComp = this
          // for firefox
          e.dataTransfer.setData("data","data");
          e.dataTransfer.effectAllowed = 'move'
          return true
        }
        return false
      },
      dragEnd(e) {
        fromComp = null
      },
      dragOver(e) {
        e.preventDefault()
        return true
      },
      dragEnter(e) {
        if (!fromComp) return
        if (this.model.isLeaf) return
        this.isDragEnterNode = true
      },
      dragLeave(e) {
        this.isDragEnterNode = false
      },
      drop(e) {
        if (!fromComp) return
        fromComp.model.moveInto(this.model)
        this.isDragEnterNode = false
      },

      dragEnterUp () {
        if (!fromComp) return
        this.isDragEnterUp = true
      },
      dragOverUp (e) {
        e.preventDefault()
        return true
      },
      dragLeaveUp () {
        if (!fromComp) return
        this.isDragEnterUp = false
      },
      dropUp () {
        if (!fromComp) return
        fromComp.model.insertBefore(this.model)
        this.isDragEnterUp = false
      },

      dragEnterBottom () {
        if (!fromComp) return
        this.isDragEnterBottom = true
      },
      dragOverBottom (e) {
        e.preventDefault()
        return true
      },
      dragLeaveBottom () {
        if (!fromComp) return
        this.isDragEnterBottom = false
      },
      dropBottom () {
        if (!fromComp) return
        fromComp.model.insertAfter(this.model)
        this.isDragEnterBottom = false
      }
    },
    beforeCreate () {
      this.$options.components.item = require('./TreeList.vue')
    }
  }
</script>

<style lang="less" rel="stylesheet/less" scoped>
  @font-face {
    font-family: 'icomoon';
    src:  url('fonts/icomoon.eot?ui1hbx');
    src:  url('fonts/icomoon.eot?ui1hbx#iefix') format('embedded-opentype'),
    url('fonts/icomoon.ttf?ui1hbx') format('truetype'),
    url('fonts/icomoon.woff?ui1hbx') format('woff'),
    url('fonts/icomoon.svg?ui1hbx#icomoon') format('svg');
    font-weight: normal;
    font-style: normal;
  }

  .vue-tree-icon {
    /* use !important to prevent issues with browser extensions that change fonts */
    font-family: 'icomoon' !important;
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;

    /* Better Font Rendering =========== */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    &.item-icon {
      margin-right: 4px;
      &:hover {
        color: inherit;
      }
    }
    &:hover {
      color: blue;
    }
  }

  .icon-file:before {
    content: "\e906";
  }
  .icon-folder:before {
    content: "\e907";
  }
  .icon-caret-down:before {
    content: "\e900";
  }
  .icon-caret-right:before {
    content: "\e901";
  }
  .icon-edit:before {
    content: "\e902";
  }
  .icon-folder-plus-e:before {
    content: "\e903";
  }
  .icon-plus:before {
    content: "\e904";
  }
  .icon-trash:before {
    content: "\e905";
  }


  .border {
    height: 5px;
    &.up {
      margin-top: -5px;
      background-color: transparent;
    }
    &.bottom {
      background-color: transparent;
    }
    &.active {
      border-bottom: 3px dashed blue;
      /*background-color: blue;*/
    }
  }

  .tree-node {
    display: flex;
    align-items: center;
    padding: 5px 0 5px 1rem;
    .input {
      border: none;
      max-width: 150px;
      border-bottom: 1px solid blue;
    }
    &:hover {
      background-color: #f0f0f0;
    }
    &.active {
      outline: 2px dashed pink;
    }
    .caret {
      margin-left: -1rem;
    }
    .operation {
      margin-left: 2rem;
      letter-spacing: 1px;
    }
  }


  .item {
    cursor: pointer;
  }
  .tree-margin {
    margin-left: 2em;
  }
</style>
