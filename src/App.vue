<template>
<v-app id="inspire">
  <v-navigation-drawer
    fixed
    clipped
    app
    v-model="drawer"
  >
    <el-menu theme="dark" router>
      <el-menu-item index="/">
      	<i class="material-icons">
          dashboard</i>&nbsp;主页</el-menu-item>
      <el-menu-item index="/projects">
      	<i class="material-icons">
          assignment</i>&nbsp;项目</el-menu-item>
      <el-menu-item index="/myspace">
      	<i class="material-icons">
          account_box</i>&nbsp;用户</el-menu-item>
    </el-menu>
    </v-navigation-drawer>
    <div class="headline">
      <el-button type="primary"  circle>
      <i class="material-icons" @click.stop="drawer = !drawer">
        calendar_view_day
      </i></el-button>&nbsp
      <h1>Project Kanban</h1>
      <div class="head">
    	<el-button @click="jumpToHome" circle type="primary">
      	<i class="el-icon-bell" style="transform:scale(1.5);width:30px">
        <el-badge color="red" left style="background-color: rgba(0,0,0,0)">
          <span slot="badge" v-if="noti_num!=0">{{noti_num}}</span>
        </el-badge></i>
      </el-button>
      <div class="avatar">
        <img 
          v-if="myInformation.avatar"
          :src="myInformation.avatar"
          alt=""
        >
        <i class="material-icons" v-else >ccaccount</i></div>
    </div>
  </div>
  <v-content fluid grid-list-md>
    <router-view></router-view>
  </v-content>
</v-app>
</template>

<script>
  export default {

    name: "home",
    data: () => ({
      dialog: false,
      drawer: false,
      items: [
        { icon: 'dashboard', text: 'Home',link:'' },
        { icon: 'assignment', text: 'Projects',link:'projects' },
        { icon: 'account_box', text: 'Account',link:'myspace' },

      ],
      myInformation:{},
      notification:[],
      noti_num:0

    }),
    props: {
      source: String
    },
    mounted(){
      let that = this;
      that.myInfo();
      setInterval(function(){
        that.getNotification();
      },5000)
    },
    methods:{
      myInfo(){
        let url = "api/user/info";

        getData(this,url,(data)=>{
          this.myInformation=data;
        })

      },

      getNotification(){
        let url = "/api/notification/find";
        //此查询不是query式
        let req={
          "is_read":false
        }
        postData(this,url,req,(data)=>{
          this.notification = data;
          this.noti_num = data.length
        })
      },

      jumpToHome(){
        this.$router.push({ path: `/` })
      },

      jumpToRouter(item){
        const link = item.link;
        console.log("link");
        this.$router.push({path:`/${link}`})
      }

    }

  }
</script>

<style scoped>
  *{
    /*vertical-align: middle;*/
  }
  .headline{
  	background-color:#0277BD;
  }
  .head {
    position: absolute;
    top: 5px;
    left:1010px;
}
  .avatar{
  	height:35px;
  	width:35px;
  }
  .el-button--primary {
    color: #fff;
    background-color: #0277BD;
    border-color: #0277BD;
}
h1{
	position:absolute;
	top:10px;
	color:white;
	left:50px;
	font-size: 25px;
}
</style>
