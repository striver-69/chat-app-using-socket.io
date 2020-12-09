const socket=io()

//server(emit)-->client(receive)--acknowledgement-->server
//client(emit)-->server(receive)--acknowledgement-->client

const $messageform=document.querySelector('#message-form')
const $messageFormInput=document.querySelector('input')
const $messageFormButton=document.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//options
const obj=Qs.parse(location.search,{ignoreQueryPrefix:true})
const autoscroll=()=>{
    //new message element
    const $newmessage=$messages.lastElementChild

    //height of the new message
    const newMessagestyles=getComputedStyle($newmessage)
    const newMessageMargin=parseInt(newMessagestyles.marginBottom)
    const newMessageHeight=$newmessage.offsetHeight+newMessageMargin
    
    //visible height
    const visibleheight=$messages.offsetHeight

    //height of messages container
    const containerheight=$messages.scrollHeight

    //how far have I scrolled
    const scrollOffset=$messages.scrollTop + visibleheight

    if(containerheight-newMessageHeight<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }

}

socket.on('message',(res)=>{
    console.log(res)
    const html=Mustache.render(messageTemplate,{
        username:res.username,
        message:res.text,
        createdAt:moment(res.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})



socket.on('locationMessage',(res)=>{
    console.log(res)
    const html=Mustache.render(locationTemplate,{
        username:res.username,
        locationMessage:res.url,
        createdAt:moment(res.createdAt).format('h:mm a')
     })
     $messages.insertAdjacentHTML('beforeend',html)
     autoscroll()
})

socket.on('Room data',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageform.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    $messageFormInput.focus()
    //disable
    const res={
        obj:obj,
        mess:$messageFormInput.value
    }
    socket.emit("sendMessage",res,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        //enable
        if(error){
            return console.log(error)
        }
        console.log('Message delivered')
    })
    $messageFormInput.value=""

})



$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by ur browser')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        const latitude=position.coords.latitude
        const longitude=position.coords.longitude
        const loc={
            latitude:latitude,
            longitude:longitude
        }
        const res={loc,obj}
        socket.emit("sendlocation",res,(resp)=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log(resp)
        })
    })
})

socket.emit('join',obj,(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})
