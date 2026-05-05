// FreeClaw - API Test v3
const ApiTest = {
    run: async function() {
        Toast.show('Testing API...');
        var connected = await Api.ping();
        if (!connected) {
            Toast.show('Server not connected', 'error');
            return;
        }
        try {
            var files = await Api.listFiles(Config.mainDir);
            Toast.show('API OK: ' + files.length + ' files found');
        } catch (e) {
            Toast.show('API Error: ' + e.message, 'error');
        }
    }
};