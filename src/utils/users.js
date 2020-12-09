const users=[]
//add user,remove user,get user,get user in room
const addUser=({id, username,room})=>{
    //clean data
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //validat edata
    if(!username||!room){
        return {
            error:'Username and room are required'
        }
    }
    //check for existing users
    const existingUser=users.find((user)=>{
        return user.room===room && user.username === username
    })

    //validate username
    if(existingUser){
        return {
            error:'Username is in use'
        }
    }

    //store user
    const user={id,username,room}
    users.push(user)
    return {
        users
    }
}

const removeuser=(id)=>{
    const index=users.findIndex((user)=>{
        return user.id === id
    })
    if(index!==-1){
        return users.splice(index,1)[0]
    }
}

const getUsers=(id)=>{
    if(!id){
        return undefined
    }
    const user=users.find((user)=>{
        return user.id === id
    })
    return user
}

const getUsersInRoom=(room)=>{
    if(!room){
        return []
    }
    room=room.trim()
    const Users=users.filter((user)=>{
        return user.room === room
    })
    return Users
}

module.exports={
    addUser,
    removeuser,
    getUsers,
    getUsersInRoom
}