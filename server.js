var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];

app.use(express.static(__dirname + '/public'));

server.listen(8080, function() {
    console.log('Server Started at http://localhost:8080');
});

io.on('connection', function(socket) {
    // 在线统计
    socket.on('login', function(nickName) {
        if ( users.indexOf(nickName) > -1 ) {
            socket.emit('nickExisted')
        } else {
            socket.userIndex = users.length;//这里很巧妙,索引0对应第一个昵称
            socket.nickName = nickName;
            users.push(nickName);//push进去后数组长度是1,此时昵称索引是0
            socket.emit('loginSuccess');//向自己發送登錄成功的消息

            io.sockets.emit('system', nickName, users.length, 'login');//system向所有人发送当前用户登录的信息
        }
    });

    socket.on('disconnect', function() {
        users.splice(socket.userIndex, 1);//服務斷開時，從users里去掉離開的人

        socket.broadcast.emit('system', socket.nickName, users.length, 'logout');//system向所有人發送當前用戶離開的信息
    });

    // 分发信息
    socket.on('postMsg', function(msg, color) {
        socket.broadcast.emit('newMsg', socket.nickName, msg, color);
    });

    // 分发图片
    socket.on('img', function(imageData, color) {
        socket.broadcast.emit('newImg', socket.nickName, imageData, color);
    })
});
