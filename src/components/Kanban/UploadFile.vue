<template>
  <div class="img-list">
      <form id="form1" enctype="multipart/form-data">
      <el-upload
        class="upload-demo"
        ref="upload"
        :show-file-list="false"
        action=""
        :http-request="uploadFile"
        :on-progress="uploadOnProgress"
        >
        <el-button size="small" type="primary" :disabled="disabled">点击上传</el-button>
      </el-upload>
      </form>
    <el-table
      :data="filelist"
      style="width: 100%">
      <el-table-column
        label="文件名"
        width="180">
        <template slot-scope="scope">
          <i class="el-icon-document"></i>
          <span style="margin-left: 10px">{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="download(scope.row._id)">
            下载</el-button>
          <!--<a :href="'/api/attachment/download/'+scope.row._id+'/of/'+projectId" target="_blank">下载</a>-->
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)"
            :disabled="disabled">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="!pass && progress !== 0" class="img-content img-progress">
      <el-progress type="circle" :percentage="progress" :status="proStatus"></el-progress>
    </div>
    <iframe id="my_iframe" style="display:none;"></iframe>

  </div>
</template>

<script>
  export default{
    name: 'upload-list',
    props:['files','projectId','ref_id','target','disabled'],
    data(){
      return {
        progress: 0,//上传进度
        pass: null,//是否上传成功
        filelist:[],
        params: {
          action: '',
          data:null
        },
        ended:true
      }
    },
    watch: {
      files(value) {
        this.filelist = value;
      }
    },
    computed: {
      proStatus(){//上传状态
        if(this.pass){
          return 'success'
        }else if(this.pass == false){
          return 'exception'
        }else{
          return ''
        }
      },

    },
    mounted(){
    },
    methods: {
      fetchData(){
        let url = "/api/attachment/show/of/project/"+this.projectId;

        getData(this,url,(data)=>{
          console.log("file",data)
          // this.filelist = data;
        })
      },

      uploadFile(_file){
        let that  =this;
        let url = "/api/attachment/upload/to/" + that.projectId;
        let file = _file.file;
        let filename,type,length;
        console.log(file);

        if (file) {
           filename = file.name;
           type = file.type;
           length = file.size;
        }
        let fd = new FormData();
        fd.append("file",file);

        var xhr = new XMLHttpRequest;

        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4 && xhr.status == 200) {
            console.log(xhr.responseText);
            let response = eval('('+ xhr.responseText +')');
            if(response.code!=0){
              this.$message.error("上传失败");
              return;
            }
            let file_id = response.data;
            console.log(file_id)
            that.uploadOnSuccess(filename, file_id);
          }
        }

        xhr.open("POST", url, false);
        // xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded;charset=utf-8');
        xhr.setRequestHeader("file_type",type);
        xhr.setRequestHeader("file_name",that.stringToByte(filename));
        xhr.setRequestHeader("X-File-Length",length);

        xhr.send(fd);
      },
        /*文件中文名不能直接上传
        * 需要进行转换byteString类型文件名
        * */
       stringToByte(str) {
        var bytes = new Array();
        var len, c;
        len = str.length;
        for(var i = 0; i < len; i++) {
          c = str.charCodeAt(i);
          if(c >= 0x010000 && c <= 0x10FFFF) {
            bytes.push(((c >> 18) & 0x07) | 0xF0);
            bytes.push(((c >> 12) & 0x3F) | 0x80);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
          } else if(c >= 0x000800 && c <= 0x00FFFF) {
            bytes.push(((c >> 12) & 0x0F) | 0xE0);
            bytes.push(((c >> 6) & 0x3F) | 0x80);
            bytes.push((c & 0x3F) | 0x80);
          } else if(c >= 0x000080 && c <= 0x0007FF) {
            bytes.push(((c >> 6) & 0x1F) | 0xC0);
            bytes.push((c & 0x3F) | 0x80);
          } else {
            bytes.push(c & 0xFF);
          }
        }
        return bytes;
      },

      uploadOnProgress(e,file){//开始上传
        console.log("percent",e.percent,file)
        this.progress = Math.floor(e.percent)

      },

      uploadOnSuccess(filename,file_id){//上传附件
        console.log("——————————success——————————")
        this.pass = true;
        this.$message.success("上传成功")
        console.log(file_id)
        if(!file_id)return;

        this.filelist.push({
          "_id" :file_id,
          "name": filename
        })

        let attachment = {
          "attachment":this.filelist
        }
        this.updateInAssets(attachment)

      },

      updateInAssets(data){
        let url_update;

        if(this.target =="project"){
          url_update = "/api/project/"+this.projectId+"/update";

        }
        else if(this.target =="task"){
          url_update = "/api/asset/update/"+this.ref_id+"/of/"+this.projectId;
        }

        postData(this,url_update,data)
      },

      uploadOnError(error){
        console.log("——————————error——————————")
        // console.log(e)
        this.pass = false;
        this.$message.error(error);
      },

      handleDelete(index,file){//删除
        if(!file._id){
          return false;
        }
        let that = this;
        this.$confirm('是否删除此附件？','提示',{
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //可添加ajax
          this.$message.success("删除成功")
          this.$message({
            type: 'success',
            message: '删除成功',
            onClose: () => {
              that.filelist.splice(index,1)

              let url_del = "/api/attachment/delete/"+file._id;
              let id = {
                "_id":file._id

              }

              postData(this,url_del,id,()=>{
                console.log("delete")
              })
              this.updateInAssets(that.filelist)

            }
          })
        }).catch((meg) => console.log(meg))
      },


      // handleDownload(index,file){
      //   let obj_id = file._id;
      //   let url = "/api/attachment/download/"+obj_id+"/of/"+this.projectId;
      //
      //   this.$http.get(url).then(response => {
      //     console.log("success",response)
      //     // this.download(response)
      //
      //   }, error => {
      //     console.log(error)
      //   });
      // },

      download (_id) {
        if (!_id) {
          return;
        }else{
          document.getElementById("my_iframe").src="/api/attachment/download/"+_id+'/of/'+this.projectId;
        }
      }
    }
  }
</script>

<style>
  *{
    box-sizing: border-box;
  }
  .img-list{
    overflow:hidden;
    width:100%;
  }
  .img-list .img-content{
    float:left;
    text-align:left;
    position:relative;
    display:inline-block;
    width:200px;
    height:270px;
    padding:5px;
    margin:20px;
    border:1px solid #d1dbe5;
    border-radius:4px;
    transition:all .3s;
    box-shadow:0 2px 4px 0 rgba(0,0,0,.12), 0 0 6px 0 rgba(0,0,0,.04);
  }
  .img-list .img-upload{
    float:left;
    width:200px;
    height:270px;
    display:table;
    text-align:center;
  }
  .img-list .uploader{
    width:100%;
    display:table-cell;
    vertical-align:middle;
  }
  .img-list .img-progress{
    text-align:center;
    padding-top:50px;
  }
  .img-list .img-content img{
    display:block;
    width:100%;
    height:190px;
    margin:0 auto;
    border-radius:4px;
  }
  .img-list .img-content .name{
    margin-top:10px;
  }
  .img-list .img-content .name>div{
    width:90%;
    text-overflow:ellipsis;
    overflow:hidden;
    height:25px;
    line-height:25px;
  }
  .img-list .img-content:hover .del,
  .img-list .img-content:hover .layer{
    opacity:1;
  }
  .img-list .img-content .del,
  .img-list .img-content .layer{
    opacity:0;
    transition:all .3s;
  }
  .img-list .img-content .del{
    position:absolute;
    bottom:10px;
    right:10px;
    color:#8492a6;
    cursor:pointer;
    font-size:1.1em;
  }
  .img-list .img-content .layer{
    position:absolute;
    left:0;
    right:0;
    top:0;
    height:200px;
    color:#fff;
    text-align:center;
    z-index:5;
    background-color:rgba(0,0,0,.4);
  }
  .img-list .img-content .layer i{
    font-size:1.6em;
    margin-top:80px;
  }

  .burst{
    background-image: url("../../assets/logo.png");
  }
  a {
    cursor:pointor;
  }
  a:link {
    text-decoration: none;
  }
  a:visited {
    text-decoration: none;
  }
  a:hover {
    text-decoration: none;
  }
  a:active {
    text-decoration: none;
  }
</style>
