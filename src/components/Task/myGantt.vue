<template>
  <div>

    <div class="gantt-container">
      <gantt-header :onPrev="onPrev"
                    :onNext="onNext"
                    :onToday="onToday"></gantt-header>
      <gantt-body :startDate="ganttStart"
                  :endDate="ganttEnd"
                  :showTaskId="showTaskId"
                  :ganttData="ganttData"></gantt-body>

      <div style="position:fixed; bottom:5%; right:0; z-index:10">
        <el-button
          circle
          type="danger"
          @click="backToPre"
        >
          <i class="material-icons">chevron_left</i>
        </el-button>
      </div>

    </div>

  </div>
</template>

<script>
  import ganttHeader from '../Gantt/ganttHeader'
  import ganttBody from '../Gantt/ganttBody'
  import { animationScroll } from '../../utils/animationScroll'
  import { $$ } from '../../utils/dom'
  import moment from 'moment'
  export default {
    name: 'gantt',
    props:['projectId'],
    components: {
      ganttHeader,
      ganttBody,
    },
    data () {
      return {
        ganttStart: this.getGanttDate().start,
        ganttEnd: this.getGanttDate().end,
        T_token: 0,
        timelineSetting: null,
        loading: true,
        ganttData:{}
      }
    },
    computed: {
      showTaskId () {
        // 匹配打开的任务id
        return ''
      },
    },
    methods: {
      initGantt () {
        // 从后端获取数据
        console.log('从后端获取数据')
        let url = "/api/asset/find/of/"+this.projectId;;
        let req = {
          query:{
            "project":this.projectId
          }
        }
        let allData ={};
        allData.data=[];
        allData.data.push({
          "id": this.projectId,
          "text": "项目",
          "progress": 0,
          "open": true,
          "type": "project"
        }),
        postData(this,url,req,(data)=>{
          let tasks = data;

          if(tasks.length > 0){
            for( let index =0 ; index < tasks.length ; index++){
              let item = tasks[index]

              //找到第一层task
              if(item.desc === "root") {

                let a = {
                  "id": "tasklist"+item.reference_id,
                  "text": item.name,
                  "parent": this.projectId,
                  "type": 'tasklist',
                  "open": true,
                }
                allData.data.push(a)
                //插入第一层task转换 --为了显示该事件的时间
                allData.data.push({
                  "id": item.reference_id,
                  "projectId": this.projectId,
                  "text": item.name,
                  "startDate": (item.startDate !="") ? new Date(item.startDate): "",
                  "dueDate": (item.dueDate !="") ? new Date(item.dueDate): "",
                  "start_date": (item.startDate =="")? moment(this.startDate).startOf('day').toDate()
                    : this.getStartDate(item.startDate, item.dueDate),
                  "duration": (item.startDate =="") ? 366 : this.getDuration(
                    item.startDate,
                    item.dueDate),
                  "startDueStatus": "",
                  "type": "task",
                  "status": "progress",
                  "progress": 0,
                  "parent": a.id,
                  "real_start_date": "",
                  "real_due_date": "",
                  "label":'#89cc76',
                  "deleted": false
                })

                //找到该task子目录  push到该task的后面
                for(let i=0;i<tasks.length;i++){
                  let task = tasks[i];
                  if(task.desc != item.reference_id){

                    continue;

                  }else{
                    console.log(item.reference_id)
                    let b = {
                      "id": task.reference_id,
                      "projectId": this.projectId,
                      "text": task.name,
                      "startDate": (task.startDate !="") ? new Date(task.startDate): "",
                      "dueDate": (task.dueDate !="") ? new Date(task.dueDate): "",
                      "start_date": (task.startDate =="")? moment(this.startDate).startOf('day').toDate()
                : this.getStartDate(task.startDate, task.dueDate),
                      "duration": (task.startDate =="") ? 366 : this.getDuration(
                              task.startDate,
                              task.dueDate),
                      "startDueStatus": "",
                      "type": "task",
                      "status": "progress",
                      "progress": 0,
                      "parent": a.id,
                      "real_start_date": "",
                      "real_due_date": "",
                      "deleted": false
                    }
                    console.log(b);
                    allData.data.push(b)
                    console.log(allData);
                  }
                }
              }else{
                continue;
              }
            }
          }
        })
        // console.log(allData)
        this.ganttData = allData
      },
      getStartDate (startDateUTC, dueDateUTC) {
        if (startDateUTC) {
          return moment(startDateUTC).format('DD-MM-YYYY')
        } else if (dueDateUTC) {
          return moment(dueDateUTC).format('DD-MM-YYYY')
        }
        return null
      },
      getDuration (startDate, dueDate) {
        if (!startDate || !dueDate) return 1
        // const dateOffset = moment(dueDate).hour() === 0 ? 0 : 1
        const dateOffset = 1
        const duration = moment(moment(dueDate).startOf('day')).diff(moment(startDate).startOf('day'), 'days') + dateOffset
        return duration || 1
      },

      getGanttDate (num) {
        const ganttStart = new Date()
        const ganttEnd = new Date()
        let start,
          end
        if (num) {
          start = ganttStart.setMonth(ganttStart.getMonth() - 6 - (11 * num))
          end = ganttEnd.setMonth(ganttEnd.getMonth() + (6 - (11 * num)))
        } else {
          start = ganttStart.setMonth(ganttStart.getMonth() - 6)
          end = ganttEnd.setMonth(ganttEnd.getMonth() + 6)
        }
        this.ganttStart = start
        this.ganttEnd = end
        return {
          start,
          end
        }
      },
      onPrevYear () {
        this.T_token += 1
        this.getGanttDate(this.T_token)
      },
      onNextYear () {
        this.T_token -= 1
        this.getGanttDate(this.T_token)
      },
      onPrev () {
        const ganttScreenWidth = $$('.gantt_task')[0].clientWidth
        const currentPosition = $$('.gantt_task')[0].scrollLeft
        if (currentPosition - ganttScreenWidth > 0) {
          animationScroll({ end: currentPosition - ganttScreenWidth, type: 'scrollLeft', tagName: 'gantt_task', rate: 6 })
        } else {
          this.onPrevYear()
        }
      },
      onNext () {
        const ganttDataWidth = $$('.gantt_data_area')[0].clientWidth
        const ganttScreenWidth = $$('.gantt_task')[0].clientWidth
        const currentPosition = $$('.gantt_task')[0].scrollLeft
        if (currentPosition < (ganttDataWidth - ganttScreenWidth)) {
          animationScroll({ end: currentPosition + ganttScreenWidth, type: 'scrollLeft', tagName: 'gantt_task', rate: 6 })
        } else {
          this.onNextYear()
        }
      },
      onToday () {
        if (this.ganttStart && this.ganttEnd) {
          if (moment().isBetween(this.ganttStart,
            this.ganttEnd)) {
            const todayPosition = $$('.today')[0].offsetLeft
            const screenOffset = 180
            animationScroll({ end: todayPosition - screenOffset, type: 'scrollLeft', tagName: 'gantt_task', rate: 6 })
          } else {
            this.T_token = 0
            this.getGanttDate()
          }
        }
      },

      backToPre (){
        let projectId = this.projectId;
        this.$router.push({ path: `/projects/${projectId}` })
      }
    },

    created () {
      this.initGantt()
      this.$root.$on('task-show', taskId => { window.gantt.selectTask(taskId) })
      this.$root.$on('task-hide', taskId => { window.gantt.unselectTask(taskId) })
    },

    destroyed () {
      this.$root.$off('task-show', () => { window.gantt.selectTask() })
      this.$root.$off('task-hide', () => { window.gantt.unselectTask() })
    },



  }
</script>
<style>

  .gantt-container{
    width: 100%;
  }
  .gantt_task{
    width: 100%;
  }
</style>
