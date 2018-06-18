export function formatUser(users,id,target) {

  let info = users.find((v)=>{
    return v._id ==id
  })

  if(target == "name"){
    // console.log(users[i].name)
    return info.name;
  }
  else if(target == "avater"){
    return  info.avater;
  }
  else if(target == "department"){
    return  info.department;
  }
  else if(target == "email"){
    return  info.email;
  }

};
