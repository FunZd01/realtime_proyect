const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const mysql = require('mysql');
const MySQLEvents = require('@rodrigogs/mysql-events');
const {database} = require('./helpers');
//const path = require('path')

const PORT = process.env.port || 3303;
//instancia de express
const app = express();

//app.use(express.static(path.join(__dirname,'public')))//propositos de prueba se debe BORRAR
//rutas
//home
app.get('/',(req,res)=>{
    res.send({response: 'running...'}).status(200);
});
//requiriendo rutas externas
const new_kiss = require('./routes/new_kiss');
app.use('/new_kiss', new_kiss);

//instancia del server
const server = http.createServer(app);

//middlewares
app.use(cors({
    origin: 'http://localhost:3303',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//definiendo arreglos
let data = Array(0);
let currentData = Array(0);
const io = socketIo(server);
//socket config
io.sockets.on('connection',(socket)=>{
    database.table('newKiss')
    .withFields(['id','info'])
    .sort({id: -1})
    .getAll()
    .then(prods =>{
        data = prods;
        io.sockets.emit('refresh', {prods:[...data]});
    })
    .catch(err => console.log(err));
})

const program = async () =>{
    const connection = mysql.createConnection(
        {
            host: 'localhost',
            user: 'funzd',
            password: 'Mysql123!'
        }
    );
    const instance = new MySQLEvents(connection,{
        startAtEnd: true
    });

    await instance.start();
    
    instance.addTrigger(
        {
            name: 'Monitor all sql statements',
            expresion: 'test.*', //esuchando para test db
            statement: MySQLEvents.STATEMENTS.ALL,
            onEvent: e =>{
                currentData = e.affectedRows;
                
                let newData;

                switch(e.type){
                    case "DELETE":
                        //asignando evento actual
                        newData = currentData[0].before;

                        //encontrando indice de la fila borrada
                        let index = data.findIndex(p=> p.id === newData.id);
                        //si existe sera mayor a -1
                        if (index> -1){
                            data = data.filter(p => p.id !== newData.id)
                            io.sockets.emit('update',{prods:[...data],type: "DELETE"});
                        }else{
                            return;
                        }
                        break;
                    case "UPDATE":
                        newData = currentData[0].after;
                        //encontrando indice de la fila borrada
                        let index2 = data.findIndex(p=> p.id === newData.id);
                        //si existe sera mayor a -1
                        if (index2> -1){
                            data[index2] = newData;
                            io.sockets.emit('update',{prods:[...data],type: "UPDATE"});
                        }else{
                            return;
                        }
                        break;
                    case "INSERT":
                        database.table('newKiss')
                        .withFields(['id','info'])
                        .sort({id: -1})
                        .getAll()
                        .then(prods =>{
                            data = prods;
                            io.sockets.emit('refresh', {prods:[...data]});
                        })
                        .catch(err => console.log(err));
                        break
                    default:
                        break;
                }
            }
        }
    );
    instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
    instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
};
program().then();

//running server
server.listen(PORT, ()=>{
    console.log("running server on ", PORT);
})
