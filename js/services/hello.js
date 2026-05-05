// FreeClaw - Hello World test module
const Hello = {
    say: function() {
        console.log('Hello from FreeClaw!');
    },

    greet: function(name) {
        Toast.show('Hello, ' + (name || 'World') + '!');
    },

    version: function() {
        return '1.0.0';
    }
};