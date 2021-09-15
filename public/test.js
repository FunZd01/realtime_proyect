const socketIo = io()

socketIo.emit('data',({
    id: 5,
    name: 'funzd'
}))

socketIo.on('data',(data)=>{
    console.log(data.id,'    ', data.name)
})
