<template>
	<el-row>
		<el-collapse>
			<el-collapse-item title="收件箱">
				<div v-if="notifications.length==0">
					<el-tag type="info">暂无新消息</el-tag>
				</div>
				<div else v-for="(item,index) in notifications" :key="index">
					<el-card class="box-card">
						<el-checkbox v-model="item.is_read" @click="markRead(item)">
						</el-checkbox>
						<div class="email">
							<ul>
								<li>
									<h4>{{item.header}}</h4></li>
								<li>
									<div class="content">{{item.content}}</div>
								</li>
								<li>{{ item.date |format_Date}}</li>
							</ul>
						</div>
					</el-card>
				</div>
			</el-collapse-item>
			<el-collapse-item title="正在进行中">
				<div v-for="(item,index) in filterProgress" :key="index">
					<el-collapse-item>
						<template slot="title">
							<div>
								{{item.name}}</div>
						</template>
						<div v-for="(list,subindex) in item.data" :key="subindex">
							<el-card>{{list.name}}</el-card>
						</div>
					</el-collapse-item>
				</div>
			</el-collapse-item>
		</el-collapse>
	</el-row>
</template>

<script>
    import {formatDate2} from '../../utils/date'
    export default {
      name: "Inbox",
      props:{
        bigData:{
          type:Array,
        },
        users:{
          type:Array,
        },
        myInformation:{
          type:Object
        }
      },
      data(){
          return{
            page:1,
            notifications:[]


          }
      },

      filters: {
        format_Date(time) {
          return formatDate2(time);
        },

        format_Name(name){

        }
      },
      mounted(){
        let that = this;
        that.getNotifications();
      },
      computed:{
        //正在进行的项目
        filterProgress(){

          let length = this.bigData.length;
          let result=[];
          if(length>0){
            for(let i =0;i<length;i++) {
              let item = this.bigData[i];
              let progressData = [];
              progressData = item.assets.filter((v) => {
                if (v.status === "progress" && v.owner == this.myInformation._id) {
                    return v;
                  }
                })
              result[i]={
                "name":item.name,
                "_id":item._id,
                "data":progressData
              }
            }
          }

          return result;
        }

      },
      methods:{

        getNotifications(){
          let url = "/api/notification/find";
          let req ={
            "to":this.myInformation._id,
            "is_read":false
          };
          postData(this,url,req,(data)=>{
            console.log("get",data)
            this.notifications = data;
          })

        },
        markRead(item){
          console.log(item)

          let id = [item._id]
          let url ="/api/notification/read";

          postData(this,url,id,()=>{
            this.getNotifications();
            console.log("success")
          })


        }

      }
    }
</script>

<style scoped>
.content{
	width:160px;
	word-break: break-all;
}
ul{
	list-style-type:none;
	}
.box-card[data-v-866acca0] {
    height: auto;
    padding: 10px 10px 0 10px;
}
.email{
	position:relative;
	left:30px;
	top:-25px;
	width:160px;
}
</style>
