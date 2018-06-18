<!--<template>
	
		<v-layout row style="margin: 10px">
	
			<v-flex xs4 style="float:left;margin-right: 10px">
				<inbox :bigData="bigData" :users="users" :myInformation="myInformation"></inbox>
			</v-flex>
	
			<v-flex xs8>
				<el-card>
					<el-row type="flex" class="row-bg">
	
						<el-col style="margin-left: 20px">
							<h2>项目</h2>
							<el-row v-for="item in bigData" :key="item._id" @click="getSearchProject(item._id,item.name)">
								<el-col>
									<i class="el-icon-view"></i>
								</el-col>
								<el-col>
									<el-row>{{ item.name}}</el-row>
								</el-col>
							</el-row>
						</el-col>
	
						<v-flex xs9>
							<el-row type="flex" class="row-bg">
								<el-col :span="8">
									<el-button type="info" @click="getSearchType('me')"> 我 </el-button>
								</el-col>
								<el-col :span="12">
									<el-button type="info" @click="getSearchType('department')"> 我的部门 </el-button>
								</el-col>
								<el-col :span="8">
									<el-button type="info" @click="getSearchType('all')"> 所有 </el-button>
								</el-col>
							</el-row>
							<v-layout row>
								<v-flex xs12>
									<dashboard ref="child" :myInformation="myInformation" :bigData="bigData" :users="users" style="float:left" :searchID="searchID" :searchType="searchType" :searchName="searchName"></dashboard>
								</v-flex>
							</v-layout>
						</v-flex>
					</el-row>
				</el-card>
	
			</v-flex>
		</v-layout>
	</template>-->
<template>
	<el-row style="margin: 10px">
		<el-col style="width:20%;float:left;margin-right: 10px">
			<inbox :bigData="bigData" :users="users" :myInformation="myInformation"></inbox>
		</el-col>

		<el-col style="width:70%">
			<el-card>
				<el-row type="flex" class="row-bg">

					<el-col style="margin-left: 20px">
						<h2>项目</h2>
						<el-row v-for="item in bigData" :key="item._id">
							<el-button @click="getSearchProject(item._id,item.name)" class="specificbutton">
								<el-col>
									<i class="material-icons">folder</i>
								</el-col>
								<el-col>
									<el-row>{{ item.name}}</el-row>
								</el-col>
							</el-button>
						</el-row>
					</el-col>
					<el-container>
						<el-header>
							<el-col :span="8">
								<el-button type="info" @click="getSearchType('me')"> 我 </el-button>
							</el-col>
							<el-col :span="8">
								<el-button type="info" @click="getSearchType('department')"> 我的部门 </el-button>
							</el-col>
							<el-col :span="8">
								<el-button type="info" @click="getSearchType('all')" style="float:right"> 所有 </el-button>
							</el-col>
						</el-header>
						<el-main>
							<dashboard ref="child" :myInformation="myInformation" :bigData="bigData" :users="users" style="float:left" :searchID="searchID" :searchType="searchType" :searchName="searchName"></dashboard>
						</el-main>
					</el-container>
				</el-row>
			</el-card>
		</el-col>
	</el-row>
</template>
<script>
  import Dashboard from '../Inbox/Dashboard'
  import Inbox from '../Inbox/Inbox'

    export default {
      name: "Home",
      components:{
       "dashboard":Dashboard,
       "inbox":Inbox
      },
      data(){
        return{
          myInformation:{},
          bigData:[],
          items: [
            {
              icon: 'folder_open',
              text: '查看我的项目',
              model: false,
              value: 'projectId',
            },
          ],
          searchID:"",
          searchName:"",
          searchType:"me",
          users:[]
        }
      },
      computed:{

      },
      beforeCreate(){

      },
      created(){

      },
      mounted() {
        let that =this;
        that.myInfo();
        that.getUsers();
        that.fetchData();      	//console.log(myInformation);
      },
      methods:{
      	alert(){
      		console.log("111")
      	},
        myInfo(){
          let url = "api/user/info";
          getData(this,url,(data)=>{
            this.myInformation=data;
          })
        },

        getUsers(){
          let url ="/api/user/all";
          getData(this,url,(data)=>{
            this.users=data;
          })
        },

        fetchData(callback = undefined) {
          //get projects data
          let bigData = [];

          let url_involved = "/api/project/involved";
          let url_member ="/api/project/involved?type=member";
          this.fetchInvolved(url_involved).then((data1)=>{
            bigData.push(...data1);
            this.fetchInvolved(url_member).then((data2)=>{
              bigData.push(...data2);
              let n = bigData.length;
              bigData.forEach((project) => {

                // fetch
                this.fetchAssets(project, () => {
                  n -= 1;
                  if(n===0) {
                    // console.log(bigData);
                    this.bigData = bigData;
                    this.initDashboard();
                  }
                });
              })
            })
          })
        },

        getBigData(url,callback){
          getData(this,url,(data)=>{
            callback(data)
          })
        },

        fetchInvolved(url){

          return new Promise((processBigData)=>{
            this.getBigData(url,(result)=>{
              processBigData(result)
            })
          })
        },

        initDashboard(){

          this.searchID = this.bigData[0]._id;

          this.$refs.child.initData(this.searchID,this.searchType,this.bigData);
        },

        fetchAssets(project, callback){
          // let result = projects.map((project)=>{
            let pid = project._id;
            let url = "/api/asset/find/of/"+pid+"?limit=100";
            let req={
              query:{
                "project":pid
              }
            }
            postData(this,url,req,(data)=>{
              project.assets = data;
              if(callback) {
                callback()
              }
            })
          // })
        },

        getSearchProject(id,name){

          this.searchID = id;
          this.searchName = name;

          this.$refs.child.initData(this.searchID,this.searchType,this.bigData);
        },

        getSearchType(type){
          this.searchType = type;
          this.$refs.child.initData(this.searchID,this.searchType,this.bigData);
        }


      }
    }
</script>

<style scoped>
.specificbutton{
    width: 100px;
    padding: 0;
    border:0;
    margin-right: 20px;
    height: 50px;
}
.el-col-24 {
    width: 25%;
    font-size: 18px;
}
</style>
