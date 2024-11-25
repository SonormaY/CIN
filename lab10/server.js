const net = require('net');
const { Worker, isMainThread, parentPort } = require('worker_threads');

const VALID_CREDENTIALS = { 'user1': 'password1', 'user2': 'password2' };

function authenticate(credentials) {
    return VALID_CREDENTIALS[credentials.login] === credentials.password
        ? `Hi ${credentials.login}! You are in system.\n`
        : 'Error: Wrong login/password combination.\n';
}

if (isMainThread) {
    const parallel = process.argv.includes('--parallel');
    
    net.createServer(socket => {
        let buffer = '';
        
        if (!parallel) {
            socket.on('data', data => {
                buffer += data.toString();
                if (buffer.includes('\n')) {
                    console.log('Request:', buffer);
                    socket.write(authenticate(JSON.parse(buffer)));
                }
            });
            return;
        }

        const worker = new Worker(__filename);
        socket.on('data', data => {
            buffer += data.toString();
            if (buffer.includes('\n')) {
                worker.postMessage(buffer);
                buffer = '';
            }
        });
        worker.on('message', response => socket.write(response));
        socket.on('end', () => worker.terminate());

    }).listen(3000, () => console.log(`Server running on port 3000 in ${parallel ? 'parallel' : 'sequential'} mode`));
} else {
    parentPort.on('message', data => {
        try {
            console.log('Request:', data);
            parentPort.postMessage(authenticate(JSON.parse(data)));
        } catch (err) {
            parentPort.postMessage(`Error: ${err.message}\n`);
        }
    });
}