const net = require('net');

new net.Socket()
    .connect(3000, 'localhost', function() {
        this.write(JSON.stringify({login: 'user1', password: 'password1'}) + '\n');
    })
    .on('data', data => console.log('Response:', data.toString()))
    .on('close', () => console.log('Connection closed'))
    .on('error', err => console.error('Error:', err.message));