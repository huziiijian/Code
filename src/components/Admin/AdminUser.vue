<template>
  <v-container fluid class="adminContainer">
    <v-dialog v-model="dialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">Eidt User</span>
              </v-card-title>
              <v-card-text>
                <v-container grid-list-md>
                  <v-layout wrap>
                    <v-flex xs12>
                      <label>User Email: {{editedItem.email}}</label>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field label="Name" v-model="editedItem.name"></v-text-field>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-select label="Department" v-model="editedItem.department" :items="departments"></v-select>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-select label="Sex" v-model="editedItem.sex" :items="sexOption"></v-select>
                    </v-flex>
                    <v-flex xs12 md6>
                      <v-text-field label="Phone" v-model="editedItem.phone"></v-text-field>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" flat @click.native="close">Cancel</v-btn>
                <v-btn color="blue darken-1" flat @click.native="save">Save</v-btn>
              </v-card-actions>
            </v-card>
    </v-dialog>
      <v-card>
        <v-card-title>
          <h2>Admin User</h2>
          <v-spacer></v-spacer>
          <v-text-field
            append-icon="search"
            label="Search"
            single-line
            hide-details
            v-model="search"
          ></v-text-field>
        </v-card-title>
        <v-data-table
          :headers="headers"
          :items="items"
          :search="search"
        >
          <template slot="items" slot-scope="props">
            <td>{{ props.item.email }}</td>
            <td class="text-xs-right">{{ props.item.name }}</td>
            <td class="text-xs-right">{{ props.item.department }}</td>
            <td class="text-xs-right">{{ props.item.sex }}</td>
            <td class="text-xs-right">{{ props.item.phone }}</td>
            <td class="text-xs-right">{{ props.item.iron }}</td>
            <td class="justify-center layout px-0">
              <v-btn icon class="mx-0" @click="editItem(props.item)">
                <v-icon color="teal">edit</v-icon>
              </v-btn>

            </td>
          </template>
          <template slot="no-data">
            <v-btn color="primary" @click="fetchData">Reset</v-btn>
          </template>
          <v-alert slot="no-results" :value="true" color="error" icon="warning">
            Your search for "{{ search }}" found no results.
          </v-alert>
        </v-data-table>
      </v-card>
  </v-container>
</template>

<script>
  export default {
    data () {
      return {
        search: '',
        dialog: false,
        headers: [
          {
            text: 'Email Address',
            align: 'left',
            value: 'email'
          },
          {text: 'Name', value: 'name'},
          {text: 'Department', value: 'department'},
          {text: 'Sex', value: 'sex'},
          {text: 'Phone', value: 'phone'},
          {text: 'Actions', value: 'name', sortable: false}
        ],
        items: [],
        departments:[
          "Sales",
          "Finance",
        ],
        sexOption:[
          "male",
          "female"
        ],
        editedIndex: -1,
        editedItem: {

        },
        defaultItem: {

        }
      }
    },

    computed: {

    },

    watch: {
      dialog (val) {
        val || this.close()
      }
    },

    created() {

      this.fetchData();


    },

    methods:{
      fetchData() {

        this.$http.get('/api/user/all').then(response => {
          // get body data
          this.items = response.data.data;
          // console.log(this.items);
        }, error=> {
          // error callback
          this.notify(error)
        });

      },

      editItem (item) {
        this.editedIndex = this.items.indexOf(item)
        this.editedItem = Object.assign({}, item)
        // console.log(this.editedItem);
        this.dialog = true
      },

      // deleteItem (item) {
      //   const index = this.items.indexOf(item)
      //   confirm('Are you sure you want to delete this item?') && this.items.splice(index, 1)
      // },

      close () {
        this.dialog = false
        setTimeout(() => {
          this.editedItem = Object.assign({}, this.defaultItem)
          this.editedIndex = -1
        }, 300)
      },

      save () {

        if (this.editedIndex > -1) {
          Object.assign(this.items[this.editedIndex], this.editedItem)

          let uid=this.items[this.editedIndex].uid;
          let item=this.items[this.editedIndex];

          this.$http.post('/api/user/modify/'+uid,
            {
              headers:{
                'Content-type':'application/vnd.api+json',
              },
              body: item
            }).then(response => {
            console.log(this.items[this.editedIndex]);
            if(response.data.code != 0) {
              this.notify(response.data.error);
            }
          }, error => {
            this.notify(error)
          });
        } else {
          this.items.push(this.editedItem)
        }
        this.close()
      }
    }
  }
</script>

<style scoped>
.adminContainer{
  margin: 0 auto;
}
</style>
