<template>
	<el-row style="top:20px">
		<div style="position:fixed; bottom:0; right:0; z-index:10">
			<el-button type="danger" circle @click="enterGantt">
				<i class="material-icons">timeline</i>
			</el-button>
		</div>
		<el-row>
			<el-col span="5">
				<el-row>
					<el-col :span="12">
						<el-button type="primary" @click="showAll">显示所有</el-button>
					</el-col>
					<el-col :span="12">
						<el-button type="primary" @click="showMine">只看我的</el-button>
					</el-col>
				</el-row>
				<el-row>
					<el-col :span="22" >
						<tree @click="onClick" :model="treelist" :blocks="blocks" :myInformation="myInformation" @refresh="fetchData"></tree>
					</el-col>
				</el-row>
			</el-col>
			<el-col :span="19">
			<el-container>
				<el-header>
					<el-input class="search" label="Search" placeholder="请输入内容" v-model="search" prefix-icon="el-icon-search">
					</el-input>
				</el-header>
				<el-main style="padding-top:0">
					<kanban :stages="statuses" :blocks="filterLists" @update-block="updateBlock">
						<el-card v-for="item in blocks" :slot="item.reference_id" :key="item.reference_id"  :class="[dueDate(item.dueDate,item.status),notMine(item.owner)]">
							<div class="header">
								<h3>{{item.name}}</h3>
								<div v-if="item.startDate"><span>Start:{{item.startDate}}</span></div>
								<div v-if="item.dueDate"><span>Due:{{item.dueDate}}</span></div>
							</div>
							<div style="position:absolute;left:120px;height:45px;bottom:5px">
								<img style="display:inline-block;width:40px; height:40px;border-radius:70%" v-if="owner_Avatar(item.owner)!= false" :src="owner_Avatar(item.owner)">
								<i v-else class="material-icons">
                                account_circle
                                </i>
								<el-button icon="el-icon-info" circle @click="editItem(item)" style="border:0">
								</el-button>
							</div>
						</el-card>
					</kanban>
				</el-main>
			</el-container>
			</el-col>
		</el-row>
		<v-dialog v-model="editedShow" fullscreen hide-overlay transition="dialog-bottom-transition" scrollable class="editDialog">
			<card ref="card" target="task" :editedItem="editedItem" :editedShow="editedShow" :users="users" :myInformation="myInformation" v-on:changeShow="closeDialog" @refreshData="fetchData"></card>
		</v-dialog>
	</el-row>
</template>

<script>

  import { debounce } from 'lodash';
  import Kanban from '@/components/Kanban/Kanban';
  import Card from '@/components/Kanban/Card'
  import  TreeList from '@/components/Kanban/TreeList'
  import {Tree} from '@/components/Kanban/Tree.js'

  export default {

    name: "my-task",
    props: ['projectId'],
    components:{

      'kanban':Kanban,
      'card':Card,
      'tree':TreeList
    },

    data(){
      return{
        today:new Date().getTime(),
        search:"",
        newTaskShow:false,
        newTask:{},
        dialog2:false,
        statuses:[
          "todo","progress","done"
        ],
        blocks:[],
        isMine:false,
        editedInfo:[],
        editedItem:{},
        editedShow:false,

        disable:false,
        users:[],
        addingMembers:[],
        addMemberShow:false,
        filterFolder:"",
        myInformation:{}

      }
    },
    created(){
      this.getUsers();
    },
    mounted(){
      this.myInfo();
      this.fetchData();

    },

    filters:{

    },

    computed:{

      treelist(){
        let blocks = this.blocks;
        let newArr =[];

        let rootArr = blocks.filter((v)=>{
          return v.desc==="root"
        });

        if(rootArr.length!=0){
          let n = rootArr.length;
          rootArr.forEach((root)=>{
            root.children =[];
            let childArr = blocks.filter((v)=>{
              return v.desc===root.reference_id;
            })
            if(childArr.length!=0){
              root.children=childArr;
            }
            n -=1;
            if(n==0){
              newArr = rootArr
            }
          })
        }

        let tree = [{
          "name":"Project",
          "reference_id":"root",
          "children":newArr,
          "project":this.projectId
        }]

        let treeArr = new Tree(tree);
        return treeArr;
      },

      filterLists(){
        let lists = this.blocks;
        let viewMine = this.isMine;
        if(viewMine==true){
          lists = this.getMyBlocks(this.blocks);
        }else{
          lists = this.blocks;
        }
        let search = this.search;
        let filterFolder = this.filterFolder;
        search =search.trim().toLowerCase();
        let newArr = [];

        if(filterFolder !=""){
          newArr = lists.filter((item)=>{
            return item.desc === filterFolder;
          })
        }else{
          newArr = lists;
        }
        if( !search ){
          return newArr;
        }

        newArr = newArr.filter(function (item) {
          let index = item.name.trim().toLowerCase().indexOf(search);
          if( index !== -1){
            return item;
          }
        });
        return newArr;
      },

    },

    methods:{
      myInfo(){
        let url = "api/user/info";
        getData(this,url,(data)=>{
          this.myInformation=data;
        })
      },

      getUsers(){
        let urlUser = "/api/user/all";
        getData(this,urlUser,(data)=> {
          //get all users' data
          this.users = data;
        });
      },

      fetchData:function() {
        console.log("fetch");
        let url = "/api/asset/find/of/"+this.projectId+"?limit=100";
        let req = {
          query:{
            "project":this.projectId
          }
        }
        postData(this,url,req,(data)=>{
          let blocks = data;
          blocks = blocks.map((item) => {
            item.ownerName = this.searchUserInfo(item.owner,"name");
            return item;
          })
          this.blocks = blocks;
        })
      },

      getMyBlocks(assets){
        let arr = assets.filter((v)=>{
          return v.owner == this.myInformation._id;
        })
        return arr;
      },

      owner_Avatar(owner){
        let that =this;
        let info = that.users.find((v)=>{
          if(v._id == owner) return v;
        });
        if(info.avatar && info.avatar!="") {
          return info.avatar;
        }else{
          return false;
        }
      },

      dueDate(dueDate,status){
        let today = this.today;
        let result;
        if(dueDate!=undefined){
          result = new Date(dueDate).getTime();
          if(status !="done" && result < today) return "isDelay";
        }else{
          return;
        }
      },

      notMine(owner){
        if(owner != this.myInformation._id){
          return "notMine";
        }else{
          return "";
        }
      },
      //按钮 显示所有task
      showAll(){
        this.isMine = false;
        this.filterFolder ="";
      },

      //按钮 显示我的task
      showMine(){
        this.isMine = true;
        this.filterFolder ="";
      },


      //拖动看板card 更新数据
      updateBlock: debounce(function (reference_id, status) {
        let that = this;

        let url ="/api/asset/update/"+reference_id+"/of/"+this.projectId;

        let block = this.blocks.find( b => b.reference_id === Number(reference_id));
        let temp = block.status;
        if(block.owner!=that.myInformation._id) {
          alert("对不起，你不是该任务的所有者，没法更改任务状态！");
          block.status = temp;
          console.log(temp)
          // that.fetchData();
          // return false;
        }else{
          block.status = status;

          if(status=="done"){
            block.checked = true;
          }else{
            block.checked = false;
          }
          delete block._id,block.reference_id,block.project;
          block.children=[];
          postData(this,url,block)
        }
      }, 100),

      // 点击树结构的文件夹，找到它的下一层 并在看板中筛选出子文件
      onClick(model) {
        // console.log(model)
        let pid = model.reference_id;
        if(pid =="root"){
          this.filterFolder = "root";
        }else{
          this.filterFolder = pid;
        }
      },

      editItem(item) {
        // this.editedIndex = this.items.indexOf(item);
        this.editedItem = Object.assign({}, item);
        this.editedShow = true;

        this.editedItem.email = this.searchUserInfo(item.owner,"email");
        this.getEditedItemChildren(item);

        this.editedItem.labelDetail = this.getEditedItemLabel(item.owner)

        console.log(this.editedItem);
        console.log("edited")
      },

      //仅用于Card中 Checklist的中项目  查找current子项
      getEditedItemChildren(item){
        // let item =this.editedItem;
        // let target = this.target;
        let target = "task";
        let pid,req;

        if(target === "project"){
          pid = item._id;
          req = {
            'query': {
              'desc': "root"
            }
          }
        }

        else if(target === "task"){
          pid = item.project;
          req={
            'query': {
              'desc': item.reference_id
            }
          }
        }
        let url="/api/asset/find/of/"+ pid +"?limit=200";
        postData(this,url,req,(data)=>{
          let result = data.map((v)=>{
            v.ownerName  =this.searchUserInfo(v.owner,"name");
            return  v;
          })
          this.editedItem.children = result;
          return data;
        })
      },

      getEditedItemMembers(members){
        let arr=[];
        if(members.length !=0){
          for (let i = 0; i < members.length; i++) {
            let memberID = members[i];
            let memberName = this.searchUserInfo(memberID, "name");
            let avater = this.searchUserInfo(memberID, "avater");
            arr[i] = {"_id": memberID, "name": memberName, "avater": avater};
          }
        }
        return arr;
      },

      getEditedItemLabel(owner){
        let that = this;
        //只有一个部门 标签
        let labels = that.myInformation.labels;
        let department = that.myInformation.department;
        let v = labels.find((item)=>{
          let name = item.name.trim().toLowerCase();
          if(name==department){

            return item
          }
        })
        return {
          "name":department.toUpperCase(),
          "color":v.color
        }
      },

      searchUserInfo(id,target){
        let that = this;
        let users = that.users;

        for(let i=0;i<users.length;i++){
          if(id == users[i]._id){
            // console.log(id)
            if(target === "name"){
              // console.log(users[i].name)
              return users[i].name;
            }
            else if(target === "avater"){
              return  users[i].avater;
            }
            else if(target === "email"){
              return  users[i].email;
            }
            else if(target === "label"){

            }
          }
        }
      },

      //用于 树 结构的查找子文件
      childrenIterator(arr,block) {
        arr.map((obj)=>{
          if(obj.reference_id == block.desc){
            if(block.desc!="root"){
              block.children=[];
            }
            obj.children.push(block);
          }else{
            this.childrenIterator(obj.children,block);
          }
        });
        return arr;
      },

      enterGantt(){
        let projectId = this.projectId;
        this.$router.push({ path: `/gantt/${projectId}` }) // -> /gantt/:projectId
      },


      closeDialog(msg){
        this.editedShow = msg;
        console.log(msg)
        console.log("changeshow")
      }
    }

  }
</script>

<style  lang="scss">

  .search{
    width: 60%;
    margin-bottom: 10px;
    float: right;
  }

  .editDialog{
    z-index: 50;
    width:300px;
    padding:0;
  }

  #leaf_card{
    padding:0;
    height: auto;
  }
  .card{
    height: auto;
  }
  .item {
    cursor: pointer;
  }
  .bold {
    font-weight: bold;
  }
  ul {
    padding-left: 1em;
    line-height: 1.5em;
    list-style-type: dot;
  }
  .isDelay{
    border:2px solid red;
  }

  @import './../Kanban/kanban.scss';
  $on-hold: #FB7D44;
  $in-progress: #2A92BF;
  $needs-review: #F4CE46;
  $approved: #00B961;
  * {
    box-sizing: border-box;
  }
  body {
    background: #33363D;
    color: white;
    font-family: 'Lato';
    font-weight: 300;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  .drag-column {
  &-on-hold {
  .drag-column-header,
  .is-moved,
  .drag-options {
    background: $on-hold;
  }
  }
  &-in-progress {
  .drag-column-header,
  .is-moved,
  .drag-options {
    background: $in-progress;
  }
  }
  &-needs-review {
  .drag-column-header,
  .is-moved,
  .drag-options{
    background: $needs-review;
  }
  }
  &-approved {
  .drag-column-header,
  .is-moved,
  .drag-options {
    background: $approved;
  }
  }
  }
  .section {
    padding: 20px;
    text-align: center;
  a {
    color: white;
    text-decoration: none;
    font-weight: 300;
  }
  h4 {
    font-weight: 400;
  a {
    font-weight: 600;
  }
  }
  }
  .header {
    margin: 0px 10px 10px 10px;
}
section .el-button.is-circle {
    position: relative;
    bottom: 10px;
}
.search{
    width:30%;
}
section .el-card__body {
	position:relative;
    padding: 5px;
    min-height: 120px;
}

</style>
