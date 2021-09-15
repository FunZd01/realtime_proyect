const express = require('express');
const router = express.Router();

//ingreso de datos
router.post('/',(req,res)=>{
    console.log('inside new_kiss!!');
  let socket_id = [];
   const io = req.app.get('socketio');
//conexion
io.on('connection',(socket)=>{
    console.log('nuevo cliente conectado ',socket.id);
    //desconexion
    socket.on("disconnect", () => {
    console.log('cliente ', socket.id, ' desconectado!!')
    });
})

    io.on('new_kiss', (socket) => {
        socket_id.Push(socket.id);
          if (socket_id[0] === socket.id) {
            io.removeAllListeners('connection'); 
          }

       console.log('conectado a socketio'); 
   });
    console.log('conection failed!');
})

module.exports = router;
