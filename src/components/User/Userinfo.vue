<template lang="html">
	<el-container class="userInfo">
		<el-form>
			<el-card>
					<el-container>
						<el-header>
							<h2>用户信息</h2></el-header>
						<el-row type="flex" class="row-bg">
							<el-row>
								<el-col :span="24" >
									<el-input placeholder="您的姓名" name="name" label="User Name" value="user.name" v-model="user.name">
									</el-input>
								</el-col>
								<el-col :span="24">
									<el-input placeholder="您的邮箱" name="email" type="email" label="Email" v-model="user.email">
									</el-input>
								</el-col>
								<el-col :span="24">
									<el-select v-model="user.sex" placeholder="请选择对应性别">
										<el-option v-for="item in sexOption" :key="item.value" :label="item.label" :value="item.value">
										</el-option>
									</el-select>
								</el-col>
								<el-col :span="24">
									<el-input placeholder="您的部门" name="department" label="Department" value="user.department" v-model="user.department ">
									</el-input>
								</el-col>
								<el-col :span="24">
									<el-input placeholder="您的电话" name="phone" label="Phone" value="Input text" v-model="user.phone">
									</el-input>
								</el-col>
							</el-row>
							<el-row>
								<el-upload class="upload-demo" drag>
									<i class="el-icon-upload"></i>
									<div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
									<div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
								</el-upload>
							</el-row>
							<!--这里的action逻辑并没有改！！！！！！！！！-->
							
							
							
							              <v-layout row wrap justify-center>
                <v-flex xs12>
                  <inputFile v-model="file" accept="image/*" :imgSrc="user.avatar" @onChange="fileChange"></inputFile>
                  <v-btn color="primary"
                         class="white--text"
                         @click="uploadAvatar"

                  >
                  确认上传
                  <v-icon right dark>cloud_upload</v-icon></v-btn>
                </v-flex>
              </v-layout>
              
              
              
						</el-row>
						<el-footer>
							<el-row  type="flex" class="row-bg" justify="space-around">
								<el-col :span="2" >
									<el-button type="primary" v-on:click="onSave">保存</el-button>
								</el-col>
								<el-col :span="2" >
									<el-button type="info" v-on:click="cancel">关闭</el-button>
								</el-col>
							</el-row>
						</el-footer>
					</el-container>
			</el-card>
		</el-form>
	</el-container>
</template>
<!--</v-layout>-->
<!--</v-flex>  -->
<!--<v-flex xs12>
                  <v-text-field name="email" type="email" label="Email"  v-model="user.email"
                                class="input-group testt" required disabled></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-select name="sex" label="Sex" v-model="user.sex" 
                            :items="sexOption" class="input-group" required disabled></v-select>
                </v-flex>

                <v-flex xs12>
                  <v-text-field name="department" label="Department" value="user.department" v-model="user.department " class="input-group" required disabled></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field name="phone"  label="Phone" value="Input text" v-model="user.phone" class="input-group"></v-text-field>
                </v-flex>-->

<!--<v-flex xs6>
              <v-layout row wrap justify-center>
                <v-flex xs12>
                  <inputFile v-model="file" accept="image/*" :imgSrc="user.avatar" @onChange="fileChange"></inputFile>
                  <v-btn color="primary"
                         class="white--text"
                         @click="uploadAvatar"

                  >
                  确认上传
                  <v-icon right dark>cloud_upload</v-icon></v-btn>
                </v-flex>
              </v-layout>
             </v-flex>

<!--</v-layout>-->

<!--<v-layout row justify-center>
            <v-flex xs6>
              <v-btn v-on:click="cancel">Cancel</v-btn>
            </v-flex>
            <v-flex xs6>
                <v-btn class="primary" v-on:click="onSave">Save</v-btn>
            </v-flex>
         </v-layout>-->
<script>
    import InputFile from './InputFile'
    export default {
      name: "userinfo",
      components:{
        'inputFile': InputFile
      },
      data () {
        return {
          user:{
            email:"",
            name:"",
            sex:"",
            department:"",
            phone:"",
            avatar:""
          },

          sexOption:[
            {value:"1",label:"male"},
            {value:"2",label:"female"}
          ],
          file:'',
          maxSize:5120000,
          thumbnail : null,
          progress : 0 //上传进度


        }
      },
      created() {
        this.fetchData();
      },

      methods:{
        fetchData() {
          getData(this,'/api/user/info',(data)=>{
            this.user = data;
          })

        },
        onSave() {
          let user = this.user;
          console.log(this.user);
          delete user._id;
          postData(this,'/api/user/update',user)
          alert("保存成功！")

        },
        cancel(){
          console.log("cancel it");
          window.location.reload(true);
        },
        fileChange(file, name) {
          console.log('File:', file);
          console.log('FileName:', name);
          this.file=file;
        },
        uploadAvatar(){
          let file = this.file;
          console.log("upload",file)
          if(file.length==0) return alert("您还未选择头像文件");
          let url = '/api/user/avatar/upload';

          // if (file) {
          //   if (file.size>this.maxSize) {
          //     //todo filter file
          //     return alert('请选择小于5MB的图片');
          //   }
            //filter file, 文件大小,类型等过滤
            //如果是图片文件
            // const reader = new FileReader()
            // const imageUrl = reader.readAsDataURL(file)
            // img.src = imageUrl //在预览区域插入图片

          let formData = new FormData();

          formData.append('Content-Type', 'multipart/form-data')
          formData.append('avatar_file', file)
          formData.append('avatar_filename', file.name)

         postData(this,url,formData,(data)=>{
           if(data==null){
             let info={
               "avatar":"/api/user/avatar/"+this.user._id
             }
             postData(this,"/api/user/update",info,()=>{
               this.fetchData();
             })
           }
         })
        },

      }
    }
</script>

<style scoped>
   .el-select .el-input {
    left: 0;
}
  .userInfo{
    height: 100%;
  }
  .el-col-24 {
    width: 100%;
    margin-bottom: 35px;
}
.el-select {
    width:100%;
}
.upload-demo{
    margin-left: 20px;
}
.el-input{
	position:static;
}

</style>
