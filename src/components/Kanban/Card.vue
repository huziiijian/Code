<template>
	<el-card > 
		<el-dialog max-width="500px" :visible.sync="ownerDialog" title="更换负责人">
				<el-select v-model="newOwner" placeholder="请选择负责人">
                    <el-option v-for="item in users" :key="item.name" :value="item.name"></el-option>
                </el-select>
				<el-main style="padding-bottom:0">
					<el-button color="primary"  @click.stop="ownerDialog=false">关闭</el-button>
					<el-button color="primary" type="primary" @click.stop="changeOwner">提交</el-button>
				</el-main>
		</el-dialog>
		<div class="title">
			<el-button @click="closeDialog()" class="btnn">
				<i class="material-icons" style="color:white">close</i>
			</el-button>
			<input v-model="editedItem.name" :disabled="disable" style="font-size: 20px;border-bottom: 2px dotted;color:white" />
			<div class="title-btn">
				<el-button @click="judgeIsOwner() " v-if="disable" class="btnn"><i class="material-icons" style="color:white">edit</i></el-button>
				<el-button @click="onSave(editedItem)" v-if="!disable" class="btnn"><i class="material-icons" style="color:white">save</i></el-button>
				<el-dropdown trigger="click">
					<span class="el-dropdown-link">
                    <i class="material-icons" >more_vert</i>
                    </span>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item><p @click="ownerDialog=true">更换负责人</p></el-dropdown-item>
						<el-dropdown-item><p @click="deleteTask(editedItem)">删除</p></el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</div>
		</div>
		<el-card>
			<el-row type="flex" class="row-bg" justify="space-around">
				<el-col :span="1">
					<h3>进程:</h3>
				</el-col>
				<el-col :span="15">
					<el-progress :percentage="progress" height="7" :label="progress"> {{progress}}%</el-progress>
				</el-col>
				<el-col :span="1">
					<h3>属于:</h3>
				</el-col>
				<el-col :span="5">
                    <img :src="owner_Avatar(editedItem.owner)">
						<div class="tooltip"> Name:{{editedItem.ownerName}}<br/>
						Email:{{editedItem.email}}</div>
				</el-col>
			</el-row>
			<v-divider></v-divider>
			<el-row>
				<el-col :span="12">
					<div class="subheader">
						<strong>起始日期：</strong>
							<el-date-picker type="date" v-model="editedItem.startDate"
								value-format="yyyy-MM-dd"></el-date-picker>
					</div>
				</el-col>
				<el-col :span="12">
					<div class="subheader">
						<strong>终止日期：</strong>
							<el-date-picker type="date" v-model="editedItem.dueDate"
								value-format="yyyy-MM-dd"></el-date-picker>
					</div>
				</el-col>
			</el-row>
			<el-row v-if="editedItem.members">
				<el-col :span="4"><strong>成员：</strong></el-col>
				<el-col :span="18">
					<el-row>
						<el-col :span="2">
							<el-button circle icon :disabled="disable" @click.stop="addMemberShow = !addMemberShow">
								<i class="material-icons">group_add</i>
							</el-button>
						</el-col>
						<el-col :span="14">
							<el-row>
								<el-col :span="6" v-for="member in  editedItem.membersInfo" :key="member._id">
									<el-tag type="success">
											<img :src="member.avater">
										{{member.name}}
									</el-tag>
								</el-col>
							</el-row>
						</el-col>
					</el-row>
				</el-col>
				<el-dialog :visible.sync="addMemberShow" max-width="500px" height="400px">
							<h3>增加合伙人</h3>
						<v-card-text>
							<v-container fluid>
								<v-layout row wrap>
									<v-flex xs12>
										<v-select label="Select" :items="users" v-model="addingMembers" item-text="name" multiple chips max-height="300px" autocomplete>

											<template slot="selection" slot-scope="data">
												<v-chip @input="data.parent.selectItem(data.item)" :selected="data.selected" :key="JSON.stringify(data.item._id)">
													<v-avatar>
														<img :src="data.item.avatar">
													</v-avatar>
													{{ data.item.name }}
												</v-chip>
											</template>
											<template slot="item" slot-scope="data">
												<template v-if="typeof data.item !== 'object'">
													<v-list-tile-content v-text="data.item"></v-list-tile-content>
												</template>
												<template v-else>
													<v-list-tile-avatar>
														<img :src="data.item.avatar">
													</v-list-tile-avatar>
													<v-list-tile-content>
														<v-list-tile-title v-html="data.item.name"></v-list-tile-title>
													</v-list-tile-content>
												</template>
											</template>
										</v-select>

									</v-flex>
									<v-flex xs12>
										<v-expansion-panel class="elevation-0">
											<v-expansion-panel-content>
												<v-spacer/>
												<div slot="header">
													<v-btn flat>Advanced</v-btn>
												</div>
												<v-card>
													<v-list>
														<v-list-tile v-for="(member,index) in editedItem.membersInfo" :key="index">
															<v-list-tile-avatar>
																<img :src="member.avatar">
															</v-list-tile-avatar>

															<v-list-tile-title>{{member.name}}</v-list-tile-title>
															<v-list-tile-action>
																<v-btn icon ripple @click="deleteMember(member,index)"><i class="material-icons" color="red">delete</i></v-btn>
															</v-list-tile-action>
														</v-list-tile>
													</v-list>
												</v-card>
											</v-expansion-panel-content>
										</v-expansion-panel>
									</v-flex>
								</v-layout>
							</v-container>
						</v-card-text>
						<v-card-actions>
							<v-btn color="primary" flat @click.stop="addMemberShow=false">Close</v-btn>
							<v-spacer/>
							<v-btn color="primary" flat @click="addMembers">Send</v-btn>
						</v-card-actions>
				</el-dialog>
			</el-row>

			<el-row>
				<el-col :span="4">
					<h4>标签</h4>
				</el-col>
				<el-col :span="18">
					<el-row>
						<el-col :span="16">
							<el-tag :color="editedItem.labelDetail.color" v-if="editedItem.labelDetail">{{editedItem.labelDetail.name}}</el-tag>
						</el-col >
					</el-row>
				</el-col>
			</el-row>

			<el-row v-if="target==='project'">
				<el-col :span="4">
					<h4>项目代码</h4>
				</el-col>
				<el-col :span="18">
					<el-input v-model="editedItem.code" :disabled="disable" />
				</el-col>
				<el-col :span="4">
					<h4>客户</h4>
				</el-col>
				<el-col :span="18">
					<el-input v-model="editedItem.client" :disabled="disable" />
				</el-col><br>
				<el-col :span="4">
						<h4>Part Number</h4>
						<el-popover placement="right-end" width="200" trigger="click">
							<el-button size="mini" slot="reference" circle>
								<i class="material-icons">
                                info
                                </i>
							</el-button>
								<h4 style="margin-bottom: 20px;">零件号历史记录</h4>
									<ul v-for="(history,index) in editedItem.history_pn" :key="index">
											<li>
												<h4>V{{index}}:{{history.partNumber}}</h4>
											</li>
											<li>
												<p>{{history.date | formatDate}}</p>
											</li>
									</ul>
						</el-popover>
				</el-col>
				<el-col :span="8">
					<el-input type="textarea":rows="2" name="partNumber" v-model="editedItem.partNumber" :disabled="disable" />
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="4">
				<h4>描述</h4>
				</el-col>
				<el-col :span="18">
					<el-input  type="textarea" :rows="8" name="description" v-model="editedItem.description" multi-line textarea :disabled="disable" />
				</el-col>
			</el-row>

			<v-layout row wrap>
				<v-flex xs12 sm12>
					<v-expansion-panel v-if="editedItem.isLeaf==false || target == 'project' ">
						<v-expansion-panel-content>
							<v-subheader slot="header">Checklist</v-subheader>
							<v-list-tile avatar v-for="(item, i) in editedItem.children" :key="i">
								<v-list-tile-action>
									<v-checkbox v-model="item.checked" :value="item.checked" :disabled="disable"></v-checkbox>
								</v-list-tile-action>
								<v-list-tile-content>
									<v-list-tile-title>{{item.name}}</v-list-tile-title>
									<v-list-tile-sub-title>Assign to :{{item.ownerName}}</v-list-tile-sub-title>
								</v-list-tile-content>
							</v-list-tile>
						</v-expansion-panel-content>
					</v-expansion-panel>

					<v-expansion-panel>
						<v-expansion-panel-content>
							<v-subheader slot="header">Files</v-subheader>
							<upload_file ref="upload_file" :files="editedItem.attachment" :projectId="projectId" :ref_id="ref_id" :target="target" :disabled="disable"></upload_file>
						</v-expansion-panel-content>
					</v-expansion-panel>

					<v-expansion-panel>
						<v-expansion-panel-content>
							<v-subheader slot="header">Comments History</v-subheader>
							<v-list three-line>
								<template v-for="(item, index) in editedItem.history_c">
									<v-list-tile avatar @click="">
										<v-list-tile-avatar>
											<img :src="owner_Avatar(item.owner)">
										</v-list-tile-avatar>
										<v-list-tile-content>
											<v-list-tile-title v-html="item.name"></v-list-tile-title>
											<v-list-tile-sub-title v-html="item.content"></v-list-tile-sub-title>
										</v-list-tile-content>
										<v-list-tile-action>
											<v-list-tile-action-text>{{item.date | formatDate}}</v-list-tile-action-text>
										</v-list-tile-action>
									</v-list-tile>
								</template>
							</v-list>
						</v-expansion-panel-content>
					</v-expansion-panel>
				</v-flex>
			</v-layout>
		</el-card>

		<el-footer style="margin-bottom:10px;">

			<div style="margin-top: 20px">
				<el-input placeholder="请输入留言" v-model="comment">
					<el-button slot="append" icon="el-icon-message" @click="sendCommit"></el-button>
				</el-input>
			</div>

		</el-footer>
	</el-card>
</template>

<script>
  import {formatDate} from '../../utils/date'
  import  UploadFile from './UploadFile'

    export default {
      name: "Card",

      components:{
        'upload_file':UploadFile
      },

      props:{
        editedItem:{
          type:Object
        },
        editedShow:{
          type:Boolean
        },
        users:{
          type:Array
        },
        target:{
          type:String
        },
        myInformation:{
          type:Object
        }

      },

      data(){
        return{
          disable:true,
          progress_value:0,
          ownerDialog:false,
          menu: false,
          newOwner:{},
          addingMembers:[],
          addMemberShow:false,
          oldPartNumber:"",
          pn_menu:false,
          comment:"",
          file:[],
          fileList:[],


        }
      },

      filters: {
        formatDate(time) {
          var date = new Date(time);
          return formatDate(date, "yyyy-MM-dd hh:mm");
        },
      },

      computed:{
        progress(){
          let item = this.editedItem;
          let children = this.editedItem.children;

            if(children && children.length==0 && item.status==="done")return 100;
            if((children && children.length==0 && item.status!="done")||children==undefined)return 0;

            let result =0;
            for (let i = 0; i < children.length; i++) {
              if (children[i].checked == true) {
                result += 1;
              }
            }
            if(children.length==0){
              return 0
            }else{
              return parseInt(result/children.length*100);
            }
          },

        projectId(){
          if(this.target =="project"){
            return this.editedItem._id;
          }
          else if(this.target == "task"){
            return this.editedItem.project
          }
          else{
            return "";
          }
        },

        ref_id(){
          if(this.target == "task"){
            return this.editedItem.reference_id
          }else{
            return "";
          }
        },
      },

      mounted(){
        if(this.target =="project"){
          this.oldPartNumber = this.editedItem.partNumber;
        }
      },

      methods: {

        judgeIsOwner() {
          if (this.myInformation._id != this.editedItem.owner) {
            this.$alert('对不起，你不是该任务所有者，无法进行该操作', '警告', {
              confirmButtonText: '确定',
              callback: action => {
                return;
              }
            });
          } else {
            return this.disable = false;
          }
        },

        owner_Avatar(owner) {
          let that = this;

          let info = that.users.find((v) => {
            if (v._id == owner) return v;
          });
          if (info.avatar != undefined || info.avatar) {
            return info.avatar;
          }
        },

        changeOwner() {
          let newOwner = this.newOwner;
          let target = this.target;
          let url = "";
          if (target == "project") {
            let pid = this.editedItem._id;
            url = "/api/project/" + pid + "/to/" + newOwner._id;
          }
          else if (target == "task") {
            let rid = this.editedItem.reference_id;
            let pid = this.editedItem.project;
            url = "/api/asset/" + rid + "/of/" + pid + "/to/" + newOwner._id;
          }

          let newId = {
            "owner": newOwner._id
          }
          postData(this, url, newId, () => {
            this.$emit('refreshData');
            this.ownerDialog = false;
            let header = "转交任务";
            let content = this.myInformation.name + "把任务<" + this.editedItem.name + ">转交给您了";
            this.sendNotification(newOwner._id, header, content);
            this.closeDialog();
          })
        },

        addMembers() {
          let that = this;

          let pid, url;
          if (this.target == "project") {
            pid = that.editedItem._id
            url = "/api/project/" + pid + "/member/add";
          }

          let membersinfo = that.addingMembers;

          //合并两个数组，去重
          let newMembersInfo = this.uniqueArray(this.editedItem.membersInfo.concat(membersinfo), "_id");

          this.editedItem.membersInfo = newMembersInfo;

          let id = [];
          for (let i = 0; i < newMembersInfo.length; i++) {
            id[i] = newMembersInfo[i]._id;
          }
          postData(this, url, id, () => {
            this.$emit('refreshData');
            this.addingMembers = [];
            this.addMemberShow = false;

          });
        },

        deleteMember(item, index) {
          this.$confirm('是否删除该成员？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            let pid, url;
            let that = this;

            pid = that.editedItem._id;
            url = "/api/project/" + pid + "/member/delete";
            let memberID = [item._id];
            that.editedItem.members.splice(index, 1);
            that.editedItem.membersInfo.splice(index, 1);
            postData(this, url, memberID, () => {
              this.$emit('refreshData');
            })
          }).catch(() => {
            return;
          });
        },

        onSave(item) {
          // this.disable = true;
          let that = this;

          delete item.membersInfo;
          // delete
          item.modifyDateUTC = new Date().getTime();

          let children = item.children;
          item.children = that.saveChildren(children);

          if (that.progress == 100) {
            item.checked = true;
            item.status = "done";
          }

          let pid, rid;

          if (that.target == "project") {
            /*判断当前零件号信息是否已修改，
              若修改，将信息存入历史记录中  history_pn ==history of part number
             */
            let a = that.oldPartNumber;
            let b = item.partNumber;
            console.log(a==b)
            // console.log(that.trim2(that.oldPartNumber));
            // console.log(item.partNumber);
            if (a != b) {
              item.history_pn.push({
                "partNumber": item.partNumber,
                "date": new Date().getTime()
              })
            }

            pid = item._id
            let url = "/api/project/" + pid + "/update";
            delete item._id
            postData(this, url, item, () => {
              this.$emit('refreshData');
            })
          }
          else if (this.target == "task") {
            rid = item.reference_id;
            pid = item.project;
            let url = "/api/asset/update/" + rid + "/of/" + pid;
            delete item._id, item.reference_id, item.project;
            postData(this, url, item, () => {
              this.$emit('refreshData');
            })
          }
          this.disable = true;
          this.closeDialog();
        },
        trim2(str)
        {
          return str.replace(/(^\s*)|(\s*$)/g, '');
        },

        saveChildren(children) {
          let pid, rid, result;
          if (children && children.length > 0) {
            pid = children[0].project;
            for (let i = 0; i < children.length; i++) {

              let child = children[i];
              rid = child.reference_id;

              let url = "/api/asset/update/" + rid + "/of/" + pid;
              if (child.checked == true) {
                result = {
                  "checked": true,
                  "status": "done",
                }
              } else {
                result = {
                  "checked": false,
                }
              }
              postData(this, url, result)
            }
            children = [];
            return children;
          } else {
            return false;
          }
        },

        closeDialog() {
          let editedShow = false;
          let that = this;
          console.log("disable", that.disable);

          if (that.disable == false) {
            this.$confirm('目前在编辑模式中，是否保存修改？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              that.disable = true;
              that.onSave();
              this.$emit('refreshData');
              this.$emit("changeShow", editedShow)
            }).catch(() => {
              that.disable = true;
              this.$emit("changeShow", editedShow)
            });
          }
          else {
            this.$emit("changeShow", editedShow)
          }
        },

        uniqueArray(array, key) {
          let result = [array[0]];
          for (let i = 1; i < array.length; i++) {
            let item = array[i];
            let repeat = false;
            for (let j = 0; j < result.length; j++) {
              if (item[key] == result[j][key]) {
                repeat = true;
                break;
              }
            }
            if (!repeat) {
              result.push(item);
            }
          }
          return result;
        },

        fileChange(file, name) {
          console.log('File:', file);
          console.log('FileName:', name);
        },

        sendCommit() {
          let item = this.editedItem;
          let history_c = this.editedItem.history_c;
          let new_comment = {
            "owner": this.myInformation._id,
            "name": this.myInformation.name,
            "email": this.myInformation.email,
            "content": this.comment,
            "date": new Date().getTime()
          };
          history_c.unshift(new_comment);
          console.log(history_c);
          let data = {
            "history_c": history_c
          }
          this.editedItem.history_c = history_c;

          if (this.target == "project") {
            let pid = item._id;
            let url = "/api/project/" + pid + "/update";

            postData(this, url, data, () => {
              let header = this.myInformation.name + "在项目" + this.editedItem.name + "给您留言了";
              let content = new_comment.content;
              this.comment = "";

              this.sendNotification(this.editedItem.owner, header, content)
              this.comment = "";
              this.$emit('refreshData');
            })
          }
          else if (this.target == "task") {
            let pid = item.project;
            let rid = item.reference_id;

            let url = "/api/asset/update/" + rid + "/of/" + pid;
            postData(this, url, data, () => {
              let header = this.myInformation.name + "在任务" + this.editedItem.name + "中给您留言了";
              let content = new_comment.content;
              this.comment = "";

              this.sendNotification(this.editedItem.owner, header, content)
              this.$emit('refreshData');
            })
          }
        },

        deleteTask(model) {

          let url, t
          if (this.target === "project") {
            url = "/api/project/" + model._id + "/delete";
            t = {
              "_id": model._id
            }

          }
          else if (this.target === "task") {
            url = "/api/asset/delete/" + model.reference_id + "/of/" + model.project;
            t = {
              "reference_id": model.reference_id
            }
          }

          postData(this, url, t, () => {
            this.closeDialog();
          });

        },

        sendNotification(receiver, header, content) {
          let now = new Date().getTime();
          console.log("now" + now);
          let url = "/api/notification/to/" + receiver;

          let notification = {
            "to": receiver,
            "from": this.myInformation._id,
            "project": this.target == "project" ? this.editedItem._id : this.editedItem.project,
            "task": this.target == "project" ? "pj" : this.editedItem.reference_id,
            "header": header,
            "content": content,
            "is_read": false,
            "date": now
          }
          console.log(notification)

          postData(this, url, notification, () => {
            console.log("send")
          })

        },

      }


}
</script>

<style scoped>
	ul
	{list-style-type:none;
	}
	.el-button.is-circle {
    border-radius: 50%;
    padding: 12px;
    border: 0;
}
	.el-tag{
	height:50px;
	}
	.el-col-18{
    margin-top: 20px;
}	.el-col-8 {
    margin-top: 40px;
}
	.el-col-4 {
    margin-top: 30px;
    margin-left: 15px;
}
	.tooltip{
		position:absolute;
		right:0px;
		top:5px;
	}
	img {
    border-style: none;
    width: 45px;
    height: 45px;
    border-radius: 50%;
}
	.el-button--primary {
    position: relative;
    left: 350px;
}
	.subheader{
		padding-top: 20px;
	}
	.title{
		position:relative;
		background-color: #1976D2;
	}
	.title-btn{
		position:absolute;
		right:10px;
		top:0;
	}
	.btnn{
		border:0;
		background-color:#1976D2;
	}
	.el-popper{
    margin-top: 0;
}
	.el-dropdown {
    color: white;
    right: 5px;
}
  .uploader-example {
    width: 95%;
    padding: 15px;
    margin: 15px;
    font-size: 12px;
    box-shadow: 0 0 10px rgba(0, 0, 0, .4);
  }
  .uploader-example .uploader-btn {
    margin-right: 4px;
  }
  .uploader-example .uploader-list {
    max-height: 440px;
    overflow: auto;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .el-footer{
    /*background-color: #6b6b6b;*/
  }
</style>
