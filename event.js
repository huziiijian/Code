let server;
let shell = require('electron').shell;
function serve(path) {

  if(server) {
    server.close()
  }
  try {
    let certs = require(path);

    let server_path = $("#server-path").val();
    let server_port = $("#server-port").val();
    let app = get_express_server(certs, server_path, 8443);
    let port = $("#port").val();
    port = parseInt(port);
    server = app.listen(port);
    // mainView2("http://localhost:"+port+'/');
    mainView2("http://"+server_path+":"+port+'/');
  } catch(e) {
    alert(e);
  }
}

function mainView2(url) {

  const BrowserWindow = require('electron').remote.BrowserWindow;

  var win = new BrowserWindow({  width: 800, height: 600, show: false });
  win.on('closed', function() {
    win = null;
  });

  win.loadURL(url);
  win.show();
}

$(document).ready(()=>{
    let path2 = localStorage.getItem('path');
    let server_path2 =localStorage.getItem('server-path');
    let server_port2 =localStorage.getItem('server-port');
    let port2 =localStorage.getItem('port');
    console.log(server_path2)
    if(path2) {
      $("#user-file-path").val(path2);
    }
    if(server_path2) {
      $("#server-path").val(server_path2);
    }
    if(server_port2) {
      $("#server-port").val(server_port2);
    }
    if(port2) {
      $("#port").val(port2);
    }

    $("#user-file").change(() => {
      let files = $("#user-file").prop('files');
        if(files.length !== 0) {
            $("#user-file-path").val(files[0].path)
        }
    });

    $("#open-user-file").click(()=>{
        $("#user-file").click()
    });

    $('#serve').click(()=>{
        let path = $("#user-file-path").val();
        let server_path = $("#server-path").val();
        let server_port = $("#server-port").val();
        let port = $("#port").val();
        localStorage.setItem('path', path);
        localStorage.setItem('server-path', server_path);
        localStorage.setItem('server-port', server_port);
        localStorage.setItem('port', port);
        if(!path) {
            alert('请选择身份验证文件');
            return
        }
        if(!server_path){
            alert('请输入服务器地址');
            return
        }
        if(!server_port){
          alert('请输入服务器地址');
          return
        }
        if(!port){
          alert('请输入端口号');
          return
        }
        serve(path)
      $('#serve').attr("disabled",true);
    });

    $("#stop").click(() => {
      console.log(server)
        if(server) {
            server.close();
            server = undefined
        }
      $('#serve').attr("disabled",false);

    });

    // $("#open-link").click(() => {
    //     if(!server) {
    //         alert('please launch the server');
    //         return
    //     }
    //     let port = $("#port").val();
    //     // window.open("http://localhost:"+port+'/api/user/info')
    //     mainView2("http://localhost:"+port+'/')
    // });
    // $("#open-extra").click(() => {
    //     if(!server) {
    //         alert('please launch the server');
    //         return
    //     }
    //     let port = $("#port").val();
    //     shell.openExternal("http://localhost:"+port+'/api/user/info')
    // });



});
